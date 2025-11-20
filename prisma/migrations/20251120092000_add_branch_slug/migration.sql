-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Branch_slug_key" ON "Branch"("slug");

