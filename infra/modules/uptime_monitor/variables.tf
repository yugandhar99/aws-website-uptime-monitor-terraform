variable "environment" {
  description = "Environment name."
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names."
  type        = string
}

variable "website_url" {
  description = "URL of the target website."
  type        = string
}

variable "assertions" {
  description = "Expected website response conditions."
  type = object({
    status_code          = number
    body_includes        = string
    max_response_time_ms = number
  })
}

variable "ping_schedule" {
  description = "EventBridge schedule expression."
  type        = string
}

variable "subscriber_email" {
  description = "Optional email address to receive SNS alerts."
  type        = string
  default     = null
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table to store uptime metrics."
  type        = string
}

variable "lambda_timeout_seconds" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 15
}

variable "lambda_memory_mb" {
  description = "Lambda memory size in MB."
  type        = number
  default     = 256
}

variable "request_timeout_ms" {
  description = "HTTP request timeout for the uptime check."
  type        = number
  default     = 5000
}

variable "retention_days" {
  description = "TTL retention period for uptime records."
  type        = number
  default     = 30
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention for the Lambda function."
  type        = number
  default     = 30
}

variable "enable_metric_alarms" {
  description = "Create CloudWatch alarms for uptime failure and high latency."
  type        = bool
  default     = true
}

variable "cloudwatch_metric_namespace" {
  description = "Custom CloudWatch namespace for uptime metrics."
  type        = string
  default     = "WebsiteUptimeMonitor"
}
