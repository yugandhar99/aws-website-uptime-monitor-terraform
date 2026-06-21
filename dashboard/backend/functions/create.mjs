import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE;
const MAX_ITEMS = Number.parseInt(process.env.MAX_SCAN_ITEMS || '500', 10);

export const handler = async () => {
  const headers = responseHeaders();

  try {
    const items = await scanAllItems(MAX_ITEMS);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const recentPings = items
      .filter(item => item.timestamp && new Date(item.timestamp) >= thirtyMinutesAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(formatItem);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recentPings)
    };
  } catch (error) {
    console.error(JSON.stringify({ level: 'ERROR', message: 'recent_pings_failed', error: error.message }));
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ error: 'Could not fetch recent pings.' })
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

function formatItem(item) {
  return {
    id: item.id,
    timestamp: item.timestamp,
    websiteUrl: item.websiteUrl || '',
    status: item.status,
    statusCode: Number.parseInt(item.statusCode || 0, 10),
    responseTime: Number.parseInt(item.responseTime || 0, 10),
    errorType: item.errorType || '',
    errorMessage: item.errorMessage || ''
  };
}

function responseHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': (process.env.CORS_ALLOW_ORIGIN || '*').split(',')[0],
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
  };
}
