# ---------------------------------------------------------------------------
# Staging uses a subdomain of the root domain: staging.<domain>
# DNS is managed in the same Route 53 hosted zone as production.
#
# Pass the production hosted zone ID as a variable so this module can add
# records without creating a second zone for the same domain.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# ACM certificate for staging subdomains (must be us-east-1 for CloudFront)
# ---------------------------------------------------------------------------
resource "aws_acm_certificate" "main" {
  domain_name               = "staging.${var.domain_name}"
  subject_alternative_names = ["api.staging.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.app_name}-cert"
    Environment = var.environment
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ---------------------------------------------------------------------------
# DNS — client (staging.<domain> → CloudFront)
# ---------------------------------------------------------------------------
resource "aws_route53_record" "client" {
  zone_id = var.route53_zone_id
  name    = "staging.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.client.domain_name
    zone_id                = aws_cloudfront_distribution.client.hosted_zone_id
    evaluate_target_health = false
  }
}

# ---------------------------------------------------------------------------
# DNS — server (api.staging.<domain> → App Runner)
# ---------------------------------------------------------------------------
resource "aws_apprunner_custom_domain_association" "server" {
  domain_name = "api.staging.${var.domain_name}"
  service_arn = aws_apprunner_service.server.arn
}

resource "aws_route53_record" "apprunner_validation" {
  for_each = {
    for r in aws_apprunner_custom_domain_association.server.certificate_validation_records : r.name => r
  }

  zone_id         = var.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.value]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_route53_record" "server" {
  zone_id = var.route53_zone_id
  name    = "api.staging.${var.domain_name}"
  type    = "CNAME"
  ttl     = 60
  records = [aws_apprunner_service.server.service_url]
}
