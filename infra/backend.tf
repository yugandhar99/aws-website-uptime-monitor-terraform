# For portfolio/local testing, Terraform uses local state by default.
# For team usage, uncomment and configure this remote backend after creating the S3 bucket and DynamoDB lock table.
# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "website-uptime-monitor/terraform.tfstate"
#     region         = "us-west-2"
#     dynamodb_table = "your-terraform-lock-table"
#     encrypt        = true
#   }
# }
