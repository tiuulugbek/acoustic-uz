-- Add catalogHeroImageId and logoId to Setting table
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "catalogHeroImageId" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "logoId" TEXT;

-- Add unique constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_catalogHeroImageId_key'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_catalogHeroImageId_key" UNIQUE ("catalogHeroImageId");
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_logoId_key'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_logoId_key" UNIQUE ("logoId");
  END IF;
END $$;

-- Add foreign keys
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_catalogHeroImageId_fkey'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_catalogHeroImageId_fkey" FOREIGN KEY ("catalogHeroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_logoId_fkey'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add sidebarConfigs, sidebarSections, sidebarBrandIds to Setting table
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "sidebarConfigs" JSONB;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "sidebarSections" JSONB;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "sidebarBrandIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add AmoCRM fields to Setting table
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmDomain" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmClientId" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmClientSecret" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmAccessToken" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmRefreshToken" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmPipelineId" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "amocrmStatusId" TEXT;

-- Add productMetadata to Showcase table
ALTER TABLE "Showcase" ADD COLUMN IF NOT EXISTS "productMetadata" JSONB;
