# Security Notes

## Do not commit secrets

Never commit:

- AWS access keys
- `.env` files
- Terraform state files
- private keys or certificates
- API tokens
- SNS endpoints that should remain private

This project includes `.gitignore` rules for common secret and state files.

## GitHub Actions authentication

Use GitHub Actions OIDC with an AWS IAM role instead of long-lived `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets.

Required GitHub secret:

```text
AWS_ROLE_TO_ASSUME
```

Optional GitHub variable:

```text
AWS_REGION
```

## Terraform state

For portfolio testing, local state is okay. For team or production usage, configure an encrypted S3 backend and DynamoDB state locking.

## Production hardening checklist

- Restrict `dashboard_api_allowed_origins` to your CloudFront/custom domain.
- Use custom domain and ACM certificate for CloudFront.
- Review IAM policies and scope access tightly.
- Review Checkov and Trivy findings before deployment.
- Configure CloudWatch log retention.
- Enable DynamoDB PITR for production.
- Confirm SNS subscribers manually.
- Keep Terraform provider versions reviewed and updated.
