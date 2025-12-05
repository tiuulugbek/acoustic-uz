-- AlterTable
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "faviconId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_faviconId_key" ON "Setting"("faviconId");

-- AddForeignKey
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_faviconId_fkey'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_faviconId_fkey" 
    FOREIGN KEY ("faviconId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
