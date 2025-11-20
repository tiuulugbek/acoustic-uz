-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "tour3d_iframe" TEXT;

-- CreateIndex
CREATE INDEX "Branch_slug_idx" ON "Branch"("slug");
