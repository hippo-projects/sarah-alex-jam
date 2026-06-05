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
