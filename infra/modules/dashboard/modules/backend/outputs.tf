output "api_gateway_url" {
  value = module.api_gateway.api_endpoint
}

output "lambda_functions" {
  value = { for k, v in module.lambda_functions : k => v.lambda_function_arn }
}
