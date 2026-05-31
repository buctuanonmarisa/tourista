# Tourista

## Local Docker

`docker run -p 3000:3000 tourista` is not enough because Docker does not load `.env` automatically.

Use one of these:

```bash
docker build --no-cache -t tourista .
docker run --env-file .env -p 3000:3000 tourista
```

or:

```bash
docker compose up --build
```

The app requires `DATABASE_URL` at runtime. Seed only when you want:

In `.env`, keep the value unquoted for Docker:

```bash
DATABASE_URL=postgresql://user:password@host:5432/tourista
```

```bash
npm run db:seed
npm run db:seed:clips
npm run db:seed:tourme-clips
```

For local development:

```bash
npm run dev
```
Test-NetConnection 16.176.165.19 -Port 22

.\deploy-local-image.ps1 `
  -HostName 16.176.165.19 `
  -User ec2-user `
  -KeyPath .\tourista-kp.pem `
  -EnvFile .\.env.production