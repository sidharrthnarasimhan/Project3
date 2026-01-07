# Startup OS - AWS/Azure Production Deployment Guide

## 🏗️ Enterprise Architecture Overview

This guide covers production-ready, auto-scaling deployment on AWS and Azure with CI/CD, monitoring, and security best practices.

---

# AWS Deployment Architecture

## 🎯 Recommended AWS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                          │
│                   app.yourdomain.com                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              CloudFront (Global CDN)                        │
│              - SSL/TLS Termination                          │
│              - DDoS Protection                              │
│              - Edge Caching                                 │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
    ┌──────▼──────┐            ┌───────▼────────┐
    │   S3 Bucket │            │  API Gateway   │
    │  (Frontend) │            │  (REST API)    │
    │   - React   │            └───────┬────────┘
    │   - Static  │                    │
    └─────────────┘            ┌───────▼────────────────────┐
                               │   Application Load         │
                               │   Balancer (ALB)           │
                               └───────┬────────────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       │                               │
              ┌────────▼────────┐           ┌─────────▼────────┐
              │  ECS Fargate    │           │  ECS Fargate     │
              │  (Backend API)  │           │  (Backend API)   │
              │  - Auto Scaling │           │  - Auto Scaling  │
              │  - Container 1  │           │  - Container 2   │
              └────────┬────────┘           └─────────┬────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │   RDS PostgreSQL        │
                          │   - Multi-AZ            │
                          │   - Auto Backups        │
                          │   - Read Replicas       │
                          └─────────────────────────┘
```

---

## 📦 AWS Services Breakdown

### Core Services

| Service | Purpose | Monthly Cost (Est.) |
|---------|---------|---------------------|
| **CloudFront** | Global CDN, HTTPS | $1-50 (pay per use) |
| **S3** | Frontend hosting | $1-5 |
| **ECS Fargate** | Backend containers | $30-100 |
| **RDS PostgreSQL** | Database (db.t3.micro) | $15-50 |
| **Application Load Balancer** | Traffic distribution | $16-30 |
| **Route 53** | DNS management | $0.50/hosted zone |
| **CloudWatch** | Monitoring & logs | $5-20 |
| **Secrets Manager** | Secure env variables | $1-5 |
| **SES** | Email sending | $0.10/1000 emails |

**Total: ~$70-260/month** (scales with traffic)

---

## 🚀 Step-by-Step AWS Deployment

### Phase 1: Prerequisites & Setup

#### 1. Install AWS CLI
```bash
# macOS
brew install awscli

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

#### 2. Install Required Tools
```bash
# Install AWS CDK (Infrastructure as Code)
npm install -g aws-cdk

# Install Docker
# Download from: https://www.docker.com/products/docker-desktop

# Verify installations
aws --version
cdk --version
docker --version
```

---

### Phase 2: Database Setup (RDS PostgreSQL)

#### Option A: AWS RDS (Recommended for Production)

```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier startup-os-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible false \
  --storage-encrypted
```

**Production Settings:**
- Instance: `db.t3.small` or larger
- Multi-AZ: Enabled (high availability)
- Automated backups: 7-30 days
- Encryption: Enabled
- Storage: Auto-scaling enabled

#### Option B: Keep Neon (Simpler)
- Keep using your existing Neon database
- Update security settings to allow AWS IP ranges

---

### Phase 3: Backend Deployment (ECS Fargate)

#### 1. Create Dockerfile for Backend

Create `/backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
```

#### 2. Build and Push to ECR (Elastic Container Registry)

```bash
# Navigate to backend
cd /Users/sidharrthnarasimhan/Project3/backend

# Create ECR repository
aws ecr create-repository --repository-name startup-os-backend --region us-east-1

# Get ECR login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t startup-os-backend .

# Tag image
docker tag startup-os-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startup-os-backend:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startup-os-backend:latest
```

#### 3. Create ECS Cluster & Task Definition

**Via AWS Console:**
1. Go to **ECS** → **Clusters** → **Create Cluster**
2. Name: `startup-os-cluster`
3. Infrastructure: **AWS Fargate**
4. Create **Task Definition**:
   - Family: `startup-os-backend-task`
   - Container:
     - Image: `YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startup-os-backend:latest`
     - Port: 3001
     - CPU: 256 (.25 vCPU)
     - Memory: 512 MB
   - Environment Variables: Add from Secrets Manager

#### 4. Create Service with Auto-Scaling

```bash
aws ecs create-service \
  --cluster startup-os-cluster \
  --service-name startup-os-backend-service \
  --task-definition startup-os-backend-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3001
```

**Auto-Scaling Configuration:**
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/startup-os-cluster/startup-os-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# CPU-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/startup-os-cluster/startup-os-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

---

### Phase 4: Frontend Deployment (S3 + CloudFront)

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://startup-os-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://startup-os-frontend --index-document index.html --error-document index.html

# Upload built files
cd /Users/sidharrthnarasimhan/Project3
npm run build
aws s3 sync dist/ s3://startup-os-frontend --delete
```

#### 2. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name startup-os-frontend.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

**CloudFront Settings (Console):**
- Origin: S3 bucket
- Viewer Protocol: Redirect HTTP to HTTPS
- Price Class: Use all edge locations
- Alternate Domain Names: app.yourdomain.com
- SSL Certificate: Request via ACM
- Custom Error Response: 404 → /index.html (for React Router)

---

### Phase 5: Load Balancer & API Gateway

#### Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name startup-os-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing

# Create Target Group
aws elbv2 create-target-group \
  --name startup-os-targets \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /health

# Create Listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

### Phase 6: Security & Secrets

#### AWS Secrets Manager

```bash
# Create secret for environment variables
aws secretsmanager create-secret \
  --name startup-os/backend/env \
  --description "Backend environment variables" \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "CLERK_SECRET_KEY": "sk_live_...",
    "SENDGRID_API_KEY": "SG..."
  }'

# Update ECS Task Definition to use secrets
# Reference in task definition JSON:
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:xxx:secret:startup-os/backend/env:DATABASE_URL::"
    }
  ]
}
```

---

### Phase 7: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: startup-os-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster startup-os-cluster \
            --service startup-os-backend-service \
            --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://startup-os-frontend --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

### Phase 8: Monitoring & Logging

#### CloudWatch Setup

```bash
# Create Log Group
aws logs create-log-group --log-group-name /ecs/startup-os-backend

# Create Metric Alarm for CPU
aws cloudwatch put-metric-alarm \
  --alarm-name startup-os-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

#### X-Ray for Distributed Tracing (Optional)
```bash
# Add to backend Dockerfile
RUN npm install aws-xray-sdk

# Update server.js
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
```

---

## 💰 AWS Cost Optimization

### Development Environment (~$30/month)
- RDS: db.t3.micro ($15)
- ECS: 1 Fargate task (.25 vCPU, 512 MB) ($7)
- ALB: 1 instance ($16)
- S3 + CloudFront: ($2)

### Production Environment (~$150-500/month)
- RDS: db.t3.medium Multi-AZ ($80-150)
- ECS: 2-5 Fargate tasks (.5 vCPU, 1 GB each) ($50-150)
- ALB: ($20-30)
- CloudFront: ($10-50)
- Secrets Manager: ($5)
- CloudWatch: ($10-20)

### Cost Saving Tips
1. Use **Reserved Instances** for RDS (save 30-50%)
2. Use **Savings Plans** for ECS (save 20-40%)
3. Enable **S3 Intelligent Tiering**
4. Set **CloudWatch log retention** to 7-14 days
5. Use **AWS Budgets** to track spending

---

# Azure Deployment Architecture

## 🎯 Recommended Azure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Azure Front Door (Global CDN)                  │
│              - WAF Protection                               │
│              - SSL/TLS                                      │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
    ┌──────▼──────┐            ┌───────▼────────────┐
    │   Blob      │            │   API Management   │
    │   Storage   │            │   (Optional)       │
    │  (Frontend) │            └───────┬────────────┘
    └─────────────┘                    │
                               ┌───────▼────────────────────┐
                               │   Application Gateway      │
                               │   (Load Balancer + WAF)    │
                               └───────┬────────────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       │                               │
              ┌────────▼────────┐           ┌─────────▼────────┐
              │  Container      │           │  Container       │
              │  Instance       │           │  Instance        │
              │  (Backend)      │           │  (Backend)       │
              └────────┬────────┘           └─────────┬────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  Azure Database for     │
                          │  PostgreSQL             │
                          │  - Flexible Server      │
                          │  - High Availability    │
                          └─────────────────────────┘
```

---

## 📦 Azure Services Breakdown

| Service | Purpose | Monthly Cost (Est.) |
|---------|---------|---------------------|
| **Azure Front Door** | Global CDN, WAF | $35-100 |
| **Blob Storage** | Frontend hosting | $1-5 |
| **Container Instances** | Backend containers | $30-80 |
| **Azure Database PostgreSQL** | Database | $20-100 |
| **Application Gateway** | Load balancer | $20-40 |
| **Key Vault** | Secrets management | $1-5 |
| **App Insights** | Monitoring | $5-20 |

**Total: ~$110-350/month**

---

## 🚀 Step-by-Step Azure Deployment

### Phase 1: Prerequisites

```bash
# Install Azure CLI
brew install azure-cli

# Login
az login

# Set subscription
az account set --subscription "Your Subscription Name"

# Create Resource Group
az group create --name startup-os-rg --location eastus
```

---

### Phase 2: Database (Azure Database for PostgreSQL)

```bash
az postgres flexible-server create \
  --resource-group startup-os-rg \
  --name startup-os-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password 'SecurePassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --high-availability Enabled \
  --backup-retention 7
```

---

### Phase 3: Backend (Azure Container Instances)

```bash
# Create Azure Container Registry
az acr create \
  --resource-group startup-os-rg \
  --name startuposacr \
  --sku Basic

# Build and push image
az acr build \
  --registry startuposacr \
  --image backend:latest \
  ./backend

# Deploy Container Instance
az container create \
  --resource-group startup-os-rg \
  --name startup-os-backend \
  --image startuposacr.azurecr.io/backend:latest \
  --cpu 1 \
  --memory 1.5 \
  --registry-login-server startuposacr.azurecr.io \
  --registry-username $(az acr credential show --name startuposacr --query username -o tsv) \
  --registry-password $(az acr credential show --name startuposacr --query passwords[0].value -o tsv) \
  --dns-name-label startup-os-api \
  --ports 3001 \
  --environment-variables \
    NODE_ENV=production \
    PORT=3001 \
  --secure-environment-variables \
    DATABASE_URL='postgresql://...' \
    CLERK_SECRET_KEY='sk_live_...'
```

---

### Phase 4: Frontend (Azure Blob Storage + CDN)

```bash
# Create storage account
az storage account create \
  --name startuposfrontend \
  --resource-group startup-os-rg \
  --location eastus \
  --sku Standard_LRS

# Enable static website
az storage blob service-properties update \
  --account-name startuposfrontend \
  --static-website \
  --404-document index.html \
  --index-document index.html

# Upload frontend
az storage blob upload-batch \
  --account-name startuposfrontend \
  --source ./dist \
  --destination '$web'

# Create Azure Front Door
az afd profile create \
  --profile-name startup-os-frontdoor \
  --resource-group startup-os-rg \
  --sku Standard_AzureFrontDoor
```

---

## 📊 Scaling Configuration

### AWS Auto-Scaling
- **Min instances**: 2
- **Max instances**: 10
- **Scale up**: CPU > 70% for 2 minutes
- **Scale down**: CPU < 30% for 5 minutes

### Azure Auto-Scaling
- **Container Instances**: Manual scaling
- **App Service**: Auto-scale rules
- **Kubernetes (AKS)**: Horizontal Pod Autoscaler

---

## 🔒 Security Best Practices

### Network Security
- [x] Use VPC/VNet with private subnets
- [x] Enable WAF on load balancers
- [x] Restrict database access to backend only
- [x] Use Security Groups/NSGs
- [x] Enable DDoS protection

### Application Security
- [x] Store secrets in Secrets Manager/Key Vault
- [x] Enable HTTPS everywhere
- [x] Use IAM roles (not access keys)
- [x] Enable encryption at rest
- [x] Regular security scanning

### Monitoring
- [x] Set up CloudWatch/App Insights
- [x] Configure alerts for errors
- [x] Monitor costs
- [x] Track performance metrics

---

## 📈 Performance Optimization

1. **Database**: Connection pooling, read replicas
2. **Backend**: Horizontal scaling, caching (Redis)
3. **Frontend**: CDN caching, image optimization
4. **API**: Rate limiting, compression

---

## 🎯 Next Steps

1. Choose your platform (AWS or Azure)
2. Set up development environment first
3. Test thoroughly
4. Set up CI/CD pipeline
5. Deploy to production
6. Monitor and optimize

---

**Questions?** This is a production-grade setup. Start with the development tier and scale as needed!
