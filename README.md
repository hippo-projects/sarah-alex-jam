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

Infrastructure is managed with Terraform in the `terraform/` directory.

### Architecture
- **Client** → S3 + CloudFront
- **Server** → AWS App Runner (Docker image via ECR)
- **Database** → Amazon DocumentDB (in a private VPC)

### Prerequisites
- [Terraform](https://developer.hashicorp.com/terraform/install)
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- Docker (for building the server image)

### 1. Configure Terraform variables
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
docdb_password = "your-strong-password"   # min 8 chars, no @ / " or spaces
jwt_secret     = "your-jwt-secret"
google_client_id = "your-google-client-id"  # optional
```

### 2. Deploy infrastructure
```bash
cd terraform
terraform init
terraform apply
```

After apply, note the outputs:
```
cloudfront_url      = "https://xxxx.cloudfront.net"
apprunner_url       = "https://xxxx.us-east-1.awsapprunner.com"
ecr_repository_url  = "069637868194.dkr.ecr.us-east-1.amazonaws.com/sarah-alex-jam-server"
docdb_endpoint      = "sarah-alex-jam-docdb.cluster-xxxx.us-east-1.docdb.amazonaws.com"
```

### 3. Build and push the server image to ECR
```bash
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    $(terraform output -raw ecr_repository_url)

docker build -t sarah-alex-jam-server ./server
docker tag sarah-alex-jam-server:latest $(terraform output -raw ecr_repository_url):latest
docker push $(terraform output -raw ecr_repository_url):latest
```

### 4. Deploy the client to S3
```bash
cd client
VITE_GRAPHQL_URL=$(cd ../terraform && terraform output -raw apprunner_url) \
  yarn build

aws s3 sync dist/ s3://$(cd ../terraform && terraform output -raw s3_bucket_name)/ --delete

aws cloudfront create-invalidation \
  --distribution-id $(cd ../terraform && terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

---

## Tear Down

To destroy all AWS infrastructure:
```bash
cd terraform
terraform destroy
```

> ⚠️ This permanently deletes the DocumentDB cluster, all S3 files, and all other provisioned resources. There is no final snapshot by default.

To also remove the ECR images before destroying:
```bash
aws ecr batch-delete-image \
  --repository-name sarah-alex-jam-server \
  --image-ids imageTag=latest
terraform destroy
```
