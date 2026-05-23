# Docker Guide for Tourista

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t tourista .

# Run with environment variables from .env file
docker run -d \
  --name tourista-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:Tr0p1calV1bes2024!@tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com:5432/touristadb?sslmode=require" \
  -v tourista-uploads:/tmp/uploads \
  tourista

# View logs
docker logs -f tourista-app

# Stop the container
docker stop tourista-app

# Remove the container
docker rm tourista-app
```

## Important Notes

### Database Connection

The container **requires** the `DATABASE_URL` environment variable to connect to your PostgreSQL database. Without it, you'll see errors like:

```
Error: Environment variable not found: DATABASE_URL
```

### Upload Persistence

Uploads are stored in `/tmp/uploads` inside the container and persisted using a Docker volume named `tourista-uploads`. This ensures your uploaded images survive container restarts.

### Seeding the Database

By default, the seeder is **disabled** in production (see `entrypoint.sh`). To re-seed:

```bash
# Option 1: Run seeder inside container
docker exec -it tourista-app npx tsx prisma/seed.ts

# Option 2: Enable seeding in entrypoint.sh and rebuild
# Uncomment lines 17-19 in entrypoint.sh, then:
docker-compose up -d --build
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs tourista-app

# Common issues:
# 1. DATABASE_URL not set → Add -e DATABASE_URL="..." to docker run
# 2. Port 3000 already in use → Stop other services or use -p 8080:3000
# 3. Database unreachable → Check RDS security group and connection string
```

### Database connection errors

```bash
# Test database connection from container
docker exec -it tourista-app npx prisma db push

# If it fails, check:
# 1. DATABASE_URL is correct
# 2. RDS security group allows your IP
# 3. Database credentials are valid
```

### Rebuild after code changes

```bash
# Using docker-compose
docker-compose down
docker-compose up -d --build

# Using docker commands
docker stop tourista-app
docker rm tourista-app
docker build -t tourista .
docker run -d --name tourista-app -p 3000:3000 -e DATABASE_URL="..." tourista
```

## Production Deployment (EC2)

The GitHub Actions workflow automatically:
1. Copies code to EC2
2. Builds Docker image
3. Runs container with DATABASE_URL from secrets
4. Exposes on port 80

See `.github/workflows/deploy.yml` for details.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | No | Set to `production` (default in Dockerfile) |
| `PORT` | No | Internal port (default: 3000) |

## Useful Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container resource usage
docker stats tourista-app

# Execute commands inside container
docker exec -it tourista-app sh

# View container environment variables
docker exec tourista-app env

# Clean up unused images
docker image prune -f

# Clean up everything (careful!)
docker system prune -a
```

## Docker Compose Commands

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Scale services (not applicable for single service)
docker-compose up -d --scale tourista=2
```

## Local Development vs Docker

**Local Development (Recommended for development):**
```bash
npm run dev
```
- Fast hot reload
- Easy debugging
- Direct file access

**Docker (Recommended for testing production build):**
```bash
docker-compose up
```
- Tests production build
- Matches EC2 environment
- Tests Docker configuration

## Next Steps

1. **Start the app:** `docker-compose up -d`
2. **Check logs:** `docker-compose logs -f`
3. **Visit:** http://localhost:3000
4. **Stop:** `docker-compose down`
