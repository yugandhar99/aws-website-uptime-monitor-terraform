data "aws_dynamodb_table" "this" {
  name = var.dynamodb_table_name
}

module "sns_topic" {
  source  = "terraform-aws-modules/sns/aws"
  version = "6.2.0"

  name = "${var.name_prefix}-sns-${var.environment}"

  subscriptions = var.subscriber_email == null || var.subscriber_email == "" ? {} : {
    email = {
      protocol = "email"
      endpoint = var.subscriber_email
    }
  }
}

module "lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.1.0"

  function_name = "${var.name_prefix}-uptime-fn-${var.environment}"
  source_path = [
    "${path.module}/lambda/function.mjs",
    { npm_requirements = "${path.module}/lambda/package.json" }
  ]
  handler = "function.handler"
  runtime = "nodejs22.x"

  timeout     = var.lambda_timeout_seconds
  memory_size = var.lambda_memory_mb
  publish     = true

  tracing_mode                        = "Active"
  cloudwatch_logs_retention_in_days   = var.log_retention_days
  create_current_version_allowed_triggers = false

  attach_policy_json = true
  policy_json = templatefile("${path.module}/templates/lambda_policy.json", {
    dynamodb_table_arn        = data.aws_dynamodb_table.this.arn
    sns_topic_arn             = module.sns_topic.topic_arn
    cloudwatch_metric_namespace = var.cloudwatch_metric_namespace
  })

  allowed_triggers = {
    eventbridge = {
      service    = "events"
      source_arn = module.eventbridge.eventbridge_rule_arns["crons"]
    }
  }

  artifacts_dir = "${path.root}/.terraform/lambda-builds/"
  environment_variables = {
    ENVIRONMENT               = var.environment
    DYNAMODB_TABLE            = data.aws_dynamodb_table.this.name
    SNS_TOPIC_ARN             = module.sns_topic.topic_arn
    WEBSITE_URL               = var.website_url
    EXPECTED_STATUS_CODE      = tostring(var.assertions.status_code)
    EXPECTED_KEYWORD          = var.assertions.body_includes
    MAX_RESPONSE_TIME_MS      = tostring(var.assertions.max_response_time_ms)
    REQUEST_TIMEOUT_MS        = tostring(var.request_timeout_ms)
    RETENTION_DAYS            = tostring(var.retention_days)
    CLOUDWATCH_NAMESPACE      = var.cloudwatch_metric_namespace
    USER_AGENT                = "website-uptime-monitor/${var.environment}"
  }
}

module "eventbridge" {
  source  = "terraform-aws-modules/eventbridge/aws"
  version = "4.1.0"

  create_bus = false

  rules = {
    crons = {
      description         = "Website uptime check schedule for ${var.website_url}"
      schedule_expression = var.ping_schedule
    }
  }

  targets = {
    crons = [
      {
        name = "uptime-check-lambda"
        arn  = module.lambda_function.lambda_function_arn
      }
    ]
  }
}

resource "aws_cloudwatch_metric_alarm" "uptime_failure" {
  count = var.enable_metric_alarms ? 1 : 0

  alarm_name          = "${var.name_prefix}-${var.environment}-website-down"
  alarm_description   = "Website uptime check failed for ${var.website_url}."
  namespace           = var.cloudwatch_metric_namespace
  metric_name         = "UptimeCheckFailure"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = [module.sns_topic.topic_arn]
  ok_actions          = [module.sns_topic.topic_arn]

  dimensions = {
    Environment = var.environment
    WebsiteUrl  = var.website_url
  }
}

resource "aws_cloudwatch_metric_alarm" "high_latency" {
  count = var.enable_metric_alarms ? 1 : 0

  alarm_name          = "${var.name_prefix}-${var.environment}-high-latency"
  alarm_description   = "Website response time exceeded the configured threshold for ${var.website_url}."
  namespace           = var.cloudwatch_metric_namespace
  metric_name         = "ResponseTimeMs"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  period              = 300
  statistic           = "Average"
  threshold           = var.assertions.max_response_time_ms
  treat_missing_data  = "notBreaching"
  alarm_actions       = [module.sns_topic.topic_arn]

  dimensions = {
    Environment = var.environment
    WebsiteUrl  = var.website_url
  }
}
