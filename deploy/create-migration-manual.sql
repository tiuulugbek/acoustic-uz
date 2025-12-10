-- Manual migration for PostCategory section and imageId fields
-- Run this SQL directly on the database if migrate deploy fails

-- Add section column to PostCategory table
ALTER TABLE "PostCategory" 
ADD COLUMN IF NOT EXISTS "section" TEXT;

-- Add imageId column to PostCategory table
ALTER TABLE "PostCategory" 
ADD COLUMN IF NOT EXISTS "imageId" TEXT;

-- Add unique constraint on imageId
CREATE UNIQUE INDEX IF NOT EXISTS "PostCategory_imageId_key" ON "PostCategory"("imageId");

-- Add foreign key constraint for imageId -> Media.id
ALTER TABLE "PostCategory"
ADD CONSTRAINT IF NOT EXISTS "PostCategory_imageId_fkey" 
FOREIGN KEY ("imageId") 
REFERENCES "Media"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add index on section for better query performance
CREATE INDEX IF NOT EXISTS "PostCategory_section_idx" ON "PostCategory"("section");

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PostCategory' 
AND column_name IN ('section', 'imageId');

