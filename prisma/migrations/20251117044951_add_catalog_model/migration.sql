-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "catalogId" TEXT;

-- CreateTable
CREATE TABLE "Catalog" (
    "id" TEXT NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "icon" TEXT,
    "imageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_slug_key" ON "Catalog"("slug");

-- CreateIndex
CREATE INDEX "Catalog_slug_idx" ON "Catalog"("slug");

-- CreateIndex
CREATE INDEX "Catalog_order_idx" ON "Catalog"("order");

-- CreateIndex
CREATE INDEX "Catalog_status_idx" ON "Catalog"("status");

-- CreateIndex
CREATE INDEX "Product_catalogId_idx" ON "Product"("catalogId");

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "Catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
