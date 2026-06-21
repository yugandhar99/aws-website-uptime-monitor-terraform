import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE;
const MAX_ITEMS = Number.parseInt(process.env.MAX_SCAN_ITEMS || '1000', 10);

export const handler = async () => {
  const headers = responseHeaders();

  try {
    const items = await scanAllItems(MAX_ITEMS);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthData = items.filter(item => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const totalChecks = currentMonthData.length;
    const successfulChecks = currentMonthData.filter(item => item.status === 'SUCCESS').length;
    const failedChecks = currentMonthData.filter(item => item.status === 'FAILURE').length;
    const invalidStatusCount = currentMonthData.filter(item => item.errorType === 'InvalidStatusCode' || (item.errorMessage || '').includes('Invalid')).length;
    const responseTimes = currentMonthData
      .map(item => Number.parseInt(item.responseTime || 0, 10))
      .filter(time => Number.isFinite(time) && time >= 0);

    const uptime = totalChecks > 0 ? Number(((successfulChecks / totalChecks) * 100).toFixed(2)) : 0;
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        uptime,
        invalidStatusCount,
        avgResponseTime,
        totalChecks,
        successfulChecks,
        failedChecks,
        lastUpdated: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error(JSON.stringify({ level: 'ERROR', message: 'metrics_failed', error: error.message }));
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ error: 'Could not fetch metrics.' })
    };
  }
};

async function scanAllItems(limit) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const result = await dynamoDb.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: Math.min(100, limit - items.length),
      ExclusiveStartKey
    }));
    items.push(...(result.Items || []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey && items.length < limit);

  return items;
}

function responseHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': (process.env.CORS_ALLOW_ORIGIN || '*').split(',')[0],
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
  };
}
