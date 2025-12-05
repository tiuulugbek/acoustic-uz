-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tour3d_config" JSONB,
ADD COLUMN     "workingHours_ru" TEXT,
ADD COLUMN     "workingHours_uz" TEXT;

-- AlterTable
ALTER TABLE "CatalogPageConfig" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable - Add categoryId if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'categoryId') THEN
        ALTER TABLE "Post" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- AlterTable - Add postType if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'postType') THEN
        ALTER TABLE "Post" ADD COLUMN "postType" TEXT NOT NULL DEFAULT 'article';
    END IF;
END $$;

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

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_slug_key" ON "PostCategory"("slug");

-- CreateIndex
CREATE INDEX "PostCategory_slug_idx" ON "PostCategory"("slug");

-- CreateIndex
CREATE INDEX "PostCategory_status_order_idx" ON "PostCategory"("status", "order");

-- CreateIndex - Create indexes if not exists
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_categoryId_status_idx" ON "Post"("categoryId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_postType_idx" ON "Post"("postType");

-- AddForeignKey - Add foreign key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Post_categoryId_fkey'
    ) THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
ALTER TABLE "HomepagePlaceholder" ADD CONSTRAINT "HomepagePlaceholder_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
