# Budget CAR - Deployment Runbook

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Procedures](#deployment-procedures)
5. [Health Checks](#health-checks)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
8. [Maintenance Operations](#maintenance-operations)

---

## Overview

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   FastAPI   │────▶│  PostgreSQL │
│  (Frontend) │     │  (Backend)  │     │     (DB)    │
│   Port 80   │     │  Port 8000  │     │  Port 5432  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Services

| Service  | Container Name | Port | Technology        |
|----------|----------------|------|-------------------|
| Frontend | web            | 80   | React + Nginx     |
| Backend  | backend        | 8000 | FastAPI + Uvicorn |
| Database | db             | 5432 | PostgreSQL 16     |

### Files

| File                      | Purpose                              |
|---------------------------|--------------------------------------|
| `docker-compose.yml`      | Development configuration            |
| `docker-compose.prod.yml` | Production configuration             |
| `.env.example`            | Development environment template     |
| `.env.prod.example`       | Production environment template      |
| `backend/Dockerfile`      | Development backend image            |
| `backend/Dockerfile.prod` | Production backend image             |
| `frontend/Dockerfile`     | Development frontend image           |
| `frontend/Dockerfile.prod`| Production frontend image            |

---

## Pre-Deployment Checklist

### Before First Deployment

- [ ] Server/VM provisioned with Docker and Docker Compose installed
- [ ] Domain name configured (if applicable)
- [ ] SSL certificate obtained (Let's Encrypt or similar)
- [ ] Firewall rules configured (ports 80, 443 open)
- [ ] `.env.prod` file created from `.env.prod.example`
- [ ] All secrets generated (JWT_SECRET, RESET_TOKEN_SECRET, DB password)
- [ ] Backup strategy defined

### Before Each Deployment

- [ ] All tests passing (`make test` or CI/CD green)
- [ ] Code reviewed and approved
- [ ] Database migrations reviewed (if any)
- [ ] Current version noted for rollback reference
- [ ] Maintenance window communicated (if needed)

---

## Environment Configuration

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate reset token secret  
openssl rand -hex 32

# Generate database password
openssl rand -base64 24
```

### Create Production Environment File

```bash
# Copy template
cp .env.prod.example .env.prod

# Edit with your values
nano .env.prod
```

### Required Environment Variables

| Variable              | Description                          | Example                    |
|-----------------------|--------------------------------------|----------------------------|
| `POSTGRES_USER`       | Database username                    | `budgetcar_prod`           |
| `POSTGRES_PASSWORD`   | Database password                    | (generated)                |
| `POSTGRES_DB`         | Database name                        | `budgetcar_production`     |
| `DATABASE_URL`        | Full connection string               | `postgresql+psycopg2://...`|
| `JWT_SECRET`          | JWT signing key (64+ chars)          | (generated)                |
| `RESET_TOKEN_SECRET`  | Password reset token key             | (generated)                |
| `CORS_ORIGINS`        | Allowed frontend origins             | `https://yourdomain.com`   |
| `VITE_API_URL`        | API URL for frontend                 | `https://api.yourdomain.com`|

---

## Deployment Procedures

### Initial Deployment

```bash
# 1. Clone repository
git clone https://github.com/Couragous77/625-CAR-Group-Project-.git
cd 625-CAR-Group-Project-

# 2. Create production environment file
cp .env.prod.example .env.prod
# Edit .env.prod with your values

# 3. Build and start services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 4. Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Verify health
curl http://localhost:8000/health/ready
curl http://localhost:80/health

# 6. (Optional) Seed initial data
docker compose -f docker-compose.prod.yml exec backend python -m app.seed
```

### Update Deployment (Rolling Update)

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new images (without stopping current containers)
docker compose -f docker-compose.prod.yml --env-file .env.prod build

# 3. Record current image IDs for rollback
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep "625-car" > /tmp/previous-images.txt

# 4. Apply database migrations (if any)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Rolling restart (one service at a time)
docker compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 10
curl http://localhost:8000/health/ready  # Verify backend

docker compose -f docker-compose.prod.yml up -d --no-deps web
sleep 5
curl http://localhost:80/health  # Verify frontend

# 6. Clean up old images
docker image prune -f
```

### Zero-Downtime Deployment (Blue-Green)

For zero-downtime deployments, use a reverse proxy (Nginx/Traefik) in front:

```bash
# 1. Start new containers on different ports
docker compose -f docker-compose.prod.yml --env-file .env.prod \
  -p budgetcar-blue up -d --build

# 2. Verify new deployment health
curl http://localhost:8001/health/ready

# 3. Switch traffic in reverse proxy to new containers

# 4. Stop old containers
docker compose -p budgetcar-green down
```

---

## Health Checks

### Available Endpoints

| Endpoint         | Purpose                    | Expected Response           |
|------------------|----------------------------|-----------------------------|
| `/health`        | Basic liveness             | `{"status": "ok"}`          |
| `/health/live`   | Process is running         | `{"status": "alive"}`       |
| `/health/ready`  | Ready to serve traffic     | `{"status": "ready", ...}`  |

### Manual Health Verification

```bash
# Backend health
curl -s http://localhost:8000/health | jq
curl -s http://localhost:8000/health/ready | jq

# Frontend health
curl -s http://localhost:80/health

# Database connectivity
docker compose -f docker-compose.prod.yml exec db pg_isready -U $POSTGRES_USER

# View service status
docker compose -f docker-compose.prod.yml ps
```

### Automated Health Monitoring

Docker Compose includes built-in health checks. View status:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' $(docker ps -q)

# View health check logs
docker inspect --format='{{json .State.Health}}' backend | jq
```

---

## Rollback Procedures

### Quick Rollback (Same Version, Config Issue)

```bash
# 1. Stop current containers
docker compose -f docker-compose.prod.yml down

# 2. Fix configuration
nano .env.prod

# 3. Restart
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Code Rollback (Previous Version)

```bash
# 1. Identify the previous working commit
git log --oneline -10

# 2. Stop current containers
docker compose -f docker-compose.prod.yml down

# 3. Checkout previous version
git checkout <previous-commit-hash>

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 5. Verify health
curl http://localhost:8000/health/ready
```

### Database Migration Rollback

```bash
# 1. Check current migration
docker compose -f docker-compose.prod.yml exec backend alembic current

# 2. View migration history
docker compose -f docker-compose.prod.yml exec backend alembic history

# 3. Rollback to specific revision
docker compose -f docker-compose.prod.yml exec backend alembic downgrade <revision>

# Example: Rollback one migration
docker compose -f docker-compose.prod.yml exec backend alembic downgrade -1
```

### Image Rollback (Using Saved Images)

```bash
# If you saved previous image IDs:
cat /tmp/previous-images.txt

# Tag old image as current
docker tag <old-image-id> 625-car-group-project_backend:latest

# Restart with old image
docker compose -f docker-compose.prod.yml up -d --no-build
```

---

## Monitoring & Troubleshooting

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f db

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Common Issues

#### Backend Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Common causes:
# - Database not ready: Check db health
# - Missing environment variables: Verify .env.prod
# - Migration error: Check alembic logs
```

#### Database Connection Failed

```bash
# Verify database is running
docker compose -f docker-compose.prod.yml ps db

# Test connection
docker compose -f docker-compose.prod.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1"

# Check DATABASE_URL matches docker network
# Should use 'db' as hostname, not 'localhost'
```

#### Frontend Shows Blank Page

```bash
# Check nginx logs
docker compose -f docker-compose.prod.yml logs web

# Verify build succeeded
docker compose -f docker-compose.prod.yml exec web ls -la /usr/share/nginx/html

# Check API URL is correct
# VITE_API_URL must be set at BUILD time
```

#### Container Keeps Restarting

```bash
# Check exit code
docker inspect --format='{{.State.ExitCode}}' backend

# View last logs before crash
docker logs --tail=50 backend

# Check resource limits
docker stats
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -f
```

---

## Maintenance Operations

### Database Backup

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Stop backend first
docker compose -f docker-compose.prod.yml stop backend

# Restore from backup
cat backup_file.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U $POSTGRES_USER $POSTGRES_DB

# Restart backend
docker compose -f docker-compose.prod.yml start backend
```

### SSL Certificate Renewal

If using Let's Encrypt with certbot:

```bash
# Renew certificates
certbot renew

# Reload nginx
docker compose -f docker-compose.prod.yml exec web nginx -s reload
```

### Clean Up Old Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAUTION: may delete data)
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## Appendix: Quick Reference Commands

```bash
# Start production
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Stop production
docker compose -f docker-compose.prod.yml down

# View status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Run migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Backend shell
docker compose -f docker-compose.prod.yml exec backend bash

# Database shell
docker compose -f docker-compose.prod.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB

# Health check
curl http://localhost:8000/health/ready
```

---

## Contact & Escalation

| Issue Type          | Contact              | Response Time |
|---------------------|----------------------|---------------|
| App not responding  | On-call engineer     | 15 minutes    |
| Data issue          | Database admin       | 1 hour        |
| Security incident   | Security team        | Immediate     |
| Feature question    | Development team     | Next business day |

---

*Last updated: December 2025*
*Version: 1.0*
