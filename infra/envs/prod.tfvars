environment = "prod"
aws_region  = "us-west-2"

target_website_url  = "https://your-production-site.example.com/"
uptime_ping_schedule = "rate(5 minutes)"

uptime_assertions = {
  status_code          = 200
  body_includes        = ""
  max_response_time_ms = 3000
}

# Replace with your alert email before production deployment.
uptime_alert_subscriber_email = null
retention_days                = 90
log_retention_days            = 30
enable_metric_alarms          = true
enable_deletion_protection    = true

# Replace '*' with your CloudFront/custom domain in production.
dashboard_api_allowed_origins = ["*"]
