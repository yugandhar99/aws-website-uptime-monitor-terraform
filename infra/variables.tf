variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region used for all regional resources."
  type        = string
  default     = "us-west-2"
}

variable "db_billing_mode" {
  description = "DynamoDB billing mode. Use PAY_PER_REQUEST for a portfolio/demo workload."
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.db_billing_mode)
    error_message = "db_billing_mode must be PAY_PER_REQUEST or PROVISIONED."
  }
}

variable "dynamodb_pitr_enabled" {
  description = "Enable point-in-time recovery for uptime history."
  type        = bool
  default     = true
}

variable "retention_days" {
  description = "Number of days to retain uptime check records in DynamoDB using TTL."
  type        = number
  default     = 30

  validation {
    condition     = var.retention_days >= 1 && var.retention_days <= 365
    error_message = "retention_days must be between 1 and 365."
  }
}

variable "uptime_ping_schedule" {
  description = "EventBridge schedule expression for uptime checks."
  type        = string
  default     = "rate(5 minutes)"
}

variable "target_website_url" {
  description = "Public HTTP/HTTPS URL to monitor."
  type        = string
  default     = "https://example.com/"

  validation {
    condition     = can(regex("^https?://", var.target_website_url))
    error_message = "target_website_url must start with http:// or https://."
  }
}

variable "uptime_assertions" {
  description = "Expected website response conditions. Leave body_includes empty when content matching is not required."
  type = object({
    status_code          = number
    body_includes        = string
    max_response_time_ms = number
  })
  default = {
    status_code          = 200
    body_includes        = "Example Domain"
    max_response_time_ms = 3000
  }

  validation {
    condition     = var.uptime_assertions.status_code >= 100 && var.uptime_assertions.status_code <= 599
    error_message = "uptime_assertions.status_code must be a valid HTTP status code."
  }

  validation {
    condition     = var.uptime_assertions.max_response_time_ms > 0
    error_message = "uptime_assertions.max_response_time_ms must be greater than zero."
  }
}

variable "uptime_alert_subscriber_email" {
  description = "Optional email address for SNS uptime alerts. Leave null to skip email subscription."
  type        = string
  default     = null

  validation {
    condition     = var.uptime_alert_subscriber_email == null || can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.uptime_alert_subscriber_email))
    error_message = "uptime_alert_subscriber_email must be a valid email address or null."
  }
}

variable "lambda_timeout_seconds" {
  description = "Lambda timeout for uptime checks."
  type        = number
  default     = 15
}

variable "lambda_memory_mb" {
  description = "Lambda memory size."
  type        = number
  default     = 256
}

variable "request_timeout_ms" {
  description = "HTTP request timeout used by the uptime check Lambda."
  type        = number
  default     = 5000
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention for Lambda functions."
  type        = number
  default     = 30
}

variable "dashboard_api_allowed_origins" {
  description = "CORS allowed origins for the dashboard API. Use a specific CloudFront/custom domain in production."
  type        = list(string)
  default     = ["*"]
}

variable "enable_deletion_protection" {
  description = "Keep critical frontend resources during destroy when true."
  type        = bool
  default     = false
}

variable "enable_metric_alarms" {
  description = "Create CloudWatch alarms for failed uptime checks and high latency."
  type        = bool
  default     = true
}
