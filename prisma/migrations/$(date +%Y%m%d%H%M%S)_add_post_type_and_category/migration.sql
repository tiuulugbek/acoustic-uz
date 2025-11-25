-- CreateTable
CREATE TABLE "PostCategory" (
    "id" TEXT NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "postType" TEXT NOT NULL DEFAULT 'article',
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "excerpt_uz" TEXT,
ADD COLUMN "excerpt_ru" TEXT;

-- CreateIndex
CREATE INDEX "PostCategory_slug_idx" ON "PostCategory"("slug");

-- CreateIndex
CREATE INDEX "PostCategory_status_order_idx" ON "PostCategory"("status", "order");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_categoryId_status_idx" ON "Post"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Post_postType_idx" ON "Post"("postType");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;




