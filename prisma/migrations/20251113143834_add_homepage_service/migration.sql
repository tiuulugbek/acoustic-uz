-- CreateTable
CREATE TABLE "HomepageService" (
    "id" TEXT NOT NULL,
    "title_uz" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "excerpt_uz" TEXT,
    "excerpt_ru" TEXT,
    "slug" TEXT,
    "imageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageService_status_order_idx" ON "HomepageService"("status", "order");

-- AddForeignKey
ALTER TABLE "HomepageService" ADD CONSTRAINT "HomepageService_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
