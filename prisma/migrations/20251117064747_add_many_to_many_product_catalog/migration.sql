/*
  Warnings:

  - You are about to drop the column `catalogId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_catalogId_fkey";

-- DropIndex
DROP INDEX "Product_catalogId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "catalogId";

-- CreateTable
CREATE TABLE "_ProductToCatalog" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToCatalog_AB_unique" ON "_ProductToCatalog"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToCatalog_B_index" ON "_ProductToCatalog"("B");

-- AddForeignKey
ALTER TABLE "_ProductToCatalog" ADD CONSTRAINT "_ProductToCatalog_A_fkey" FOREIGN KEY ("A") REFERENCES "Catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToCatalog" ADD CONSTRAINT "_ProductToCatalog_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
