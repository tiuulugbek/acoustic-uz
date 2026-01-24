-- AlterTable: Add Digits-in-Noise test fields to HearingTest
ALTER TABLE "HearingTest" 
ADD COLUMN IF NOT EXISTS "testMethod" TEXT DEFAULT 'frequency',
ADD COLUMN IF NOT EXISTS "leftEarSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "rightEarSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "overallSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "leftEarSINResults" JSONB,
ADD COLUMN IF NOT EXISTS "rightEarSINResults" JSONB;

-- Make leftEarResults and rightEarResults optional (nullable)
ALTER TABLE "HearingTest" 
ALTER COLUMN "leftEarResults" DROP NOT NULL,
ALTER COLUMN "rightEarResults" DROP NOT NULL;

-- Add index for testMethod
CREATE INDEX IF NOT EXISTS "HearingTest_testMethod_idx" ON "HearingTest"("testMethod");
