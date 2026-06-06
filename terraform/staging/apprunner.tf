# ---------------------------------------------------------------------------
# VPC Connector — gives App Runner access to the private VPC (for DocumentDB)
# ---------------------------------------------------------------------------
resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "${var.app_name}-vpc-connector"
  subnets            = aws_subnet.private[*].id
  security_groups    = [aws_security_group.docdb.id]

  tags = {
    Name        = "${var.app_name}-vpc-connector"
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# App Runner service
# ---------------------------------------------------------------------------
resource "aws_apprunner_service" "server" {
  service_name = "${var.app_name}-server"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.server.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "4000"

        runtime_environment_variables = {
          MONGODB_URI      = "mongodb://sajadmin:${var.docdb_password}@${aws_docdbelastic_cluster.staging.endpoint}:27017/?tls=true&tlsCAFile=/etc/ssl/certs/ca-bundle.crt&retryWrites=false"
          JWT_SECRET       = var.jwt_secret
          GOOGLE_CLIENT_ID = var.google_client_id
          PORT             = "4000"
        }
      }
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu    = "256"
    memory = "512"
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  tags = {
    Name        = "${var.app_name}-server"
    Environment = var.environment
  }

  depends_on = [aws_iam_role_policy_attachment.apprunner_ecr_access]
}
