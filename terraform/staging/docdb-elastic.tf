# ---------------------------------------------------------------------------
# DocumentDB Elastic Cluster — serverless, scales to zero, pay per use
# Replaces standard DocumentDB for staging to minimize idle costs (~$1-5/mo vs ~$55/mo)
# ---------------------------------------------------------------------------
resource "aws_docdbelastic_cluster" "staging" {
  name           = "${var.app_name}-docdb-elastic"
  shard_count    = 1
  shard_capacity = 2  # minimum: 2 vCPUs

  admin_user_name     = "sajadmin"
  admin_user_password = var.docdb_password

  subnet_ids         = aws_subnet.private[*].id
  vpc_security_group_ids = [aws_security_group.docdb.id]

  tags = {
    Name        = "${var.app_name}-docdb-elastic"
    Environment = var.environment
  }
}
