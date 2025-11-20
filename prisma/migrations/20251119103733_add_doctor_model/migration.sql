-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "position_uz" TEXT,
    "position_ru" TEXT,
    "experience_uz" TEXT,
    "experience_ru" TEXT,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "slug" TEXT NOT NULL,
    "imageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_slug_key" ON "Doctor"("slug");

-- CreateIndex
CREATE INDEX "Doctor_slug_idx" ON "Doctor"("slug");

-- CreateIndex
CREATE INDEX "Doctor_status_order_idx" ON "Doctor"("status", "order");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
