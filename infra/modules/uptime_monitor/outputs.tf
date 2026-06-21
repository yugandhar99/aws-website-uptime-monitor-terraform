output "lambda_function_name" {
  description = "Name of the uptime check Lambda function."
  value       = module.lambda_function.lambda_function_name
}

output "lambda_function_arn" {
  description = "ARN of the uptime check Lambda function."
  value       = module.lambda_function.lambda_function_arn
}

output "sns_topic_arn" {
  description = "SNS topic ARN used for uptime alerts."
  value       = module.sns_topic.topic_arn
}
