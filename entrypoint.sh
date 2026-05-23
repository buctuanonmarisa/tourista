#!/bin/sh
set -e

echo "Starting Tourista application..."

# Wait for database to be ready (if using external database)
if [ ! -z "$DATABASE_URL" ]; then
  echo "Waiting for database to be ready..."
  # Give database a moment to be ready
  sleep 2
fi

# Run Prisma migrations
echo "Running database migrations..."
npx prisma db push --skip-generate || true

# Seed database if needed (commented out to preserve existing data)
# Uncomment the lines below if you want to re-seed the database
# echo "Seeding database..."
# npx tsx prisma/seed.ts || true

# Start the application
echo "Starting application on port ${PORT:-3000}..."
exec node server.js
