variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name used as a prefix for resource names"
  type        = string
  default     = "sarah-alex-jam-staging"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"
}

variable "docdb_password" {
  description = "Master password for the DocumentDB Elastic cluster"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret used to sign JWT tokens"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID for authentication"
  type        = string
  default     = ""
}
