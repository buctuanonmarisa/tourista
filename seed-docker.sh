#!/bin/sh
# Simple script to seed the Docker database from the host machine

echo "Seeding Docker database..."

# Temporarily update DATABASE_URL to point to Docker database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/touristadb?schema=public"

# Run the seed script
npm run db:seed

echo "Docker database seeded successfully!"
