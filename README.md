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

The app requires `DATABASE_URL` at runtime. AI auto-fill uses `OPENAI_API_KEY` first and falls back to `GEMINI_API_KEY` when available.

In `.env`, keep the value unquoted for Docker:

```bash
DATABASE_URL=postgresql://user:password@host:5432/tourista
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.5
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Seed only when you want:

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
