environment = "dev"
aws_region  = "us-west-2"

target_website_url  = "https://example.com/"
uptime_ping_schedule = "rate(5 minutes)"

uptime_assertions = {
  status_code          = 200
  body_includes        = "Example Domain"
  max_response_time_ms = 3000
}

uptime_alert_subscriber_email = null
retention_days                = 30
log_retention_days            = 14
enable_metric_alarms          = true
enable_deletion_protection    = false
dashboard_api_allowed_origins = ["*"]
