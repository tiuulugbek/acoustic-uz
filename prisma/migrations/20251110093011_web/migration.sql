/*
  Warnings:

  - You are about to drop the column `specsJson` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "specsJson",
ADD COLUMN     "audience" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "availabilityStatus" TEXT,
ADD COLUMN     "formFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hearingLossLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paymentOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "powerLevel" TEXT,
ADD COLUMN     "signalProcessing" TEXT,
ADD COLUMN     "smartphoneCompatibility" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specsText" TEXT,
ADD COLUMN     "tinnitusSupport" BOOLEAN DEFAULT false;
