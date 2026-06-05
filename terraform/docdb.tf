resource "aws_docdb_subnet_group" "main" {
  name       = "${var.app_name}-docdb-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.app_name}-docdb-subnet-group"
    Environment = var.environment
  }
}

resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${var.app_name}-docdb"
  engine                  = "docdb"
  master_username         = var.docdb_username
  master_password         = var.docdb_password
  db_subnet_group_name    = aws_docdb_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.docdb.id]
  skip_final_snapshot     = true
  apply_immediately       = true

  tags = {
    Name        = "${var.app_name}-docdb"
    Environment = var.environment
  }
}

resource "aws_docdb_cluster_instance" "main" {
  identifier         = "${var.app_name}-docdb-instance-1"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"

  tags = {
    Name        = "${var.app_name}-docdb-instance-1"
    Environment = var.environment
  }
}
