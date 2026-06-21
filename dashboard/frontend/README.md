# React Uptime Dashboard

Frontend dashboard for viewing uptime metrics and recent website checks.

## Configuration

Create `.env`:

```bash
REACT_APP_API_URL=https://your-api-id.execute-api.us-west-2.amazonaws.com
```

## Run locally

```bash
npm install
npm start
```

## Build for production

```bash
REACT_APP_API_URL=https://your-api-url npm run build
```

Upload `build/` to the S3 dashboard bucket and invalidate CloudFront.
