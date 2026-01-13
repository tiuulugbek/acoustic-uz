-- CreateTable
CREATE TABLE "HearingTest" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "deviceType" TEXT NOT NULL,
    "volumeLevel" DOUBLE PRECISION,
    "leftEarResults" JSONB NOT NULL,
    "rightEarResults" JSONB NOT NULL,
    "leftEarScore" INTEGER,
    "rightEarScore" INTEGER,
    "overallScore" INTEGER,
    "leftEarLevel" TEXT,
    "rightEarLevel" TEXT,
    "source" TEXT NOT NULL DEFAULT 'hearing_test',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HearingTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HearingTest_status_createdAt_idx" ON "HearingTest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HearingTest_source_idx" ON "HearingTest"("source");

