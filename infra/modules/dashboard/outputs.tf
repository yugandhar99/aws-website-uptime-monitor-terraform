output "url" {
  value = "https://${module.frontend.cdn_domain_name}"
}

output "api_url" {
  value = module.backend.api_gateway_url
}
