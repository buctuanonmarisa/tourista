# RDS Migration Checklist

## Pre-Migration (AWS Console)

- [ ] Create AWS account (if not already done)
- [ ] Create RDS PostgreSQL instance
  - [ ] Instance ID: `tourista-db`
  - [ ] Engine: PostgreSQL 16.x
  - [ ] Instance class: `db.t3.micro` (dev) or `db.t3.small` (prod)
  - [ ] Master username: `postgres`
  - [ ] Master password: (strong password, saved securely)
  - [ ] Public Accessibility: YES
  - [ ] Backup retention: 7 days
- [ ] Wait for RDS instance to be available (5-10 minutes)
- [ ] Configure security group
  - [ ] Allow inbound on port 5432 from your IP
  - [ ] For production: Allow from EC2 security group

## Code Changes (Already Done ✅)

- [x] Update `prisma/schema.prisma`
  - [x] Change provider from `"sqlite"` to `"postgresql"`
- [x] Update `.env`
  - [x] Replace SQLite URL with PostgreSQL connection string
- [x] Update `.env.example`
  - [x] Document PostgreSQL format
- [x] Update `Dockerfile`
  - [x] Remove hardcoded SQLite paths
  - [x] Use environment variables

## Local Development Setup

- [ ] Get RDS connection details from AWS Console
  - [ ] Endpoint: `tourista-db.xxxxx.us-east-1.rds.amazonaws.com`
  - [ ] Port: `5432`
  - [ ] Username: `postgres`
  - [ ] Password: (what you set)
- [ ] Update `.env` with actual RDS credentials
  ```
  DATABASE_URL="postgresql://postgres:PASSWORD@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
  ```
- [ ] Install PostgreSQL client (optional)
  ```bash
  # macOS
  brew install postgresql
  
  # Windows (WSL)
  sudo apt-get install postgresql-client
  ```
- [ ] Test connection
  ```bash
  psql -h tourista-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d postgres
  ```
- [ ] Create database
  ```bash
  npm run db:migrate
  ```
- [ ] Seed database (optional)
  ```bash
  npm run db:seed
  ```
- [ ] Start dev server
  ```bash
  npm run dev
  ```
- [ ] Test API endpoints
  - [ ] GET `/api/vlogs` - returns vlogs
  - [ ] GET `/api/profile` - returns user profile
  - [ ] POST `/api/vlogs` - can create vlog

## Production Deployment (EC2)

### EC2 Setup
- [ ] Launch EC2 instance
  - [ ] AMI: Ubuntu 22.04 LTS
  - [ ] Instance type: `t3.micro` (free tier) or `t3.small`
  - [ ] Security group: Allow SSH (22), HTTP (80), HTTPS (443)
  - [ ] Save key pair
- [ ] Connect to EC2
  ```bash
  ssh -i your-key.pem ubuntu@your-ec2-ip
  ```

### Install Dependencies
- [ ] Update system
  ```bash
  sudo apt-get update && sudo apt-get upgrade -y
  ```
- [ ] Install Node.js
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- [ ] Install Git
  ```bash
  sudo apt-get install -y git
  ```

### Deploy App
- [ ] Clone repository
  ```bash
  git clone https://github.com/your-username/tourista.git
  cd tourista
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Create `.env` with RDS credentials
  ```bash
  cat > .env << EOF
  DATABASE_URL="postgresql://postgres:PASSWORD@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
  EOF
  ```
- [ ] Run migrations
  ```bash
  npm run db:migrate
  ```
- [ ] Build app
  ```bash
  npm run build
  ```
- [ ] Start app (using PM2)
  ```bash
  sudo npm install -g pm2
  pm2 start npm --name "tourista" -- start
  pm2 startup
  pm2 save
  ```

### Setup Nginx (Reverse Proxy)
- [ ] Install Nginx
  ```bash
  sudo apt-get install -y nginx
  ```
- [ ] Create Nginx config
  ```bash
  sudo nano /etc/nginx/sites-available/tourista
  ```
- [ ] Enable site
  ```bash
  sudo ln -s /etc/nginx/sites-available/tourista /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  ```

### Setup SSL/HTTPS
- [ ] Install Certbot
  ```bash
  sudo apt-get install -y certbot python3-certbot-nginx
  ```
- [ ] Get certificate
  ```bash
  sudo certbot --nginx -d your-domain.com
  ```
- [ ] Enable auto-renewal
  ```bash
  sudo systemctl enable certbot.timer
  ```

## Security Hardening

- [ ] Update RDS security group
  - [ ] Remove public accessibility (if not needed)
  - [ ] Restrict to EC2 security group only
- [ ] Store password in AWS Secrets Manager (optional)
- [ ] Enable RDS encryption at rest (default: enabled)
- [ ] Enable RDS encryption in transit
  ```
  DATABASE_URL="postgresql://...?sslmode=require"
  ```
- [ ] Rotate RDS master password
- [ ] Enable CloudWatch monitoring
- [ ] Set up alarms for:
  - [ ] CPU > 80%
  - [ ] Storage > 80%
  - [ ] Connection count > threshold

## Testing & Verification

### Local Testing
- [ ] App starts without errors
- [ ] Can browse vlogs
- [ ] Can create new vlog
- [ ] Can upload images
- [ ] Can like/unlike vlogs
- [ ] Can write reviews
- [ ] Can unlock premium content
- [ ] Database queries are fast

### Production Testing
- [ ] App accessible via domain
- [ ] HTTPS working (green lock)
- [ ] All API endpoints working
- [ ] Database queries fast
- [ ] No connection errors in logs
- [ ] Backups running (check AWS Console)

## Monitoring & Maintenance

- [ ] Monitor RDS metrics (CloudWatch)
  - [ ] CPU utilization
  - [ ] Database connections
  - [ ] Storage usage
  - [ ] Read/write latency
- [ ] Check app logs
  ```bash
  pm2 logs tourista
  ```
- [ ] Test database backups monthly
- [ ] Update Node.js and dependencies quarterly
- [ ] Review security group rules quarterly

## Rollback Plan (If Issues)

If you need to revert to SQLite:
- [ ] Update `.env` to point to SQLite
  ```
  DATABASE_URL="file:./prisma/dev.db"
  ```
- [ ] Update `prisma/schema.prisma` to use `"sqlite"`
- [ ] Run `npm run db:generate`
- [ ] Restart app

---

## Quick Reference

### RDS Connection String Format
```
postgresql://username:password@host:port/database
```

### Common Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database with Prisma Studio
npx prisma studio
```

### AWS CLI Commands
```bash
# List RDS instances
aws rds describe-db-instances

# Get RDS endpoint
aws rds describe-db-instances --query 'DBInstances[0].Endpoint'

# Create snapshot
aws rds create-db-snapshot --db-instance-identifier tourista-db --db-snapshot-identifier tourista-backup-$(date +%Y%m%d)
```

---

## Support

- **Prisma Docs**: https://www.prisma.io/docs/
- **AWS RDS Docs**: https://docs.aws.amazon.com/rds/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Next.js Docs**: https://nextjs.org/docs

---

**Status**: Ready for implementation
**Last Updated**: May 20, 2026
