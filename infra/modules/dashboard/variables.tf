variable "environment" {
  description = "Environment name."
  type        = string
  default     = "dev"
}

variable "name_prefix" {
  description = "A prefix used for naming resources."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-west-2"
}

variable "enable_deletion_protection" {
  description = "Deletion protection for frontend resources."
  type        = bool
  default     = false
}

variable "frontend_cdn_price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "backend_src_root" {
  description = "Path to the backend source code."
  type        = string
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name."
  type        = string
}

variable "api_allowed_origins" {
  description = "Allowed CORS origins for API Gateway and Lambda headers."
  type        = list(string)
  default     = ["*"]
}

variable "backend_log_retention_days" {
  description = "CloudWatch Logs retention for dashboard API Lambda functions."
  type        = number
  default     = 30
}
