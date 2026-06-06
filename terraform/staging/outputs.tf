output "cloudfront_url" {
  description = "CloudFront distribution domain name for the React client"
  value       = "https://${aws_cloudfront_distribution.client.domain_name}"
}

output "apprunner_url" {
  description = "App Runner service URL for the GraphQL API"
  value       = "https://${aws_apprunner_service.server.service_url}"
}

output "ecr_repository_url" {
  description = "ECR repository URL — push Docker images here before deploying"
  value       = aws_ecr_repository.server.repository_url
}

output "docdb_endpoint" {
  description = "DocumentDB Elastic cluster endpoint"
  value       = aws_docdbelastic_cluster.staging.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name for the React client"
  value       = aws_s3_bucket.client.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.client.id
}
