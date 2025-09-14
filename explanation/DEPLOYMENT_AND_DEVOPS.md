# 🚀 Deployment and DevOps Guide for KrishiSetu

## Table of Contents
1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Production Deployment](#production-deployment)
5. [Infrastructure as Code](#infrastructure-as-code)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Backup and Recovery](#backup-and-recovery)
8. [Disaster Recovery](#disaster-recovery)
9. [Performance Optimization](#performance-optimization)
10. [Maintenance and Updates](#maintenance-and-updates)

---

## Overview

KrishiSetu's deployment and DevOps strategy ensures reliable, scalable, and maintainable delivery of the agricultural blockchain platform. This guide covers everything from local development to production deployment and ongoing maintenance.

### DevOps Principles
- **Automation**: Automated testing, building, and deployment
- **Infrastructure as Code**: Version-controlled infrastructure
- **Monitoring**: Comprehensive observability
- **Security**: Security-first deployment practices
- **Scalability**: Auto-scaling and load balancing
- **Reliability**: High availability and disaster recovery

---

## Development Environment

### 1. **Local Development Setup**

#### Prerequisites
```bash
# Required software versions
Node.js: >= 18.0.0
npm: >= 8.0.0
Git: >= 2.30.0
Docker: >= 20.10.0
Docker Compose: >= 2.0.0
```

#### Environment Setup
```bash
# Clone repository
git clone https://github.com/krishisetu/krishisetu-platform.git
cd krishisetu-platform

# Install dependencies
npm install

# Copy environment files
cp .env.example .env.local
cp .env.example .env.development

# Start development services
docker-compose up -d

# Start blockchain node
cd blockchain/smart-contracts
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
cd ../../frontend
npm run dev
```

#### Development Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:blockchain\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:blockchain": "cd blockchain/smart-contracts && npx hardhat node",
    "test": "npm run test:frontend && npm run test:blockchain",
    "test:frontend": "cd frontend && npm test",
    "test:blockchain": "cd blockchain/smart-contracts && npm test",
    "build": "npm run build:frontend && npm run build:blockchain",
    "build:frontend": "cd frontend && npm run build",
    "build:blockchain": "cd blockchain/smart-contracts && npx hardhat compile",
    "lint": "npm run lint:frontend && npm run lint:blockchain",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:blockchain": "cd blockchain/smart-contracts && npm run lint"
  }
}
```

### 2. **Docker Development Environment**

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend development server
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  # Backend API server
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/krishisetu
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  # PostgreSQL database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=krishisetu
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis cache
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  # Hardhat blockchain node
  blockchain:
    build:
      context: ./blockchain/smart-contracts
      dockerfile: Dockerfile
    ports:
      - "8545:8545"
    volumes:
      - ./blockchain/smart-contracts:/app
    command: npx hardhat node

volumes:
  postgres_data:
```

#### Development Dockerfile
```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## CI/CD Pipeline

### 1. **GitHub Actions Workflow**

#### Main CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: krishisetu

jobs:
  # Test and build
  test-and-build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test
        env:
          CI: true

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: |
            frontend/dist
            blockchain/smart-contracts/artifacts

  # Security scanning
  security-scan:
    runs-on: ubuntu-latest
    needs: test-and-build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Deploy to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test-and-build, security-scan]
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add staging deployment commands

  # Deploy to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [test-and-build, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add production deployment commands
```

#### Blockchain Deployment Pipeline
```yaml
# .github/workflows/blockchain-deploy.yml
name: Blockchain Deployment

on:
  push:
    branches: [main]
    paths: ['blockchain/**']

jobs:
  deploy-contracts:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd blockchain/smart-contracts
          npm ci

      - name: Compile contracts
        run: |
          cd blockchain/smart-contracts
          npx hardhat compile

      - name: Run tests
        run: |
          cd blockchain/smart-contracts
          npx hardhat test

      - name: Deploy to testnet
        run: |
          cd blockchain/smart-contracts
          npx hardhat run scripts/deploy.js --network sepolia
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          SEPOLIA_URL: ${{ secrets.SEPOLIA_URL }}

      - name: Verify contracts
        run: |
          cd blockchain/smart-contracts
          npx hardhat verify --network sepolia ${{ steps.deploy.outputs.contract_address }}
        env:
          ETHERSCAN_API_KEY: ${{ secrets.ETHERSCAN_API_KEY }}
```

### 2. **Automated Testing**

#### Test Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### E2E Testing
```typescript
// e2e/test-setup.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
});

test('user can register product', async ({ page }) => {
  // Login as farmer
  await page.click('[data-testid="farmer-login"]');
  await page.fill('[data-testid="email"]', 'farmer@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  // Navigate to product registration
  await page.click('[data-testid="add-product"]');
  
  // Fill product form
  await page.fill('[data-testid="product-name"]', 'Organic Wheat');
  await page.fill('[data-testid="quantity"]', '100');
  await page.fill('[data-testid="price"]', '50');
  await page.selectOption('[data-testid="quality"]', 'A');
  
  // Submit form
  await page.click('[data-testid="submit-product"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## Production Deployment

### 1. **Infrastructure Setup**

#### AWS Infrastructure
```yaml
# infrastructure/aws/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "krishisetu-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "krishisetu-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "krishisetu-public-subnet-${count.index + 1}"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "krishisetu-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "krishisetu-alb"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "krishisetu-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "krishisetu-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "krishisetu-app"
      image = "${var.ecr_repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]
      
      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}
```

### 2. **Kubernetes Deployment**

#### Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: krishisetu
  labels:
    name: krishisetu

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: krishisetu-app
  namespace: krishisetu
spec:
  replicas: 3
  selector:
    matchLabels:
      app: krishisetu-app
  template:
    metadata:
      labels:
        app: krishisetu-app
    spec:
      containers:
      - name: krishisetu-app
        image: krishisetu/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: krishisetu-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: krishisetu-service
  namespace: krishisetu
spec:
  selector:
    app: krishisetu-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: krishisetu-ingress
  namespace: krishisetu
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - krishisetu.com
    - www.krishisetu.com
    secretName: krishisetu-tls
  rules:
  - host: krishisetu.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: krishisetu-service
            port:
              number: 80
```

### 3. **Database Deployment**

#### PostgreSQL Configuration
```yaml
# k8s/postgres.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: krishisetu
data:
  POSTGRES_DB: krishisetu
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: ""

---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: krishisetu
type: Opaque
data:
  POSTGRES_PASSWORD: <base64-encoded-password>

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: krishisetu
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: postgres-secret
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

---

## Infrastructure as Code

### 1. **Terraform Configuration**

#### Main Infrastructure
```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "krishisetu"
}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Application = var.app_name
    ManagedBy   = "terraform"
  }
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.app_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = data.aws_availability_zones.available.names
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = true

  tags = local.common_tags
}

# RDS Database
module "rds" {
  source = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.app_name}-db"

  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "krishisetu"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  tags = local.common_tags
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.app_name}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.app_name}-redis"
  description                = "Redis cluster for KrishiSetu"

  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"

  num_cache_clusters = 2

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  tags = local.common_tags
}
```

### 2. **Helm Charts**

#### Application Helm Chart
```yaml
# helm/krishisetu/Chart.yaml
apiVersion: v2
name: krishisetu
description: KrishiSetu Agricultural Blockchain Platform
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
- name: postgresql
  version: 12.1.2
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
- name: redis
  version: 17.3.7
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled

---
# helm/krishisetu/values.yaml
replicaCount: 3

image:
  repository: krishisetu/app
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: krishisetu.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: krishisetu-tls
      hosts:
        - krishisetu.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

postgresql:
  enabled: true
  auth:
    postgresPassword: "changeme"
    database: "krishisetu"
  primary:
    persistence:
      enabled: true
      size: 10Gi

redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 5Gi
```

---

## Monitoring and Logging

### 1. **Application Monitoring**

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'krishisetu-app'
    static_configs:
      - targets: ['krishisetu-app:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "KrishiSetu Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

### 2. **Log Management**

#### ELK Stack Configuration
```yaml
# logging/elasticsearch.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: elasticsearch-config
  namespace: logging
data:
  elasticsearch.yml: |
    cluster.name: krishisetu-logs
    node.name: ${HOSTNAME}
    network.host: 0.0.0.0
    discovery.type: single-node
    xpack.security.enabled: false

---
# logging/logstash.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
  namespace: logging
data:
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }
    
    filter {
      if [fields][service] == "krishisetu-app" {
        grok {
          match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
        }
        date {
          match => [ "timestamp", "ISO8601" ]
        }
      }
    }
    
    output {
      elasticsearch {
        hosts => ["elasticsearch:9200"]
        index => "krishisetu-logs-%{+YYYY.MM.dd}"
      }
    }
```

---

## Backup and Recovery

### 1. **Database Backup**

#### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-krishisetu}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/backups}
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="krishisetu-backup-$(date +%Y%m%d-%H%M%S).sql"

# Create database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_DIR/$BACKUP_FILE.gz s3://krishisetu-backups/database/

# Clean up old backups
find $BACKUP_DIR -name "krishisetu-backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Kubernetes CronJob
```yaml
# k8s/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: krishisetu
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres -U postgres krishisetu | gzip > /backup/backup-$(date +%Y%m%d-%H%M%S).sql.gz
              aws s3 cp /backup/backup-*.sql.gz s3://krishisetu-backups/database/
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

### 2. **Application State Backup**

#### Configuration Backup
```bash
#!/bin/bash
# scripts/backup-config.sh

# Backup Kubernetes configurations
kubectl get all -n krishisetu -o yaml > /backups/k8s-resources-$(date +%Y%m%d).yaml

# Backup secrets
kubectl get secrets -n krishisetu -o yaml > /backups/k8s-secrets-$(date +%Y%m%d).yaml

# Backup configmaps
kubectl get configmaps -n krishisetu -o yaml > /backups/k8s-configmaps-$(date +%Y%m%d).yaml

# Upload to S3
aws s3 cp /backups/ s3://krishisetu-backups/kubernetes/ --recursive
```

---

## Disaster Recovery

### 1. **Recovery Procedures**

#### Database Recovery
```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-krishisetu}
DB_USER=${DB_USER:-postgres}
BACKUP_FILE=${1:-latest}

# Download backup from S3
aws s3 cp s3://krishisetu-backups/database/$BACKUP_FILE.gz /tmp/backup.sql.gz

# Decompress backup
gunzip /tmp/backup.sql.gz

# Restore database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < /tmp/backup.sql

# Clean up
rm /tmp/backup.sql

echo "Database restored from: $BACKUP_FILE"
```

#### Application Recovery
```bash
#!/bin/bash
# scripts/restore-application.sh

# Restore Kubernetes resources
kubectl apply -f /backups/k8s-resources-$(date +%Y%m%d).yaml

# Restore secrets
kubectl apply -f /backups/k8s-secrets-$(date +%Y%m%d).yaml

# Restore configmaps
kubectl apply -f /backups/k8s-configmaps-$(date +%Y%m%d).yaml

# Restart deployments
kubectl rollout restart deployment/krishisetu-app -n krishisetu
```

### 2. **Multi-Region Setup**

#### Cross-Region Replication
```yaml
# infrastructure/multi-region/main.tf
# Primary region (us-west-2)
module "primary" {
  source = "./modules/region"
  
  region = "us-west-2"
  environment = var.environment
  app_name = var.app_name
}

# Secondary region (us-east-1)
module "secondary" {
  source = "./modules/region"
  
  region = "us-east-1"
  environment = var.environment
  app_name = var.app_name
  
  # Cross-region replication
  replicate_from_region = "us-west-2"
}
```

---

## Performance Optimization

### 1. **CDN Configuration**

#### CloudFront Setup
```hcl
# infrastructure/cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "krishisetu-alb"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "krishisetu-alb"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### 2. **Caching Strategy**

#### Redis Configuration
```yaml
# k8s/redis-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
  namespace: krishisetu
data:
  redis.conf: |
    # Memory management
    maxmemory 256mb
    maxmemory-policy allkeys-lru
    
    # Persistence
    save 900 1
    save 300 10
    save 60 10000
    
    # Logging
    loglevel notice
    
    # Security
    requirepass ""
    
    # Performance
    tcp-keepalive 300
    timeout 0
```

---

## Maintenance and Updates

### 1. **Automated Updates**

#### Update Strategy
```yaml
# .github/workflows/update-dependencies.yml
name: Update Dependencies

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM
  workflow_dispatch:

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Update dependencies
        run: |
          npm update
          npm audit fix

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'Update Dependencies'
          body: 'Automated dependency update'
```

### 2. **Health Checks**

#### Application Health Endpoints
```typescript
// health-check.ts
import express from 'express';
import { healthCheck } from './middleware/health-check';

const app = express();

// Health check endpoint
app.get('/health', healthCheck);

// Readiness check endpoint
app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await database.ping();
    
    // Check Redis connection
    await redis.ping();
    
    // Check blockchain connection
    await blockchainService.getNetworkInfo();
    
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Liveness check endpoint
app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
```

---

## Summary

KrishiSetu's deployment and DevOps strategy provides:

1. **Development Environment**: Docker-based local development with hot reloading
2. **CI/CD Pipeline**: Automated testing, building, and deployment with GitHub Actions
3. **Production Deployment**: Kubernetes-based deployment with auto-scaling
4. **Infrastructure as Code**: Terraform and Helm for reproducible infrastructure
5. **Monitoring**: Comprehensive observability with Prometheus and Grafana
6. **Backup and Recovery**: Automated backups with disaster recovery procedures
7. **Performance Optimization**: CDN, caching, and performance monitoring
8. **Maintenance**: Automated updates and health checks

This comprehensive DevOps approach ensures KrishiSetu is deployed reliably, scales efficiently, and maintains high availability while providing excellent developer experience and operational excellence.
