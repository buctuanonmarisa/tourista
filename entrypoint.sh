#!/bin/sh
set -e

echo "Starting Tourista application..."

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required because Tourista uses Prisma/PostgreSQL for vlogs and profiles." >&2
  echo "Pass it when starting Docker, for example: docker run --env-file .env -p 3000:3000 tourista" >&2
  exit 1
fi

case "$DATABASE_URL" in
  \"*\")
    DATABASE_URL="${DATABASE_URL#\"}"
    DATABASE_URL="${DATABASE_URL%\"}"
    export DATABASE_URL
    ;;
  \'*\')
    DATABASE_URL="${DATABASE_URL#\'}"
    DATABASE_URL="${DATABASE_URL%\'}"
    export DATABASE_URL
    ;;
esac

case "$DATABASE_URL" in
  postgresql://*|postgres://*) ;;
  *)
    echo "DATABASE_URL must start with postgresql:// or postgres:// for the configured Prisma PostgreSQL datasource." >&2
    echo "Current value starts with: $(printf '%s' "$DATABASE_URL" | cut -c 1-24)..." >&2
    exit 1
    ;;
esac

# Start the application
echo "Starting application on port ${PORT:-3000}..."
exec node server.js
