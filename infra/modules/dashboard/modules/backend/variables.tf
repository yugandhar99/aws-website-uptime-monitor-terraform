variable "name_prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "requirements_path" {
  type = string
}

variable "handlers_dir" {
  type = string
}

variable "handler_extension" {
  type    = string
  default = "js"
}

variable "handler_suffix" {
  type    = string
  default = "handler"
}

variable "routes" {
  type        = map(string)
  description = "Map of API Gateway routes to handler file prefixes."
}

variable "runtime" {
  type    = string
  default = "nodejs22.x"
}

variable "dynamodb_table_name" {
  type = string
}

variable "enable_deletion_protection" {
  type    = bool
  default = false
}

variable "api_allowed_origins" {
  type    = list(string)
  default = ["*"]
}

variable "log_retention_days" {
  type    = number
  default = 30
}
