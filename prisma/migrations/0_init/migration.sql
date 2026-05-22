-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "tagline" TEXT,
    "initials" TEXT NOT NULL DEFAULT 'U',
    "avatarColor" TEXT NOT NULL DEFAULT 'ag',
    "country" TEXT,
    "travelStyle" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "vlogCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Vlog
CREATE TABLE "Vlog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'All regions',
    "vibe" TEXT NOT NULL DEFAULT 'All vlogs',
    "cost" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "duration" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "youtubeUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "instagramUrl" TEXT,
    "coverImage" TEXT,
    "thumbnailColor" TEXT NOT NULL DEFAULT 't1',
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'live',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Vlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable ItineraryDay
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "cost" INTEGER,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "clipDuration" TEXT,
    "clipDescription" TEXT,
    "highlights" TEXT,
    "foodTips" TEXT,
    "gettingThere" TEXT,
    "tips" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "vlogId" TEXT NOT NULL,

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vlogId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable Unlock
CREATE TABLE "Unlock" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vlogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Unlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Unlock_vlogId_userId_key" ON "Unlock"("vlogId", "userId");

-- AddForeignKey
ALTER TABLE "Vlog" ADD CONSTRAINT "Vlog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_vlogId_fkey" FOREIGN KEY ("vlogId") REFERENCES "Vlog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_vlogId_fkey" FOREIGN KEY ("vlogId") REFERENCES "Vlog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unlock" ADD CONSTRAINT "Unlock_vlogId_fkey" FOREIGN KEY ("vlogId") REFERENCES "Vlog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unlock" ADD CONSTRAINT "Unlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
