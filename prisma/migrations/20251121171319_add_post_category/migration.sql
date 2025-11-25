-- AlterTable
ALTER TABLE "Post" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");

-- CreateIndex
CREATE INDEX "Post_category_status_idx" ON "Post"("category", "status");




