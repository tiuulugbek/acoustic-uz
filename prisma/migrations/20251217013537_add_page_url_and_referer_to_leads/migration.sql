-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "pageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "referer" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_pageUrl_idx" ON "Lead"("pageUrl");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
