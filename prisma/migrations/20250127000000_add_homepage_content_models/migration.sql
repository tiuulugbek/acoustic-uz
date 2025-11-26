-- CreateTable
CREATE TABLE "HomepageSection" (
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

-- CreateTable
CREATE TABLE "HomepageLink" (
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

-- CreateTable
CREATE TABLE "HomepagePlaceholder" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "imageId" TEXT,
    "text_uz" TEXT DEFAULT 'Acoustic',
    "text_ru" TEXT DEFAULT 'Acoustic',
    "backgroundColor" TEXT DEFAULT '#F07E22',
    "textColor" TEXT DEFAULT '#FFFFFF',
    "fontSize" TEXT DEFAULT 'text-lg',
    "fontWeight" TEXT DEFAULT 'font-bold',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageEmptyState" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "message_uz" TEXT NOT NULL,
    "message_ru" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageEmptyState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPageConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "hearingAidsTitle_uz" TEXT DEFAULT 'Eshitish moslamalari katalogi va narxlari',
    "hearingAidsTitle_ru" TEXT DEFAULT 'Каталог и цены на слуховые аппараты',
    "interacousticsTitle_uz" TEXT DEFAULT 'Interacoustics',
    "interacousticsTitle_ru" TEXT DEFAULT 'Interacoustics',
    "accessoriesTitle_uz" TEXT DEFAULT 'Aksessuarlar',
    "accessoriesTitle_ru" TEXT DEFAULT 'Аксессуары',
    "brandTabIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brandTabOrder" TEXT[] DEFAULT ARRAY['oticon', 'resound', 'signia']::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogPageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonText" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text_uz" TEXT NOT NULL,
    "text_ru" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'button',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommonText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityStatus" (
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

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_key_key" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX "HomepageSection_key_idx" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX "HomepageSection_status_order_idx" ON "HomepageSection"("status", "order");

-- CreateIndex
CREATE INDEX "HomepageLink_sectionKey_idx" ON "HomepageLink"("sectionKey");

-- CreateIndex
CREATE INDEX "HomepageLink_position_idx" ON "HomepageLink"("position");

-- CreateIndex
CREATE INDEX "HomepageLink_status_order_idx" ON "HomepageLink"("status", "order");

-- CreateIndex
CREATE UNIQUE INDEX "HomepagePlaceholder_sectionKey_key" ON "HomepagePlaceholder"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageEmptyState_sectionKey_key" ON "HomepageEmptyState"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "CommonText_key_key" ON "CommonText"("key");

-- CreateIndex
CREATE INDEX "CommonText_key_idx" ON "CommonText"("key");

-- CreateIndex
CREATE INDEX "CommonText_category_idx" ON "CommonText"("category");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityStatus_key_key" ON "AvailabilityStatus"("key");

-- CreateIndex
CREATE INDEX "AvailabilityStatus_key_idx" ON "AvailabilityStatus"("key");

-- AddForeignKey (only if Media table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Media') THEN
    ALTER TABLE "HomepagePlaceholder" ADD CONSTRAINT "HomepagePlaceholder_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Seed default data
INSERT INTO "HomepageSection" ("id", "key", "title_uz", "title_ru", "subtitle_uz", "subtitle_ru", "description_uz", "description_ru", "showTitle", "showSubtitle", "showDescription", "order", "status", "createdAt", "updatedAt") VALUES
('section-services', 'services', 'Bizning xizmatlar', 'Наши услуги', NULL, NULL, NULL, NULL, true, false, false, 1, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('section-hearing-aids', 'hearing-aids', 'Turmush tarziga mos eshitish yechimlari', 'Решения для вашего образа жизни', 'Eshitish apparatlari', 'Слуховые аппараты', 'Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.', 'Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.', true, true, true, 2, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('section-interacoustics', 'interacoustics', 'Eng so''nggi diagnostika uskunalari', 'Диагностическое оборудование', 'Interacoustics', 'Interacoustics', 'Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.', 'Выбор инновационных решений и устройств для специалистов по аудиологии.', true, true, true, 3, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('section-journey', 'journey', 'Biz qanday yordam beramiz', 'Как мы помогаем', 'Yaxshi eshitishga yo''l', 'Путь к лучшему слуху', NULL, NULL, true, true, false, 4, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('section-news', 'news', 'Yangiliklar', 'Новости', NULL, NULL, NULL, NULL, true, false, false, 5, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "HomepageLink" ("id", "sectionKey", "text_uz", "text_ru", "href", "icon", "position", "order", "status", "createdAt", "updatedAt") VALUES
('link-services-bottom', 'services', 'Batafsil', 'Подробнее', '/services/{slug}', 'arrow-right', 'bottom', 1, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('link-hearing-aids-bottom', 'hearing-aids', 'Batafsil', 'Подробнее', '/catalog/{slug}', 'arrow-right', 'bottom', 1, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('link-interacoustics-header', 'interacoustics', 'To''liq katalog', 'Полный каталог', '/catalog?productType=interacoustics', 'arrow-right', 'header', 1, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('link-interacoustics-bottom', 'interacoustics', 'To''liq katalog', 'Полный каталог', '/catalog?productType=interacoustics', 'arrow-right', 'bottom', 2, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "HomepagePlaceholder" ("id", "sectionKey", "text_uz", "text_ru", "backgroundColor", "textColor", "fontSize", "fontWeight", "createdAt", "updatedAt") VALUES
('placeholder-services', 'services', 'Acoustic', 'Acoustic', '#F07E22', '#FFFFFF', 'text-lg', 'font-bold', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('placeholder-hearing-aids', 'hearing-aids', 'Acoustic', 'Acoustic', '#F07E22', '#FFFFFF', 'text-xs', 'font-bold', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('placeholder-interacoustics', 'interacoustics', 'Acoustic', 'Acoustic', '#F07E22', '#FFFFFF', 'text-[10px] md:text-sm', 'font-bold', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "HomepageEmptyState" ("id", "sectionKey", "message_uz", "message_ru", "icon", "createdAt", "updatedAt") VALUES
('empty-services', 'services', 'Xizmatlar tez orada qo''shiladi.', 'Услуги будут добавлены в ближайшее время.', 'info', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('empty-hearing-aids', 'hearing-aids', 'Mahsulotlar katalogi bo''sh.', 'Каталог продуктов пуст.', 'info', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('empty-interacoustics', 'interacoustics', 'Mahsulotlar topilmadi.', 'Продукты не найдены.', 'info', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('empty-news', 'news', 'Hozircha yangiliklar yo''q.', 'Новостей пока нет.', 'info', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "CommonText" ("id", "key", "text_uz", "text_ru", "category", "createdAt", "updatedAt") VALUES
('text-readMore', 'readMore', 'Batafsil', 'Подробнее', 'button', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('text-fullCatalog', 'fullCatalog', 'To''liq katalog', 'Полный каталог', 'button', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('text-backToCatalog', 'backToCatalog', '← Katalogga qaytish', '← Вернуться в каталог', 'button', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "AvailabilityStatus" ("id", "key", "label_uz", "label_ru", "schema", "colorClass", "order", "createdAt", "updatedAt") VALUES
('status-in-stock', 'in-stock', 'Sotuvda', 'В наличии', 'https://schema.org/InStock', 'text-green-600 bg-green-50', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('status-preorder', 'preorder', 'Buyurtmaga', 'Под заказ', 'https://schema.org/PreOrder', 'text-amber-600 bg-amber-50', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('status-out-of-stock', 'out-of-stock', 'Tugagan', 'Нет в наличии', 'https://schema.org/OutOfStock', 'text-rose-600 bg-rose-50', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

