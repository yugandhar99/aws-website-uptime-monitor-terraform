resource "aws_dynamodb_table" "uptime_metrics" {
  name         = "${local.project_name}-dynamodb-${var.environment}"
  billing_mode = var.db_billing_mode
  hash_key     = "id"


  attribute {
    name = "id"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = var.dynamodb_pitr_enabled
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name = "${local.project_name}-dynamodb-${var.environment}"
  }
}

module "uptime_monitor" {
  source = "./modules/uptime_monitor"

  environment = var.environment
  name_prefix = local.project_name

  website_url               = var.target_website_url
  ping_schedule             = var.uptime_ping_schedule
  assertions                = var.uptime_assertions
  subscriber_email          = var.uptime_alert_subscriber_email
  dynamodb_table_name       = aws_dynamodb_table.uptime_metrics.name
  lambda_timeout_seconds    = var.lambda_timeout_seconds
  lambda_memory_mb          = var.lambda_memory_mb
  request_timeout_ms        = var.request_timeout_ms
  retention_days            = var.retention_days
  log_retention_days        = var.log_retention_days
  enable_metric_alarms      = var.enable_metric_alarms
  cloudwatch_metric_namespace = "WebsiteUptimeMonitor"
}

module "dashboard" {
  source = "./modules/dashboard"

  environment = var.environment
  name_prefix = local.project_name

  backend_src_root            = "${path.root}/../dashboard/backend"
  dynamodb_table_name         = aws_dynamodb_table.uptime_metrics.name
  api_allowed_origins         = var.dashboard_api_allowed_origins
  backend_log_retention_days  = var.log_retention_days
  enable_deletion_protection  = var.enable_deletion_protection
}
