CREATE TABLE "TravelOption" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TravelOption_category_value_key" ON "TravelOption"("category", "value");
CREATE INDEX "TravelOption_category_active_sortOrder_idx" ON "TravelOption"("category", "active", "sortOrder");
