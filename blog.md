# Building a Serverless Website Uptime Monitor on AWS

Website monitoring is one of the most practical DevOps use cases because every production application needs availability checks, alerting, and historical visibility. This project builds a serverless uptime monitoring platform on AWS using Lambda, EventBridge, DynamoDB, CloudWatch, SNS, API Gateway, S3, CloudFront, React, Terraform, and GitHub Actions.

## Problem

A team needs to know when a website is down, slow, or returning the wrong content. Manual checks are not reliable, and setting up a full monitoring server can be unnecessary for a lightweight website check.

## Solution

The solution uses EventBridge to trigger a Lambda function every few minutes. The Lambda function calls the configured website, validates status code, optional content, and response time, then stores the result in DynamoDB. It also publishes custom CloudWatch metrics and sends an SNS alert when a failure occurs.

The dashboard is hosted using S3 and CloudFront. API Gateway exposes Lambda handlers that read metrics from DynamoDB and return data to the React frontend.

## DevOps Improvements

The project uses Terraform for infrastructure automation, environment-specific tfvars, and reusable modules. GitHub Actions validate Terraform, run security scans, check frontend builds, validate Lambda handlers, and detect Terraform drift. AWS authentication in GitHub Actions is designed for OIDC instead of long-lived access keys.

## GenAI Enhancement

A helper script can summarize uptime events into an incident-style report. In offline mode it creates a deterministic summary. In Bedrock mode it can use Amazon Bedrock to generate an AI-assisted operational summary.

## Key Learning

This project shows how cloud engineers can combine serverless automation, observability, IaC, CI/CD, security scanning, and AI-assisted operations into one real-world portfolio project.
