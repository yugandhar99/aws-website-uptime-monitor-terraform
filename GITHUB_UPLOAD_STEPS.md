# GitHub Upload Steps

## Recommended repo name

`aws-website-uptime-monitor-terraform`

## Recommended description

Serverless website uptime monitoring using AWS Lambda, EventBridge, DynamoDB, CloudWatch, SNS, API Gateway, S3/CloudFront, React, Terraform, GitHub Actions OIDC, security scanning, drift detection, and optional GenAI incident summaries.

## Upload using GitHub website

When creating the repository, keep these unchecked:

```text
Add README file      unchecked
Add .gitignore       unchecked
Choose license       unchecked
```

Then upload the extracted project files.

If GitHub blocks upload because of too many files, upload in batches:

1. Root files: `README.md`, `.gitignore`, `SECURITY.md`, `PORTFOLIO_NOTES.md`, `GITHUB_UPLOAD_STEPS.md`, `blog.md`
2. `.github` folder
3. `infra` folder
4. `dashboard` folder
5. `docs` and `scripts` folders
6. `static` folder

Do not upload `node_modules`, `.terraform`, `.tfstate`, `.env`, or ZIP files.

## Upload using Git commands

```bash
git init
git add .
git commit -m "Initial commit - AWS website uptime monitor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aws-website-uptime-monitor-terraform.git
git push -u origin main
```

## After upload

Create GitHub repository secret:

```text
AWS_ROLE_TO_ASSUME = arn:aws:iam::<account-id>:role/<github-actions-role>
```

Create optional repository variable:

```text
AWS_REGION = us-west-2
```

Run workflows manually first before enabling production apply.
