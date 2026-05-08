# Deployment Guide

## Overview

The Online Assessment Platform supports multiple deployment environments:
- **Local Development**: Docker Compose
- **Staging**: Render Cloud Platform
- **Production**: Render with High Availability

---

## Pre-Deployment Checklist

Before any deployment, verify:

- [ ] All tests passing: `npm run test:security`
- [ ] No console errors in build output
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Security scan passed
- [ ] Performance benchmarks acceptable
- [ ] Documentation updated
- [ ] Rollback plan documented

---

## Local Development Deployment

### Prerequisites

- Docker Desktop 4.0+
- Node.js 18+
- MongoDB local or Atlas connection
- Port availability: 3000, 8000, 80, 443

### Setup

```bash
# Clone repository
git clone <repo-url>
cd expense-tracker

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Create environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Configuration (.env)

**Backend:**
```env
NODE_ENV=development
PORT=8000
DB_URI=mongodb://localhost:27017/assessment
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=<generate-secure-random-string>
REFRESH_TOKEN_EXPIRY=7d

# Security
ENCRYPTION_KEY=<generate-32-byte-key>
HMAC_SECRET=<generate-secure-secret>

# OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000
VITE_ENVIRONMENT=development
```

### Start Development Environment

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Development URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1`
- MongoDB: `mongodb://localhost:27017`

### Development Commands

```bash
# Terminal 1: Backend development server
cd backend
npm run dev

# Terminal 2: Frontend development server
cd frontend
npm run dev

# Terminal 3: Run tests
npm run test:security
```

---

## Staging Deployment (Render)

### Prerequisites

- Render account with GitHub connected
- MongoDB Atlas cluster (staging)
- Environment variables configured in Render

### Deployment Steps

#### 1. Create Services

**Backend Service:**
```bash
# In Render Dashboard:
# 1. New > Web Service
# 2. Connect repository
# 3. Configure:
Name: assessment-api-staging
Environment: Node
Build Command: npm install && cd backend && npm install
Start Command: cd backend && npm start
Plan: Standard (or higher)
```

**Frontend Service:**
```bash
# In Render Dashboard:
# 1. New > Static Site
# 2. Connect repository
# 3. Configure:
Name: assessment-web-staging
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

#### 2. Environment Variables

**Backend (.env):**
```env
NODE_ENV=staging
PORT=8000
DB_URI=<mongodb-atlas-staging-uri>
JWT_SECRET=<secure-random>
GOOGLE_CLIENT_ID=<staging-google-id>
GOOGLE_CLIENT_SECRET=<staging-secret>
FRONTEND_URL=https://assessment-web-staging.onrender.com
RENDER_INTERNAL_HOSTNAME=<render-provided>
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://assessment-api-staging.onrender.com/api/v1
VITE_WS_URL=wss://assessment-api-staging.onrender.com
VITE_ENVIRONMENT=staging
```

#### 3. Custom Domain (Optional)

```
Settings > Custom Domain
Add: staging.assessment.app
Update DNS with provided CNAME
```

#### 4. SSL/TLS

- Automatically provisioned by Render
- Certificate renewal: Automatic
- Protocol: HTTPS enforced

### Deployment via Git Push

```bash
# Push to staging branch
git add .
git commit -m "Staging deployment"
git push origin staging

# Render automatically:
# 1. Detects push
# 2. Pulls latest code
# 3. Builds services
# 4. Runs migrations
# 5. Deploys to staging
# 6. Runs health checks
```

### Staging Monitoring

```bash
# View logs
# In Render Dashboard:
# Services > assessment-api-staging > Logs
# Services > assessment-web-staging > Logs

# Check health
curl https://assessment-api-staging.onrender.com/api/health

# Monitor metrics
# In Render Dashboard:
# Services > Metrics > CPU, Memory, Network
```

---

## Production Deployment (Render HA)

### Prerequisites

- Production MongoDB Atlas cluster (replicated)
- Production OAuth credentials
- SSL/TLS certificates (auto-provisioned by Render)
- DNS configuration
- Monitoring and alerting setup

### High Availability Configuration

**Backend Service:**
```env
# Production HA settings
INSTANCES=3
PLAN=Standard/Pro (auto-scaling)
SCALING_MIN=2
SCALING_MAX=5
CPU_THRESHOLD=70%
MEMORY_THRESHOLD=80%
```

**Database Replication:**
```javascript
// MongoDB Atlas: Production Tier
// Replica Set: 3 nodes across 3 regions
// Backup: Hourly incremental, daily full
// Retention: 30 days
```

### Production Deployment Checklist

**Before Deployment:**
- [ ] Code reviewed and approved
- [ ] All tests passing in CI/CD
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Security audit completed
- [ ] Performance load testing passed
- [ ] Deployment window scheduled
- [ ] Monitoring alerts configured
- [ ] On-call engineer notified

### Deployment Steps

#### 1. Pre-Production Testing

```bash
# Run security tests
npm run test:security

# Load test
npm run load-test -- --users=1000 --duration=300

# Run database migrations
npm run migrate:prod
```

#### 2. Blue-Green Deployment

```
Step 1: Deploy new version to green environment
        - New services deployed
        - Health checks passed
        - Database migrations completed

Step 2: Run smoke tests against green
        - Critical user flows tested
        - API endpoints verified
        - WebSocket connections validated

Step 3: Switch traffic from blue to green
        - Update load balancer/proxy
        - Monitor for errors
        - Ready for rollback if needed

Step 4: Monitor blue environment
        - Keep for 24 hours
        - Available for quick rollback
```

#### 3. Traffic Gradual Shift

```
00:00 - Deploy to Production
00:05 - Route 10% traffic to new version
00:15 - Monitor metrics (errors, latency, CPU)
00:30 - Route 50% traffic if stable
00:45 - Route 100% traffic if stable
01:00 - Remove old version after 1 hour
```

### Production Environment Variables

```env
NODE_ENV=production
PORT=8000

# Database
DB_URI=<mongodb-atlas-prod-uri>
DB_POOL_SIZE=100
DB_TIMEOUT=5000

# Security
JWT_SECRET=<production-secret-key>
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=<production-secret>
REFRESH_TOKEN_EXPIRY=7d
ENCRYPTION_KEY=<production-key>

# OAuth
GOOGLE_CLIENT_ID=<prod-google-id>
GOOGLE_CLIENT_SECRET=<prod-secret>

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=<api-key>

# URLs
FRONTEND_URL=https://assessment.app
API_URL=https://api.assessment.app

# Monitoring
SENTRY_DSN=<sentry-project-dsn>
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

---

## Continuous Integration & Deployment (CI/CD)

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install && cd frontend && npm install && cd ../backend && npm install
      
      - name: Run tests
        run: npm run test:security
      
      - name: Security scan
        run: npm audit
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          curl -X POST https://api.render.com/v1/services/$SERVICE_ID/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -d '{"clearCache": true}'
      
      - name: Wait for deployment
        run: sleep 60
      
      - name: Health check
        run: |
          for i in {1..30}; do
            curl -f https://api.assessment.app/api/health && break || sleep 2
          done
```

---

## Monitoring & Observability

### Health Checks

```bash
# API Health
GET /api/health
Response: { status: "ok", timestamp: "2026-05-08T..." }

# Database
GET /api/health/db
Response: { database: "connected", latency: 15 }

# Cache
GET /api/health/cache
Response: { redis: "connected" }
```

### Monitoring Dashboard

**Metrics to Track:**
- Error rate (target: <0.1%)
- Response time (target: P95 < 500ms)
- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Database connections (target: <80%)
- Failed authentication attempts
- Active sessions
- API rate limit violations

### Alerting

**Critical Alerts:**
- Error rate > 1%
- Response time P95 > 2s
- Database unavailable
- Memory > 90%
- CPU > 90%
- Authentication service down

### Logs

**Log Levels:**
```
DEBUG: Detailed debugging information
INFO: General operational information
WARN: Warning messages for potential issues
ERROR: Error messages for failures
CRITICAL: System-critical failures
```

**Centralized Logging:**
```bash
# Stream logs
docker-compose logs -f backend

# Filter logs
grep "ERROR" backend.log | tail -100
```

---

## Rollback Procedures

### Quick Rollback

```bash
# If deployment failed or critical issues detected:
git revert <commit-hash>
git push origin main

# Render automatically redeploys previous stable version
```

### Database Rollback

```bash
# Backup current database
mongodump --uri="$DB_URI" --out=./backup-prod

# Restore from previous backup
mongorestore --uri="$DB_URI" --dir=./backup-latest
```

### Traffic Rollback

```bash
# In case of production issue:
1. Immediate traffic shift back to previous version
2. Investigate issue (no time pressure)
3. Fix and redeploy when ready
```

---

## Performance Optimization

### Before Deployment

```bash
# Build optimization
npm run build -- --mode production

# Bundle analysis
npm run analyze

# Performance testing
npm run test:performance

# Load testing
npm run test:load -- --rps=100 --duration=300s
```

### Post-Deployment

```bash
# Monitor metrics
- Real User Monitoring (RUM)
- Synthetic monitoring
- Application Performance Monitoring (APM)
- Error tracking

# Optimization checks
- Core Web Vitals
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
```

---

## Scaling Strategy

### Horizontal Scaling

```javascript
// Current: Single backend instance
// Stage 1: 2 instances with load balancing (trigger: 70% CPU)
// Stage 2: 3 instances (trigger: 80% CPU)
// Stage 3: Auto-scale 3-5 instances based on metrics

// Database sharding (future)
// When: >10M users or >1TB data
```

### Vertical Scaling

```javascript
// Increase instance resources if:
// - Single request memory spike > 1GB
// - CPU sustained > 80%
// - Cannot add more instances
```

---

## Disaster Recovery

### Recovery Time Objective (RTO)
**Target:** 1 hour

### Recovery Point Objective (RPO)
**Target:** 15 minutes (transaction-safe with WAL)

### Failover Procedure

```
1. Monitor detects primary database unavailable
2. MongoDB replica set elects new primary (auto)
3. Application reconnects to new primary
4. If total outage > 15 min, restore from backup
5. Resume operations
```

---

## Post-Deployment

### Smoke Tests

```bash
# Run critical user flows
1. User registration
2. Email verification
3. Login with password
4. Google OAuth login
5. Test creation
6. Test submission
7. Admin operations
```

### Monitoring (First 24 hours)

- Error rate trends
- Response time trends
- User activity patterns
- Failed requests
- Security events
- Database performance

### Sign-Off

- [ ] Deployment successful
- [ ] All smoke tests passed
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Users reporting normal operation
- [ ] Monitoring alerts not triggered

---

## Troubleshooting Common Issues

**Issue:** Deployment fails during build
```
Solution: Check Docker logs, ensure all dependencies installed
Run: docker-compose logs backend
```

**Issue:** High error rate after deployment
```
Solution: Check recent code changes, review logs for errors
Rollback: git revert <commit-hash>
```

**Issue:** Slow response times
```
Solution: Check database query performance, API endpoint metrics
Investigate: mongodumps, APM traces
```

---

## References

- [render.yaml](../render.yaml) - Infrastructure as Code
- [docker-compose.yml](../docker-compose.yml) - Local Development
- [nginx.conf](../nginx.conf) - Reverse Proxy Configuration
