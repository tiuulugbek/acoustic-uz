-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productType" TEXT;

-- CreateIndex
CREATE INDEX "Product_productType_idx" ON "Product"("productType");
