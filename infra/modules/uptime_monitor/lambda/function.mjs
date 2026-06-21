import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDBClient({});
const sns = new SNSClient({});
const cloudWatch = new CloudWatchClient({});

const TABLE_NAME = mustGetEnv('DYNAMODB_TABLE');
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';
const WEBSITE_URL = mustGetEnv('WEBSITE_URL');
const EXPECTED_STATUS_CODE = parseInteger(process.env.EXPECTED_STATUS_CODE, 200);
const EXPECTED_KEYWORD = process.env.EXPECTED_KEYWORD || '';
const MAX_RESPONSE_TIME_MS = parseInteger(process.env.MAX_RESPONSE_TIME_MS, 3000);
const REQUEST_TIMEOUT_MS = parseInteger(process.env.REQUEST_TIMEOUT_MS, 5000);
const RETENTION_DAYS = parseInteger(process.env.RETENTION_DAYS, 30);
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const CLOUDWATCH_NAMESPACE = process.env.CLOUDWATCH_NAMESPACE || 'WebsiteUptimeMonitor';
const USER_AGENT = process.env.USER_AGENT || 'website-uptime-monitor/1.1';

export async function handler(event = {}, context = {}) {
  const startedAt = Date.now();
  const timestamp = new Date(startedAt).toISOString();

  let result = {
    id: uuidv4(),
    timestamp,
    websiteUrl: WEBSITE_URL,
    status: 'SUCCESS',
    statusCode: 0,
    responseTime: 0,
    errorType: '',
    errorMessage: '',
    requestId: context.awsRequestId || ''
  };

  try {
    const response = await fetchWebsite(WEBSITE_URL, REQUEST_TIMEOUT_MS);
    result.responseTime = Date.now() - startedAt;
    result.statusCode = response.statusCode;

    if (response.statusCode !== EXPECTED_STATUS_CODE) {
      markFailure(result, 'InvalidStatusCode', `Expected ${EXPECTED_STATUS_CODE}, received ${response.statusCode}`);
    } else if (EXPECTED_KEYWORD && !response.body.includes(EXPECTED_KEYWORD)) {
      markFailure(result, 'KeywordNotFound', `Expected keyword was not found: ${EXPECTED_KEYWORD}`);
    } else if (result.responseTime > MAX_RESPONSE_TIME_MS) {
      markFailure(result, 'HighLatency', `Response time ${result.responseTime}ms exceeded threshold ${MAX_RESPONSE_TIME_MS}ms`);
    }
  } catch (error) {
    result.responseTime = Date.now() - startedAt;
    markFailure(result, error.name || 'RequestError', error.message || 'Website check failed');
  }

  await Promise.allSettled([
    saveResult(result),
    publishMetrics(result)
  ]);

  if (result.status === 'FAILURE' && SNS_TOPIC_ARN) {
    await publishAlert(result);
  }

  console.log(JSON.stringify({ level: 'INFO', message: 'uptime_check_completed', ...result }));
  return result;
}

function mustGetEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function markFailure(result, errorType, errorMessage) {
  result.status = 'FAILURE';
  result.errorType = errorType;
  result.errorMessage = errorMessage;
}

async function fetchWebsite(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/json,text/plain,*/*'
      }
    });

    const body = await response.text();
    return { statusCode: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function saveResult(result) {
  const ttlEpoch = Math.floor(Date.now() / 1000) + RETENTION_DAYS * 24 * 60 * 60;
  const monthKey = result.timestamp.substring(0, 7);

  await dynamoDB.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id: { S: result.id },
      timestamp: { S: result.timestamp },
      monthKey: { S: monthKey },
      websiteUrl: { S: result.websiteUrl },
      status: { S: result.status },
      statusCode: { N: String(result.statusCode) },
      responseTime: { N: String(result.responseTime) },
      errorType: { S: result.errorType },
      errorMessage: { S: result.errorMessage },
      requestId: { S: result.requestId },
      ttl: { N: String(ttlEpoch) }
    }
  }));
}

async function publishMetrics(result) {
  const dimensions = [
    { Name: 'Environment', Value: ENVIRONMENT },
    { Name: 'WebsiteUrl', Value: WEBSITE_URL }
  ];

  await cloudWatch.send(new PutMetricDataCommand({
    Namespace: CLOUDWATCH_NAMESPACE,
    MetricData: [
      {
        MetricName: 'UptimeCheckSuccess',
        Unit: 'Count',
        Value: result.status === 'SUCCESS' ? 1 : 0,
        Dimensions: dimensions
      },
      {
        MetricName: 'UptimeCheckFailure',
        Unit: 'Count',
        Value: result.status === 'FAILURE' ? 1 : 0,
        Dimensions: dimensions
      },
      {
        MetricName: 'ResponseTimeMs',
        Unit: 'Milliseconds',
        Value: result.responseTime,
        Dimensions: dimensions
      }
    ]
  }));
}

async function publishAlert(result) {
  const subject = `Website uptime alert: ${result.websiteUrl}`;
  const message = [
    `Website: ${result.websiteUrl}`,
    `Environment: ${ENVIRONMENT}`,
    `Status: ${result.status}`,
    `Error Type: ${result.errorType}`,
    `Error: ${result.errorMessage}`,
    `HTTP Status: ${result.statusCode}`,
    `Response Time: ${result.responseTime}ms`,
    `Checked At: ${result.timestamp}`,
    `Request Id: ${result.requestId}`
  ].join('\n');

  await sns.send(new PublishCommand({
    TopicArn: SNS_TOPIC_ARN,
    Subject: subject.substring(0, 100),
    Message: message
  }));
}
