ALTER TABLE "ItineraryDay" ADD COLUMN "placeName" TEXT;
ALTER TABLE "ItineraryDay" ADD COLUMN "placeQuery" TEXT;

UPDATE "ItineraryDay" AS day
SET
  "placeName" = NULLIF(TRIM(day."activity"), ''),
  "placeQuery" = NULLIF(TRIM(CONCAT_WS(', ', NULLIF(day."activity", ''), NULLIF(vlog."location", ''), NULLIF(vlog."country", ''))), '')
FROM "Vlog" AS vlog
WHERE day."vlogId" = vlog."id"
  AND day."placeQuery" IS NULL;
