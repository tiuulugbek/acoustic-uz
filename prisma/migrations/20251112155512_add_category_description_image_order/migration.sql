-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "description_uz" TEXT,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ProductCategory_order_idx" ON "ProductCategory"("order");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
