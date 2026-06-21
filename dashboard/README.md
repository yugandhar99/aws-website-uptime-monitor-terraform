# Dashboard

The dashboard has two parts:

- `backend` - API Gateway Lambda handlers that read uptime records from DynamoDB.
- `frontend` - React app that displays uptime percentage, latency, and recent checks.

## Local frontend run

```bash
cd dashboard/frontend
npm install
cp .env.example .env
npm start
```

Update `.env` with your API Gateway URL.

## Backend validation

```bash
cd dashboard/backend
npm install
npm run test
```
