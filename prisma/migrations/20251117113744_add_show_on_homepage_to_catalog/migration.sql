-- AlterTable
ALTER TABLE "Catalog" ADD COLUMN     "showOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Catalog_showOnHomepage_idx" ON "Catalog"("showOnHomepage");
