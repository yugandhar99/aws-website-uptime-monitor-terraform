module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.5.0"

  bucket = "${var.name_prefix}-fe-s3-${var.environment}"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning = {
    enabled = true
  }

  attach_policy = true
  policy = templatefile("${path.module}/templates/s3_bucket_policy.json", {
    bucket_id = module.s3_bucket.s3_bucket_id
    cf_arn    = module.cdn.cloudfront_distribution_arn
  })

  force_destroy = !var.enable_deletion_protection
}

module "cdn" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "5.0.0"

  comment             = "CloudFront for ${module.s3_bucket.s3_bucket_id} bucket"
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = var.cdn_price_class
  retain_on_delete    = var.enable_deletion_protection
  default_root_object = var.default_root_object

  create_origin_access_control = true
  origin_access_control = {
    s3_oac = {
      description      = "CloudFront access to S3 dashboard bucket"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

  origin = {
    s3 = {
      domain_name           = module.s3_bucket.s3_bucket_bucket_regional_domain_name
      origin_access_control = "s3_oac"
    }
  }

  default_cache_behavior = {
    target_origin_id       = "s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = var.cdn_allowed_methods
    cached_methods         = var.cdn_cached_methods
    use_forwarded_values   = false

    cache_policy_name            = "Managed-CachingOptimized"
    origin_request_policy_name   = "Managed-CORS-S3Origin"
    response_headers_policy_name = "Managed-SecurityHeadersPolicy"
  }

  ordered_cache_behavior = [
    {
      target_origin_id       = "s3"
      path_pattern           = "/static/*"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = var.cdn_allowed_methods
      cached_methods         = var.cdn_cached_methods
      use_forwarded_values   = false

      cache_policy_name            = "Managed-CachingOptimized"
      origin_request_policy_name   = "Managed-CORS-S3Origin"
      response_headers_policy_name = "Managed-SecurityHeadersPolicy"
    }
  ]

  viewer_certificate = {
    cloudfront_default_certificate = true
  }
}
