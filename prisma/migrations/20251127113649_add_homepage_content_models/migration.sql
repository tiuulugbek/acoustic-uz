-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "HomepageSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title_uz" TEXT,
    "title_ru" TEXT,
    "subtitle_uz" TEXT,
    "subtitle_ru" TEXT,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "showSubtitle" BOOLEAN NOT NULL DEFAULT false,
    "showDescription" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "HomepageLink" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "text_uz" TEXT NOT NULL,
    "text_ru" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT,
    "position" TEXT NOT NULL DEFAULT 'bottom',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "HomepagePlaceholder" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "text_uz" TEXT,
    "text_ru" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "fontSize" TEXT,
    "fontWeight" TEXT,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "HomepageEmptyState" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "message_uz" TEXT NOT NULL,
    "message_ru" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageEmptyState_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "CatalogPageConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "hearingAidsTitle_uz" TEXT,
    "hearingAidsTitle_ru" TEXT,
    "interacousticsTitle_uz" TEXT,
    "interacousticsTitle_ru" TEXT,
    "accessoriesTitle_uz" TEXT,
    "accessoriesTitle_ru" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "CommonText" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text_uz" TEXT NOT NULL,
    "text_ru" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommonText_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Create if not exists
CREATE TABLE IF NOT EXISTS "AvailabilityStatus" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label_uz" TEXT NOT NULL,
    "label_ru" TEXT NOT NULL,
    "schema" TEXT,
    "colorClass" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex - Create indexes if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "HomepageSection_key_key" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageSection_key_idx" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageSection_status_order_idx" ON "HomepageSection"("status", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageLink_sectionKey_idx" ON "HomepageLink"("sectionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageLink_position_order_idx" ON "HomepageLink"("position", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageLink_status_idx" ON "HomepageLink"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HomepagePlaceholder_sectionKey_key" ON "HomepagePlaceholder"("sectionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepagePlaceholder_sectionKey_idx" ON "HomepagePlaceholder"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HomepageEmptyState_sectionKey_key" ON "HomepageEmptyState"("sectionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomepageEmptyState_sectionKey_idx" ON "HomepageEmptyState"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommonText_key_key" ON "CommonText"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommonText_key_idx" ON "CommonText"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommonText_category_idx" ON "CommonText"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilityStatus_key_key" ON "AvailabilityStatus"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AvailabilityStatus_key_idx" ON "AvailabilityStatus"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AvailabilityStatus_order_idx" ON "AvailabilityStatus"("order");

-- AddForeignKey - Add foreign key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'HomepagePlaceholder_imageId_fkey'
    ) THEN
        ALTER TABLE "HomepagePlaceholder" ADD CONSTRAINT "HomepagePlaceholder_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


