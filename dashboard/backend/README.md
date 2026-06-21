# Uptime Monitor API

Node.js 22 Lambda handlers used by API Gateway.

## Routes

| Route | Handler | Purpose |
|---|---|---|
| `GET /health` | `health.mjs` | API health check |
| `GET /metrics` | `get.mjs` | Monthly uptime metrics |
| `GET /recent-pings` | `create.mjs` | Recent checks from last 30 minutes |
| `GET /uptime-data` | `list.mjs` | Latest uptime records |

## Validate locally

```bash
npm install
npm run lint
npm run test
```

The Lambda deployment package is created by Terraform using `terraform-aws-modules/lambda/aws`.
