-- AlterTable
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "authorId" TEXT;

-- AlterTable  
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "branchIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "patientTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");

-- AddForeignKey
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Post_authorId_fkey'
  ) THEN
    ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
