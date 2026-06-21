export const handler = async () => {
  return {
    statusCode: 200,
    headers: responseHeaders(),
    body: JSON.stringify({ status: 'ok', service: 'uptime-monitor-api', timestamp: new Date().toISOString() })
  };
};

function responseHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': (process.env.CORS_ALLOW_ORIGIN || '*').split(',')[0],
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
  };
}
