-- CreateTable
CREATE TABLE IF NOT EXISTS "PostCategory" (
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

-- AlterTable - Add postType if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'postType') THEN
        ALTER TABLE "Post" ADD COLUMN "postType" TEXT NOT NULL DEFAULT 'article';
    END IF;
END $$;

-- AlterTable - Add categoryId if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'categoryId') THEN
        ALTER TABLE "Post" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- AlterTable - Add excerpt_uz if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'excerpt_uz') THEN
        ALTER TABLE "Post" ADD COLUMN "excerpt_uz" TEXT;
    END IF;
END $$;

-- AlterTable - Add excerpt_ru if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Post' AND column_name = 'excerpt_ru') THEN
        ALTER TABLE "Post" ADD COLUMN "excerpt_ru" TEXT;
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PostCategory_slug_key" ON "PostCategory"("slug");
CREATE INDEX IF NOT EXISTS "PostCategory_slug_idx" ON "PostCategory"("slug");
CREATE INDEX IF NOT EXISTS "PostCategory_status_order_idx" ON "PostCategory"("status", "order");
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX IF NOT EXISTS "Post_categoryId_status_idx" ON "Post"("categoryId", "status");
CREATE INDEX IF NOT EXISTS "Post_postType_idx" ON "Post"("postType");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Post_categoryId_fkey'
    ) THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
