# SQLite → AWS RDS PostgreSQL Migration Summary

## What Changed

### ✅ Code Changes (Already Completed)

| File | Before | After |
|------|--------|-------|
| `prisma/schema.prisma` | `provider = "sqlite"` | `provider = "postgresql"` |
| `.env` | `DATABASE_URL="file:./prisma/dev.db"` | `DATABASE_URL="postgresql://..."` |
| `.env.example` | SQLite format | PostgreSQL format with examples |
| `Dockerfile` | Hardcoded SQLite path | Environment variable based |

### 📋 Files Created

1. **AWS_RDS_SETUP.md** - Complete setup guide (7 sections)
2. **RDS_MIGRATION_CHECKLIST.md** - Step-by-step checklist
3. **MIGRATION_SUMMARY.md** - This file

---

## Architecture Change

### Before (SQLite)
```
┌─────────────────────────────────────┐
│   Next.js App (Local/Docker)        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Prisma ORM                 │   │
│  │  ↓                          │   │
│  │  SQLite Database            │   │
│  │  (prisma/dev.db)            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

❌ Issues:
- File-based (not suitable for production)
- No built-in backups
- Single point of failure
- Can't scale horizontally
```

### After (AWS RDS PostgreSQL)
```
┌──────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  VPC (Virtual Private Cloud)                        │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  EC2 Instance (Your App)                     │  │   │
│  │  │  ┌────────────────────────────────────────┐  │  │   │
│  │  │  │  Next.js App                           │  │  │   │
│  │  │  │  ↓                                      │  │  │   │
│  │  │  │  Prisma ORM                            │  │  │   │
│  │  │  └────────────────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                     ↓ (TCP 5432)                   │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  RDS PostgreSQL Instance                     │  │   │
│  │  │  - Managed by AWS                           │  │   │
│  │  │  - Automated backups                        │  │   │
│  │  │  - High availability                        │  │   │
│  │  │  - Encryption at rest & in transit          │  │   │
│  │  │  - CloudWatch monitoring                    │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RDS Backups (S3)                                   │   │
│  │  - Daily automated snapshots                        │   │
│  │  - 7-30 day retention                              │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

✅ Benefits:
- Managed service (AWS handles maintenance)
- Automated daily backups
- High availability & disaster recovery
- Encryption at rest & in transit
- CloudWatch monitoring & alerts
- Can scale vertically (larger instance)
- Can add read replicas for scaling reads
```

---

## Implementation Steps

### Phase 1: AWS Setup (10-15 minutes)
```
1. Create RDS PostgreSQL instance
   └─ Instance ID: tourista-db
   └─ Engine: PostgreSQL 16.x
   └─ Class: db.t3.micro (dev) or db.t3.small (prod)
   └─ Storage: 20 GB
   └─ Public Accessibility: YES (for setup)

2. Configure Security Group
   └─ Allow port 5432 from your IP
   └─ For production: Allow from EC2 security group

3. Get Connection Details
   └─ Endpoint: tourista-db.xxxxx.us-east-1.rds.amazonaws.com
   └─ Port: 5432
   └─ Username: postgres
   └─ Password: (your strong password)
```

### Phase 2: Local Development (10-15 minutes)
```
1. Update .env with RDS connection string
   └─ DATABASE_URL="postgresql://postgres:PASSWORD@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"

2. Test connection
   └─ psql -h tourista-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres

3. Create database & run migrations
   └─ npm run db:migrate

4. Seed database (optional)
   └─ npm run db:seed

5. Start dev server
   └─ npm run dev
   └─ Test API endpoints
```

### Phase 3: Production Deployment (30-45 minutes)
```
1. Launch EC2 Instance
   └─ AMI: Ubuntu 22.04 LTS
   └─ Type: t3.micro or t3.small
   └─ Security Group: Allow SSH, HTTP, HTTPS

2. Install Dependencies
   └─ Node.js 20.x
   └─ Git

3. Deploy App
   └─ Clone repository
   └─ npm install
   └─ Create .env with RDS credentials
   └─ npm run db:migrate
   └─ npm run build

4. Start App
   └─ Using PM2 (process manager)
   └─ Or systemd service

5. Setup Nginx (Reverse Proxy)
   └─ Forward port 80/443 to app on 3000

6. Setup SSL/HTTPS
   └─ Using Certbot & Let's Encrypt
   └─ Auto-renewal enabled
```

---

## Connection String Format

```
postgresql://username:password@host:port/database
                ↓         ↓      ↓    ↓    ↓
postgresql://postgres:MyPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista
```

### Components:
- **username**: `postgres` (or custom)
- **password**: Your strong password
- **host**: RDS endpoint (from AWS Console)
- **port**: `5432` (PostgreSQL default)
- **database**: `tourista` (created by migrations)

---

## Key Files & Their Roles

```
tourista/
├── prisma/
│   ├── schema.prisma          ← Changed: provider = "postgresql"
│   └── migrations/            ← Auto-generated by Prisma
│       └── [timestamp]_init/  ← PostgreSQL schema
│
├── .env                       ← Changed: PostgreSQL connection string
├── .env.example               ← Changed: PostgreSQL format
├── Dockerfile                 ← Changed: Removed hardcoded SQLite paths
│
├── AWS_RDS_SETUP.md          ← NEW: Complete setup guide
├── RDS_MIGRATION_CHECKLIST.md ← NEW: Step-by-step checklist
└── MIGRATION_SUMMARY.md       ← NEW: This file
```

---

## Environment Variables

### Development (Local)
```bash
# .env (local machine)
DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
```

### Production (EC2)
```bash
# /home/ubuntu/tourista/.env
DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
```

### Docker (Optional)
```bash
# Pass at runtime
docker run -e DATABASE_URL="postgresql://..." tourista:latest
```

---

## Security Checklist

- [ ] RDS password is strong (12+ chars, mixed case, numbers, symbols)
- [ ] Security group restricts access to your IP only
- [ ] `.env` is in `.gitignore` (never commit passwords)
- [ ] Use AWS Secrets Manager for production (optional)
- [ ] Enable RDS encryption at rest (default: enabled)
- [ ] Enable RDS encryption in transit (add `?sslmode=require`)
- [ ] Rotate RDS password every 90 days
- [ ] Enable CloudWatch monitoring
- [ ] Set up alarms for CPU, storage, connections
- [ ] Test backups monthly

---

## Monitoring & Maintenance

### CloudWatch Metrics (AWS Console)
```
RDS → Databases → tourista-db → Monitoring

Monitor:
├─ CPU Utilization (should be < 80%)
├─ Database Connections (track growth)
├─ Read/Write Latency (should be < 10ms)
├─ Storage Space (should have 20% free)
└─ Failed SQL Server Agent Jobs (if any)
```

### Application Logs (EC2)
```bash
# View app logs
pm2 logs tourista

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u tourista -f
```

### Database Debugging (Local)
```bash
# Open Prisma Studio
npx prisma studio

# Then visit http://localhost:5555
# Browse tables, edit data, run queries
```

---

## Cost Estimate (Monthly)

| Component | Instance | Cost |
|-----------|----------|------|
| **RDS** | db.t3.micro | ~$10 (free tier) |
| **RDS** | db.t3.small | ~$30 |
| **RDS** | db.t3.medium | ~$60 |
| **EC2** | t3.micro | ~$10 (free tier) |
| **EC2** | t3.small | ~$20 |
| **Data Transfer** | Out of AWS | ~$0.09/GB |
| **Backups** | 7-day retention | ~$2 |
| **Total (Dev)** | micro + micro | ~$12 |
| **Total (Prod)** | small + small | ~$50 |

---

## Troubleshooting Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `connect ECONNREFUSED` | RDS not running or unreachable | Check RDS status, security group |
| `database "tourista" does not exist` | Database not created | Run `npm run db:migrate` |
| `Cannot find module '@prisma/client'` | Prisma not generated | Run `npm run db:generate` |
| `timeout acquiring a connection slot` | Connection pool exhausted | Restart app, check connection pooling |
| `too many connections` | Max connections exceeded | Increase RDS max_connections or use RDS Proxy |
| `SSL/TLS error` | Encryption issue | Add `?sslmode=require` to DATABASE_URL |

---

## Next Steps

1. **Create RDS Instance** (AWS Console)
   - Follow "Phase 1: AWS Setup" in AWS_RDS_SETUP.md
   - Takes 10-15 minutes

2. **Test Locally** (Your Machine)
   - Update `.env` with RDS credentials
   - Run `npm run db:migrate`
   - Run `npm run dev`
   - Test API endpoints

3. **Deploy to EC2** (AWS)
   - Follow "Phase 2: Deployment to EC2" in AWS_RDS_SETUP.md
   - Takes 30-45 minutes

4. **Monitor & Maintain**
   - Check CloudWatch metrics
   - Monitor app logs
   - Test backups monthly

---

## Resources

- **AWS RDS Documentation**: https://docs.aws.amazon.com/rds/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Next.js Documentation**: https://nextjs.org/docs/
- **AWS Free Tier**: https://aws.amazon.com/free/

---

## Summary

✅ **Code changes completed**
- Prisma schema updated to PostgreSQL
- Environment variables configured
- Dockerfile updated for flexibility

📋 **Documentation provided**
- AWS_RDS_SETUP.md (complete guide)
- RDS_MIGRATION_CHECKLIST.md (step-by-step)
- MIGRATION_SUMMARY.md (this file)

🚀 **Ready to implement**
1. Create RDS instance in AWS Console
2. Update `.env` with your RDS credentials
3. Run migrations locally
4. Deploy to EC2

---

**Status**: Ready for implementation
**Last Updated**: May 20, 2026
**Estimated Time**: 60-90 minutes total
