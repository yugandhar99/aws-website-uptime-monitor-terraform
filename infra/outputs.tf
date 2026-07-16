output "dashboard_url" {
  description = "CloudFront dashboard URL."
  value       = module.dashboard.url
}


output "dashboard_api_url" {
  description = "API Gateway URL used by the React dashboard."
  value       = module.dashboard.api_url
}

output "dynamodb_table_name" {
  description = "DynamoDB table storing uptime history."
  value       = aws_dynamodb_table.uptime_metrics.name
}

output "uptime_lambda_name" {
  description = "Lambda function that performs scheduled website checks."
  value       = module.uptime_monitor.lambda_function_name
}

output "sns_topic_arn" {
  description = "SNS topic for uptime alerts."
  value       = module.uptime_monitor.sns_topic_arn
}
