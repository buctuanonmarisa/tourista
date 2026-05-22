# AWS RDS PostgreSQL Setup Guide for Tourista

This guide walks you through setting up AWS RDS PostgreSQL and connecting your Tourista app to it.

---

## Table of Contents
1. [AWS RDS Setup](#aws-rds-setup)
2. [Local Development](#local-development)
3. [Deployment to EC2](#deployment-to-ec2)
4. [Troubleshooting](#troubleshooting)
5. [Security Best Practices](#security-best-practices)

---

## AWS RDS Setup

### Step 1: Create RDS PostgreSQL Instance

1. **Log in to AWS Console** → Go to **RDS** → **Databases** → **Create Database**

2. **Choose Engine**
   - Select **PostgreSQL**
   - Version: Latest stable (e.g., 16.x)

3. **Database Settings**
   - **DB Instance Identifier**: `tourista-db` (or your preferred name)
   - **Master Username**: `postgres` (or custom)
   - **Master Password**: Generate a strong password (save it securely!)
     - Example: `Tr0p1c@lV1bes2024!`

4. **Instance Configuration**
   - **DB Instance Class**: 
     - Development: `db.t3.micro` (free tier eligible)
     - Production: `db.t3.small` or larger
   - **Storage**: 20 GB (adjustable later)
   - **Storage Type**: General Purpose (gp3)

5. **Connectivity**
   - **VPC**: Default VPC (or your custom VPC)
   - **Public Accessibility**: **YES** (for initial setup from your local machine)
   - **VPC Security Group**: Create new or select existing
     - Name: `tourista-db-sg`

6. **Backup & Maintenance**
   - **Backup Retention**: 7 days (production: 30 days)
   - **Multi-AZ**: NO (development) or YES (production)
   - **Enable encryption**: YES (default)

7. **Click "Create Database"** and wait 5-10 minutes for creation

### Step 2: Configure Security Group

1. Go to **EC2** → **Security Groups** → Find `tourista-db-sg`

2. **Edit Inbound Rules**
   - Add rule:
     - Type: PostgreSQL
     - Protocol: TCP
     - Port: 5432
     - Source: Your IP (for local development)
       - Find your IP: https://www.whatismyipaddress.com/
       - Or use `0.0.0.0/0` for testing (NOT recommended for production)

3. **For Production (EC2 deployment)**
   - Add rule:
     - Type: PostgreSQL
     - Protocol: TCP
     - Port: 5432
     - Source: Your EC2 instance's security group

### Step 3: Get Connection Details

1. Go to **RDS** → **Databases** → Click on `tourista-db`

2. Copy these details:
   - **Endpoint**: `tourista-db.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`
   - **Master Username**: `postgres`
   - **Master Password**: (what you set)

---

## Local Development

### Step 1: Update Environment Variables

1. Open `.env` in your project root:
   ```bash
   # Replace with your actual RDS endpoint and password
   DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
   ```

   **Format**: `postgresql://username:password@host:port/database`

2. **Never commit `.env` to git!** It's already in `.gitignore`

### Step 2: Install PostgreSQL Client (Optional)

To test connection from command line:

**macOS:**
```bash
brew install postgresql
```

**Windows (WSL):**
```bash
sudo apt-get install postgresql-client
```

**Windows (Direct):**
- Download from https://www.postgresql.org/download/windows/
- Install and add to PATH

### Step 3: Test Connection

```bash
# Replace with your actual endpoint and password
psql -h tourista-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres \
     -c "SELECT version();"
```

You should see PostgreSQL version info. If successful, exit:
```bash
\q
```

### Step 4: Create Database

**Option A: Using psql**
```bash
psql -h tourista-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d postgres

# In psql prompt:
CREATE DATABASE tourista;
\q
```

**Option B: Using Prisma (recommended)**
```bash
npm run db:migrate
```

This will:
- Create the `tourista` database
- Apply all schema migrations
- Generate Prisma client

### Step 5: Seed Database (Optional)

```bash
npm run db:seed
```

This populates initial test data.

### Step 6: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Browse vlogs
- Create a new vlog
- Check API endpoints

---

## Deployment to EC2

### Step 1: Launch EC2 Instance

1. Go to **EC2** → **Instances** → **Launch Instance**

2. **Choose AMI**: Ubuntu 22.04 LTS (free tier eligible)

3. **Instance Type**: `t3.micro` (free tier) or `t3.small`

4. **Security Group**: Create new
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere

5. **Launch** and save your key pair

### Step 2: Connect to EC2

```bash
# Replace with your key and instance IP
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git

# Verify installations
node --version
npm --version
```

### Step 4: Clone & Setup App

```bash
# Clone your repository
git clone https://github.com/your-username/tourista.git
cd tourista

# Install dependencies
npm install

# Create .env file with RDS connection
cat > .env << EOF
DATABASE_URL="postgresql://postgres:YourPassword123@tourista-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tourista"
EOF

# Run migrations
npm run db:migrate

# Build app
npm run build
```

### Step 5: Start Application

**Option A: Using PM2 (Recommended)**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start app
pm2 start npm --name "tourista" -- start

# Make it restart on reboot
pm2 startup
pm2 save
```

**Option B: Using systemd**

Create `/etc/systemd/system/tourista.service`:
```ini
[Unit]
Description=Tourista Next.js App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/tourista
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tourista
sudo systemctl start tourista
```

### Step 6: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/tourista
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/tourista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Troubleshooting

### Connection Refused

**Error**: `connect ECONNREFUSED`

**Solutions**:
1. Check RDS instance is running (AWS Console → RDS → Databases)
2. Verify security group allows port 5432 from your IP
3. Check DATABASE_URL format: `postgresql://user:pass@host:port/db`
4. Test with psql: `psql -h <endpoint> -U postgres`

### Database Does Not Exist

**Error**: `database "tourista" does not exist`

**Solution**:
```bash
# Create database
npm run db:migrate
```

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run db:generate
npm install
```

### Timeout Connecting to RDS

**Error**: `timeout acquiring a connection slot`

**Solutions**:
1. Check internet connection
2. Verify RDS endpoint is correct
3. Check security group allows your IP
4. RDS might still be starting (wait 5-10 minutes)

### Too Many Connections

**Error**: `too many connections for role "postgres"`

**Solutions**:
1. Restart app (closes connections)
2. Use connection pooling (see below)
3. Increase RDS max connections (AWS Console)

---

## Security Best Practices

### 1. Use AWS Secrets Manager

Instead of storing password in `.env`:

```bash
# Store in Secrets Manager
aws secretsmanager create-secret \
  --name tourista/db-password \
  --secret-string "YourPassword123"

# Retrieve in app
aws secretsmanager get-secret-value --secret-id tourista/db-password
```

### 2. Use IAM Database Authentication

```bash
# Enable in RDS
# Then use temporary tokens instead of passwords
```

### 3. Enable Encryption

- **At Rest**: Enabled by default in RDS
- **In Transit**: Use SSL/TLS (Prisma supports this)

Update `.env`:
```
DATABASE_URL="postgresql://postgres:password@host:5432/tourista?sslmode=require"
```

### 4. Restrict Security Group

- Only allow access from your app server
- Use security group IDs instead of IP ranges
- Regularly audit inbound rules

### 5. Regular Backups

- Enable automated backups (7-30 days)
- Test restore process monthly
- Store backups in S3

### 6. Monitor & Alert

```bash
# Enable CloudWatch monitoring
# Set alarms for:
# - CPU > 80%
# - Storage > 80%
# - Connection count > threshold
# - Failed login attempts
```

### 7. Rotate Credentials

```bash
# Change master password monthly
# Update .env and restart app
# Use AWS Secrets Manager for rotation
```

---

## Connection Pooling (Optional)

For production with high traffic, use **AWS RDS Proxy**:

1. Go to **RDS** → **Proxies** → **Create Database Proxy**
2. **Target Group**: Select your RDS instance
3. **Engine Family**: PostgreSQL
4. **Proxy Endpoint**: Use this in DATABASE_URL instead of direct RDS endpoint

Benefits:
- Reduces connection overhead
- Improves performance
- Handles connection spikes

---

## Monitoring

### CloudWatch Metrics

Monitor in AWS Console:
- **CPU Utilization**
- **Database Connections**
- **Read/Write Latency**
- **Storage Space**

### Prisma Studio (Local Development)

```bash
npx prisma studio
```

Opens web UI to browse/edit data at http://localhost:5555

---

## Cost Optimization

| Instance | Monthly Cost | Use Case |
|----------|-------------|----------|
| `db.t3.micro` | ~$10 | Development (free tier) |
| `db.t3.small` | ~$30 | Small production |
| `db.t3.medium` | ~$60 | Medium production |
| `db.t3.large` | ~$120 | Large production |

**Tips**:
- Use free tier for development
- Start with `db.t3.small` for production
- Scale up as needed
- Enable automated backups (minimal cost)
- Delete unused snapshots

---

## Next Steps

1. ✅ Create RDS instance (AWS Console)
2. ✅ Update `.env` with connection string
3. ✅ Test connection locally
4. ✅ Run migrations (`npm run db:migrate`)
5. ✅ Deploy to EC2
6. ✅ Setup SSL/HTTPS
7. ✅ Monitor and maintain

---

## Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **AWS RDS Docs**: https://docs.aws.amazon.com/rds/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Next.js Docs**: https://nextjs.org/docs

---

**Last Updated**: May 20, 2026
