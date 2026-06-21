# AWS Website Uptime Monitor

Serverless website uptime monitoring platform built with **AWS Lambda, EventBridge, DynamoDB, CloudWatch custom metrics, SNS, API Gateway, S3, CloudFront, React, Terraform, GitHub Actions, and optional GenAI incident summaries**.

This project is designed as a DevOps/Cloud portfolio project that demonstrates how to build an automated uptime monitoring solution with infrastructure as code, CI/CD quality checks, alerting, dashboard visibility, and operational runbooks.

## Project Overview

The system runs scheduled checks against a target website, validates the response status, optional page content, and response time, then stores the result in DynamoDB. Failures are sent to SNS, custom metrics are published to CloudWatch, and a React dashboard displays uptime trends and recent ping results.

```text
EventBridge Schedule
        |
        v
AWS Lambda Uptime Checker ---> CloudWatch Custom Metrics + Alarms
        |
        +---> DynamoDB Uptime History
        |
        +---> SNS Email Alert on Failure

React Dashboard ---> API Gateway ---> Lambda API Handlers ---> DynamoDB
        |
        v
S3 + CloudFront
```

## What I Enhanced

- Removed committed Terraform state files.
- Replaced personal/default email values with safe configurable variables.
- Added environment validation and safer Terraform variable defaults.
- Added DynamoDB server-side encryption, TTL retention, and point-in-time recovery.
- Improved Lambda uptime checker with timeout handling, redirects, structured JSON logs, custom CloudWatch metrics, richer DynamoDB records, and safer SNS alerts.
- Added CloudWatch alarms for website failure and high response time.
- Added Lambda X-Ray tracing and CloudWatch log retention settings.
- Improved API handlers with pagination-safe scans and better error handling.
- Added `/health` API route for operational checks.
- Hardened S3/CloudFront frontend hosting with private bucket access and security headers.
- Reworked GitHub Actions to use OIDC-style AWS authentication instead of long-lived AWS keys.
- Added Terraform validation, TFLint, Checkov, drift detection, frontend build validation, backend syntax checks, and Trivy repository scanning.
- Added GenAI incident-summary helper for offline mode and optional Amazon Bedrock mode.
- Added portfolio notes, runbook, architecture guide, security notes, screenshot checklist, and GitHub upload steps.

## Technology Stack

| Area | Tools / Services |
|---|---|
| Cloud | AWS Lambda, EventBridge, DynamoDB, SNS, CloudWatch, API Gateway, S3, CloudFront |
| IaC | Terraform, reusable modules, environment tfvars |
| Frontend | React, Axios, Recharts, Framer Motion |
| Backend | Node.js 22 Lambda functions, AWS SDK v3 |
| CI/CD | GitHub Actions, OIDC-ready AWS auth, Terraform plan/apply workflow |
| Security | Checkov, Trivy, TFLint, least-privilege IAM, encrypted DynamoDB/S3 |
| Ops | CloudWatch metrics, alarms, structured logs, drift detection, runbook |
| GenAI | Optional Bedrock-based incident summary helper |

## Repository Structure

```text
.
├── dashboard/
│   ├── backend/                 # API Gateway Lambda handlers
│   └── frontend/                # React uptime dashboard
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GENAI_ENHANCEMENT.md
│   ├── RUNBOOK.md
│   └── SCREENSHOTS.md
├── infra/
│   ├── envs/                    # dev/prod Terraform variable files
│   ├── modules/                 # uptime monitor and dashboard modules
│   └── *.tf                     # root Terraform configuration
├── scripts/
│   └── genai_uptime_summary.py  # offline/Bedrock incident summary helper
├── .github/workflows/           # CI/CD, security, drift detection workflows
├── PORTFOLIO_NOTES.md
├── SECURITY.md
└── GITHUB_UPLOAD_STEPS.md
```

## Prerequisites

- AWS account with permissions for Lambda, EventBridge, DynamoDB, SNS, API Gateway, S3, CloudFront, IAM, and CloudWatch.
- Terraform 1.10 or later.
- Node.js 22 or later.
- AWS CLI configured locally, or GitHub Actions OIDC configured for pipeline deployment.

## Configure Environment

Update `infra/envs/dev.tfvars` or create your own tfvars file.

```hcl
environment         = "dev"
aws_region          = "us-west-2"
target_website_url  = "https://example.com/"
uptime_ping_schedule = "rate(5 minutes)"

uptime_assertions = {
  status_code          = 200
  body_includes        = "Example Domain"
  max_response_time_ms = 3000
}

uptime_alert_subscriber_email = null
retention_days                = 30
log_retention_days            = 30
enable_metric_alarms          = true
```

For email alerts, set:

```hcl
uptime_alert_subscriber_email = "your-email@example.com"
```

After deployment, confirm the SNS subscription email from AWS.

## Deploy Infrastructure

```bash
cd infra
terraform init
terraform workspace new dev || terraform workspace select dev
terraform fmt -recursive
terraform validate
terraform plan -var-file=envs/dev.tfvars
terraform apply -var-file=envs/dev.tfvars
```

Useful outputs:

```bash
terraform output dashboard_api_url
terraform output dashboard_url
terraform output uptime_lambda_name
terraform output dynamodb_table_name
```

## Run Frontend Locally

```bash
cd dashboard/frontend
npm install
REACT_APP_API_URL="$(cd ../../infra && terraform output -raw dashboard_api_url)" npm start
```

## Build Frontend for S3

```bash
cd dashboard/frontend
npm install
REACT_APP_API_URL="https://your-api-gateway-url" npm run build
aws s3 sync build/ s3://your-dashboard-bucket --delete
```

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | API health check |
| `GET /metrics` | Current month uptime metrics |
| `GET /recent-pings` | Recent uptime checks from the last 30 minutes |
| `GET /uptime-data` | Latest uptime records for analysis |

## GitHub Actions Setup

This project is OIDC-ready. Instead of storing `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, create an AWS IAM role that trusts your GitHub repository, then add this GitHub secret:

```text
AWS_ROLE_TO_ASSUME = arn:aws:iam::<account-id>:role/<github-actions-role>
```

Optional repository variable:

```text
AWS_REGION = us-west-2
```

Workflows included:

- `Terraform Quality and Deploy` - format, validate, plan, TFLint, Checkov, optional apply.
- `Terraform Drift Detection` - scheduled/manual drift check and GitHub issue creation.
- `Backend API Quality` - Node.js Lambda handler validation.
- `Frontend Dashboard Quality` - React test/build validation.
- `Repository Security Scan` - Trivy vulnerability, secret, and misconfiguration scan.
- `Deploy Frontend to S3` - manual dashboard build and S3/CloudFront deployment.

## Optional GenAI Enhancement

The helper script can summarize uptime results in offline mode or use Amazon Bedrock when configured.

Offline mode:

```bash
python scripts/genai_uptime_summary.py --input docs/sample-uptime-events.json
```

Bedrock mode:

```bash
python scripts/genai_uptime_summary.py \
  --input docs/sample-uptime-events.json \
  --provider bedrock \
  --model-id anthropic.claude-3-haiku-20240307-v1:0
```

See `docs/GENAI_ENHANCEMENT.md` for details.

## Security Notes

- Do not commit `.tfstate`, `.env`, AWS keys, or secrets.
- Use GitHub Actions OIDC for AWS authentication.
- Use a remote Terraform backend for team usage.
- Restrict `dashboard_api_allowed_origins` to your CloudFront or custom domain in production.
- Confirm SNS subscriptions only for trusted email addresses.
- Review Checkov and Trivy findings before production deployment.

## Cost Notes

This project uses mostly serverless resources, but AWS charges may still apply for Lambda invocations, DynamoDB usage, API Gateway requests, CloudFront, SNS, S3 storage, and CloudWatch metrics/logs. Destroy demo resources when done:

```bash
cd infra
terraform destroy -var-file=envs/dev.tfvars
```

## Resume Bullet

Built a serverless website uptime monitoring platform using AWS Lambda, EventBridge, DynamoDB, CloudWatch custom metrics, SNS, API Gateway, S3/CloudFront, React, Terraform, GitHub Actions OIDC, security scanning, drift detection, and optional GenAI incident summaries.

## Interview Summary

I built this project to show how a DevOps engineer can automate website monitoring in a serverless way. EventBridge triggers a Lambda function on a schedule, the Lambda validates website health, stores results in DynamoDB, publishes CloudWatch metrics, and sends SNS alerts when the website is down or slow. The React dashboard reads API Gateway endpoints backed by Lambda functions and shows uptime percentage, response time, and recent failures.

I also enhanced the project with current market practices like Terraform IaC, environment-based deployments, GitHub Actions with OIDC authentication, Checkov and Trivy security scanning, drift detection, structured logs, CloudWatch alarms, and an optional GenAI incident summary script for release/operations reporting.
