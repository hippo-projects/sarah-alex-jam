# sarah-alex-jam

A music jam with Sarah and Alex.

## Architecture

| Layer | Technology |
|---|---|
| Client | React + Vite + TypeScript |
| Server | Apollo GraphQL + Node.js (TypeScript) |
| Database | MongoDB (local) / Amazon DocumentDB (production) |
| Auth | JWT + Google OAuth (`@react-oauth/google`) |

---

## Dev Setup

### Prerequisites
- Node.js
- Yarn
- Docker (for local MongoDB)

### 1. Install dependencies
```bash
yarn install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/sarah-alex-jam
JWT_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
PORT=4000
```

Edit `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Start MongoDB
```bash
docker compose up -d
```

### 4. Start the dev servers
```bash
yarn dev          # client + server together
yarn dev:client   # Vite only  → http://localhost:5173
yarn dev:server   # Apollo only → http://localhost:4000/graphql
```

### Useful scripts
```bash
yarn cache:clear        # wipe all node_modules and reinstall
yarn cache:clear:vite   # clear Vite build cache only
```

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an OAuth client ID → **Web application**
3. Add `http://localhost:5173` to **Authorized JavaScript origins**
4. Copy the Client ID into both `.env` files above

---

## AWS Deployment

Infrastructure is managed with Terraform. Two environments are available:

| | Production (`terraform/`) | Staging (`terraform/staging/`) |
|---|---|---|
| **Database** | DocumentDB standard (`db.t3.medium`) | DocumentDB Elastic (serverless) |
| **App Runner** | 1 vCPU / 2GB | 0.25 vCPU / 0.5GB |
| **Est. cost** | ~$60–80/mo | ~$5–15/mo |

### Architecture
- **Client** → S3 + CloudFront
- **Server** → AWS App Runner (Docker image via ECR)
- **Database** → Amazon DocumentDB (production) / DocumentDB Elastic (staging)

### Prerequisites
- [Terraform](https://developer.hashicorp.com/terraform/install)
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- Docker (for building the server image)

---

### First-time setup

#### 1. Configure Terraform variables

**Staging:**
```bash
cd terraform/staging
cp terraform.tfvars.example terraform.tfvars
```

**Production:**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
docdb_password   = "your-strong-password"    # min 8 chars, no @ / " or spaces
jwt_secret       = "your-jwt-secret"
domain_name      = "yourdomain.com"
google_client_id = "your-google-client-id"   # optional
```

Edit `terraform/staging/terraform.tfvars`:
```hcl
docdb_password   = "your-strong-password"
jwt_secret       = "your-jwt-secret"
domain_name      = "yourdomain.com"
route53_zone_id  = "Z0123456789ABCDEFGHIJ"   # from: cd terraform && terraform output -raw route53_zone_id
google_client_id = "your-google-client-id"   # optional
```

> **Note:** Deploy production first so the Route 53 zone exists before staging tries to add records to it.

#### 2. Deploy infrastructure
```bash
# Staging
cd terraform/staging && terraform init && terraform apply

# Production
cd terraform && terraform init && terraform apply
```

After apply, note the outputs — you'll need them for the steps below and for GitHub secrets:
```
cloudfront_url             = "https://xxxx.cloudfront.net"
apprunner_url              = "https://xxxx.us-east-1.awsapprunner.com"
ecr_repository_url         = "069637868194.dkr.ecr.us-east-1.amazonaws.com/sarah-alex-jam-staging-server"
s3_bucket_name             = "sarah-alex-jam-staging-client-xxxx"
cloudfront_distribution_id = "XXXXXXXXXXXX"
docdb_endpoint             = "xxxx.us-east-1.docdb.amazonaws.com"
route53_zone_id            = "Z0123456789ABCDEFGHIJ"
name_servers               = ["ns-xxx.awsdns-xx.com", ...]
client_url                 = "https://yourdomain.com"
api_url                    = "https://api.yourdomain.com"
```

> **Domain registrar step:** After the first production `terraform apply`, copy the `name_servers` output and set them as the nameservers at your domain registrar. DNS propagation takes a few minutes to a few hours.

#### 3. Push the server image to ECR

> Must be done once before Terraform can start App Runner.

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    069637868194.dkr.ecr.us-east-1.amazonaws.com

# Build for linux/amd64 (required for App Runner)
docker build --platform linux/amd64 -t sarah-alex-jam-server ./server

# Tag and push (replace with your ECR repo URL from terraform output)
ECR_REPO=$(cd terraform/staging && terraform output -raw ecr_repository_url)
docker tag sarah-alex-jam-server:latest $ECR_REPO:latest
docker push $ECR_REPO:latest
```

#### 4. Deploy the client to S3
```bash
# Build with production GraphQL URL
VITE_GRAPHQL_URL=$(cd terraform/staging && terraform output -raw apprunner_url) \
  yarn workspace sarah-alex-jam-client build

# Sync to S3
S3_BUCKET=$(cd terraform/staging && terraform output -raw s3_bucket_name)
aws s3 sync client/dist/ s3://$S3_BUCKET/ --delete

# Invalidate CloudFront cache
CF_ID=$(cd terraform/staging && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
```

---

### Ongoing deployments

After first-time setup, deployments are automated via GitHub Actions:

| Trigger | What runs |
|---|---|
| PR into `main` | Auto-deploys changed parts (client / server / terraform) to staging |
| Merge to `main` | Same as above |
| Manual | Run individual workflows from **Actions → Run workflow** |

#### Manual workflows (Actions tab in GitHub)

| Workflow | What it does |
|---|---|
| **Deploy Client (manual)** | Build Vite + sync to S3 + invalidate CloudFront |
| **Deploy Server (manual)** | Build Docker image + push to ECR |
| **Terraform Apply (manual)** | `plan`, `apply`, or `destroy` for staging |

#### GitHub Secrets required

Add these in **Settings → Secrets → Actions**:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `STAGING_APPRUNNER_URL` | `terraform output apprunner_url` |
| `STAGING_S3_BUCKET` | `terraform output s3_bucket_name` |
| `STAGING_CLOUDFRONT_ID` | `terraform output cloudfront_distribution_id` |
| `STAGING_CLOUDFRONT_DOMAIN` | CloudFront domain (no `https://`) |
| `STAGING_GOOGLE_CLIENT_ID` | Google Cloud Console |
| `STAGING_DOCDB_PASSWORD` | Value set in `terraform.tfvars` |
| `STAGING_JWT_SECRET` | Value set in `terraform.tfvars` |
| `STAGING_DOMAIN_NAME` | Root domain (e.g. `yourdomain.com`) |
| `STAGING_ROUTE53_ZONE_ID` | `cd terraform && terraform output -raw route53_zone_id` |

---

## Tear Down

```bash
# Empty ECR and S3 first (Terraform can't delete non-empty resources)
aws ecr batch-delete-image \
  --repository-name sarah-alex-jam-staging-server \
  --region us-east-1 \
  --image-ids "$(aws ecr list-images --repository-name sarah-alex-jam-staging-server --region us-east-1 --query 'imageIds' --output json)"

S3_BUCKET=$(cd terraform/staging && terraform output -raw s3_bucket_name)
aws s3 rm s3://$S3_BUCKET --recursive

# Destroy all infrastructure
cd terraform/staging && terraform destroy
```

> ⚠️ This permanently deletes all provisioned resources. There is no final snapshot.
