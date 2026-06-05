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
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.main.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name for the React client"
  value       = aws_s3_bucket.client.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.client.id
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID — needed as an input for the staging workspace"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Route 53 name servers — point your domain registrar at these"
  value       = aws_route53_zone.main.name_servers
}

output "client_url" {
  description = "Custom domain URL for the React client"
  value       = "https://${var.domain_name}"
}

output "api_url" {
  description = "Custom domain URL for the GraphQL API"
  value       = "https://api.${var.domain_name}"
}
