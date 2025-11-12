-- CreateTable
CREATE TABLE "HomepageHearingAid" (
    "id" TEXT NOT NULL,
    "title_uz" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "link" TEXT,
    "imageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageHearingAid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageJourneyStep" (
    "id" TEXT NOT NULL,
    "title_uz" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageJourneyStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageNewsItem" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "title_uz" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "excerpt_uz" TEXT,
    "excerpt_ru" TEXT,
    "slug" TEXT,
    "publishedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageNewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageHearingAid_status_order_idx" ON "HomepageHearingAid"("status", "order");

-- CreateIndex
CREATE INDEX "HomepageJourneyStep_status_order_idx" ON "HomepageJourneyStep"("status", "order");

-- CreateIndex
CREATE INDEX "HomepageNewsItem_status_order_idx" ON "HomepageNewsItem"("status", "order");

-- CreateIndex
CREATE INDEX "HomepageNewsItem_postId_idx" ON "HomepageNewsItem"("postId");

-- AddForeignKey
ALTER TABLE "HomepageHearingAid" ADD CONSTRAINT "HomepageHearingAid_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageNewsItem" ADD CONSTRAINT "HomepageNewsItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
