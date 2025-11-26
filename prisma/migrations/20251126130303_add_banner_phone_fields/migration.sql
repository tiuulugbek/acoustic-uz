-- Add showPhone and phoneNumber fields to Banner table
ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "showPhone" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
