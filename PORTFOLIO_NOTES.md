# Portfolio Notes - AWS Website Uptime Monitor

## GitHub repo name

`aws-website-uptime-monitor-terraform`

## GitHub description

Serverless website uptime monitoring using AWS Lambda, EventBridge, DynamoDB, CloudWatch, SNS, API Gateway, S3/CloudFront, React, Terraform, GitHub Actions OIDC, security scanning, drift detection, and optional GenAI incident summaries.

## What this project proves

This project shows that I can design and implement a practical cloud operations solution, not just deploy a basic app. It covers infrastructure automation, monitoring, alerting, serverless backend design, frontend hosting, CI/CD quality gates, and operational documentation.

## Career progression story

This project fits well after basic Docker and Jenkins projects because it moves into cloud-native operations. It shows progression from application containerization and CI/CD into AWS serverless automation, production monitoring, observability, IaC governance, and AI-assisted operations.

## Resume bullets

- Built a serverless AWS website uptime monitoring platform using Lambda, EventBridge, DynamoDB, CloudWatch metrics, SNS alerts, API Gateway, S3, CloudFront, React, and Terraform.
- Implemented CloudWatch alarms, structured Lambda logs, DynamoDB TTL retention, point-in-time recovery, secure S3/CloudFront hosting, and least-privilege IAM policies.
- Added GitHub Actions workflows for Terraform validation, TFLint, Checkov, Trivy scanning, drift detection, frontend build validation, and backend Lambda syntax checks.
- Added an optional GenAI incident summary helper using offline mode or Amazon Bedrock to summarize uptime failures, latency trends, and recommended next actions.

## Interview answer

I built this project as a serverless website monitoring system on AWS. EventBridge triggers a Lambda function every few minutes, the Lambda checks a website for status code, content, and latency, and then stores the results in DynamoDB. It also publishes CloudWatch custom metrics and sends SNS alerts when the website is down or response time crosses the threshold. On top of that, a React dashboard is hosted using S3 and CloudFront, and the dashboard reads uptime data through API Gateway and Lambda APIs.

I enhanced it like a real DevOps project by adding Terraform modules, environment tfvars, DynamoDB encryption and TTL, CloudWatch alarms, X-Ray tracing, GitHub Actions with OIDC-based AWS authentication, Checkov and Trivy security scanning, drift detection, and operational docs. I also added a GenAI-style incident summary script that can summarize failed checks and suggest next steps, which aligns the project with current market trends around AI-assisted operations.

## Screenshots to add after deployment

- Terraform plan/apply output
- Lambda function page
- EventBridge schedule
- DynamoDB records
- CloudWatch custom metrics
- SNS alert email
- API Gateway endpoints
- React dashboard hosted behind CloudFront
- GitHub Actions successful workflow runs
- Optional GenAI incident summary output
