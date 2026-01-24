-- AlterTable
ALTER TABLE "Service" ADD COLUMN "alternativeCoverId" TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_alternativeCoverId_fkey" FOREIGN KEY ("alternativeCoverId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
