-- AlterTable
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "siteName" TEXT DEFAULT 'Acoustic.uz';
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "siteDescriptionUz" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "siteDescriptionRu" TEXT;
