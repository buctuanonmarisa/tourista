# Architecture Diagrams

## Current Architecture (SQLite)

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Local Machine                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Application (npm run dev)                   │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Pages & API Routes                            │  │  │
│  │  │  - /api/vlogs                                  │  │  │
│  │  │  - /api/profile                                │  │  │
│  │  │  - /api/upload                                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                      ↓                                │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Prisma ORM                                    │  │  │
│  │  │  - Query builder                               │  │  │
│  │  │  - Type-safe database access                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                      ↓                                │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  SQLite Database (File-based)                  │  │  │
│  │  │  Location: prisma/dev.db                       │  │  │
│  │  │  - Users table                                 │  │  │
│  │  │  - Vlogs table                                 │  │  │
│  │  │  - Reviews table                               │  │  │
│  │  │  - Unlocks table                               │  │  │
│  │  │  - ItineraryDay table                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ❌ Issues:                                                │
│  - Not suitable for production                             │
│  - No automatic backups                                    │
│  - Single point of failure                                 │
│  - Can't scale horizontally                                │
│  - File permissions issues in Docker                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Target Architecture (AWS RDS PostgreSQL)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud (us-east-1)                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    VPC (Virtual Private Cloud)                         │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Public Subnet                                                   │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  EC2 Instance (t3.small)                                   │ │ │ │
│  │  │  │  - Ubuntu 22.04 LTS                                        │ │ │ │
│  │  │  │  - Node.js 20.x                                            │ │ │ │
│  │  │  │  - Nginx (reverse proxy)                                   │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Next.js Application (Production Build)             │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │  Pages & API Routes                            │ │ │ │ │ │
│  │  │  │  │  │  - /api/vlogs                                  │ │ │ │ │ │
│  │  │  │  │  │  - /api/profile                                │ │ │ │ │ │
│  │  │  │  │  │  - /api/upload                                 │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────────────────────┘ │ │ │ │ │
│  │  │  │  │                      ↓                               │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │  Prisma ORM                                    │ │ │ │ │ │
│  │  │  │  │  │  - Query builder                               │ │ │ │ │ │
│  │  │  │  │  │  - Type-safe database access                   │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────────────────────┘ │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────────────────┘ │ │ │ │
│  │  │  │                      ↓ (TCP 5432)                         │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Security Group: tourista-db-sg                     │ │ │ │ │
│  │  │  │  │  - Allow port 5432 from EC2 security group          │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────────────────┘ │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Private Subnet (Database)                                       │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  RDS PostgreSQL Instance (db.t3.small)                    │ │ │ │
│  │  │  │  - Endpoint: tourista-db.xxxxx.us-east-1.rds.amazonaws.com│ │ │ │
│  │  │  │  - Port: 5432                                             │ │ │ │
│  │  │  │  - Engine: PostgreSQL 16.x                                │ │ │ │
│  │  │  │  - Storage: 20 GB (gp3)                                   │ │ │ │
│  │  │  │  - Multi-AZ: NO (dev) or YES (prod)                       │ │ │ │
│  │  │  │  - Encryption: At rest (enabled)                          │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Database: tourista                                 │ │ │ │ │
│  │  │  │  │  ├─ users table                                     │ │ │ │ │
│  │  │  │  │  ├─ vlogs table                                     │ │ │ │ │
│  │  │  │  │  ├─ reviews table                                   │ │ │ │ │
│  │  │  │  │  ├─ unlocks table                                   │ │ │ │ │
│  │  │  │  │  └─ itinerary_days table                            │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────────────────┘ │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │  ✅ Features:                                              │ │ │ │
│  │  │  │  - Managed by AWS (no maintenance)                        │ │ │ │
│  │  │  │  - Automated daily backups                                │ │ │ │
│  │  │  │  - Point-in-time recovery                                 │ │ │ │
│  │  │  │  - High availability (Multi-AZ)                           │ │ │ │
│  │  │  │  - CloudWatch monitoring                                  │ │ │ │
│  │  │  │  - Encryption at rest & in transit                        │ │ │ │
│  │  │  │  - Can scale vertically                                   │ │ │ │
│  │  │  │  - Can add read replicas                                  │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  AWS Backup & Monitoring Services                                      │ │
│  │  ├─ RDS Automated Backups (7-30 day retention)                         │ │
│  │  ├─ CloudWatch Metrics (CPU, connections, latency)                     │ │
│  │  ├─ CloudWatch Alarms (CPU > 80%, storage > 80%)                       │ │
│  │  ├─ RDS Performance Insights (query analysis)                          │ │
│  │  └─ AWS Secrets Manager (password storage)                             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          Internet / Users                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Your Domain (example.com)                                             │ │
│  │  ↓ HTTPS (port 443)                                                    │ │
│  │  ↓ (Nginx reverse proxy on EC2)                                        │ │
│  │  ↓ (Forwards to Next.js on port 3000)                                  │ │
│  │  ↓                                                                      │
│  │  Next.js Application                                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Request Flow (User → App → Database)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. User Request                                                            │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Browser: GET https://example.com/api/vlogs?region=Asia         │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  2. Nginx (Reverse Proxy)                                                   │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Receives HTTPS request on port 443                              │   │
│     │  Decrypts TLS/SSL                                                │   │
│     │  Forwards to Next.js on localhost:3000                           │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  3. Next.js API Route                                                       │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  src/app/api/vlogs/route.ts                                      │   │
│     │  ├─ Parses query parameters (region=Asia)                        │   │
│     │  ├─ Validates input                                              │   │
│     │  └─ Calls Prisma client                                          │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  4. Prisma ORM                                                              │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Prisma.vlog.findMany({                                          │   │
│     │    where: { region: "Asia" },                                    │   │
│     │    include: { author: true, reviews: true }                      │   │
│     │  })                                                               │   │
│     │  ├─ Generates SQL query                                          │   │
│     │  └─ Sends to PostgreSQL                                          │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  5. PostgreSQL Query                                                        │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  SELECT v.*, u.*, r.*                                            │   │
│     │  FROM vlogs v                                                    │   │
│     │  JOIN users u ON v.author_id = u.id                              │   │
│     │  LEFT JOIN reviews r ON v.id = r.vlog_id                         │   │
│     │  WHERE v.region = 'Asia'                                         │   │
│     │  ORDER BY v.created_at DESC                                      │   │
│     │                                                                  │   │
│     │  (Executed on RDS PostgreSQL)                                    │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  6. Database Response                                                       │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  RDS returns rows:                                               │   │
│     │  [                                                               │   │
│     │    { id: "vlog1", title: "Bangkok", region: "Asia", ... },      │   │
│     │    { id: "vlog2", title: "Tokyo", region: "Asia", ... },        │   │
│     │    ...                                                           │   │
│     │  ]                                                               │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  7. Prisma Transforms                                                       │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Converts database rows to JavaScript objects                    │   │
│     │  Applies type safety                                             │   │
│     │  Returns to API route                                            │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  8. API Response                                                            │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Next.js returns JSON:                                           │   │
│     │  {                                                               │   │
│     │    "vlogs": [                                                    │   │
│     │      { "id": "vlog1", "title": "Bangkok", ... },                │   │
│     │      { "id": "vlog2", "title": "Tokyo", ... }                   │   │
│     │    ]                                                             │   │
│     │  }                                                               │   │
│     │  Status: 200 OK                                                  │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  9. Nginx Response                                                          │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │  Encrypts response with TLS/SSL                                  │   │
│     │  Sends HTTPS response to browser                                 │   │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                           │
│  10. Browser Renders                                                        │
│      ┌──────────────────────────────────────────────────────────────────┐  │
│      │  Browser receives JSON                                           │  │
│      │  React renders vlog cards                                        │  │
│      │  User sees: Bangkok, Tokyo, ... vlogs                            │  │
│      └──────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Development Workflow                                │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  1. Local Development                                                │  │
│  │     ├─ npm install                                                   │  │
│  │     ├─ npm run db:generate                                           │  │
│  │     ├─ npm run db:migrate                                            │  │
│  │     ├─ npm run dev                                                   │  │
│  │     └─ Test on http://localhost:3000                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  2. Git Commit & Push                                                │  │
│  │     ├─ git add .                                                     │  │
│  │     ├─ git commit -m "Feature: ..."                                  │  │
│  │     └─ git push origin main                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  3. CI/CD Pipeline (GitHub Actions / GitLab CI)                      │  │
│  │     ├─ Run tests                                                     │  │
│  │     ├─ Run linter                                                    │  │
│  │     ├─ Build Docker image                                            │  │
│  │     └─ Push to Docker registry                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  4. Deploy to EC2                                                    │  │
│  │     ├─ SSH into EC2 instance                                         │  │
│  │     ├─ git pull origin main                                          │  │
│  │     ├─ npm install                                                   │  │
│  │     ├─ npm run db:migrate (if schema changed)                        │  │
│  │     ├─ npm run build                                                 │  │
│  │     └─ pm2 restart tourista                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 ↓                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  5. Production (Live)                                                │  │
│  │     ├─ App running on EC2                                            │  │
│  │     ├─ Nginx forwarding traffic                                      │  │
│  │     ├─ HTTPS enabled                                                 │  │
│  │     ├─ Connected to RDS PostgreSQL                                   │  │
│  │     └─ Monitoring via CloudWatch                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         tourista Database                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  users                                                               │  │
│  │  ├─ id (UUID, PK)                                                    │  │
│  │  ├─ handle (String, UNIQUE)                                          │  │
│  │  ├─ name (String)                                                    │  │
│  │  ├─ bio (String, nullable)                                           │  │
│  │  ├─ followers (Int)                                                  │  │
│  │  ├─ credits (Int)                                                    │  │
│  │  ├─ earnings (Float)                                                 │  │
│  │  ├─ createdAt (DateTime)                                             │  │
│  │  └─ updatedAt (DateTime)                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 ↑                                           │
│                                 │ (1:N)                                     │
│                                 │                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  vlogs                                                               │  │
│  │  ├─ id (UUID, PK)                                                    │  │
│  │  ├─ title (String)                                                   │  │
│  │  ├─ location (String)                                                │  │
│  │  ├─ region (String)                                                  │  │
│  │  ├─ vibe (String)                                                    │  │
│  │  ├─ cost (Int, nullable)                                             │  │
│  │  ├─ rating (Float)                                                   │  │
│  │  ├─ views (Int)                                                      │  │
│  │  ├─ likes (Int)                                                      │  │
│  │  ├─ credits (Int)                                                    │  │
│  │  ├─ coverImage (String, nullable)                                    │  │
│  │  ├─ authorId (UUID, FK → users.id)                                   │  │
│  │  ├─ createdAt (DateTime)                                             │  │
│  │  └─ updatedAt (DateTime)                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│         ↑                                    ↑                              │
│         │ (1:N)                             │ (1:N)                         │
│         │                                   │                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  reviews                                                             │  │
│  │  ├─ id (UUID, PK)                                                    │  │
│  │  ├─ authorName (String)                                              │  │
│  │  ├─ rating (Int)                                                     │  │
│  │  ├─ text (String)                                                    │  │
│  │  ├─ vlogId (UUID, FK → vlogs.id)                                     │  │
│  │  ├─ authorId (UUID, FK → users.id, nullable)                         │  │
│  │  └─ createdAt (DateTime)                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  itinerary_days                                                      │  │
│  │  ├─ id (UUID, PK)                                                    │  │
│  │  ├─ day (Int)                                                        │  │
│  │  ├─ activity (String)                                                │  │
│  │  ├─ cost (Int, nullable)                                             │  │
│  │  ├─ locked (Boolean)                                                 │  │
│  │  ├─ description (String, nullable)                                   │  │
│  │  ├─ mediaUrl (String, nullable)                                      │  │
│  │  ├─ vlogId (UUID, FK → vlogs.id)                                     │  │
│  │  └─ createdAt (DateTime)                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  unlocks                                                             │  │
│  │  ├─ id (UUID, PK)                                                    │  │
│  │  ├─ vlogId (UUID, FK → vlogs.id)                                     │  │
│  │  ├─ userId (UUID, FK → users.id)                                     │  │
│  │  ├─ UNIQUE(vlogId, userId)                                           │  │
│  │  └─ createdAt (DateTime)                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scaling Strategy (Future)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Scaling Options                                     │
│                                                                             │
│  Phase 1: Current (Single EC2 + Single RDS)                                │
│  ├─ EC2: t3.small (1 instance)                                             │
│  ├─ RDS: db.t3.small (single instance)                                     │
│  └─ Cost: ~$50/month                                                       │
│                                                                             │
│  Phase 2: Horizontal Scaling (Load Balancer + Multiple EC2)                │
│  ├─ Load Balancer (ALB): Distributes traffic                               │
│  ├─ EC2: t3.small (2-3 instances)                                          │
│  ├─ RDS: db.t3.small (single instance, read replicas optional)             │
│  └─ Cost: ~$100-150/month                                                  │
│                                                                             │
│  Phase 3: Database Scaling (RDS Proxy + Read Replicas)                     │
│  ├─ RDS Proxy: Connection pooling                                          │
│  ├─ RDS Primary: db.t3.medium (write operations)                           │
│  ├─ RDS Read Replicas: db.t3.small (read operations)                       │
│  ├─ EC2: t3.small (2-3 instances)                                          │
│  └─ Cost: ~$200-300/month                                                  │
│                                                                             │
│  Phase 4: Full Scale (CDN + Caching + Microservices)                       │
│  ├─ CloudFront: CDN for static assets                                      │
│  ├─ ElastiCache: Redis for session/data caching                            │
│  ├─ RDS: db.t3.large or larger                                             │
│  ├─ EC2: Auto Scaling Group (2-10 instances)                               │
│  ├─ S3: Object storage for uploads                                         │
│  └─ Cost: ~$500+/month                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: May 20, 2026
