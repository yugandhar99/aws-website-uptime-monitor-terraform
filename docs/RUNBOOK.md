# Operations Runbook

## Website down alert

1. Open the SNS alert email and confirm the failed URL, status code, and response time.
2. Open CloudWatch Metrics under namespace `WebsiteUptimeMonitor`.
3. Check `UptimeCheckFailure` and `ResponseTimeMs` for the target URL.
4. Open the Lambda logs for the uptime check function.
5. Confirm whether the failure is network timeout, invalid status code, keyword mismatch, or high latency.
6. Manually test the URL from browser and terminal:

```bash
curl -I https://example.com/
curl -L https://example.com/
```

7. If the website is truly down, notify the application owner.
8. If only the keyword check failed, verify whether the page content changed and update `body_includes` if needed.

## High latency alert

1. Review CloudWatch `ResponseTimeMs` metric.
2. Compare against recent successful checks.
3. Check application, CDN, DNS, and backend logs.
4. Increase threshold only if the new latency is expected and approved.

## Dashboard not loading

1. Check CloudFront distribution status.
2. Confirm S3 bucket has the React `build/` files.
3. Confirm `REACT_APP_API_URL` was set correctly during build.
4. Open API `/health` endpoint directly.
5. Confirm API Gateway CORS configuration.

## Terraform drift detected

1. Open the GitHub issue created by the drift workflow.
2. Review the drift workflow artifact and Terraform plan output.
3. Identify if the drift was a manual AWS console change or expected platform change.
4. Either import/update Terraform code or revert the manual change.
5. Run a new plan and close the drift issue after resolution.

## Destroy demo environment

```bash
cd infra
terraform workspace select dev
terraform destroy -var-file=envs/dev.tfvars
```
