# Tourista Deployment Guide

**Date:** May 23, 2026  
**Status:** ✅ Ready for Deployment  
**Docker Image:** tourista:latest (1.59GB, 372MB compressed)

---

## 🚀 Quick Start

### Prerequisites
- Docker installed and running
- PostgreSQL database (or SQLite for local development)
- Environment variables configured

### Local Development

```bash
# Run with SQLite (local development)
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  tourista:latest
```

### Production Deployment

```bash
# Run with PostgreSQL
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/tourista" \
  -v tourista-uploads:/app/public/uploads \
  tourista:latest
```

---

## 📋 Environment Variables

### Required
- `DATABASE_URL` - Database connection string
  - SQLite: `file:./dev.db`
  - PostgreSQL: `postgresql://user:password@host:5432/dbname`

### Optional
- `NODE_ENV` - Set to `production` (default)
- `PORT` - Application port (default: 3000)

### Example .env
```env
DATABASE_URL=postgresql://tourista:password@tourista-db.example.com:5432/tourista
NODE_ENV=production
PORT=3000
```

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t tourista:latest .
```

### Run Container
```bash
docker run -d \
  --name tourista \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/tourista" \
  -v tourista-uploads:/app/public/uploads \
  tourista:latest
```

### Docker Compose
```yaml
version: '3.8'

services:
  tourista:
    image: tourista:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://tourista:password@db:5432/tourista
      NODE_ENV: production
    volumes:
      - tourista-uploads:/app/public/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: tourista
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tourista
    volumes:
      - tourista-db:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  tourista-uploads:
  tourista-db:
```

### Run with Docker Compose
```bash
docker-compose up -d
```

---

## 🔧 Configuration

### Database Setup

#### PostgreSQL
```bash
# Create database
createdb tourista

# Set connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/tourista"

# Run migrations
npx prisma db push

# Seed database
npx tsx prisma/seed.ts
```

#### SQLite (Local Development)
```bash
# Set connection string
export DATABASE_URL="file:./dev.db"

# Run migrations
npx prisma db push

# Seed database
npx tsx prisma/seed.ts
```

### File Uploads
- Uploads are stored in `/app/public/uploads`
- Mount as volume for persistence: `-v tourista-uploads:/app/public/uploads`

---

## 📊 Image Information

### Build Details
- **Image Name:** tourista:latest
- **Image ID:** 15b4ad273e78
- **Image Size:** 1.59GB
- **Compressed Size:** 372MB
- **Base Image:** node:20-alpine
- **Build Time:** ~40 seconds

### Included Components
- ✅ Node.js 20 Alpine
- ✅ Next.js 14.2.3
- ✅ Prisma ORM
- ✅ All dependencies
- ✅ Production-optimized build
- ✅ Entrypoint script for database setup

---

## 🚀 Deployment Steps

### Step 1: Prepare Database
```bash
# Create PostgreSQL database
createdb tourista

# Or use managed database service (AWS RDS, Azure Database, etc.)
```

### Step 2: Set Environment Variables
```bash
export DATABASE_URL="postgresql://user:password@host:5432/tourista"
export NODE_ENV=production
export PORT=3000
```

### Step 3: Run Container
```bash
docker run -d \
  --name tourista \
  -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=production \
  -v tourista-uploads:/app/public/uploads \
  tourista:latest
```

### Step 4: Verify Deployment
```bash
# Check container is running
docker ps | grep tourista

# Check logs
docker logs tourista

# Test application
curl http://localhost:3000
```

---

## 🔍 Monitoring

### View Logs
```bash
# Real-time logs
docker logs -f tourista

# Last 100 lines
docker logs --tail 100 tourista
```

### Check Container Status
```bash
docker ps | grep tourista
docker inspect tourista
```

### Health Check
```bash
# Test application endpoint
curl http://localhost:3000

# Check database connection
docker exec tourista npx prisma db execute --stdin < /dev/null
```

---

## 🛠️ Troubleshooting

### Database Connection Failed
```bash
# Check DATABASE_URL is correct
docker exec tourista env | grep DATABASE_URL

# Test database connection
docker exec tourista npx prisma db execute --stdin < /dev/null
```

### Port Already in Use
```bash
# Use different port
docker run -p 3001:3000 tourista:latest

# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

### Uploads Not Persisting
```bash
# Ensure volume is mounted
docker run -v tourista-uploads:/app/public/uploads tourista:latest

# Check volume
docker volume ls | grep tourista
docker volume inspect tourista-uploads
```

### Application Won't Start
```bash
# Check logs
docker logs tourista

# Check environment variables
docker exec tourista env

# Rebuild image
docker build -t tourista:latest .
```

---

## 📈 Performance Optimization

### Image Size
- Current: 1.59GB (372MB compressed)
- Multi-stage build reduces final image size
- Alpine Linux keeps base image small

### Database
- Use connection pooling for PostgreSQL
- Index frequently queried fields
- Monitor query performance

### Caching
- Docker layer caching speeds up rebuilds
- Node modules cached in separate layer
- Next.js static assets cached

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, etc.)
- Rotate database passwords regularly

### Database
- Use strong passwords
- Enable SSL/TLS for connections
- Restrict database access to application only

### Container
- Run as non-root user (optional)
- Use read-only filesystem where possible
- Scan image for vulnerabilities

### Network
- Use HTTPS in production
- Implement rate limiting
- Use Web Application Firewall (WAF)

---

## 📦 Scaling

### Horizontal Scaling
```bash
# Run multiple instances
docker run -p 3001:3000 tourista:latest
docker run -p 3002:3000 tourista:latest
docker run -p 3003:3000 tourista:latest

# Use load balancer (nginx, HAProxy, etc.)
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tourista
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tourista
  template:
    metadata:
      labels:
        app: tourista
    spec:
      containers:
      - name: tourista
        image: tourista:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tourista-secrets
              key: database-url
        volumeMounts:
        - name: uploads
          mountPath: /app/public/uploads
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: tourista-uploads
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t tourista:latest .
      
      - name: Push to registry
        run: |
          docker tag tourista:latest myregistry/tourista:latest
          docker push myregistry/tourista:latest
      
      - name: Deploy to production
        run: |
          docker pull myregistry/tourista:latest
          docker run -d -p 3000:3000 myregistry/tourista:latest
```

---

## 📝 Maintenance

### Regular Tasks
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review security logs

### Monthly
- [ ] Update Docker image
- [ ] Review and rotate secrets
- [ ] Check disk usage
- [ ] Performance analysis

### Quarterly
- [ ] Security audit
- [ ] Dependency updates
- [ ] Database optimization
- [ ] Capacity planning

---

## 🆘 Support

### Common Issues
1. **Database connection failed** → Check DATABASE_URL
2. **Port already in use** → Use different port or kill process
3. **Uploads not persisting** → Mount volume
4. **Application won't start** → Check logs with `docker logs`

### Getting Help
- Check logs: `docker logs tourista`
- Check environment: `docker exec tourista env`
- Check database: `docker exec tourista npx prisma db execute`

---

## 📞 Contact

For deployment issues or questions:
1. Check this guide
2. Review Docker logs
3. Check database connectivity
4. Review environment variables

---

## ✅ Deployment Checklist

- [ ] Docker image built successfully
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] Volume mounts configured
- [ ] Container running and healthy
- [ ] Application accessible on port 3000
- [ ] Database migrations completed
- [ ] File uploads working
- [ ] Logs being monitored
- [ ] Backups configured

---

## 🎉 Deployment Complete!

Your Tourista application is now ready for production deployment. Follow the steps above to deploy to your infrastructure.

---

**Created by:** Claude Code Assistant  
**Date:** May 23, 2026  
**Status:** ✅ Ready for Production

---

## Quick Reference

```bash
# Build
docker build -t tourista:latest .

# Run (Local)
docker run -p 3000:3000 -e DATABASE_URL="file:./dev.db" tourista:latest

# Run (Production)
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/tourista" \
  -v tourista-uploads:/app/public/uploads \
  tourista:latest

# View Logs
docker logs -f tourista

# Stop Container
docker stop tourista

# Remove Container
docker rm tourista
```

---

**Next Step:** Deploy to your infrastructure using the steps above!
