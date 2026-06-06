resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# ---------------------------------------------------------------------------
# S3 bucket for the React/Vite static site
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "client" {
  bucket = "${var.app_name}-client-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "${var.app_name}-client"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "client" {
  bucket = aws_s3_bucket.client.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Origin Access Control — CloudFront authenticates to S3 with OAC (not OAI)
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "client" {
  name                              = "${var.app_name}-client-oac"
  description                       = "OAC for ${var.app_name} client bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ---------------------------------------------------------------------------
# Bucket policy — allow CloudFront OAC to read objects
# ---------------------------------------------------------------------------
data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "s3_cloudfront_oac" {
  statement {
    sid     = "AllowCloudFrontServicePrincipal"
    effect  = "Allow"
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.client.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.client.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "client" {
  bucket = aws_s3_bucket.client.id
  policy = data.aws_iam_policy_document.s3_cloudfront_oac.json

  # Explicit dependency ensures the CloudFront distribution (and its ARN) exist
  # before the bucket policy is applied. Without this, Terraform may apply the
  # policy before the distribution is created (the ARN reference flows through
  # a data source, so the implicit dep chain isn't always inferred correctly),
  # causing CloudFront to receive AccessDenied from S3 and return raw XML.
  depends_on = [
    aws_s3_bucket_public_access_block.client,
    aws_cloudfront_distribution.client,
  ]
}
