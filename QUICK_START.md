# Quick Start: AWS RDS PostgreSQL Migration

**Time Required**: 60-90 minutes  
**Difficulty**: Easy-Medium  
**Prerequisites**: AWS account, Node.js 20.x, Git

---

## 🚀 TL;DR (The Fastest Path)

### 1. Create RDS (AWS Console) - 10 minutes
```
AWS Console → RDS → Create Database
- Engine: PostgreSQL 16.x
- Instance: db.t3.micro
- Username: postgres
- Password: (strong password)
- Public Accessibility: YES
- Wait 5-10 minutes...
```

### 2. Update Code (Your Machine) - 5 minutes
```bash
# Update .env with your RDS endpoint
DATABASE_URL="postgresql://postgres:PASSWORD@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

### 3. Deploy to EC2 (AWS) - 30-45 minutes
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone & setup
git clone https://github.com/your-username/tourista.git
cd tourista
npm install

# Create .env
cat > .env << EOF
DATABASE_URL="postgresql://postgres:PASSWORD@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
EOF

# Deploy
npm run db:migrate
npm run build
pm2 start npm --name "tourista" -- start
```

---

## 📋 Step-by-Step Guide

### Step 1: Create RDS PostgreSQL Instance

**Time**: 10-15 minutes

1. Go to **AWS Console** → **RDS** → **Databases** → **Create Database**

2. **Engine Options**
   - Select **PostgreSQL**
   - Version: Latest (e.g., 16.x)

3. **Templates**
   - Select **Free tier** (if eligible) or **Production**

4. **Settings**
   ```
   DB Instance Identifier: tourista-db
   Master Username: postgres
   Master Password: YourPassword123! (save this!)
   ```

5. **Instance Configuration**
   ```
   DB Instance Class: db.t3.micro (free tier)
   Storage: 20 GB
   Storage Type: gp3
   ```

6. **Connectivity**
   ```
   VPC: Default VPC
   Public Accessibility: YES
   VPC Security Group: Create new (tourista-db-sg)
   ```

7. **Backup**
   ```
   Backup Retention: 7 days
   Multi-AZ: NO (for dev)
   ```

8. Click **Create Database** and wait 5-10 minutes

### Step 2: Configure Security Group

**Time**: 5 minutes

1. Go to **EC2** → **Security Groups** → Find `tourista-db-sg`

2. **Edit Inbound Rules**
   - Add rule:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Your IP (find at https://www.whatismyipaddress.com/)

3. Save

### Step 3: Get RDS Connection Details

**Time**: 2 minutes

1. Go to **RDS** → **Databases** → Click `tourista-db`

2. Copy:
   - **Endpoint**: `tourista-db.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: (what you set)

### Step 4: Update Your App

**Time**: 5 minutes

1. Open `.env` in your project:
   ```bash
   DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
   ```

2. Run migrations:
   ```bash
   npm run db:migrate
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Test at http://localhost:3000

### Step 5: Deploy to EC2

**Time**: 30-45 minutes

#### 5.1 Launch EC2 Instance

1. Go to **EC2** → **Instances** → **Launch Instance**

2. **AMI**: Ubuntu 22.04 LTS

3. **Instance Type**: t3.micro (free tier)

4. **Security Group**: Create new
   - Allow SSH (22) from your IP
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere

5. **Launch** and save key pair

#### 5.2 Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 5.3 Install Dependencies

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git
```

#### 5.4 Deploy App

```bash
# Clone repo
git clone https://github.com/your-username/tourista.git
cd tourista

# Install dependencies
npm install

# Create .env
cat > .env << EOF
DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
EOF

# Run migrations
npm run db:migrate

# Build
npm run build

# Install PM2
sudo npm install -g pm2

# Start app
pm2 start npm --name "tourista" -- start
pm2 startup
pm2 save
```

#### 5.5 Setup Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/tourista > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable
sudo ln -s /etc/nginx/sites-available/tourista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5.6 Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## ✅ Verification Checklist

### Local Development
- [ ] RDS instance created and running
- [ ] `.env` updated with RDS credentials
- [ ] `npm run db:migrate` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Can browse vlogs at http://localhost:3000
- [ ] Can create new vlog
- [ ] Can upload images

### Production (EC2)
- [ ] EC2 instance running
- [ ] App deployed and running (`pm2 status`)
- [ ] Nginx forwarding traffic
- [ ] Can access app via domain
- [ ] HTTPS working (if setup)
- [ ] Database queries working

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `connect ECONNREFUSED` | Check RDS is running, security group allows your IP |
| `database "tourista" does not exist` | Run `npm run db:migrate` |
| `Cannot find module '@prisma/client'` | Run `npm run db:generate` |
| `timeout acquiring a connection slot` | Restart app: `pm2 restart tourista` |
| `Cannot connect to RDS from EC2` | Check security group allows EC2 security group |

---

## 📚 Full Documentation

For detailed information, see:
- **AWS_RDS_SETUP.md** - Complete setup guide
- **RDS_MIGRATION_CHECKLIST.md** - Detailed checklist
- **MIGRATION_SUMMARY.md** - Architecture overview
- **ARCHITECTURE_DIAGRAM.md** - Visual diagrams

---

## 💰 Cost Estimate

| Component | Cost |
|-----------|------|
| RDS (db.t3.micro) | ~$10/month |
| EC2 (t3.micro) | ~$10/month |
| Data transfer | ~$0-5/month |
| **Total** | **~$20-25/month** |

---

## 🎯 Next Steps

1. ✅ Create RDS instance (AWS Console)
2. ✅ Update `.env` with RDS credentials
3. ✅ Test locally (`npm run dev`)
4. ✅ Deploy to EC2
5. ✅ Setup Nginx & SSL
6. ✅ Monitor with CloudWatch

---

## 📞 Need Help?

- **Prisma Docs**: https://www.prisma.io/docs/
- **AWS RDS Docs**: https://docs.aws.amazon.com/rds/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Status**: Ready to implement  
**Last Updated**: May 20, 2026
