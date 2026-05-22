# Tourista Database Setup Guide

## Current Status ✅

Your Tourista application is configured to use **AWS RDS PostgreSQL** database:
- **Host**: tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com
- **Port**: 5432
- **Database**: touristadb
- **User**: postgres
- **Region**: ap-southeast-2 (Sydney)

## What's Been Done

1. ✅ **Environment Configuration**: `.env` file is properly configured with RDS connection string
2. ✅ **Prisma Setup**: Prisma ORM is configured to use PostgreSQL
3. ✅ **Schema Definition**: Database schema is defined in `prisma/schema.prisma`
4. ✅ **Migration Files**: Initial migration SQL has been created in `prisma/migrations/0_init/migration.sql`

## What Needs to Be Done

### Step 1: Apply Database Migration to RDS

You need to run the migration SQL on your RDS database. You have two options:

#### **Option A: Using AWS CloudShell (Recommended)**

1. Go to AWS Console → RDS → Your DB instance
2. Click **"Connectivity & security"** tab
3. Click **"CloudShell"** button
4. Run this command:

```bash
psql -h tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com \
     -U postgres \
     -d touristadb \
     -p 5432 \
     -f /path/to/migration.sql
```

Or paste the SQL directly:

```bash
psql -h tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com \
     -U postgres \
     -d touristadb \
     -p 5432
```

Then paste the contents of `prisma/migrations/0_init/migration.sql`

#### **Option B: Using Local psql**

```bash
psql -h tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com \
     -U postgres \
     -d touristadb \
     -p 5432 \
     -f prisma/migrations/0_init/migration.sql
```

### Step 2: Verify Tables Were Created

```bash
psql -h tourista-db-instance.c182qi44a1i6.ap-southeast-2.rds.amazonaws.com \
     -U postgres \
     -d touristadb \
     -p 5432 \
     -c "\dt"
```

You should see these tables:
- User
- Vlog
- ItineraryDay
- Review
- Unlock

### Step 3: Record Migration in Prisma

After applying the migration, run:

```bash
npm run db:generate
```

This regenerates the Prisma client.

### Step 4: Test the Application

```bash
npm run dev
```

Then try posting a vlog through the UI or via API:

```bash
curl -X POST http://localhost:3000/api/vlogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Vlog",
    "city": "Manila",
    "country": "Philippines",
    "region": "Luzon",
    "vibe": "City Vibes",
    "cost": "5000",
    "duration": "3",
    "credits": 25,
    "description": "A test vlog"
  }'
```

## Database Schema Overview

### User Table
- Stores creator profiles
- Fields: handle, name, bio, avatar, social links, metrics (followers, earnings, etc.)

### Vlog Table
- Stores vlog information
- Fields: title, location, cost, rating, views, likes, cover image, etc.
- Foreign key: authorId (references User)

### ItineraryDay Table
- Stores day-by-day itinerary for each vlog
- Fields: day number, activity, cost, locked status, media, tips, etc.
- Foreign key: vlogId (references Vlog)

### Review Table
- Stores user reviews and ratings for vlogs
- Fields: author name, rating, text, timestamp
- Foreign keys: vlogId, authorId (optional)

### Unlock Table
- Tracks which users have unlocked premium content
- Unique constraint: one unlock per (vlog, user) pair
- Foreign keys: vlogId, userId

## Troubleshooting

### Connection Timeout
If you get "Connection timed out" errors:
1. Check RDS instance is running (AWS Console → RDS → Status should be "available")
2. Verify security group allows port 5432 inbound
3. Check internet gateway is enabled for your VPC

### Table Already Exists
If you get "table already exists" error, the migration has already been applied. You can proceed to Step 3.

### Prisma Client Issues
If you get Prisma client errors:
```bash
npm run db:generate
```

## Next Steps

Once the database is set up:

1. **Seed Sample Data** (optional):
   ```bash
   npm run db:seed
   ```

2. **Start Development**:
   ```bash
   npm run dev
   ```

3. **Create Vlogs**: Use the UI or API to create vlogs, which will now be saved to your RDS database

## API Endpoints for Testing

- `POST /api/vlogs` - Create a new vlog
- `GET /api/vlogs` - List all vlogs
- `GET /api/vlogs/[id]` - Get vlog details
- `PATCH /api/vlogs/[id]` - Update vlog
- `DELETE /api/vlogs/[id]` - Delete vlog

## Important Notes

- Your `.env` file contains your database password. **Keep it secure and never commit it to version control**.
- The migration file is idempotent - running it multiple times won't cause errors if tables already exist.
- All foreign key relationships are properly configured with CASCADE delete where appropriate.

---

**Last Updated**: May 21, 2026
