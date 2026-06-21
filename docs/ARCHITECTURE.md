# Architecture

## Purpose

The goal of this project is to monitor a public website from AWS and give the operations team a simple dashboard, alerting path, and historical uptime record.

## Flow

```text
EventBridge schedule
  -> Lambda uptime checker
      -> HTTP request to target website
      -> DynamoDB uptime event storage
      -> CloudWatch custom metrics
      -> SNS alert when failed

React dashboard on S3/CloudFront
  -> API Gateway HTTP API
      -> Lambda API handlers
          -> DynamoDB scan/read
```

## AWS services

| Service | Responsibility |
|---|---|
| EventBridge | Runs uptime checks on a schedule. |
| Lambda | Performs website check and API operations. |
| DynamoDB | Stores uptime events with TTL retention. |
| CloudWatch | Stores custom uptime and latency metrics; triggers alarms. |
| SNS | Sends email notifications on failure. |
| API Gateway | Exposes dashboard backend APIs. |
| S3 | Hosts React static build files privately. |
| CloudFront | Provides HTTPS CDN access to the dashboard. |
| IAM | Controls least-privilege service permissions. |

## Why serverless

Serverless is a good fit because uptime checks are periodic and lightweight. The system does not need always-on servers, and AWS handles scaling, scheduling, execution, and logging.

## Current-market enhancements

- Infrastructure as Code using Terraform modules.
- GitHub Actions OIDC authentication instead of long-lived AWS keys.
- Checkov, TFLint, and Trivy scanning.
- CloudWatch custom metrics and alarms.
- DynamoDB encryption, TTL, and point-in-time recovery.
- Optional GenAI operations summary using Bedrock or offline mode.

## Possible future upgrades

- Add CloudWatch Synthetics canaries for browser/API journey testing.
- Add Route 53 health checks for DNS/failover use cases.
- Add Slack, Teams, or PagerDuty integration.
- Add API Gateway authorizer for secured dashboard APIs.
- Add multi-region active monitoring.
- Add OpenTelemetry traces and service maps.
