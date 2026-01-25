--
-- PostgreSQL database dump
--

\restrict mw0Qr8zAe9JA5gx6gZ0x0jejD0J3deGstgvxuqhbpmsMasBbwpKy9eR5cxjQFBo

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    "userEmail" text,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    action text NOT NULL,
    changes jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO acoustic_user;

--
-- Name: AvailabilityStatus; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."AvailabilityStatus" (
    id text NOT NULL,
    key text NOT NULL,
    label_uz text NOT NULL,
    label_ru text NOT NULL,
    schema text,
    "colorClass" text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AvailabilityStatus" OWNER TO acoustic_user;

--
-- Name: Banner; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    text_uz text,
    text_ru text,
    "ctaText_uz" text,
    "ctaText_ru" text,
    "ctaLink" text,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Banner" OWNER TO acoustic_user;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    address_uz text NOT NULL,
    address_ru text NOT NULL,
    phone text NOT NULL,
    phones text[],
    "imageId" text,
    map_iframe text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    latitude double precision,
    longitude double precision,
    slug text,
    tour3d_iframe text,
    "serviceIds" text[] DEFAULT ARRAY[]::text[],
    tour3d_config jsonb,
    "workingHours_ru" text,
    "workingHours_uz" text
);


ALTER TABLE public."Branch" OWNER TO acoustic_user;

--
-- Name: Brand; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoId" text,
    desc_uz text,
    desc_ru text
);


ALTER TABLE public."Brand" OWNER TO acoustic_user;

--
-- Name: Catalog; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Catalog" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    description_uz text,
    description_ru text,
    icon text,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "showOnHomepage" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Catalog" OWNER TO acoustic_user;

--
-- Name: CatalogPageConfig; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."CatalogPageConfig" (
    id text DEFAULT 'singleton'::text NOT NULL,
    "hearingAidsTitle_uz" text,
    "hearingAidsTitle_ru" text,
    "interacousticsTitle_uz" text,
    "interacousticsTitle_ru" text,
    "accessoriesTitle_uz" text,
    "accessoriesTitle_ru" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CatalogPageConfig" OWNER TO acoustic_user;

--
-- Name: CommonText; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."CommonText" (
    id text NOT NULL,
    key text NOT NULL,
    text_uz text NOT NULL,
    text_ru text NOT NULL,
    category text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CommonText" OWNER TO acoustic_user;

--
-- Name: Doctor; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Doctor" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    position_uz text,
    position_ru text,
    experience_uz text,
    experience_ru text,
    description_uz text,
    description_ru text,
    slug text NOT NULL,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "branchIds" text[] DEFAULT ARRAY[]::text[],
    "patientTypes" text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."Doctor" OWNER TO acoustic_user;

--
-- Name: Faq; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Faq" (
    id text NOT NULL,
    question_uz text NOT NULL,
    question_ru text NOT NULL,
    answer_uz text NOT NULL,
    answer_ru text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Faq" OWNER TO acoustic_user;

--
-- Name: HearingTest; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HearingTest" (
    id text NOT NULL,
    name text,
    phone text,
    email text,
    "deviceType" text NOT NULL,
    "volumeLevel" double precision,
    "leftEarResults" jsonb NOT NULL,
    "rightEarResults" jsonb NOT NULL,
    "leftEarScore" integer,
    "rightEarScore" integer,
    "overallScore" integer,
    "leftEarLevel" text,
    "rightEarLevel" text,
    source text DEFAULT 'hearing_test'::text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HearingTest" OWNER TO acoustic_user;

--
-- Name: HomepageEmptyState; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageEmptyState" (
    id text NOT NULL,
    "sectionKey" text NOT NULL,
    message_uz text NOT NULL,
    message_ru text NOT NULL,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageEmptyState" OWNER TO acoustic_user;

--
-- Name: HomepageHearingAid; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageHearingAid" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    description_uz text,
    description_ru text,
    link text,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageHearingAid" OWNER TO acoustic_user;

--
-- Name: HomepageJourneyStep; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageJourneyStep" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    description_uz text,
    description_ru text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageJourneyStep" OWNER TO acoustic_user;

--
-- Name: HomepageLink; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageLink" (
    id text NOT NULL,
    "sectionKey" text NOT NULL,
    text_uz text NOT NULL,
    text_ru text NOT NULL,
    href text NOT NULL,
    icon text,
    "position" text DEFAULT 'bottom'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageLink" OWNER TO acoustic_user;

--
-- Name: HomepageNewsItem; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageNewsItem" (
    id text NOT NULL,
    "postId" text,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    excerpt_uz text,
    excerpt_ru text,
    slug text,
    "publishedAt" timestamp(3) without time zone,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageNewsItem" OWNER TO acoustic_user;

--
-- Name: HomepagePlaceholder; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepagePlaceholder" (
    id text NOT NULL,
    "sectionKey" text NOT NULL,
    "imageId" text,
    text_uz text,
    text_ru text,
    "backgroundColor" text,
    "textColor" text,
    "fontSize" text,
    "fontWeight" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepagePlaceholder" OWNER TO acoustic_user;

--
-- Name: HomepageSection; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageSection" (
    id text NOT NULL,
    key text NOT NULL,
    title_uz text,
    title_ru text,
    subtitle_uz text,
    subtitle_ru text,
    description_uz text,
    description_ru text,
    "showTitle" boolean DEFAULT true NOT NULL,
    "showSubtitle" boolean DEFAULT false NOT NULL,
    "showDescription" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageSection" OWNER TO acoustic_user;

--
-- Name: HomepageService; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."HomepageService" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    excerpt_uz text,
    excerpt_ru text,
    slug text,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomepageService" OWNER TO acoustic_user;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    source text,
    message text,
    "productId" text,
    status text DEFAULT 'new'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "pageUrl" text,
    referer text
);


ALTER TABLE public."Lead" OWNER TO acoustic_user;

--
-- Name: Media; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    url text NOT NULL,
    alt_uz text,
    alt_ru text,
    filename text,
    "mimeType" text,
    size integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Media" OWNER TO acoustic_user;

--
-- Name: Menu; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Menu" (
    id text NOT NULL,
    name text NOT NULL,
    items jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Menu" OWNER TO acoustic_user;

--
-- Name: Page; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Page" (
    id text NOT NULL,
    slug text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    body_uz text,
    body_ru text,
    "metaTitle_uz" text,
    "metaTitle_ru" text,
    "metaDescription_uz" text,
    "metaDescription_ru" text,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "galleryIds" text[] DEFAULT ARRAY[]::text[],
    "usefulArticleSlugs" text[] DEFAULT ARRAY[]::text[],
    "videoUrl" text
);


ALTER TABLE public."Page" OWNER TO acoustic_user;

--
-- Name: Post; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    body_uz text NOT NULL,
    body_ru text NOT NULL,
    slug text NOT NULL,
    excerpt_uz text,
    excerpt_ru text,
    "coverId" text,
    tags text[],
    status text DEFAULT 'published'::text NOT NULL,
    "publishAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text,
    "categoryId" text,
    "postType" text DEFAULT 'article'::text NOT NULL
);


ALTER TABLE public."Post" OWNER TO acoustic_user;

--
-- Name: PostCategory; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."PostCategory" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    description_uz text,
    description_ru text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    section text,
    "imageId" text
);


ALTER TABLE public."PostCategory" OWNER TO acoustic_user;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    description_uz text,
    description_ru text,
    price numeric(14,2),
    stock integer DEFAULT 0,
    "brandId" text,
    "categoryId" text,
    "galleryIds" text[],
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    audience text[] DEFAULT ARRAY[]::text[],
    "availabilityStatus" text,
    "formFactors" text[] DEFAULT ARRAY[]::text[],
    "hearingLossLevels" text[] DEFAULT ARRAY[]::text[],
    "paymentOptions" text[] DEFAULT ARRAY[]::text[],
    "powerLevel" text,
    "signalProcessing" text,
    "smartphoneCompatibility" text[] DEFAULT ARRAY[]::text[],
    "specsText" text,
    "tinnitusSupport" boolean DEFAULT false,
    benefits_ru text[] DEFAULT ARRAY[]::text[],
    benefits_uz text[] DEFAULT ARRAY[]::text[],
    features_ru text[] DEFAULT ARRAY[]::text[],
    features_uz text[] DEFAULT ARRAY[]::text[],
    "fittingRange_ru" text,
    "fittingRange_uz" text,
    "galleryUrls" text[] DEFAULT ARRAY[]::text[],
    intro_ru text,
    intro_uz text,
    "regulatoryNote_ru" text,
    "regulatoryNote_uz" text,
    "relatedProductIds" text[] DEFAULT ARRAY[]::text[],
    tech_ru text,
    tech_uz text,
    "usefulArticleSlugs" text[] DEFAULT ARRAY[]::text[],
    "productType" text,
    "thumbnailId" text
);


ALTER TABLE public."Product" OWNER TO acoustic_user;

--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    icon text,
    "parentId" text,
    description_ru text,
    description_uz text,
    "imageId" text,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ProductCategory" OWNER TO acoustic_user;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    permissions text[]
);


ALTER TABLE public."Role" OWNER TO acoustic_user;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    title_uz text NOT NULL,
    title_ru text NOT NULL,
    excerpt_uz text,
    excerpt_ru text,
    body_uz text,
    body_ru text,
    slug text NOT NULL,
    "coverId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text
);


ALTER TABLE public."Service" OWNER TO acoustic_user;

--
-- Name: ServiceCategory; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."ServiceCategory" (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    description_uz text,
    description_ru text,
    icon text,
    "imageId" text,
    "parentId" text,
    "order" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceCategory" OWNER TO acoustic_user;

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Setting" (
    id text DEFAULT 'singleton'::text NOT NULL,
    "phonePrimary" text DEFAULT '1385'::text,
    "phoneSecondary" text DEFAULT '+998 71 202 14 41'::text,
    email text,
    "telegramBotToken" text,
    "telegramChatId" text,
    "brandPrimary" text DEFAULT '#F07E22'::text,
    "brandAccent" text DEFAULT '#3F3091'::text,
    "featureFlags" jsonb,
    "socialLinks" jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "catalogHeroImageId" text,
    "logoId" text,
    "sidebarConfigs" jsonb,
    "sidebarSections" jsonb,
    "sidebarBrandIds" text[] DEFAULT ARRAY[]::text[],
    "telegramButtonBotToken" text,
    "telegramButtonBotUsername" text,
    "telegramButtonMessage_uz" text,
    "telegramButtonMessage_ru" text,
    "faviconId" text,
    "googleAnalyticsId" text,
    "yandexMetrikaId" text
);


ALTER TABLE public."Setting" OWNER TO acoustic_user;

--
-- Name: Showcase; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."Showcase" (
    id text NOT NULL,
    type text NOT NULL,
    "productIds" text[],
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productMetadata" jsonb
);


ALTER TABLE public."Showcase" OWNER TO acoustic_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "fullName" text,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "mustChangePassword" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO acoustic_user;

--
-- Name: _ProductToCatalog; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public."_ProductToCatalog" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProductToCatalog" OWNER TO acoustic_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: acoustic_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO acoustic_user;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."AuditLog" (id, "userId", "userEmail", entity, "entityId", action, changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: AvailabilityStatus; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."AvailabilityStatus" (id, key, label_uz, label_ru, schema, "colorClass", "order", "createdAt", "updatedAt") FROM stdin;
cmih2l6oc002jjja3g1tp4730	in-stock	Mavjud	В наличии	https://schema.org/InStock	text-green-600 bg-green-50	1	2025-11-27 06:46:04.813	2025-11-27 06:46:04.813
cmih2l6oc002kjja3ucqajh1b	out-of-stock	Mavjud emas	Нет в наличии	https://schema.org/OutOfStock	text-red-600 bg-red-50	2	2025-11-27 06:46:04.813	2025-11-27 06:46:04.813
cmih2l6oc002ljja30lpozpgr	preorder	Oldindan buyurtma	Предзаказ	https://schema.org/PreOrder	text-blue-600 bg-blue-50	3	2025-11-27 06:46:04.813	2025-11-27 06:46:04.813
cmih2l6oc002mjja3ysdqspoo	coming-soon	Tez orada	Скоро	https://schema.org/PreOrder	text-yellow-600 bg-yellow-50	4	2025-11-27 06:46:04.813	2025-11-27 06:46:04.813
\.


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Banner" (id, title_uz, title_ru, text_uz, text_ru, "ctaText_uz", "ctaText_ru", "ctaLink", "imageId", "order", status, "createdAt", "updatedAt") FROM stdin;
cmih32wqn0006ab1n2a0h2sjo	Bolalarda eshitishni diagnostika qilish	Диагностика слуха у детей	Bolalarda eshitish muammolarini erta aniqlash ularning rivojlanishi uchun muhim.	Ранняя проверка слуха важна для развития ребёнка.	Batafsil	Подробнее	/services/kids-test	cmire8o4z001eeo0rt6i0yxik	1	published	2025-11-27 06:59:51.744	2025-12-04 12:28:06.823
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Branch" (id, name_uz, name_ru, address_uz, address_ru, phone, phones, "imageId", map_iframe, "order", "createdAt", "updatedAt", latitude, longitude, slug, tour3d_iframe, "serviceIds", tour3d_config, "workingHours_ru", "workingHours_uz") FROM stdin;
cmih32wr9001qab1nygw3diw0	Yunusobod	Yunusobod	Toshkent shahar, Yunusobod 2-mavze 6-uy. Mo'ljal Asaka Bank. The Elements mehmonxona ro'parasida	г. Ташкент, Юнусабад, 2-й массив, дом 6. Ориентир: банк Asaka, напротив гостиницы The Elements	+998945904114	{}	cmkez4nao000a6kzky39zn7sn	\N	2	2025-11-27 06:59:51.765	2026-01-15 04:53:08.422	41.36200701177543	69.28818898298819	yunusobod	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001rab1nai947kg4	Yakkasaroy	Yakkasaroy	Toshkent shahar, Yakkasaroy tumani , Yusuf Xos Xojib 72.  Mo'ljal: Pasado yoki Jumanji restoranlari.	г. Ташкент, Якасарайский район, Юсуф Хос Хожиб, 72. Ориентир: рестораны Pasado или Jumanji.	+998712156850	{}	cmkez4w9v000b6kzk685j2a9e	\N	3	2025-11-27 06:59:51.765	2026-01-15 04:53:20.85	41.29482805319527	69.2537342099695	yakkasaroy	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001sab1ng2rn5y8h	Toshmi	Toshmi	Toshkent shahar, Shayhontoxur tumani, Farobiy 35. Mo'ljal Safia Bakery to'g'risida	г. Ташкент, Шайхантахурский район, Фараби 35. Ориентир: напротив Safia Bakery.	+998998804114	{}	cmkez538s000c6kzk9mlr4cjf	\N	4	2025-11-27 06:59:51.765	2026-01-15 04:53:29.101	41.34892415113293	69.17652213409222	toshmi	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001tab1nd9sxv6uv	Sergeli	Sergeli	Toshkent sh, Sergeli tumani, Sergeli 8 mavzesi, shokirariq ko'chasi, Mo'ljal: Baxt uyi to'yxona orqasida	г. Ташкент, Сергелийский район, Сергели 8-й массив, улица Шокирарик. Ориентир: за тойхоной «Баxt уйи».	+998903224114	{}	cmkez5afi000d6kzkfwq7o9zw	\N	5	2025-11-27 06:59:51.765	2026-01-15 04:53:38.362	41.21948930400441	69.22274179647307	sergeli	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001yab1nnyeiehgi	Navoiy	Navoiy	Navoiy shahar Zarafshon MFY Lev Tolstoy ko'chasi 1/30-31 uy.	г. Навои, Зарафшон МФЙ, улица Льва Толстого, дом 1/30-31.	+998937664114	{}	cmkez713v000f6kzk73qqo7yh	\N	10	2025-11-27 06:59:51.765	2026-01-15 04:54:59.309	40.0904468842983	65.37393329641368	navoiy	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90029ab1n3tj0fz7h	Jizzax	Jizzax	Jizzax shahar, Toshloq MFY, Shifokorlar ko'chasi, 8A uy	Jizzax shahar, Toshloq MFY, Shifokorlar ko'chasi, 8A uy	+998933654114	{}	cmkezb4cn000l6kzklir4mv20	\N	21	2025-11-27 06:59:51.765	2026-01-15 04:58:10.306	40.12635503885972	67.82918768107209	jizzax	\N	{}	\N	\N	\N
cmih32wr9001wab1n1jed39ds	Guliston	Guliston	Sirdaryo viloyat, Guliston shahar, Birlashgan ko`chasi, 6B-uy. Mo`ljal: Suzish havzasi orqasida	Сырдарьинская область, г. Гулистан, улица Бирлашган, дом 6B. Ориентир: за бассейном.	+998903324114	{}	cmkf0yi95000o6kzkk030mh0u	\N	8	2025-11-27 06:59:51.765	2026-01-15 05:44:21.906	40.50459092587306	68.7707139810919	guliston	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90021ab1nvbz06c8h	Shahrisabz	Shahrisabz	Qashqadaryo viloyati, Shahrisabz shahri, Teparlik MFY, 340-uy. Mo‘ljal: teri kasalliklari shifoxonasi (kojenniy bolnitsa).	Кашкадарьинская область, г. Шахрисабз, МФЙ Тепарлик, дом 340. Ориентир: кожвендиспансер (кожная больница).	+998998040605	{}	cmkhwekhp000ot6rve9aqsoff	\N	13	2025-11-27 06:59:51.765	2026-01-17 06:00:14.04	39.05949178901263	66.84198368286825	shahrisabz	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90028ab1nn17tx9ji	Qo'qon	Qo'qon	Qo‘qon shahar, Yangi Chorsu, 219-uy. Mo‘ljal: San’atkorlar uyi.	г. Коканд, Янгий Чорсу, дом 219. Ориентир: Дом деятелей искусства.	+998916795334	{}	cmkhwf32g000qt6rv6gg013p5	\N	20	2025-11-27 06:59:51.765	2026-01-17 06:00:37.338	40.53595158781408	70.95132830992938	qoqon	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001xab1nlifmra4n	Samarqand	Samarqand	Samarqand viloyati, Samarqand shahar, Gagarin ko'chasi 60 - uy  Mo'ljal:  "Beeline" ofisi ro'parasida	Самаркандская область, г. Самарканд, улица Гагарина, дом 60. Ориентир: напротив офиса «Beeline».	+998994474114	{}	cmkez6rbe000e6kzktrn68u8c	\N	9	2025-11-27 06:59:51.765	2026-01-15 04:54:50.746	39.66356652899635	66.93702432979721	samarqand	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001zab1ns33yhj6j	Buxoro	Buxoro	Buxoro shahar Mustaqillik ko'cha 40/1 Mo'ljal eski bahor kafesi (kinoteator Buxoro)	г. Бухара, улица Мустакиллик, дом 40/1. Ориентир: бывшее кафе «Баҳор» (кинотеатр «Бухара»).	+998935130049	{}	cmkez78u2000g6kzkx37hewaw	\N	11	2025-11-27 06:59:51.765	2026-01-15 04:55:10.137	39.75176019168013	64.43596539454518	buxoro	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90020ab1n9eaigqtx	Qarshi	Qarshi	Qarshi shahar, Chaqar MFY, Islom Karimov Ko'chasi, 353-uy. Mo'ljal: Eski shahar 4- maktab yonida	г. Карши, Чакар МФЙ, улица Ислама Каримова, дом 353. Ориентир: рядом со школой №4 (Старый город).	+998908744114	{}	cmkez84w5000h6kzk4x696ydh	\N	12	2025-11-27 06:59:51.765	2026-01-15 04:55:50.767	38.87481581351129	65.80650890984371	qarshi	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90022ab1nqybphsat	Termiz	Termiz	Surxondaryo viloyati. Termiz shahar, Taraqqiyot ko'chasi. 36 A. Mo'ljal: Viloyat prokuraturasi yonida.	г. Термез, Сурхандарьинская область, улица Тараккиёт, дом 36А. Ориентир: рядом с областной прокуратурой.	+998909794114	{}	cmkf0y0w9000n6kzkkci5flsj	\N	14	2025-11-27 06:59:51.765	2026-01-15 05:44:01.453	37.22774555440551	67.27256185209002	termiz	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001uab1n0nrcwxml	Qo'yliq	Qo'yliq	Toshkent shahar, Yashnaobod tumani, Farg'ona yo'li ko'chasi, Qo'yliq markaz m/m 10B. Mo'ljal: Korzinka orqasida	г. Ташкент, Яшнабадский район, улица Фергана йули, Куйлюк центр, м/м 10B. Ориентир: за Korzinka.	+998903934114	{}	cmkhwdgz6000nt6rv5tt51dpv	\N	6	2025-11-27 06:59:51.765	2026-01-17 05:59:32.871	41.24184258637032	69.33474558113085	qoyliq	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90026ab1nmi3ffzme	Farg'ona	Farg'ona	Farg'ona shahar, Al-Farg'oniy koʻchasi, 19-uy 	г. Фергана, улица Аль-Фаргони, дом 19	+998911614114	{}	cmkez0psk00086kzkrwr61hdg	\N	0	2025-11-27 06:59:51.765	2026-01-15 04:50:09.423	40.38304233120668	71.78483432341388	fargona	\N	{}	{"scenes": {"1": {"id": "1", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 0, "pitch": 0, "title": {"ru": "1", "uz": "1"}, "hotSpots": [{"yaw": -153.8, "text": "Qabulxona", "type": "scene", "pitch": 0.4, "sceneId": "2"}], "panorama": "http://localhost:3001/uploads/2025-11-28-1764333156487-flow_img_20250422_153621_10_084-hvwltc.jpg"}, "2": {"id": "2", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 1, "pitch": 0, "title": {"ru": "2", "uz": "2"}, "hotSpots": [{"yaw": -149.6, "text": "Tashqariga chiqish", "type": "scene", "pitch": -15.6, "sceneId": "1"}, {"yaw": 122.5, "text": "1-xona", "type": "scene", "pitch": -9.7, "sceneId": "3"}], "panorama": "http://localhost:3001/uploads/2025-11-28-1764333168940-flow_img_20250422_155916_10_086-ixtgjm.jpg"}, "3": {"id": "3", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 2, "pitch": 0, "title": {"ru": "3", "uz": "3"}, "hotSpots": [{"yaw": -168.6, "text": "Qabulxona", "type": "scene", "pitch": -22, "sceneId": "2"}], "panorama": "http://localhost:3001/uploads/2025-11-28-1764333178008-flow_img_20250422_155524_10_085-ngnfbo.jpg"}}, "compass": false, "default": {"yaw": 0, "hfov": 100, "pitch": 0, "compass": true, "autoLoad": true, "autoRotate": -2, "firstScene": "1"}, "autoLoad": true, "mouseZoom": true, "autoRotate": -2, "keyboardZoom": true, "showControls": true, "showZoomCtrl": true, "showFullscreenCtrl": true}	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001pab1nnv7g29iw	Chilonzor	Chilonzor	Toshkent sh, Chilonzor 7-45-3 Mo'ljal: Eski Mikrokreditbank, Hasaxon qori masjidi, Chilonzor Oq tepa	г. Ташкент, Чиланзар 7-45-3 Ориентир: бывший Микрокредитбанк, мечеть Хасахон кари, Чиланзар Оқтепа	+998712884444	{+998909205271}	cmkez4dbw00096kzkoaqhjnuc	\N	1	2025-11-27 06:59:51.765	2026-01-15 04:52:55.679	41.29730626633113	69.20506945414891	chilonzor	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90024ab1nlhebem2x	Nukus	Nukus	Nukus shahar, Allayar Dosnazarov ko‘chasi, 99/3-uy. Mo‘ljal: Nukus shahar hokimiyati ro‘parasida.	г. Нукус, улица Аллаяра Досназарова, дом 99/3. Ориентир: напротив хокимията города Нукус.	+998907094114	{}	cmkez9ynw000i6kzkackz4ub4	\N	16	2025-11-27 06:59:51.765	2026-01-15 04:57:15.645	42.46665562954583	59.61873943886847	nukus	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90025ab1ngrvfhemj	Andijon	Andijon	Andijon shahar, Alisher Navoiy shoh ko‘chasi, 86/88-uy.	г. Андижан, улица Алишера Навои, дом 86/88.	+998994204114	{}	cmkeza4la000j6kzk4r5q0u6i	\N	17	2025-11-27 06:59:51.765	2026-01-15 04:57:23.911	40.77613236348919	72.3559091811062	andijon	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90027ab1nxgjqrzka	Namangan	Namangan	Namangan shahar, Boburshoh ko‘chasi, 16/4-uy. Mo‘ljal: 11-maktab ro‘parasida.	г. Наманган, улица Бабуршох, дом 16/4. Ориентир: напротив школы №11.	+998932084114	{}	cmkezabvb000k6kzkig33eis4	\N	19	2025-11-27 06:59:51.765	2026-01-15 04:57:33.443	40.99393111918123	71.67986242344605	namangan	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr9001vab1naktd62h1	Sebzor	Sebzor	Toshkent shahar, Olmazor tumani, Sebzor 35V	г. Ташкент, Алмазарский район, Себзор 35V	+998771514114	{}	cmkf0xlrd000m6kzk6tkbgjgx	\N	1	2025-11-27 06:59:51.765	2026-01-15 05:43:39.411	41.3384931847745	69.25241099169301	sebzor	\N	{cmir1q4gv000beo0rmzr47lsp,cmir98kg80011eo0rxcbsw4a7,cmir520u0000veo0rf71ehamz,cmir2l6uo000oeo0rnr9s073n}	{"scenes": {"1": {"id": "1", "yaw": -180, "hfov": 100, "type": "equirectangular", "order": 0, "pitch": 0, "title": {"ru": "1", "uz": "1"}, "hotSpots": [{"yaw": 169, "text": "Markaz yoni", "type": "scene", "pitch": 1.3, "sceneId": "2"}], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"}, "2": {"id": "2", "yaw": -10, "hfov": 100, "type": "equirectangular", "order": 1, "pitch": 0, "title": {"ru": "2", "uz": "2"}, "hotSpots": [{"yaw": -9.3, "text": "Qabulxonaga kirish", "type": "scene", "pitch": -0.8, "sceneId": "3"}], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426295853-img_20251129_192139_307-b8i7ax.jpg"}, "3": {"id": "3", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 2, "pitch": 0, "title": {"ru": "3", "uz": "3"}, "hotSpots": [], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426433947-img_20251129_191711_956-tx69pd.jpg"}, "4": {"id": "4", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 3, "pitch": 0, "title": {"ru": "4", "uz": "4"}, "hotSpots": [], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426456427-img_20251129_192055_636-07eojq.jpg"}, "5": {"id": "5", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 4, "pitch": 0, "title": {"ru": "5", "uz": "5"}, "hotSpots": [], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426688655-2-mryau7.jpg"}, "6": {"id": "6", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 5, "pitch": 0, "title": {"ru": "6", "uz": "6"}, "hotSpots": [], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426764690-3-9scdly.jpg"}, "7": {"id": "7", "yaw": 0, "hfov": 100, "type": "equirectangular", "order": 6, "pitch": 0, "title": {"ru": "7", "uz": "7"}, "hotSpots": [], "panorama": "http://localhost:3001/uploads/2025-11-29-1764426794936-4-1pj4x9.jpg"}}, "compass": false, "default": {"yaw": 0, "hfov": 100, "pitch": 0, "compass": true, "autoLoad": true, "autoRotate": -2, "firstScene": "1"}, "autoLoad": true, "mouseZoom": true, "autoRotate": -2, "keyboardZoom": true, "showControls": true, "showZoomCtrl": true, "showFullscreenCtrl": true}	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
cmih32wr90023ab1nivzvq4fw	Urganch	Urganch	Xorazm viloyati, Urganch shahar, Tinchlik ko‘chasi, 31-uy. Mo‘ljal: Urganch shahar hokimiyati ro‘parasida; Xorazm viloyat jinoyat ishlari sudi ro‘parasida; Urganch urologiya markazi yonida.	Хорезмская область, г. Ургенч, улица Тинчлик, дом 31. Ориентир: напротив хокимията города Ургенч; напротив Хорезмского областного суда по уголовным делам; рядом с Ургенчским центром урологии.	+998992224114	{}	cmkhwevqp000pt6rvgpfpr3r6	\N	15	2025-11-27 06:59:51.765	2026-01-17 06:00:25.698	41.56322416092417	60.62533706765551	urganch	\N	{}	\N	Понедельник: 09:00 – 18:00\nВторник: 09:00 – 18:00\nСреда: 09:00 – 18:00\nЧетверг: 09:00 – 18:00\nПятница: 09:00 – 18:00\nСуббота: 10:00 – 17:00\nВоскресенье: Выходной день	Dushanba: 09:00 - 18:00\nSeshanba: 09:00 - 18:00\nChorshanba: 09:00 - 18:00\nPayshanba: 09:00 - 18:00\nJuma: 09:00 - 18:00\nShanba: 10:00 - 17:00\nYakshanba: Dam olish kuni
\.


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Brand" (id, name, slug, "logoId", desc_uz, desc_ru) FROM stdin;
cmih32wqq000fab1nimu18r3b	Oticon	oticon	cmiokrpfg0001tpunn22cc06f	Oticon — MoreSound Intelligence texnologiyasi asosidagi smart eshitish apparatlari.	Oticon — слуховые аппараты с технологией MoreSound Intelligence.
cmih32wqq000iab1nr31vye89	ReSound	resound	cmiokr1xy0000tpunrc4150z6	ReSound — 360° eshitish tajribasini taqdim etuvchi Omnia platformasi.	ReSound — платформа Omnia c 360° восприятием окружающего звука.
cmiknllmo000476v71d73sn03	Signia	signia	cmioksjoj0002tpune1t1inrn	\N	\N
cmih32wqq000dab1n3gho77dm	Interacoustics	interacoustics	cmiol278l0000hbl8lxx85gfp	Interacoustics — diagnostika va eshitish uskunalari bo'yicha yetakchi brend.	Interacoustics — ведущий бренд в области диагностики и слуховых решений.
\.


--
-- Data for Name: Catalog; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Catalog" (id, name_uz, name_ru, slug, description_uz, description_ru, icon, "imageId", "order", status, "showOnHomepage") FROM stdin;
cmih32wqt000sab1ncjk3uz3p	Ko'rinmas quloq orqasidagi	Незаметные заушные	ko-rinmas-quloq-orqasidagi	Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modellar. Qulay boshqaruvli va parvarish qilish oson.	Простые в уходе и управлении модели легко скрываются за ушной раковиной и волосами.	\N	cmiqzwih00002eo0rlaahk592	1	published	t
cmih32wqt000wab1ny7wywsq3	AI texnologiyalari	C Al-технологиями	ai-texnologiyalari	Sun'iy intellekt asosidagi aqlli eshitish texnologiyalari.	Умные слуховые технологии на базе искусственного интеллекта.	\N	cmiqzxmum0003eo0r2oj1etqr	5	published	t
cmih32wqt000xab1nzdpsqajj	Bolalar va o'smirlar uchun	Для детей и подростков	bolalar-va-osmirlar-uchun	Bolalarning nutq ko'nikmalarini normal rivojlantirishga yordam beradigan eshitish yechimlari.	Слуховые решения, которые помогут обеспечить ребенку нормальное развитие речевых навыков.	\N	cmiqzy7id0004eo0rmk7a34fn	6	published	t
cmih32wqt000yab1n4y706ku5	Quloqdagi shovqinni boshqarish	Управление шумом в ушах	quloqdagi-shovqinni-boshqarish	Samarali tovush terapiyasi quloq shovqinini niqoblaydi va darhol yengillik beradi.	Эффективная звуковая терапия маскирует ушной шум и приносит моментальное облегчение.	\N	cmir01dtj0005eo0re5xb0a9p	7	published	t
cmih32wqt000tab1n67ct8yee	Keksalar uchun	Для пожилых людей	keksalar-uchun	Ishonchli, bardoshli va parvarish qilish oson eshitish yechimlari keksalar uchun.	Надежные, долговечные и простые в уходе слуховые решения для людей пожилого возраста.	\N	cmir029uz0006eo0r6ezzmaas	2	published	t
cmih32wqt000zab1ngmdbo9q3	Smartfon uchun	Для смартфона	smartfon-uchun	Smartfoningizdan to'g'ridan-to'g'ri eshitish apparatlariga yuqori sifatli ovoz.	Звук высокого качества с вашего смартфона напрямую в слуховые аппараты.	\N	cmir03ncn0007eo0r8payehi2	8	published	t
cmih32wqt0010ab1n9d78ea6b	Kuchli va superkuchli	Мощные и супермощные	kuchli-va-superkuchli	3 va 4 darajadagi eshitish yo'qotilishi uchun universal yechimlar.	Универсальные решения для улучшения слуха при 3 и 4 степени тугоухости.	\N	cmir04cvt0008eo0rtx4l38c0	9	published	t
cmih32wqt000vab1nal2oe2dz	Ikkinchi darajadagi eshitish yo'qotilishi	При тугоухости 2 степени	ikkinchi-darajadagi-eshitish-yo-qotilishi	O'rtacha eshitish yo'qotilishi uchun keng tanlov.	Большой выбор моделей для помощи при нарушениях слуха умеренной степени.	\N	cmirbnja3001beo0rg7g68kvw	4	published	t
cmih32wqt000uab1n55ax9jnb	Ko'rinmas	Невидимые	ko-rinmas	Eshitish muammosiga sezilmaydigan yechim, u bilan siz uyatchanlikni unutasiz.	Незаметное решение проблемы со слухом, с которым вы забудете о стеснении.	\N	cmirbo8b6001ceo0r0ly3tfim	3	published	t
\.


--
-- Data for Name: CatalogPageConfig; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."CatalogPageConfig" (id, "hearingAidsTitle_uz", "hearingAidsTitle_ru", "interacousticsTitle_uz", "interacousticsTitle_ru", "accessoriesTitle_uz", "accessoriesTitle_ru", "updatedAt") FROM stdin;
singleton	Eshitish apparatlari	Слуховые аппараты	Interacoustics	Interacoustics	Aksessuarlar	Аксессуары	2025-11-27 06:59:51.776
\.


--
-- Data for Name: CommonText; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."CommonText" (id, key, text_uz, text_ru, category, "createdAt", "updatedAt") FROM stdin;
cmih2l6o7002djja3y766im1z	read-more	Batafsil	Подробнее	buttons	2025-11-27 06:46:04.808	2025-11-27 06:59:51.777
cmih2l6oa002ejja3te5fgppl	learn-more	Ko'proq o'rganish	Узнать больше	buttons	2025-11-27 06:46:04.811	2025-11-27 06:59:51.777
cmih2l6ob002fjja3qb93e1fv	contact-us	Biz bilan bog'lanish	Связаться с нами	buttons	2025-11-27 06:46:04.811	2025-11-27 06:59:51.778
cmih2l6ob002gjja3dc00nppb	call-now	Hozir qo'ng'iroq qiling	Позвоните сейчас	buttons	2025-11-27 06:46:04.812	2025-11-27 06:59:51.778
cmih2l6ob002hjja3z0fq8wct	free-consultation	Bepul konsultatsiya	Бесплатная консультация	services	2025-11-27 06:46:04.812	2025-11-27 06:59:51.779
cmih2l6oc002ijja3mp0yr3mb	free-delivery	Bepul yetkazib berish	Бесплатная доставка	services	2025-11-27 06:46:04.812	2025-11-27 06:59:51.779
\.


--
-- Data for Name: Doctor; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Doctor" (id, name_uz, name_ru, position_uz, position_ru, experience_uz, experience_ru, description_uz, description_ru, slug, "imageId", "order", status, "createdAt", "updatedAt", "branchIds", "patientTypes") FROM stdin;
cmizkm8gg0004co331xg28rqz	Akramova Mashhura Abdurahmonovna	Акрамова Машхура Абдурахмоновна	Surdolog-otorinolaringolog shifokor	Врач сурдолог-оториноларинголог	2013-yildan beri faoliyat yuritadi	Стаж работы с 2013 года	Ikkinchi toifali surdolog shifokor, bolalar surdologi, eshitish bo‘yicha mutaxassis.\nSugdologiya va eshitishni korreksiya qilish sohasida 13 yildan ortiq tajribaga ega. Jumladan KSVP, ASSR, otoaakustik emissiya kabi obyektiv tekshiruv usullarida katta amaliy tajribaga ega.\n\nFaoliyat yo‘nalishlari:\n\nEshitish kasalliklarining oldini olish va davolash\n\nEshitishni reabilitatsiya qilish bo‘yicha tavsiyalar\n\nEshitish apparatlarini tanlash va sozlash\n\nKattalar va 3 oylikdan boshlab bolalarda barcha turdagi eshitish diagnostikasi\n\nEshitish apparatiga moslashishning barcha bosqichlarida kuzatuv va hamrohlik\n\nIndividual quloq qolipi tayyorlash uchun quloq kanalidan qolip olish\n\nYangi tug‘ilgan chaqaloqlardan boshlab har qanday yoshdagi bemorlarda eshitish buzilishlari bo‘yicha maslahatlar\n\nMa’lumoti:\n\n2004–2011 — Andijon Davlat Tibbiyot Instituti, umumiy amaliyot shifokori\n\n2011–2013 — Toshkent Tibbiyot Akademiyasi, otorinolaringologiya yo‘nalishi\n\n2018-yil — Toshkent shifokorlarni malaka oshirish institutida tibbiy surdologiya bo‘yicha kursni muvaffaqiyatli tamomlagan	Врач-сурдолог второй квалификационной категории, детский сурдолог, специалист по слуху.\nИмеет более 13 лет опыта в области сурдологии и коррекции слуха, включая объективные методы исследования: КСВП, ASSR, отоакустическая эмиссия.\n\nСфера деятельности:\n\nПрофилактика и лечение нарушений слуха\n\nРекомендации по реабилитации слуха\n\nПодбор и настройка слуховых аппаратов\n\nВсе виды диагностики слуха у взрослых и детей с 3 месяцев\n\nСопровождение на всех этапах адаптации к ношению слухового аппарата\n\nВыполнение слепков ушных каналов для изготовления индивидуальных ушных вкладышей\n\nКонсультации по вопросам тугоухости и нарушений слуха у людей любого возраста, включая новорождённых\n\nОбразование:\n\n2004–2011 — Андижанский государственный медицинский институт, врач общей практики\n\n2011–2013 — Ташкентская медицинская академия, специальность «оториноларингология»\n\n2018 год — Успешно прошла курс по медицинской сурдологии в Ташкентском институте усовершенствования врачей	akramova-mashhura-abdurahmonovna	cmizkm4pu0002co33x39pbxgz	1	published	2025-12-10 05:30:38.032	2025-12-14 15:54:33.254	{cmih32wr9001vab1naktd62h1}	{}
cmizkrpuq0005co336rpkalv1	Jumaev Aziz Abdusamad o‘g‘li	Джумаев Азиз Абдусамад угли	«ACOUSTIC LOR» klinikasi rahbari, vrach-otorinolaringolog, audiolog	Руководитель клиники «ACOUSTIC LOR», врач-оториноларинголог, аудиолог	2018 yildan beri (6 yildan ortiq)	с 2018 года (более 6 лет)	Jumaev Aziz Abdusamad o‘g‘li — 6 yildan ortiq tajribaga ega otorinolaringolog va audiolog, Termiz shahridagi “Acoustic LOR klinikasi” rahbari. Kattalar va bolalardagi quloq, burun, tomoq kasalliklari hamda eshitish buzilishlarini zamonaviy usullar asosida aniqlash va davolash bo‘yicha yuqori malakali mutaxassis.\n\nKSVP va Otoakustik emissiya kabi obyektiv diagnostika usullarini mukammal bajaradi. LOR-kasalliklarning diagnostikasi, davosi va profilaktikasi bilan shug‘ullanadi. Eshitish apparatlarini tanlash va ular bilan moslashuv jarayonini to‘liq kuzatib boradi.\n\nFaoliyat yo‘nalishlari\n\nBarcha LOR-kasalliklarning profilaktikasi va davolashi\n\nKattalar va bolalarda eshitish buzilishlarini kompleks diagnostika qilish\n\nObyektiv diagnostika: KSVP va otoakustik emissiya\n\nEshitish moslamalarini tanlash va dasturlash\n\nEshitishni reabilitatsiya qilish bo‘yicha tavsiyalar\n\nEshitish apparatiga moslashuvning barcha bosqichlarida doimiy kuzatuv\n\nIsh tajribasi\n\n2020 — hozirga qadar — shifokor otorinolaringolog-audiolog, “Acoustic LOR klinikasi”, Termiz\n\n2020 — 2024 — shifokor otorinolaringolog, Surxondaryo viloyati bolalar ko‘p tarmoqli tibbiyot markazi\n\n2020 — 2024 — shifokor otorinolaringolog, Termiz shahar tibbiyot birlashmasi, markaziy poliklinika\n\n2021 — 2024 — Toshkent tibbiyot akademiyasi Termiz filiali, assistent\n\n2018 — 2020 — Toshkent Pediatriya Tibbiyot Instituti, LOR kafedrasi, klinik ordinator\n\nMa’lumoti\n\nToshkent Pediatriya Tibbiyot Instituti, Pediatriya fakulteti, bakalavr darajasi (2012–2018)\n\nToshkent Pediatriya Tibbiyot Instituti, Otorinolaringologiya bo‘yicha klinik ordinatura (2018–2021)	Джумаев Азиз Абдусамад угли — врач-оториноларинголог и аудиолог с более чем 6-летним опытом работы, руководитель клиники «Acoustic LOR» в городе Термез. Высококвалифицированный специалист по диагностике и лечению заболеваний уха, горла, носа, а также нарушений слуха у взрослых и детей с применением современных методов.\n\nОтлично владеет объективными методами исследования слуха: КСВП и отоакустическая эмиссия. Занимается диагностикой, лечением и профилактикой всех ЛОР-заболеваний. Проводит подбор слуховых аппаратов и полное сопровождение пациента на всех этапах адаптации.\n\nОсновные направления деятельности\n\nПрофилактика и лечение всех ЛОР-заболеваний\n\nКомплексная диагностика нарушений слуха у взрослых и детей\n\nОбъективные методы исследования: КСВП и отоакустическая эмиссия\n\nПодбор и программирование слуховых аппаратов\n\nКонсультирование по вопросам реабилитации слуха\n\nНаблюдение на всех этапах адаптации к слуховому аппарату\n\nОпыт работы\n\n2020 — настоящее время — врач оториноларинголог-аудиолог, «Acoustic LOR клиника», Термез\n\n2020 — 2024 — врач-оториноларинголог, Сурхандарьинский областной многопрофильный детский медицинский центр\n\n2020 — 2024 — врач-оториноларинголог, Терmezское городское медицинское объединение, центральная поликлиника\n\n2021 — 2024 — ассистент Ташкентской медицинской академии, Терmezский филиал\n\n2018 — 2020 — клинический ординатор, кафедра ЛОР-заболеваний, Ташкентский педиатрический медицинский институт\n\nОбразование\n\nТашкентский педиатрический медицинский институт, факультет педиатрии, степень бакалавра (2012–2018)\n\nТашкентский педиатрический медицинский институт, клиническая ординатура по оториноларингологии (2018–2021)	dzhumaev-aziz-abdusamad-ugli	cmizkukh30006co33g6mk6yb8	2	published	2025-12-10 05:34:53.858	2025-12-14 15:54:47.218	{cmih32wr90022ab1nqybphsat}	{}
\.


--
-- Data for Name: Faq; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Faq" (id, question_uz, question_ru, answer_uz, answer_ru, "order", status, "createdAt", "updatedAt") FROM stdin;
cmih32wr6001fab1ncgpx7e41	Eshitish apparati qanday ishlaydi?	Как работает слуховой аппарат?	Eshitish apparati mikrofondan tovushlarni qabul qiladi, ularni raqamli signalga aylantiradi va qayta ishlaydi. Keyin kuchaytirilgan tovush quloq ichiga uzatiladi. Zamonaviy apparatlar AI texnologiyasi yordamida nutqni shovqindan ajratadi va eng yaxshi eshitishni ta'minlaydi.	Слуховой аппарат принимает звуки через микрофон, преобразует их в цифровой сигнал и обрабатывает. Затем усиленный звук передается в ухо. Современные аппараты используют технологию ИИ для отделения речи от шума и обеспечения наилучшего слуха.	1	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001gab1nvmhao4ie	Eshitish apparatini qancha vaqt davomida kiyish mumkin?	Как долго можно носить слуховой аппарат?	Eshitish apparatini kun davomida kiyish mumkin. Dastlabki kunlarda qisqa vaqt (2-3 soat) kiyib, keyin vaqtni asta-sekin oshirish tavsiya etiladi. Quloq apparatiga moslashish uchun 1-2 hafta kerak bo'lishi mumkin.	Слуховой аппарат можно носить в течение всего дня. В первые дни рекомендуется носить его короткое время (2-3 часа), постепенно увеличивая продолжительность. Для адаптации к аппарату может потребоваться 1-2 недели.	2	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001hab1npgg6qou7	Eshitish apparati qancha narxda?	Сколько стоит слуховой аппарат?	Eshitish apparatlari narxi model, funksiyalar va texnologiyalariga qarab 5 milliondan 30 million so'mgacha o'zgaradi. Bizda 0% muddatli to'lov va turli xil to'lov shartlari mavjud. Bepul konsultatsiya va sinov uchun bizga murojaat qiling.	Стоимость слуховых аппаратов варьируется от 5 до 30 миллионов сум в зависимости от модели, функций и технологий. У нас доступна рассрочка 0% и различные условия оплаты. Обратитесь к нам для бесплатной консультации и примерки.	3	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001iab1ntlnw9xje	Bolalar uchun eshitish apparatlari mavjudmi?	Есть ли слуховые аппараты для детей?	Ha, bizda bolalar uchun maxsus dizayn qilingan eshitish apparatlari mavjud. Ular mustahkam, suv o'tkazmaydi va bolalar uchun xavfsiz materiallardan tayyorlangan. Bolalar uchun apparatlar kattalar uchun modellardan farqli ravishda bolalar eshitish xususiyatlariga moslashtirilgan.	Да, у нас есть слуховые аппараты, специально разработанные для детей. Они прочные, водонепроницаемые и изготовлены из безопасных для детей материалов. Детские аппараты адаптированы к особенностям слуха детей, в отличие от моделей для взрослых.	4	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001jab1neboueci3	Eshitish apparatini smartfon bilan boshqarish mumkinmi?	Можно ли управлять слуховым аппаратом через смартфон?	Ha, ko'pchilik zamonaviy eshitish apparatlari smartfon ilovalari orqali boshqariladi. Ilova orqali ovoz balandligini sozlash, rejimlarni o'zgartirish va hatto telefon qo'ng'iroqlarini to'g'ridan-to'g'ri eshitish apparatiga uzatish mumkin.	Да, большинство современных слуховых аппаратов управляются через приложения для смартфона. Через приложение можно регулировать громкость, менять режимы и даже передавать телефонные звонки напрямую в слуховой аппарат.	5	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001kab1n9zb5bqrh	Eshitish apparatini qanday parvarish qilish kerak?	Как ухаживать за слуховым аппаратом?	Eshitish apparatini har kuni quruq mato bilan tozalash, namlikdan saqlash va batareyani muntazam almashtirish kerak. Kechasi apparatni yopiq idishda saqlash va namlikni yutuvchi vositalardan foydalanish tavsiya etiladi.	Слуховой аппарат следует ежедневно очищать сухой тканью, защищать от влаги и регулярно менять батарею. Рекомендуется хранить аппарат в закрытом контейнере на ночь и использовать влагопоглощающие средства.	6	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001lab1niivqjzo7	Eshitish apparatini qancha vaqt ishlatish mumkin?	Как долго можно использовать слуховой аппарат?	Zamonaviy eshitish apparatlari odatda 5-7 yil davomida ishlaydi. Muntazam parvarish va texnik xizmat ko'rsatish bilan bu muddat yanada uzoq bo'lishi mumkin. Har yili apparatni tekshirish va sozlash tavsiya etiladi.	Современные слуховые аппараты обычно служат 5-7 лет. При регулярном уходе и техническом обслуживании этот срок может быть еще дольше. Рекомендуется ежегодно проверять и настраивать аппарат.	7	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001mab1n0g3qb1bl	Eshitish apparati quloqni shikastlaydimi?	Вредит ли слуховой аппарат уху?	Yo'q, to'g'ri sozlangan eshitish apparati quloqni shikastlamaydi. Aksincha, u eshitish qobiliyatini yaxshilaydi va miyada eshitish markazlarini faollashtiradi. Muhimi - apparatni mutaxassis tomonidan to'g'ri sozlash va muntazam tekshirish.	Нет, правильно настроенный слуховой аппарат не вредит уху. Наоборот, он улучшает слух и активирует слуховые центры в мозге. Важно правильно настроить аппарат специалистом и регулярно проверять его.	8	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001nab1n9o4whs9z	Eshitish apparatini uxlashda ham kiyish mumkinmi?	Можно ли носить слуховой аппарат во время сна?	Umuman olganda, uxlashda eshitish apparatini kiyish tavsiya etilmaydi. Bu quloq terisini qizdiradi va qulflanishga olib kelishi mumkin. Kechasi apparatni yopiq idishda saqlash va batareyani olib tashlash yaxshiroq.	В целом, носить слуховой аппарат во время сна не рекомендуется. Это может нагревать кожу уха и привести к дискомфорту. Лучше хранить аппарат в закрытом контейнере на ночь и вынимать батарею.	9	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
cmih32wr6001oab1nnb7b4g3k	Eshitish apparatini qayerdan sotib olish mumkin?	Где можно купить слуховой аппарат?	Acoustic.uz markazlarida siz eshitish apparatlarini sotib olishingiz va bepul konsultatsiya olishingiz mumkin. Bizda barcha yetakchi brendlar (Oticon, Phonak, Widex, Signia) mavjud. Bepul sinov va sozlash xizmatlari ham mavjud.	В центрах Acoustic.uz вы можете приобрести слуховые аппараты и получить бесплатную консультацию. У нас представлены все ведущие бренды (Oticon, Phonak, Widex, Signia). Также доступны бесплатные примерка и настройка.	10	published	2025-11-27 06:59:51.763	2025-11-27 06:59:51.763
\.


--
-- Data for Name: HearingTest; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HearingTest" (id, name, phone, email, "deviceType", "volumeLevel", "leftEarResults", "rightEarResults", "leftEarScore", "rightEarScore", "overallScore", "leftEarLevel", "rightEarLevel", source, status, notes, "createdAt", "updatedAt") FROM stdin;
cmiqebbfc0000bphhyp3bm0yc	\N	\N	\N	speaker	1	{"250": 0.18, "500": 0.23, "1000": 0.2, "2000": 0.22, "4000": 0.23, "8000": 0.25}	{"250": 0.24, "500": 0.17, "1000": 0.2, "2000": 0.16, "4000": 0.19, "8000": 0.15}	78	82	80	mild	mild	hearing_test	completed	\N	2025-12-03 19:24:15.384	2025-12-03 19:24:15.384
cmiqehf1p0000eo0rn1035cw1	\N	\N	\N	speaker	1	{"250": 0.05, "500": 0.05, "1000": 0.05, "2000": 0.05, "4000": 0.05, "8000": 0.05}	{"250": 0.05, "500": 0.05, "1000": 0.05, "2000": 0.05, "4000": 0.05, "8000": 0.05}	95	95	95	normal	normal	hearing_test	completed	\N	2025-12-03 19:29:00.012	2025-12-03 19:29:00.012
cmiqzmuxz0001eo0r7tpuhk37	\N	\N	\N	headphone	1	{"250": 0, "500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0}	{"250": 0, "500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0}	100	100	100	normal	normal	hearing_test	completed	\N	2025-12-04 05:21:05.821	2025-12-04 05:21:05.821
cmire8k3i001deo0rfcph41bh	\N	\N	\N	headphone	1	{"250": 0.25, "500": 0.05, "1000": 0.05, "2000": 0, "4000": 0, "8000": 0}	{"250": 0.05, "500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0}	94	99	97	normal	normal	hearing_test	completed	\N	2025-12-04 12:09:52.831	2025-12-04 12:09:52.831
cmivlyklq0001co331y2s2h6i	\N	\N	\N	headphone	1	{"250": 0.56, "500": 0, "1000": 0.9500000000000003, "2000": 0.9500000000000003, "4000": 0.7500000000000001, "8000": 0.9500000000000003}	{"250": 0.9500000000000003, "500": 0.9500000000000003, "1000": 0.995, "2000": 0.94, "4000": 0.915, "8000": 0.99}	31	4	18	severe	profound	hearing_test	completed	\N	2025-12-07 10:57:08.559	2025-12-07 10:57:08.559
cmjiefay3002p14eadrxfiwul	\N	\N	\N	headphone	1	{"250": 0.9000000000000002, "500": 0.1, "1000": 0, "2000": 0, "4000": 0, "8000": 0}	{"250": 0.9500000000000003, "500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0}	83	84	84	mild	mild	hearing_test	completed	\N	2025-12-23 09:44:54.315	2025-12-23 09:44:54.315
cmjkd3hfk004914ea7az53bg4	\N	\N	\N	speaker	1	{"250": 0.99, "500": 0.155, "1000": 0, "2000": 0.015, "4000": 0, "8000": 0.025}	{"250": 0.185, "500": 0.195, "1000": 0.235, "2000": 0.27, "4000": 0.33, "8000": 0.355}	80	74	77	mild	mild	hearing_test	completed	\N	2025-12-24 18:43:15.584	2025-12-24 18:43:15.584
\.


--
-- Data for Name: HomepageEmptyState; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageEmptyState" (id, "sectionKey", message_uz, message_ru, icon, "createdAt", "updatedAt") FROM stdin;
cmih2l6o4002bjja32hl6hz6h	services	Hozircha xizmatlar mavjud emas	Услуги пока недоступны	info	2025-11-27 06:46:04.804	2025-11-27 06:59:51.774
cmih2l6o6002cjja30d6r77v1	hearing-aids	Hozircha mahsulotlar mavjud emas	Продукты пока недоступны	empty-box	2025-11-27 06:46:04.806	2025-11-27 06:59:51.775
\.


--
-- Data for Name: HomepageHearingAid; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageHearingAid" (id, title_uz, title_ru, description_uz, description_ru, link, "imageId", "order", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HomepageJourneyStep; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageJourneyStep" (id, title_uz, title_ru, description_uz, description_ru, "order", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HomepageLink; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageLink" (id, "sectionKey", text_uz, text_ru, href, icon, "position", "order", status, "createdAt", "updatedAt") FROM stdin;
cmih2l6o00023jja3dmffd309	services	Barcha xizmatlarni ko'rish	Посмотреть все услуги	/services	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih2l6o00024jja3winr967t	hearing-aids	Katalogga o'tish	Перейти в каталог	/catalog	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih2l6o00025jja3nvghyrfd	interacoustics	Batafsil	Подробнее	/catalog/interacoustics	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih2l6o00026jja3vrq17mz7	cochlear	Batafsil	Подробнее	/catalog/cochlear	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih2l6o00027jja3pf3sayko	fresh-posts	Barcha maqolalarni ko'rish	Посмотреть все статьи	/posts	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih2l6o00028jja3rcsuo5rb	branches	Barcha filiallarni ko'rish	Посмотреть все филиалы	/branches	arrow-right	bottom	1	published	2025-11-27 06:46:04.801	2025-11-27 06:46:04.801
cmih32wrf002kab1nxcql26ud	services	Barcha xizmatlarni ko'rish	Посмотреть все услуги	/services	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
cmih32wrf002lab1nv5lsr2u1	hearing-aids	Katalogga o'tish	Перейти в каталог	/catalog	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
cmih32wrf002mab1n4g3j6j9v	interacoustics	Batafsil	Подробнее	/catalog/interacoustics	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
cmih32wrf002nab1n57oyaoqu	cochlear	Batafsil	Подробнее	/catalog/cochlear	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
cmih32wrf002oab1nihaa7ojz	fresh-posts	Barcha maqolalarni ko'rish	Посмотреть все статьи	/posts	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
cmih32wrf002pab1n3qd46jxk	branches	Barcha filiallarni ko'rish	Посмотреть все филиалы	/branches	arrow-right	bottom	1	published	2025-11-27 06:59:51.771	2025-11-27 06:59:51.771
\.


--
-- Data for Name: HomepageNewsItem; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageNewsItem" (id, "postId", title_uz, title_ru, excerpt_uz, excerpt_ru, slug, "publishedAt", "order", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HomepagePlaceholder; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepagePlaceholder" (id, "sectionKey", "imageId", text_uz, text_ru, "backgroundColor", "textColor", "fontSize", "fontWeight", "createdAt", "updatedAt") FROM stdin;
cmih2l6o20029jja3idzzcyer	services	\N	Xizmatlar tez orada qo'shiladi	Услуги будут добавлены в ближайшее время	#f0f0f0	#666	text-lg	font-bold	2025-11-27 06:46:04.802	2025-11-27 06:59:51.773
cmih2l6o3002ajja3holcp0jd	hearing-aids	\N	Mahsulotlar tez orada qo'shiladi	Продукты будут добавлены в ближайшее время	#f0f0f0	#666	text-lg	font-bold	2025-11-27 06:46:04.804	2025-11-27 06:59:51.774
\.


--
-- Data for Name: HomepageSection; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageSection" (id, key, title_uz, title_ru, subtitle_uz, subtitle_ru, description_uz, description_ru, "showTitle", "showSubtitle", "showDescription", "order", status, "createdAt", "updatedAt") FROM stdin;
cmih2l6nw001vjja3q0dfdk4m	services	Xizmatlarimiz	Наши услуги	Professional eshitish yechimlari	Профессиональные слуховые решения	Biz sizga eng yaxshi eshitish yechimlarini taklif etamiz	Мы предлагаем вам лучшие слуховые решения	t	t	f	1	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw001wjja3zraj64xi	hearing-aids	Eshitish apparatlari	Слуховые аппараты	Zamonaviy texnologiyalar	Современные технологии	Eng yaxshi brendlar va modellar	Лучшие бренды и модели	t	t	f	2	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw001xjja3bsmjkdri	interacoustics	Interacoustics	Interacoustics	Diagnostika uskunalari	Диагностическое оборудование	Professional diagnostika va tekshiruv	Профессиональная диагностика и обследование	t	t	f	3	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw001yjja34ki1l45k	cochlear	Cochlear implantlar	Кохлеарные импланты	Chuqur eshitish yo'qotilishi uchun	Для глубокой потери слуха	Koxlear implantlar va aksessuarlar	Кохлеарные импланты и аксессуары	t	t	f	4	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw001zjja3226wgegp	path-to-better-hearing	Yaxshi eshitishga yo'l	Путь к лучшему слуху	4 qadamda	В 4 шага	Bizning jarayonimiz	Наш процесс	t	t	f	5	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw0020jja38hks1kp6	fresh-posts	So'nggi yangiliklar	Последние новости	Maqolalar va yangiliklar	Статьи и новости	Eshitish va sog'liq haqida	О слухе и здоровье	t	t	f	6	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw0021jja3pqh0tohg	faq	Savol-Javob	Вопросы и ответы	Tez-tez so'raladigan savollar	Часто задаваемые вопросы	Eshitish apparatlari haqida	О слуховых аппаратах	t	f	f	7	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
cmih2l6nw0022jja3wlvbveha	branches	Filiallarimiz	Наши филиалы	Bizning manzillar	Наши адреса	Barcha filiallar va kontaktlar	Все филиалы и контакты	t	t	f	8	published	2025-11-27 06:46:04.797	2025-11-27 06:46:04.797
\.


--
-- Data for Name: HomepageService; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."HomepageService" (id, title_uz, title_ru, excerpt_uz, excerpt_ru, slug, "imageId", "order", status, "createdAt", "updatedAt") FROM stdin;
cmir9o3hb0018eo0ru9enxxt8	Audiometriya	Аудиометрия	Audiometriya —  eshitish darajasini tez va aniq o‘lchovchi test.	Аудиометрия — быстрый и точный тест для оценки слуха.	services/audiometriya	cmir4gj8k000reo0rjh3ohqwj	1	published	2025-12-04 10:01:59.711	2025-12-04 10:23:41.41
cmir2a4n3000ieo0r1cjy0exc	Bolalarda eshitishni diagnostika qilish	Диагностика слуха у детей	Bolalarda eshitish muammolarini erta aniqlash ularning rivojlanishi uchun muhim.	Ранняя проверка слуха важна для развития ребёнка.	services/kids-test	cmir1wnhu000eeo0rd3unte6f	3	published	2025-12-04 06:35:10.72	2025-12-04 10:23:48.478
cmir9yu0f001aeo0rduhknrmv	Kattalarda eshitishni diagnostika qilish	Диагностика слуха у взрослых	Eshitishdagi o‘zgarishlarni aniqlash va eshitish darajasini tezkor baholash.	Быстрая оценка слуха и выявление возможных изменений.	services/kattalarda-eshitishni-diagnostika-qilish	cmir2l5fh000meo0ravobjb5t	2	published	2025-12-04 10:10:20.656	2025-12-04 10:24:23.184
cmir9civ40014eo0rikwwtfyy	Eng yaqin filialni toping	Найдите ближайший филиал	Sizga eng qulay bo‘lgan Acoustic markazi manzilini aniqlang	Выберите наиболее удобный для вас филиал Acoustic	branches	cmir9ssu20019eo0rbznej3yi	4	published	2025-12-04 09:52:59.777	2025-12-04 10:05:40.629
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Lead" (id, name, phone, email, source, message, "productId", status, "createdAt", "updatedAt", "pageUrl", referer) FROM stdin;
cmir2kbxe000keo0r3xvasoig	ACOUSTIC.UZ	N/A	\N	telegram_button	/start	\N	new	2025-12-04 06:43:06.721	2025-12-04 06:43:06.721	\N	\N
cmir2ks43000leo0r7tvr730b	Ulugbek Xakimov	998909429271	\N	appointment_form_branch_cmih32wr90026ab1nmi3ffzme	Filial: Farg'ona	\N	new	2025-12-04 06:43:27.699	2025-12-04 06:43:27.699	\N	\N
cmit9nhj50000co33infyr0zq	Ulugbek Xakimov	998909429271	\N	appointment_form_branch_cmih32wr90026ab1nmi3ffzme	Filial: Farg'ona	\N	new	2025-12-05 19:37:03.617	2025-12-05 19:37:03.617	\N	\N
cmizm4oio000fco33n692ci34	Bobir Niyazov	998903264114	\N	service-ksvp_branch_cmih32wr90026ab1nmi3ffzme	Filial: Farg'ona	\N	new	2025-12-10 06:12:58.272	2025-12-10 06:12:58.272	\N	\N
cmizz8hu10000dyrqn9py5ftb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 12:19:51.241	2025-12-10 12:19:51.241	\N	\N
cmj02xcdk0001dyrqpt71vvik	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 14:03:09.416	2025-12-10 14:03:09.416	\N	\N
cmj05koh00002dyrq28swyqnt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 15:17:17.412	2025-12-10 15:17:17.412	\N	\N
cmj06mxew0003dyrqvqds4ntw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 15:47:01.927	2025-12-10 15:47:01.927	\N	\N
cmj06v5iu0004dyrqu7kmypak	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 15:53:25.687	2025-12-10 15:53:25.687	\N	\N
cmj079ddl0005dyrqapzh7rm4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 16:04:29.05	2025-12-10 16:04:29.05	\N	\N
cmj07vz6e0006dyrq4b9p9lji	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 16:22:03.734	2025-12-10 16:22:03.734	\N	\N
cmj07vz6f0007dyrqeokl9i8g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 16:22:03.735	2025-12-10 16:22:03.735	\N	\N
cmj0bgfcl0008dyrqblxoh850	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 18:01:56.662	2025-12-10 18:01:56.662	\N	\N
cmj0ds96d0009dyrq7fxb3xj8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 19:07:07.765	2025-12-10 19:07:07.765	\N	\N
cmj0g1f3q000adyrqde7crki7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 20:10:14.582	2025-12-10 20:10:14.582	\N	\N
cmj0g1g6i000bdyrqtkwbg2ey	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 20:10:15.978	2025-12-10 20:10:15.978	\N	\N
cmj0ikfxb000cdyrq19znd7qe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 21:21:01.343	2025-12-10 21:21:01.343	\N	\N
cmj0iz20a000ddyrqr5dkqq7u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-10 21:32:23.146	2025-12-10 21:32:23.146	\N	\N
cmj0srsja000edyrq7yxzn93t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 02:06:40.439	2025-12-11 02:06:40.439	\N	\N
cmj0ss6g0000fdyrqtzttjsuj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 02:06:58.465	2025-12-11 02:06:58.465	\N	\N
cmj0sscdd000gdyrqgig3xq5l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 02:07:06.145	2025-12-11 02:07:06.145	\N	\N
cmj1dd2az0000r3uzou34dmgo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 11:43:05.195	2025-12-11 11:43:05.195	\N	\N
cmj1dd2b20001r3uz1wlu3c2n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 11:43:05.198	2025-12-11 11:43:05.198	\N	\N
cmj1dd2b30002r3uz2y6u7tas	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 11:43:05.199	2025-12-11 11:43:05.199	\N	\N
cmj1gdccy0003r3uz9trx4l6v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 13:07:17.074	2025-12-11 13:07:17.074	\N	\N
cmj1gyxoz0004r3uz62uywuid	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 13:24:04.5	2025-12-11 13:24:04.5	\N	\N
cmj1zp2q40000xiolyczcvs4n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 22:08:17.164	2025-12-11 22:08:17.164	\N	\N
cmj20ud3n0001xiolvhgu508q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-11 22:40:23.507	2025-12-11 22:40:23.507	\N	\N
cmj2awwbw0002xiol7pyrkfau	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 03:22:17.9	2025-12-12 03:22:17.9	\N	\N
cmj2ayt520003xiolxgwdx973	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 03:23:47.078	2025-12-12 03:23:47.078	\N	\N
cmj2ayt830004xiols84sg5mw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 03:23:47.187	2025-12-12 03:23:47.187	\N	\N
cmj2la4ue0000jj1yvake6r8s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 08:12:31.622	2025-12-12 08:12:31.622	\N	\N
cmj2ol5yh0001jj1ylhacwaxs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 09:45:05.129	2025-12-12 09:45:05.129	\N	\N
cmj2rqpz9000011am0grfcdpt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 11:13:23.205	2025-12-12 11:13:23.205	\N	\N
cmj2rqq03000111ammzwfz89w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 11:13:23.235	2025-12-12 11:13:23.235	\N	\N
cmj2v39qa000211am7v2awqjd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 12:47:07.522	2025-12-12 12:47:07.522	\N	\N
cmj2v3bft000311am9bkvuhft	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 12:47:09.737	2025-12-12 12:47:09.737	\N	\N
cmj2v3cod000411amnmloh1n1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 12:47:11.341	2025-12-12 12:47:11.341	\N	\N
cmj2vipxj000511amrnbjgtsl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 12:59:08.359	2025-12-12 12:59:08.359	\N	\N
cmj2vj1kh000611amkilzeq2x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 12:59:23.441	2025-12-12 12:59:23.441	\N	\N
cmj2vy055000711amih3bl8gv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 13:11:01.433	2025-12-12 13:11:01.433	\N	\N
cmj2x1f5r000811am4lqgk8kf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 13:41:40.479	2025-12-12 13:41:40.479	\N	\N
cmj2xrelv000911amsvw50flk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:01:52.82	2025-12-12 14:01:52.82	\N	\N
cmj2xzil2000a11amwk786617	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:11.222	2025-12-12 14:08:11.222	\N	\N
cmj2xzixg000b11amq9m15ycf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:11.669	2025-12-12 14:08:11.669	\N	\N
cmj2xzjq4000c11am6fjtfy2l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:12.7	2025-12-12 14:08:12.7	\N	\N
cmj2xzkuf000d11amc4hlms4g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:14.151	2025-12-12 14:08:14.151	\N	\N
cmj2xznqz000e11amrd3wvl1r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:17.915	2025-12-12 14:08:17.915	\N	\N
cmj2xzobs000f11amhu0mkz8q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:18.664	2025-12-12 14:08:18.664	\N	\N
cmj2xzs5x000g11amndpd8uk9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:23.637	2025-12-12 14:08:23.637	\N	\N
cmj2xzsfv000h11am0rdx9uez	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:08:23.995	2025-12-12 14:08:23.995	\N	\N
cmj2ze73r000i11amezlh9l8g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 14:47:35.799	2025-12-12 14:47:35.799	\N	\N
cmj30mi1x000j11amt8q1rqy0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 15:22:02.853	2025-12-12 15:22:02.853	\N	\N
cmj30mi7h000k11ampqnnkres	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 15:22:03.053	2025-12-12 15:22:03.053	\N	\N
cmj30nhqq000l11amz41v03x4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 15:22:49.106	2025-12-12 15:22:49.106	\N	\N
cmj31989u000m11amhzx5pasb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 15:39:43.266	2025-12-12 15:39:43.266	\N	\N
cmj3198ey000n11amsov6dles	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 15:39:43.45	2025-12-12 15:39:43.45	\N	\N
cmj32su2x000o11amw6505j5m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 16:22:57.588	2025-12-12 16:22:57.588	\N	\N
cmj35ru2e000p11amayxswa4x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 17:46:09.782	2025-12-12 17:46:09.782	\N	\N
cmj378dch000q11am4ksir7kl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 18:27:00.882	2025-12-12 18:27:00.882	\N	\N
cmj37a59h000r11am07y2jlgr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-12 18:28:23.718	2025-12-12 18:28:23.718	\N	\N
cmj3po8rg000s11amggaw8iox	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 03:03:14.525	2025-12-13 03:03:14.525	\N	\N
cmj3s6ri9000t11amnswl3u8b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 04:13:37.858	2025-12-13 04:13:37.858	\N	\N
cmj3tcumq000u11amanv5ywhu	Doniyor	+998946106161	\N	contact-page	ish vaqtingiz nechchidan	\N	new	2025-12-13 04:46:21.458	2025-12-13 04:46:21.458	\N	\N
cmj3vud9y000v11ama184mcgt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.006	2025-12-13 05:55:58.006	\N	\N
cmj3vud9z000w11amfh3cx2ij	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.007	2025-12-13 05:55:58.007	\N	\N
cmj3vuda0000x11amve7akwdi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.008	2025-12-13 05:55:58.008	\N	\N
cmj3vuda8000z11am1wxozilu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.012	2025-12-13 05:55:58.012	\N	\N
cmj3vuda7000y11amwl76fwsg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.012	2025-12-13 05:55:58.012	\N	\N
cmj3vudaz001011amiudlonwv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.043	2025-12-13 05:55:58.043	\N	\N
cmj3vudb1001111amq0902ebg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.012	2025-12-13 05:55:58.012	\N	\N
cmj3vudc8001211amzvqxhubu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.088	2025-12-13 05:55:58.088	\N	\N
cmj3vudcf001311amwg6kvxo3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.096	2025-12-13 05:55:58.096	\N	\N
cmj3vudd1001411am5jd15tmm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.117	2025-12-13 05:55:58.117	\N	\N
cmj3vuddn001511amel9otprs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.139	2025-12-13 05:55:58.139	\N	\N
cmj3vudds001611am7ilafpy5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.144	2025-12-13 05:55:58.144	\N	\N
cmj3vude9001711ampj7d2h4j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.161	2025-12-13 05:55:58.161	\N	\N
cmj3vudea001811amq2vxk4yj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.163	2025-12-13 05:55:58.163	\N	\N
cmj3vudej001911am13lau0z3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.171	2025-12-13 05:55:58.171	\N	\N
cmj3vudev001a11amz2pfalh6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.184	2025-12-13 05:55:58.184	\N	\N
cmj3vudf8001b11amtz275yaf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.196	2025-12-13 05:55:58.196	\N	\N
cmj3vudf9001c11amek6enerf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.198	2025-12-13 05:55:58.198	\N	\N
cmj3vudff001d11am7u334b4i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.203	2025-12-13 05:55:58.203	\N	\N
cmj3vudg8001e11ammlek3hvt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.232	2025-12-13 05:55:58.232	\N	\N
cmj3vudg9001f11amdzqfbvz7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.234	2025-12-13 05:55:58.234	\N	\N
cmj3vudgb001g11am0q5jqmse	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.235	2025-12-13 05:55:58.235	\N	\N
cmj3vudge001h11amx6svltx8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.238	2025-12-13 05:55:58.238	\N	\N
cmj3vudk3001i11am2a21w113	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 05:55:58.371	2025-12-13 05:55:58.371	\N	\N
cmj3wmodj0004a5wjdseqclvw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 06:17:58.76	2025-12-13 06:17:58.76	\N	\N
cmj3wzoae0005a5wjgq8fo82m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 06:28:05.174	2025-12-13 06:28:05.174	\N	\N
cmj3y0x3m0006a5wjpvnxg9ry	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 06:57:02.867	2025-12-13 06:57:02.867	\N	\N
cmj3zl7f60007a5wjc8829zav	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 07:40:48.979	2025-12-13 07:40:48.979	\N	\N
cmj43d8ci0000bv9lfj4z93jy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 09:26:35.395	2025-12-13 09:26:35.395	\N	\N
cmj48d9si000f2rpzl7okc0sl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 11:46:35.346	2025-12-13 11:46:35.346	\N	\N
cmj499j39000g2rpzlvzfhmie	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 12:11:40.389	2025-12-13 12:11:40.389	\N	\N
cmj49mg2c000h2rpzb9n67iwy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 12:21:42.997	2025-12-13 12:21:42.997	\N	\N
cmj49mhbu000i2rpzk1zj7cxg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 12:21:44.634	2025-12-13 12:21:44.634	\N	\N
cmj49mhiv000j2rpz0tsuziy8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 12:21:44.887	2025-12-13 12:21:44.887	\N	\N
cmj4lq2u40000cg1b50zq7s5o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 18:00:27.868	2025-12-13 18:00:27.868	\N	\N
cmj4mqrhj0001cg1bsc9jd4t3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-13 18:28:59.423	2025-12-13 18:28:59.423	\N	\N
cmj54ud4c0009vzoaame0wmix	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 02:55:40.524	2025-12-14 02:55:40.524	\N	\N
cmj5c70iz000avzoaqup5h3mw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 06:21:28.043	2025-12-14 06:21:28.043	\N	\N
cmj5dnw75000bvzoafqjfnwv8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 07:02:35.202	2025-12-14 07:02:35.202	\N	\N
cmj5dnwh1000cvzoah6cx4ocf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 07:02:35.558	2025-12-14 07:02:35.558	\N	\N
cmj5eujcy000dvzoaaqkzfmqx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 07:35:44.77	2025-12-14 07:35:44.77	\N	\N
cmj5qa3ey0000zgeb82yth4jk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 12:55:46.378	2025-12-14 12:55:46.378	\N	\N
cmj5u1zai0001zgebakw0va6m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-14 14:41:26.251	2025-12-14 14:41:26.251	\N	\N
cmj6pvu9l000011tab0pzkvxf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 05:32:27.513	2025-12-15 05:32:27.513	\N	\N
cmj6wdv6q000a11taf8j68ysm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 08:34:26.211	2025-12-15 08:34:26.211	\N	\N
cmj6we3sp000b11ta3ah71k02	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 08:34:37.37	2025-12-15 08:34:37.37	\N	\N
cmj6whkk1000c11ta70pswq4y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 08:37:19.058	2025-12-15 08:37:19.058	\N	\N
cmj6wirh9000d11taos3vxtg4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 08:38:14.685	2025-12-15 08:38:14.685	\N	\N
cmj6wjbjr000e11tall5kqvkp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 08:38:40.695	2025-12-15 08:38:40.695	\N	\N
cmj6xsxyl000f11tagk68yu4f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 09:14:09.262	2025-12-15 09:14:09.262	\N	\N
cmj7075gb000g11taru4vijz1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 10:21:11.387	2025-12-15 10:21:11.387	\N	\N
cmj7075h4000h11tamzor2ydu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 10:21:11.417	2025-12-15 10:21:11.417	\N	\N
cmj7075hf000i11taxerx533f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 10:21:11.428	2025-12-15 10:21:11.428	\N	\N
cmj707615000j11taz3snvmjp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 10:21:12.138	2025-12-15 10:21:12.138	\N	\N
cmj76v7xp000o11tasel8mfip	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:27:52.045	2025-12-15 13:27:52.045	\N	\N
cmj76weot000p11tag54wqprp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:28:47.453	2025-12-15 13:28:47.453	\N	\N
cmj76wqcn000q11tafm6zzh42	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:29:02.567	2025-12-15 13:29:02.567	\N	\N
cmj76wy28000r11talgfoa112	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:29:12.561	2025-12-15 13:29:12.561	\N	\N
cmj76yaej000s11tai9b19mly	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:30:15.211	2025-12-15 13:30:15.211	\N	\N
cmj76yag1000t11tapkq6ul9l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:30:15.265	2025-12-15 13:30:15.265	\N	\N
cmj76yao0000u11tafvucw290	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 13:30:15.552	2025-12-15 13:30:15.552	\N	\N
cmj7abwsr000v11ta9vv7mk4j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 15:04:49.611	2025-12-15 15:04:49.611	\N	\N
cmj7abzvk000w11taec8roc8p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 15:04:53.6	2025-12-15 15:04:53.6	\N	\N
cmj7abzxg000x11tauq7rpt73	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 15:04:53.668	2025-12-15 15:04:53.668	\N	\N
cmj7d98h6000y11taav6by0k8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 16:26:43.627	2025-12-15 16:26:43.627	\N	\N
cmj7dhajc000z11tav0vf1hco	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 16:32:59.544	2025-12-15 16:32:59.544	\N	\N
cmj7elxkv001011taeo9kkgmj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 17:04:35.647	2025-12-15 17:04:35.647	\N	\N
cmj7fpvwz001111tafd4shb5o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 17:35:39.731	2025-12-15 17:35:39.731	\N	\N
cmj7fpw1h001211tawtgx9wks	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 17:35:39.893	2025-12-15 17:35:39.893	\N	\N
cmj7hadh6001311taa1jkf2bx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-15 18:19:35.226	2025-12-15 18:19:35.226	\N	\N
cmj82k3aa001411tat7dijb8h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 04:15:00.514	2025-12-16 04:15:00.514	\N	\N
cmj82k8es001511takjrqjy88	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 04:15:07.157	2025-12-16 04:15:07.157	\N	\N
cmj84lluk001611ta4qjw12gf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:12:10.46	2025-12-16 05:12:10.46	\N	\N
cmj84ug9w001711taj5i6zav7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:19:03.141	2025-12-16 05:19:03.141	\N	\N
cmj85ari2001811tayzcmqnqi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:31:44.186	2025-12-16 05:31:44.186	\N	\N
cmj85atg4001911taalib9czk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:31:46.708	2025-12-16 05:31:46.708	\N	\N
cmj85aun9001a11taew4uf2ha	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:31:48.262	2025-12-16 05:31:48.262	\N	\N
cmj85aykr001b11tau84vy3y7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:31:53.355	2025-12-16 05:31:53.355	\N	\N
cmj85ouqf001c11ta8k1vc5tt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:42:41.56	2025-12-16 05:42:41.56	\N	\N
cmj863euu001d11ta8dvt42o6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 05:54:00.822	2025-12-16 05:54:00.822	\N	\N
cmj8dvuj9001e11taqyvttmvk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 09:32:04.821	2025-12-16 09:32:04.821	\N	\N
cmj8mq4vy001f11ta97blcqyg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 13:39:34.846	2025-12-16 13:39:34.846	\N	\N
cmj8ow430001g11tab1hlj624	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 14:40:12.972	2025-12-16 14:40:12.972	\N	\N
cmj8qfaoy001h11taakct89xg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-16 15:23:07.618	2025-12-16 15:23:07.618	\N	\N
cmj9mvqsw000013klgnfbqdka	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 06:31:42.704	2025-12-17 06:31:42.704	\N	\N
cmj9puiua000113klzf1ibkno	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 07:54:44.579	2025-12-17 07:54:44.579	\N	\N
cmj9te5fi000213kl5z0wzzcg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 09:33:59.166	2025-12-17 09:33:59.166	\N	\N
cmja1m1ym000313kl5cmgmmpx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 13:24:04.846	2025-12-17 13:24:04.846	\N	\N
cmja1mc1w000413klxgck0lne	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 13:24:17.925	2025-12-17 13:24:17.925	\N	\N
cmja1me3j000513kl3sgefaf1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 13:24:20.575	2025-12-17 13:24:20.575	\N	\N
cmja3sejw000613klfubgcvqe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 14:25:00.332	2025-12-17 14:25:00.332	\N	\N
cmja6j33c000713kl7k4l13ic	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 15:41:44.424	2025-12-17 15:41:44.424	\N	\N
cmja6ml57000813klt690wqj7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 15:44:27.788	2025-12-17 15:44:27.788	\N	\N
cmja6za1x000913kl08vhr9h9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 15:54:19.941	2025-12-17 15:54:19.941	\N	\N
cmja7h4ce000a13kltmayadnm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 16:08:12.35	2025-12-17 16:08:12.35	\N	\N
cmja8bg6i000b13kltb38zx4o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 16:31:47.37	2025-12-17 16:31:47.37	\N	\N
cmjaeo2ts000c13klg4hzh4g5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 19:29:34.289	2025-12-17 19:29:34.289	\N	\N
cmjaeotae000d13kl4j1em4xu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-17 19:30:08.582	2025-12-17 19:30:08.582	\N	\N
cmjavn2cg000e13klygox6h63	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 03:24:40.481	2025-12-18 03:24:40.481	\N	\N
cmjavn6u3000f13kl19hbq9ji	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 03:24:46.3	2025-12-18 03:24:46.3	\N	\N
cmjax5sbh000g13klj6y48rz2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 04:07:13.565	2025-12-18 04:07:13.565	\N	\N
cmjazfpnu000h13kl9u004koj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 05:10:55.914	2025-12-18 05:10:55.914	\N	\N
cmjb29nag000i13kl4hgijp84	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 06:30:11.753	2025-12-18 06:30:11.753	\N	\N
cmjb49l2f000j13klgfob7z3e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 07:26:08.103	2025-12-18 07:26:08.103	\N	\N
cmjb5efo4000k13klxu0sutt4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 07:57:54.004	2025-12-18 07:57:54.004	\N	\N
cmjb6qz2c000l13klz5ex4r6k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 08:35:38.628	2025-12-18 08:35:38.628	\N	\N
cmjb6qzoz000m13klv2keypbv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 08:35:39.443	2025-12-18 08:35:39.443	\N	\N
cmjb6xd39000n13kledrse773	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 08:40:36.742	2025-12-18 08:40:36.742	\N	\N
cmjb703q8000o13klgx4vr47a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 08:42:44.576	2025-12-18 08:42:44.576	\N	\N
cmjb9dpz0000p13kl2ut89k1y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 09:49:19.164	2025-12-18 09:49:19.164	\N	\N
cmjba8fcd000q13klr30rfdeb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 10:13:11.725	2025-12-18 10:13:11.725	\N	\N
cmjbc2l1o000r13klj4albwjc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 11:04:38.413	2025-12-18 11:04:38.413	\N	\N
cmjbd0gvj000s13kly7k5z6c7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 11:30:59.31	2025-12-18 11:30:59.31	\N	\N
cmjbfnfn0000t13kljow9l1jp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 12:44:50.028	2025-12-18 12:44:50.028	\N	\N
cmjbfnmgl000u13klon8nhvyh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 12:44:58.87	2025-12-18 12:44:58.87	\N	\N
cmjbg492k000v13klkt71mwf1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 12:57:54.668	2025-12-18 12:57:54.668	\N	\N
cmjbgffca000w13klr5z8yg5d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 13:06:36.01	2025-12-18 13:06:36.01	\N	\N
cmjbimfzx000x13klbo9nr74y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 14:08:02.685	2025-12-18 14:08:02.685	\N	\N
cmjbjzumv000y13kldnbns5cv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 14:46:27.799	2025-12-18 14:46:27.799	\N	\N
cmjbjzvb9000z13klb8vjxv1a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 14:46:28.678	2025-12-18 14:46:28.678	\N	\N
cmjbl2s19001013klhjt56y1v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 15:16:44.013	2025-12-18 15:16:44.013	\N	\N
cmjblc1y5001113klc1o99u4x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 15:23:56.765	2025-12-18 15:23:56.765	\N	\N
cmjblt7cz001213klfco4ygu7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 15:37:16.931	2025-12-18 15:37:16.931	\N	\N
cmjblt7jo001313klwi37cczc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 15:37:17.172	2025-12-18 15:37:17.172	\N	\N
cmjblufgv001413klycj7ts9n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 15:38:14.095	2025-12-18 15:38:14.095	\N	\N
cmjbn8nvb001513kljrgenrc9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 16:17:17.783	2025-12-18 16:17:17.783	\N	\N
cmjbpqb9u001613kly1wpxu5s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 17:27:00.499	2025-12-18 17:27:00.499	\N	\N
cmjbzteac001713klzwmvsp4f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-18 22:09:20.532	2025-12-18 22:09:20.532	\N	\N
cmjc4i5q4001813klhyu1zxtg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 00:20:34.301	2025-12-19 00:20:34.301	\N	\N
cmjcfkg9d001913kl0vp5yfdd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 05:30:17.041	2025-12-19 05:30:17.041	\N	\N
cmjch2rse001a13kltnn1s6hu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 06:12:31.407	2025-12-19 06:12:31.407	\N	\N
cmjcqlmtw001b13klatooq3jr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:07.989	2025-12-19 10:39:07.989	\N	\N
cmjcqlmxu001c13klrwpcsubp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.13	2025-12-19 10:39:08.13	\N	\N
cmjcqlmxw001d13klq0efk1ai	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.133	2025-12-19 10:39:08.133	\N	\N
cmjcqln22001e13kl4b8fbr6z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.282	2025-12-19 10:39:08.282	\N	\N
cmjcqln8e001f13kl06h6rsbk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.511	2025-12-19 10:39:08.511	\N	\N
cmjcqln8f001g13kl2t7vhjm6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.511	2025-12-19 10:39:08.511	\N	\N
cmjcqln8g001i13klteooggro	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.512	2025-12-19 10:39:08.512	\N	\N
cmjcqln8f001h13klj56ntwk9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.512	2025-12-19 10:39:08.512	\N	\N
cmjcqlnje001j13klykle3fmi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:39:08.906	2025-12-19 10:39:08.906	\N	\N
cmjcqrkv3001k13kl11rn89qr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 10:43:45.375	2025-12-19 10:43:45.375	\N	\N
cmjctqqme001l13klvzbqdzhh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 12:07:05.03	2025-12-19 12:07:05.03	\N	\N
cmjcu1rg6001m13kll3rvq0da	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 12:15:39.318	2025-12-19 12:15:39.318	\N	\N
cmjcu3xra001n13kl1xtaatkq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 12:17:20.807	2025-12-19 12:17:20.807	\N	\N
cmjcv4q06001o13kldekxgfeu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 12:45:57.03	2025-12-19 12:45:57.03	\N	\N
cmjcw9040001p13klo1cynguy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 13:17:16.369	2025-12-19 13:17:16.369	\N	\N
cmjcy5u8f001q13kli6e1zr3d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 14:10:48.015	2025-12-19 14:10:48.015	\N	\N
cmjcy8awu001r13klwov1bf20	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 14:12:42.942	2025-12-19 14:12:42.942	\N	\N
cmjcyuvfp001s13kl2728c2cu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 14:30:15.973	2025-12-19 14:30:15.973	\N	\N
cmjd05y81001t13kl3gky8pgm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 15:06:52.418	2025-12-19 15:06:52.418	\N	\N
cmjd0vuw1001u13klrk40g3qm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 15:27:01.153	2025-12-19 15:27:01.153	\N	\N
cmjd2907e001v13klkjxug0m9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 16:05:14.186	2025-12-19 16:05:14.186	\N	\N
cmjd2q64i001w13kl304h9ju8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 16:18:35.01	2025-12-19 16:18:35.01	\N	\N
cmjd6rj41001x13klhmbgjz6b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 18:11:36.961	2025-12-19 18:11:36.961	\N	\N
cmjdafxib001y13kl4thn6ojh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 19:54:34.211	2025-12-19 19:54:34.211	\N	\N
cmjdao096001z13kl0e5j6c7s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 20:00:51.018	2025-12-19 20:00:51.018	\N	\N
cmjdao3yq002013kl5d9skzbx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-19 20:00:55.826	2025-12-19 20:00:55.826	\N	\N
cmjdlblrk0000sut7e2cnqx2z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 00:59:08.144	2025-12-20 00:59:08.144	\N	\N
cmjdq2jqw0001sut7jucvylbr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 03:12:03.705	2025-12-20 03:12:03.705	\N	\N
cmjdq7j640002sut7pf2a0cp8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 03:15:56.236	2025-12-20 03:15:56.236	\N	\N
cmjdwnbhg0000dfgl7yr28q49	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 06:16:10.468	2025-12-20 06:16:10.468	\N	\N
cmjdwz2u400006dg0slkf2lim	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 06:25:19.132	2025-12-20 06:25:19.132	\N	\N
cmjdwz9we00016dg0yn1qcp1d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 06:25:28.286	2025-12-20 06:25:28.286	\N	\N
cmjdxents0000ckkxgi8j0vo5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 06:37:26.177	2025-12-20 06:37:26.177	\N	\N
cmjdxsrb10001ckkxub6jwte5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 06:48:23.869	2025-12-20 06:48:23.869	\N	\N
cmje2dur9000014eawhv9f0jh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 08:56:46.581	2025-12-20 08:56:46.581	\N	\N
cmje3g5q6000114ea6g1zgjef	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 09:26:33.727	2025-12-20 09:26:33.727	\N	\N
cmje6ryl3000214eaoazqn8sg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 10:59:43.191	2025-12-20 10:59:43.191	\N	\N
cmjebnmsa000314eacsmzax5n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 13:16:19.354	2025-12-20 13:16:19.354	\N	\N
cmjeeud14000414eaei4g5wbu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 14:45:32.153	2025-12-20 14:45:32.153	\N	\N
cmjeew1ky000514eatbbhdkd9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 14:46:50.626	2025-12-20 14:46:50.626	\N	\N
cmjegwzsy000614eae656wruq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 15:43:34.211	2025-12-20 15:43:34.211	\N	\N
cmjeipnu5000714ea6b6vwurs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 16:33:51.341	2025-12-20 16:33:51.341	\N	\N
cmjejtdi6000814eakpkorhh4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 17:04:44.19	2025-12-20 17:04:44.19	\N	\N
cmjen00nz000914eaobbbxvtw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 18:33:52.992	2025-12-20 18:33:52.992	\N	\N
cmjenasdy000a14ea2ou97llk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-20 18:42:15.478	2025-12-20 18:42:15.478	\N	\N
cmjf909kk000b14ea3ov9h2ci	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 04:49:56.076	2025-12-21 04:49:56.076	\N	\N
cmjf90a88000c14earsvu92m1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 04:49:56.936	2025-12-21 04:49:56.936	\N	\N
cmjf90aac000d14eakbhqxknq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 04:49:57.012	2025-12-21 04:49:57.012	\N	\N
cmjf90asp000e14ealvu0x1q1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 04:49:57.674	2025-12-21 04:49:57.674	\N	\N
cmjf9ff5s000f14eag8notufc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 05:01:43.168	2025-12-21 05:01:43.168	\N	\N
cmjf9fg1d000g14eacgi4jxyt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 05:01:44.305	2025-12-21 05:01:44.305	\N	\N
cmjf9fg8c000h14ea4v3uy6kh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 05:01:44.557	2025-12-21 05:01:44.557	\N	\N
cmjfaf3mn000i14eaqy8qr9g2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 05:29:27.839	2025-12-21 05:29:27.839	\N	\N
cmjfdme1r000j14eautzn5j9e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 06:59:06.784	2025-12-21 06:59:06.784	\N	\N
cmjfdnoqq000k14eau1wiee54	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:00:07.288	2025-12-21 07:00:07.288	\N	\N
cmjfe2t91000l14eant2uk8q5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:11:52.982	2025-12-21 07:11:52.982	\N	\N
cmjfejjci000m14ea6sr3vbmp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:24:53.298	2025-12-21 07:24:53.298	\N	\N
cmjfejjci000n14eaz9i9gtke	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:24:53.298	2025-12-21 07:24:53.298	\N	\N
cmjfejjep000o14eawit1m9eb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:24:53.378	2025-12-21 07:24:53.378	\N	\N
cmjfejjg1000p14ea3n52iv6z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 07:24:53.425	2025-12-21 07:24:53.425	\N	\N
cmjfgezsg000q14ea8b4fvvti	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 08:17:20.56	2025-12-21 08:17:20.56	\N	\N
cmjfibdsf000r14ea3jsv8bt7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:10:31.311	2025-12-21 09:10:31.311	\N	\N
cmjfipq5h000s14eaeb2eidda	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:21:40.517	2025-12-21 09:21:40.517	\N	\N
cmjfivrkr000t14eazblt20yb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:26:22.299	2025-12-21 09:26:22.299	\N	\N
cmjfj0afs000u14ea5fyd30gs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:29:53.368	2025-12-21 09:29:53.368	\N	\N
cmjfjqw49000v14eal2k5b3w6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:50:34.522	2025-12-21 09:50:34.522	\N	\N
cmjfjqwee000w14eaowr80j10	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:50:34.886	2025-12-21 09:50:34.886	\N	\N
cmjfjqwog000x14ea5eaal42h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:50:35.249	2025-12-21 09:50:35.249	\N	\N
cmjfjqwxr000y14eagctqy9ks	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 09:50:35.583	2025-12-21 09:50:35.583	\N	\N
cmjfkm6ec000z14eavdxlspo4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 10:14:54.18	2025-12-21 10:14:54.18	\N	\N
cmjfktnqv001014eahe59zio9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 10:20:43.255	2025-12-21 10:20:43.255	\N	\N
cmjfl1vvi001114eaafvgzu5k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 10:27:07.038	2025-12-21 10:27:07.038	\N	\N
cmjflvwl8001214eaddugrqyo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 10:50:27.644	2025-12-21 10:50:27.644	\N	\N
cmjfmem8u001314ear50l9agx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:05:00.702	2025-12-21 11:05:00.702	\N	\N
cmjfmtbzh001414eaipz9sov8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:16:27.245	2025-12-21 11:16:27.245	\N	\N
cmjfn5hk2001514eap14wajrc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:25:54.339	2025-12-21 11:25:54.339	\N	\N
cmjfnkj25001614ea3mdf5aqk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:37:36.125	2025-12-21 11:37:36.125	\N	\N
cmjfnkzt8001714ea34bvf1qz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:37:57.827	2025-12-21 11:37:57.827	\N	\N
cmjfnpfko001814ealcs95uls	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:41:24.888	2025-12-21 11:41:24.888	\N	\N
cmjfo2uar001914eawq7v9xyu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 11:51:50.5	2025-12-21 11:51:50.5	\N	\N
cmjfo5w8t001a14ea7q8ujsi9	Махаммадгани 6	998907521949	\N	service-ksvp_branch_cmih32wr90027ab1nxgjqrzka	Filial: Namangan	\N	new	2025-12-21 11:54:12.989	2025-12-21 11:54:12.989	https://acoustic.uz/services/ksvp	\N
cmjfq2tdh001b14eavyd0o6ah	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 12:47:48.533	2025-12-21 12:47:48.533	\N	\N
cmjfql6t7001c14eaxn4hy8tx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 13:02:05.755	2025-12-21 13:02:05.755	\N	\N
cmjfri2lc001d14ea6jx4ci6k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 13:27:39.936	2025-12-21 13:27:39.936	\N	\N
cmjfu08sc001e14eabyv0qx86	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 14:37:47.005	2025-12-21 14:37:47.005	\N	\N
cmjfv0czt001f14eatc63uulp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 15:05:52.073	2025-12-21 15:05:52.073	\N	\N
cmjfv2k1w001g14eakql0q4ed	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 15:07:34.532	2025-12-21 15:07:34.532	\N	\N
cmjfv3s93001h14eaxkvsjs6a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 15:08:31.815	2025-12-21 15:08:31.815	\N	\N
cmjfv3svg001i14ea49qsfi6y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 15:08:32.62	2025-12-21 15:08:32.62	\N	\N
cmjfvb5qe001j14eagviax44w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 15:14:15.878	2025-12-21 15:14:15.878	\N	\N
cmjg0webf001k14eabyuw6z2w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 17:50:44.859	2025-12-21 17:50:44.859	\N	\N
cmjg3ldm9001l14eav4qoia5g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 19:06:09.585	2025-12-21 19:06:09.585	\N	\N
cmjg4atam001m14eax1flb842	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-21 19:25:56.302	2025-12-21 19:25:56.302	\N	\N
cmjghgblb001n14eai5nbd00n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 01:34:08.303	2025-12-22 01:34:08.303	\N	\N
cmjgkfg7t001o14eazttm9h6y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 02:57:26.489	2025-12-22 02:57:26.489	\N	\N
cmjgkfgaq001p14eaj5pheiiv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 02:57:26.594	2025-12-22 02:57:26.594	\N	\N
cmjgnblp3001q14easvpm7x2z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 04:18:25.816	2025-12-22 04:18:25.816	\N	\N
cmjgpfgwi001r14ea9up9sdzv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 05:17:25.459	2025-12-22 05:17:25.459	\N	\N
cmjgqo8ld001s14eajenpq7k8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 05:52:14.209	2025-12-22 05:52:14.209	\N	\N
cmjgsk7pb001t14eap0utak8p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 06:45:05.664	2025-12-22 06:45:05.664	\N	\N
cmjgsk7uc001u14eaj0oduqjg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 06:45:05.844	2025-12-22 06:45:05.844	\N	\N
cmjgsk83d001v14eaa2o6uehn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 06:45:06.17	2025-12-22 06:45:06.17	\N	\N
cmjgt4e9z001w14eat3sfnsay	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 07:00:47.304	2025-12-22 07:00:47.304	\N	\N
cmjgt4u65001x14eadaaz1iyt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 07:01:07.901	2025-12-22 07:01:07.901	\N	\N
cmjgtn7th001y14ea439nn87r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 07:15:25.397	2025-12-22 07:15:25.397	\N	\N
cmjgtt1p3001z14ea9smsf8o7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 07:19:57.4	2025-12-22 07:19:57.4	\N	\N
cmjgu1w2l002014eamnmqvywt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 07:26:50.014	2025-12-22 07:26:50.014	\N	\N
cmjgz4yw7002114eatjsagj6b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 09:49:11.719	2025-12-22 09:49:11.719	\N	\N
cmjh3p9dw002214eacx9driow	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 11:56:56.9	2025-12-22 11:56:56.9	\N	\N
cmjh3p9qs002314ealkn8zmal	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 11:56:57.364	2025-12-22 11:56:57.364	\N	\N
cmjh5isru002414earepiqzru	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 12:47:54.667	2025-12-22 12:47:54.667	\N	\N
cmjh6z4q4002514eatkowlnal	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 13:28:36.268	2025-12-22 13:28:36.268	\N	\N
cmjh71y61002614eaoppfh1yq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 13:30:47.737	2025-12-22 13:30:47.737	\N	\N
cmjh74qvh002714eaug9521hh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 13:32:58.254	2025-12-22 13:32:58.254	\N	\N
cmjh7ztlm002814ea2x30ewmi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 13:57:08.122	2025-12-22 13:57:08.122	\N	\N
cmjh9ojn7002914eaka6u4js5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 14:44:21.235	2025-12-22 14:44:21.235	\N	\N
cmjh9zthc002a14eanqclauz1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 14:53:07.201	2025-12-22 14:53:07.201	\N	\N
cmjha2m72002b14eahvxmyldd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 14:55:17.727	2025-12-22 14:55:17.727	\N	\N
cmjhbjp2d002c14ea62qrhk8u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 15:36:34.214	2025-12-22 15:36:34.214	\N	\N
cmjhbjpdl002d14eayv4zpmkp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 15:36:34.618	2025-12-22 15:36:34.618	\N	\N
cmjhbkzl0002e14ea9rtplwz5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 15:37:34.501	2025-12-22 15:37:34.501	\N	\N
cmjhdgbw5002f14ea4nm0nmki	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:29:56.405	2025-12-22 16:29:56.405	\N	\N
cmjhdlx43002g14easd0me5a8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:34:17.187	2025-12-22 16:34:17.187	\N	\N
cmjhdsflq002h14earp9kwnlj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:39:21.086	2025-12-22 16:39:21.086	\N	\N
cmjhdsfly002i14eaukz1d2hc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:39:21.094	2025-12-22 16:39:21.094	\N	\N
cmjhecvka002j14ea9im11hz3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:55:14.89	2025-12-22 16:55:14.89	\N	\N
cmjhef97e002k14ea19mv9ylv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 16:57:05.883	2025-12-22 16:57:05.883	\N	\N
cmjheu9ag002l14ead8bbg0s6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 17:08:45.833	2025-12-22 17:08:45.833	\N	\N
cmjhf80ul002m14eakz48tkun	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 17:19:28.077	2025-12-22 17:19:28.077	\N	\N
cmjhlnjst002n14eadjgbjzkp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-22 20:19:30.173	2025-12-22 20:19:30.173	\N	\N
cmji5zeqz002o14eabgsnjm1n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 05:48:35.819	2025-12-23 05:48:35.819	\N	\N
cmjifwczz002q14eacu5r5acn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 10:26:09.743	2025-12-23 10:26:09.743	\N	\N
cmjil35oz002r14eapoacr63m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 12:51:24.947	2025-12-23 12:51:24.947	\N	\N
cmjil35rz002s14ea8zduvrv6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 12:51:25.055	2025-12-23 12:51:25.055	\N	\N
cmjil35yl002t14eakpucwzno	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 12:51:25.293	2025-12-23 12:51:25.293	\N	\N
cmjimmtln002u14ea6202zilz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 13:34:42.012	2025-12-23 13:34:42.012	\N	\N
cmjio0g5f002v14eait488bba	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 14:13:17.38	2025-12-23 14:13:17.38	\N	\N
cmjio177h002w14eaw3anzijq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 14:13:52.445	2025-12-23 14:13:52.445	\N	\N
cmjioiopj002x14eavnto3bfy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 14:27:28.28	2025-12-23 14:27:28.28	\N	\N
cmjioxqas002y14eaoahwy9qk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 14:39:10.181	2025-12-23 14:39:10.181	\N	\N
cmjipycu3002z14eab7kqg3n6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 15:07:39.003	2025-12-23 15:07:39.003	\N	\N
cmjiq6slh003014eaz1xyry73	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 15:14:12.677	2025-12-23 15:14:12.677	\N	\N
cmjiricim003114eam7kbcxsf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 15:51:11.327	2025-12-23 15:51:11.327	\N	\N
cmjirr1lx003214ea6cmvni31	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 15:57:57.093	2025-12-23 15:57:57.093	\N	\N
cmjistwdb003314ea0oghokc9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 16:28:09.888	2025-12-23 16:28:09.888	\N	\N
cmjisxzct003414eakm8wnjn4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 16:31:20.381	2025-12-23 16:31:20.381	\N	\N
cmjivxkne003514ea8oqdrw31	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 17:55:00.17	2025-12-23 17:55:00.17	\N	\N
cmjivxlzt003614ea7vblyavk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 17:55:01.913	2025-12-23 17:55:01.913	\N	\N
cmjiw04v9003714eaccqxi1cl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 17:56:59.685	2025-12-23 17:56:59.685	\N	\N
cmjix1407003814eakkcnsf2w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 18:25:44.839	2025-12-23 18:25:44.839	\N	\N
cmjix14rv003914eaw4zpi6mu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 18:25:45.836	2025-12-23 18:25:45.836	\N	\N
cmjix159p003a14eaf4zon2se	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 18:25:46.478	2025-12-23 18:25:46.478	\N	\N
cmjizm14i003b14ea7l98f4kp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 19:38:00.114	2025-12-23 19:38:00.114	\N	\N
cmjj2dvid003c14eajm7uo9au	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 20:55:38.438	2025-12-23 20:55:38.438	\N	\N
cmjj2yqmt003d14ea2meigyzx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 21:11:51.893	2025-12-23 21:11:51.893	\N	\N
cmjj61x5t003e14ealbbktyqm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-23 22:38:19.169	2025-12-23 22:38:19.169	\N	\N
cmjjflm4x003f14eanpno004g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 03:05:34.546	2025-12-24 03:05:34.546	\N	\N
cmjjhkyne003g14eaa2x3fuya	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 04:01:03.338	2025-12-24 04:01:03.338	\N	\N
cmjjjkpk9003h14eatj41xj0g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 04:56:50.794	2025-12-24 04:56:50.794	\N	\N
cmjjjzccj003i14ea6jslgyve	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 05:08:13.507	2025-12-24 05:08:13.507	\N	\N
cmjjkftj8003j14eadk9pro97	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 05:21:02.276	2025-12-24 05:21:02.276	\N	\N
cmjjkmyue003k14ea6v0urzts	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 05:26:35.751	2025-12-24 05:26:35.751	\N	\N
cmjjnow9a003l14ea1o8xpoio	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 06:52:04.558	2025-12-24 06:52:04.558	\N	\N
cmjjpm7s6003m14ead758ti0y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 07:45:58.758	2025-12-24 07:45:58.758	\N	\N
cmjjqh4nm003n14ea0zfuhk1k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 08:10:01.042	2025-12-24 08:10:01.042	\N	\N
cmjjqi26o003o14easbmaibb2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 08:10:44.496	2025-12-24 08:10:44.496	\N	\N
cmjjtim6j003p14eazsddghq1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 09:35:09.26	2025-12-24 09:35:09.26	\N	\N
cmjjw6i4g003q14eau4eeljvd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 10:49:42.976	2025-12-24 10:49:42.976	\N	\N
cmjjwcw71003r14eaghsqnf4t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 10:54:41.15	2025-12-24 10:54:41.15	\N	\N
cmjjygcnj003s14eazuvvlsey	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 11:53:21.68	2025-12-24 11:53:21.68	\N	\N
cmjjzyx3a003t14ea0ux7yrki	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 12:35:47.589	2025-12-24 12:35:47.589	\N	\N
cmjjzyx6n003u14ea0qa9o8zt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 12:35:47.711	2025-12-24 12:35:47.711	\N	\N
cmjk1s3v0003v14eapdrmlkor	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 13:26:29.005	2025-12-24 13:26:29.005	\N	\N
cmjk23juq003w14ea719o5d1b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 13:35:22.947	2025-12-24 13:35:22.947	\N	\N
cmjk46b49003x14ea5pzxa1it	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 14:33:30.825	2025-12-24 14:33:30.825	\N	\N
cmjk5diwh003y14ea57uzx4uj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 15:07:07.121	2025-12-24 15:07:07.121	\N	\N
cmjk5z53l003z14ea0zul0uz5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 15:23:55.666	2025-12-24 15:23:55.666	\N	\N
cmjk64ban004014eaxj8nslbf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 15:27:56.976	2025-12-24 15:27:56.976	\N	\N
cmjk9g89z004114eaqnkgz4ie	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 17:01:11.784	2025-12-24 17:01:11.784	\N	\N
cmjk9hjvz004214eacwkyfb1r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 17:02:13.487	2025-12-24 17:02:13.487	\N	\N
cmjk9w3yq004314eakwo33mx7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 17:13:32.691	2025-12-24 17:13:32.691	\N	\N
cmjka4nyx004414ea3myng2oz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 17:20:11.865	2025-12-24 17:20:11.865	\N	\N
cmjka761l004514eaqzptjoya	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 17:22:08.601	2025-12-24 17:22:08.601	\N	\N
cmjkc1x98004614eaykpnu8qi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:14:03.164	2025-12-24 18:14:03.164	\N	\N
cmjkcykq9004714ea3z3y6tko	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:39:26.577	2025-12-24 18:39:26.577	\N	\N
cmjkd27lp004814eabov6iahp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:42:16.189	2025-12-24 18:42:16.189	\N	\N
cmjkd60vr004a14ea8aqm83qm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:45:14.103	2025-12-24 18:45:14.103	\N	\N
cmjkd60zt004b14ea00k2huvg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:45:14.25	2025-12-24 18:45:14.25	\N	\N
cmjkd68tr004c14eanmixsq27	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 18:45:24.399	2025-12-24 18:45:24.399	\N	\N
cmjkg2f3e004d14eapv5scz3t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 20:06:24.746	2025-12-24 20:06:24.746	\N	\N
cmjkg4qa6004e14eay16h0b3a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 20:08:12.558	2025-12-24 20:08:12.558	\N	\N
cmjkic7jy004f14eaptm1xc2y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 21:10:00.767	2025-12-24 21:10:00.767	\N	\N
cmjkmlpm8004g14eagni4j0gp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-24 23:09:22.544	2025-12-24 23:09:22.544	\N	\N
cmjkt7qlo004h14eax0h5e9vd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 02:14:27.949	2025-12-25 02:14:27.949	\N	\N
cmjkt7ra4004i14easox74lwz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 02:14:28.829	2025-12-25 02:14:28.829	\N	\N
cmjkytosc004j14ean1sjcjlz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 04:51:30.108	2025-12-25 04:51:30.108	\N	\N
cmjkz5iei004k14ea36xwphk8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 05:00:41.707	2025-12-25 05:00:41.707	\N	\N
cmjkzyb96004l14eauck35w1u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 05:23:05.467	2025-12-25 05:23:05.467	\N	\N
cmjl05nc3004m14eag43r9i7j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 05:28:47.715	2025-12-25 05:28:47.715	\N	\N
cmjl0gmae004n14eafybn0uii	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 05:37:19.574	2025-12-25 05:37:19.574	\N	\N
cmjl0q3js004o14eaxsbhaolc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 05:44:41.848	2025-12-25 05:44:41.848	\N	\N
cmjl1bcis004p14ea2kgs68hm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 06:01:13.253	2025-12-25 06:01:13.253	\N	\N
cmjl1go13004q14eafpefu3mx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 06:05:21.447	2025-12-25 06:05:21.447	\N	\N
cmjl2ia3a004r14eajnp1xwlt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 06:34:36.301	2025-12-25 06:34:36.301	\N	\N
cmjl2ijwn004s14ea0fj2selh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 06:34:49.031	2025-12-25 06:34:49.031	\N	\N
cmjl2rx1q004t14eaionjq74z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 06:42:05.966	2025-12-25 06:42:05.966	\N	\N
cmjl69d95004u14eafx0bq9yu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 08:19:38.97	2025-12-25 08:19:38.97	\N	\N
cmjl9dt28004v14eabbksd69i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:47:04.928	2025-12-25 09:47:04.928	\N	\N
cmjl9dt4a004w14eajpm8boaa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:47:05.002	2025-12-25 09:47:05.002	\N	\N
cmjl9dt8d004x14eauu4stn8k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:47:05.15	2025-12-25 09:47:05.15	\N	\N
cmjl9dtcu004y14ead41ddeiw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:47:05.311	2025-12-25 09:47:05.311	\N	\N
cmjl9dtgi004z14ea1wmj90sb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:47:05.442	2025-12-25 09:47:05.442	\N	\N
cmjl9fpu1005014eaav9jcg68	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:48:34.057	2025-12-25 09:48:34.057	\N	\N
cmjl9lyee005114eamarsfpp5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 09:53:25.094	2025-12-25 09:53:25.094	\N	\N
cmjl9ybun005214ea0n8lgle9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 10:03:02.399	2025-12-25 10:03:02.399	\N	\N
cmjla8m6q005314eaocf7dqgt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 10:11:02.354	2025-12-25 10:11:02.354	\N	\N
cmjla8m71005414eaatzyutyf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 10:11:02.366	2025-12-25 10:11:02.366	\N	\N
cmjlam8ad005514eaw1b9gy7z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 10:21:37.526	2025-12-25 10:21:37.526	\N	\N
cmjlbvygn005614ea05o7ffja	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 10:57:10.967	2025-12-25 10:57:10.967	\N	\N
cmjlc0ehi005714eavi36msom	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 11:00:38.358	2025-12-25 11:00:38.358	\N	\N
cmjldc52k005814eaybd6gflk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 11:37:45.644	2025-12-25 11:37:45.644	\N	\N
cmjleq4vp005914eare220yi8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 12:16:38.197	2025-12-25 12:16:38.197	\N	\N
cmjlew8c3005a14eapulzvp2a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 12:21:22.611	2025-12-25 12:21:22.611	\N	\N
cmjlfpvjb005b14eauvlvjlwz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 12:44:25.703	2025-12-25 12:44:25.703	\N	\N
cmjlgye31005c14eag8protjk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 13:19:02.606	2025-12-25 13:19:02.606	\N	\N
cmjlh2t2v005d14ea0ce8aahc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 13:22:28.664	2025-12-25 13:22:28.664	\N	\N
cmjlhixai005e14ea8tecrcrb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 13:35:00.618	2025-12-25 13:35:00.618	\N	\N
cmjlikyzm005f14eald3azb8i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 14:04:35.747	2025-12-25 14:04:35.747	\N	\N
cmjlj153f005g14eaqfr4wnjw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 14:17:10.156	2025-12-25 14:17:10.156	\N	\N
cmjlj5mg7005h14ea48394fxy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 14:20:39.272	2025-12-25 14:20:39.272	\N	\N
cmjlkfejj005i14eacjka5hz2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 14:56:15.199	2025-12-25 14:56:15.199	\N	\N
cmjlkn63b005j14eaepli2aim	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:02:17.496	2025-12-25 15:02:17.496	\N	\N
cmjlkn66k005k14ea6scokidf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:02:17.612	2025-12-25 15:02:17.612	\N	\N
cmjlkn6f1005l14ear3qt9yng	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:02:17.918	2025-12-25 15:02:17.918	\N	\N
cmjllu7n5005m14eafdrgum5w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:35:45.713	2025-12-25 15:35:45.713	\N	\N
cmjllxw1e005n14eap1wic89w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:38:37.298	2025-12-25 15:38:37.298	\N	\N
cmjlme1vd005o14ea21lstvsn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:51:11.353	2025-12-25 15:51:11.353	\N	\N
cmjlme2ld005p14ea6915vzct	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:51:12.29	2025-12-25 15:51:12.29	\N	\N
cmjlmnrur005q14eaw6a8lcqd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:58:44.932	2025-12-25 15:58:44.932	\N	\N
cmjlmnrvy005r14ea2ovkw8qj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 15:58:44.974	2025-12-25 15:58:44.974	\N	\N
cmjlmxv2v005s14ea1zz5hq8p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:06:35.672	2025-12-25 16:06:35.672	\N	\N
cmjlnkqrc005t14eaj2fme7ie	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:24:23.16	2025-12-25 16:24:23.16	\N	\N
cmjlnkr33005u14eaglmnfnn2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:24:23.583	2025-12-25 16:24:23.583	\N	\N
cmjlny616005v14ea1b384ofw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:34:49.483	2025-12-25 16:34:49.483	\N	\N
cmjlo5h79005w14eacxnxapup	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:40:30.549	2025-12-25 16:40:30.549	\N	\N
cmjlotzb6005x14eauz1iq1jr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 16:59:33.762	2025-12-25 16:59:33.762	\N	\N
cmjloyrdx005y14ea4p2rs262	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 17:03:16.773	2025-12-25 17:03:16.773	\N	\N
cmjlp5eop005z14eapszasakg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 17:08:26.905	2025-12-25 17:08:26.905	\N	\N
cmjlp5f0m006014eapl0rbsp1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 17:08:27.335	2025-12-25 17:08:27.335	\N	\N
cmjltn01m006114eab61055pg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 19:14:06.203	2025-12-25 19:14:06.203	\N	\N
cmjlubodv006214eafd3dw22h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 19:33:17.492	2025-12-25 19:33:17.492	\N	\N
cmjlvx4fb006314eax827z2i5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 20:17:57.671	2025-12-25 20:17:57.671	\N	\N
cmjlw0a48006414ea2f1401kr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 20:20:25.016	2025-12-25 20:20:25.016	\N	\N
cmjlw1aul006514eaereh0q25	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-25 20:21:12.621	2025-12-25 20:21:12.621	\N	\N
cmjmc0ji3006614eagj502hbq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 03:48:31.035	2025-12-26 03:48:31.035	\N	\N
cmjmeo87k006714ead2g3ssmx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 05:02:55.376	2025-12-26 05:02:55.376	\N	\N
cmjmlst06006814eabxuvimeq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 08:22:26.262	2025-12-26 08:22:26.262	\N	\N
cmjmlstrt006914ea8ok9xzn0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 08:22:27.258	2025-12-26 08:22:27.258	\N	\N
cmjmlw2wg006a14ea4yi5di0j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 08:24:59.057	2025-12-26 08:24:59.057	\N	\N
cmjmlw39v006b14earsmwk4uj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 08:24:59.54	2025-12-26 08:24:59.54	\N	\N
cmjmmzb4x006c14eaw88faqu8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 08:55:29.314	2025-12-26 08:55:29.314	\N	\N
cmjmpy545006d14eah1d30bis	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 10:18:33.702	2025-12-26 10:18:33.702	\N	\N
cmjmtdxc1006e14eagc750kfm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 11:54:48.962	2025-12-26 11:54:48.962	\N	\N
cmjmwvt0k006f14easy4l64ww	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 13:32:42.02	2025-12-26 13:32:42.02	\N	\N
cmjn08fce006g14eamygocayk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 15:06:29.679	2025-12-26 15:06:29.679	\N	\N
cmjn1e9g7006h14eaplz0d1bt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 15:39:01.592	2025-12-26 15:39:01.592	\N	\N
cmjn1t5sb006i14easy4odnp2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 15:50:36.683	2025-12-26 15:50:36.683	\N	\N
cmjn3223x006j14eaxpo7c8up	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:25:31.437	2025-12-26 16:25:31.437	\N	\N
cmjn3z6s4006k14ealzgjvcvs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:51:17.14	2025-12-26 16:51:17.14	\N	\N
cmjn3z8lk006l14ea58uvb62p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:51:19.496	2025-12-26 16:51:19.496	\N	\N
cmjn3z989006m14eag55lv4rb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:51:20.314	2025-12-26 16:51:20.314	\N	\N
cmjn3zb1n006n14ea55bdj11b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:51:22.668	2025-12-26 16:51:22.668	\N	\N
cmjn3zbfs006o14eadndh7ml9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:51:23.176	2025-12-26 16:51:23.176	\N	\N
cmjn43z15006p14eas543gtji	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 16:55:00.378	2025-12-26 16:55:00.378	\N	\N
cmjn9jz2c006q14eak1fd1ubc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 19:27:24.996	2025-12-26 19:27:24.996	\N	\N
cmjnakuns006r14eajbh7sxba	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 19:56:05.559	2025-12-26 19:56:05.559	\N	\N
cmjndf43o006s14ea2cpkoxig	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 21:15:36.709	2025-12-26 21:15:36.709	\N	\N
cmjngaion006t14ea5tu7g3cx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-26 22:36:01.176	2025-12-26 22:36:01.176	\N	\N
cmjnkd1lz006u14ea94ya7hr8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 00:29:57.479	2025-12-27 00:29:57.479	\N	\N
cmjnkd27g006v14eaausfjhhi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 00:29:58.252	2025-12-27 00:29:58.252	\N	\N
cmjnketz7006w14eacbszs90s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 00:31:20.899	2025-12-27 00:31:20.899	\N	\N
cmjnr2rwi006x14eavf4l4i58	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 03:37:55.651	2025-12-27 03:37:55.651	\N	\N
cmjns2y5c006y14ea5se7ahzy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 04:06:03.36	2025-12-27 04:06:03.36	\N	\N
cmjnscjk6006z14ea71z5m6qm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 04:13:31.015	2025-12-27 04:13:31.015	\N	\N
cmjnui3vt007014eaybmv1jt7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 05:13:49.865	2025-12-27 05:13:49.865	\N	\N
cmjnur4ob007114ea3vkbl74d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 05:20:50.795	2025-12-27 05:20:50.795	\N	\N
cmjnvd3iv007214easyislfyx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 05:37:55.735	2025-12-27 05:37:55.735	\N	\N
cmjnveu3z007314eaf208dds7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 05:39:16.848	2025-12-27 05:39:16.848	\N	\N
cmjnveubn007414eazu8wuuhc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 05:39:17.124	2025-12-27 05:39:17.124	\N	\N
cmjnwme9r007514eajkkn5429	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 06:13:09.184	2025-12-27 06:13:09.184	\N	\N
cmjnwz0q3007614ea67o0hhpv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 06:22:58.155	2025-12-27 06:22:58.155	\N	\N
cmjnxfbaq007714ea3ndj7m4n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 06:35:38.354	2025-12-27 06:35:38.354	\N	\N
cmjo0n8m0007814eavfijdmjr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 08:05:46.969	2025-12-27 08:05:46.969	\N	\N
cmjo0ovzu007914eail8xpq5s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 08:07:03.931	2025-12-27 08:07:03.931	\N	\N
cmjo0ow22007a14eapmw9ae2p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 08:07:04.011	2025-12-27 08:07:04.011	\N	\N
cmjo0tv28007b14eaxs215h1x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 08:10:56	2025-12-27 08:10:56	\N	\N
cmjo4oo43007c14eanbpg6f34	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 09:58:52.179	2025-12-27 09:58:52.179	\N	\N
cmjo66crp007d14eafhlwb5le	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 10:40:36.891	2025-12-27 10:40:36.891	\N	\N
cmjo66d5o007e14eanmfls8zb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 10:40:37.405	2025-12-27 10:40:37.405	\N	\N
cmjo8vtf5007f14ea3njivup3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 11:56:24.113	2025-12-27 11:56:24.113	\N	\N
cmjoaeezw007g14eat1vi2skc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 12:38:51.5	2025-12-27 12:38:51.5	\N	\N
cmjobkn9w007h14eaa5q8adgb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 13:11:41.78	2025-12-27 13:11:41.78	\N	\N
cmjodbom4007i14earo20sy8w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:00:42.845	2025-12-27 14:00:42.845	\N	\N
cmjodcks8007j14eaqcezna84	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:01:24.536	2025-12-27 14:01:24.536	\N	\N
cmjodctzg007k14eae8lk4ve3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:01:36.46	2025-12-27 14:01:36.46	\N	\N
cmjodoygx007l14ea36zi7271	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:11:02.146	2025-12-27 14:11:02.146	\N	\N
cmjoeh2ss007m14eaghzqyz6y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:32:54.124	2025-12-27 14:32:54.124	\N	\N
cmjoexsui007n14eacp38ny6m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 14:45:54.378	2025-12-27 14:45:54.378	\N	\N
cmjofhcem007o14eaxjongnsq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 15:01:06.19	2025-12-27 15:01:06.19	\N	\N
cmjog8rvd007p14eap43goqji	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 15:22:25.946	2025-12-27 15:22:25.946	\N	\N
cmjojnj81007q14ean2iu3yx2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 16:57:53.425	2025-12-27 16:57:53.425	\N	\N
cmjol847w007r14eafapy3e2t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 17:41:53.372	2025-12-27 17:41:53.372	\N	\N
cmjom3jeh007s14eamf5vd20b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:06:19.385	2025-12-27 18:06:19.385	\N	\N
cmjontzdf007t14eau8snux91	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:54:52.756	2025-12-27 18:54:52.756	\N	\N
cmjonu1hv007u14eadxh07yai	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:54:55.507	2025-12-27 18:54:55.507	\N	\N
cmjonu57y007v14eaqzqnzdzn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:55:00.335	2025-12-27 18:55:00.335	\N	\N
cmjonu6fd007w14eay2tpvgrm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:55:01.897	2025-12-27 18:55:01.897	\N	\N
cmjonu6il007x14eat910i06l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:55:02.013	2025-12-27 18:55:02.013	\N	\N
cmjonu6vp007y14ea4tuv8j1c	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 18:55:02.486	2025-12-27 18:55:02.486	\N	\N
cmjosz1y4007z14eaairmawd8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-27 21:18:47.453	2025-12-27 21:18:47.453	\N	\N
cmjp1hcgi008014eaiuqfiypw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 01:16:57.81	2025-12-28 01:16:57.81	\N	\N
cmjp1jb9u008114eaatae2qgk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 01:18:29.586	2025-12-28 01:18:29.586	\N	\N
cmjp4w300008214eazv322wzo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 02:52:24.24	2025-12-28 02:52:24.24	\N	\N
cmjp5aegu008314eauzyjsez7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 03:03:32.286	2025-12-28 03:03:32.286	\N	\N
cmjp5l9qh008414eamcz4d3gg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 03:11:59.369	2025-12-28 03:11:59.369	\N	\N
cmjp670rc008514eak5fnou7l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 03:28:54.168	2025-12-28 03:28:54.168	\N	\N
cmjp6715a008614eaz5nmvmo8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 03:28:54.67	2025-12-28 03:28:54.67	\N	\N
cmjp69thb008714eas9dgv693	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 03:31:04.703	2025-12-28 03:31:04.703	\N	\N
cmjp7hsmx008814eaf10e1ybq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 04:05:16.473	2025-12-28 04:05:16.473	\N	\N
cmjp8t0wq008914eas7cnrzyd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 04:42:00.026	2025-12-28 04:42:00.026	\N	\N
cmjp8u6vs008a14ealsnc349q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 04:42:54.424	2025-12-28 04:42:54.424	\N	\N
cmjp9uje9008b14eaw3afaop9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 05:11:10.258	2025-12-28 05:11:10.258	\N	\N
cmjp9ujgq008c14eaw3azm1us	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 05:11:10.347	2025-12-28 05:11:10.347	\N	\N
cmjp9ujt0008d14ea0inila60	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 05:11:10.789	2025-12-28 05:11:10.789	\N	\N
cmjp9ujv8008e14ea5fjxhd4y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 05:11:10.868	2025-12-28 05:11:10.868	\N	\N
cmjp9z4f6008f14eaywrk7hpk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 05:14:44.118	2025-12-28 05:14:44.118	\N	\N
cmjpd111i008g14eac2h9f1sc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 06:40:11.911	2025-12-28 06:40:11.911	\N	\N
cmjpdaall008h14eawr9nlrmt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 06:47:24.202	2025-12-28 06:47:24.202	\N	\N
cmjpddgso008i14ea4kx2ba4j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 06:49:52.2	2025-12-28 06:49:52.2	\N	\N
cmjpdipqx008j14eajlckiu9b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 06:53:57.081	2025-12-28 06:53:57.081	\N	\N
cmjpdzzix008k14eadj1hxkdu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 07:07:22.906	2025-12-28 07:07:22.906	\N	\N
cmjpek35j008l14eaewadu9ue	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 07:23:00.727	2025-12-28 07:23:00.727	\N	\N
cmjpf6lgk008m14eaiskj3zgg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 07:40:30.884	2025-12-28 07:40:30.884	\N	\N
cmjpfq12b008n14earxmchv1t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 07:55:37.562	2025-12-28 07:55:37.562	\N	\N
cmjphrvsb008o14ea6buusdrf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 08:53:03.275	2025-12-28 08:53:03.275	\N	\N
cmjphs0ez008p14ea59046n21	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 08:53:09.275	2025-12-28 08:53:09.275	\N	\N
cmjpiegc2008q14eaeuhzeh90	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:10:36.338	2025-12-28 09:10:36.338	\N	\N
cmjpj6d9p008r14eavtuya9o8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:32:18.734	2025-12-28 09:32:18.734	\N	\N
cmjpj6qhs008s14eazogiicdu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:32:35.872	2025-12-28 09:32:35.872	\N	\N
cmjpj9r0x008t14eaqlbm2cfk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.53	2025-12-28 09:34:56.53	\N	\N
cmjpj9r37008u14eaecmb362c	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.612	2025-12-28 09:34:56.612	\N	\N
cmjpj9r4b008v14eada5ia2dd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.651	2025-12-28 09:34:56.651	\N	\N
cmjpj9r4l008w14eawcujcgiy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.661	2025-12-28 09:34:56.661	\N	\N
cmjpj9r6j008x14eaodws90vu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.732	2025-12-28 09:34:56.732	\N	\N
cmjpj9raq008y14ea6uqasoaq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.882	2025-12-28 09:34:56.882	\N	\N
cmjpj9rd7008z14eak5yc868h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:56.972	2025-12-28 09:34:56.972	\N	\N
cmjpj9rhw009014easzsvp8fh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 09:34:57.14	2025-12-28 09:34:57.14	\N	\N
cmjpkwlh1009114eabb946fc1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 10:20:42.038	2025-12-28 10:20:42.038	\N	\N
cmjpkx80r009214ea71f66fcj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 10:21:11.26	2025-12-28 10:21:11.26	\N	\N
cmjpkxdmy009314eaur9fqy0b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 10:21:18.539	2025-12-28 10:21:18.539	\N	\N
cmjpm5v79009414ea427lwy3q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 10:55:54.166	2025-12-28 10:55:54.166	\N	\N
cmjppfgex009514eaem28w9in	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.41	2025-12-28 12:27:20.41	\N	\N
cmjppfgfp009614eazz8f0nvp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.438	2025-12-28 12:27:20.438	\N	\N
cmjppfgfq009714eavzss6eve	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.438	2025-12-28 12:27:20.438	\N	\N
cmjppfggt009814ea6mwnmaeu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.477	2025-12-28 12:27:20.477	\N	\N
cmjppfghv009914eac4fl6czd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.515	2025-12-28 12:27:20.515	\N	\N
cmjppfgi0009a14ea8o2o1p4k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.52	2025-12-28 12:27:20.52	\N	\N
cmjppfgi0009b14ea9c87kzkb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.521	2025-12-28 12:27:20.521	\N	\N
cmjppfgi0009c14eah6c0ns3r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.521	2025-12-28 12:27:20.521	\N	\N
cmjppfgj1009d14eakxc0h4qx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.558	2025-12-28 12:27:20.558	\N	\N
cmjppfgji009e14ea2520cmfo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.575	2025-12-28 12:27:20.575	\N	\N
cmjppfgno009f14ea2f3deif2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.725	2025-12-28 12:27:20.725	\N	\N
cmjppfgnq009g14ea15w9vs62	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.727	2025-12-28 12:27:20.727	\N	\N
cmjppfgqg009h14eambp6nj6t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.824	2025-12-28 12:27:20.824	\N	\N
cmjppfgra009i14eagkeewp33	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.855	2025-12-28 12:27:20.855	\N	\N
cmjppfguu009j14ea53ufsx0b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:20.982	2025-12-28 12:27:20.982	\N	\N
cmjppfgxk009k14eaoacsp9au	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 12:27:21.08	2025-12-28 12:27:21.08	\N	\N
cmjpqmgmx009l14ea70cjs2lt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 13:00:46.905	2025-12-28 13:00:46.905	\N	\N
cmjpqmgn6009m14eanqvdlts9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 13:00:46.914	2025-12-28 13:00:46.914	\N	\N
cmjpsbkob009n14eayuax4zig	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 13:48:18.156	2025-12-28 13:48:18.156	\N	\N
cmjpsbljk009o14eaw6omlu1z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 13:48:19.281	2025-12-28 13:48:19.281	\N	\N
cmjpt3ztb009p14eaf2tmxyo8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:24.143	2025-12-28 14:10:24.143	\N	\N
cmjpt3zw2009q14eaf5e09doi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:24.242	2025-12-28 14:10:24.242	\N	\N
cmjpt403e009r14eal2446d3m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:24.507	2025-12-28 14:10:24.507	\N	\N
cmjpt409u009s14eacu1wltai	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:24.738	2025-12-28 14:10:24.738	\N	\N
cmjpt40cg009t14eaeob0sc2u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:24.832	2025-12-28 14:10:24.832	\N	\N
cmjpt40h6009u14ead7iu7skc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.002	2025-12-28 14:10:25.002	\N	\N
cmjpt40jj009v14eaavz61fds	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.088	2025-12-28 14:10:25.088	\N	\N
cmjpt40lv009w14ea9yf1ntlf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.172	2025-12-28 14:10:25.172	\N	\N
cmjpt40np009x14eat106o18a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.237	2025-12-28 14:10:25.237	\N	\N
cmjpt40pr009y14ea17aq10uw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.312	2025-12-28 14:10:25.312	\N	\N
cmjpt40xu009z14eat2fsgqoa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.602	2025-12-28 14:10:25.602	\N	\N
cmjpt40y800a014eae0y9sl6h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:10:25.616	2025-12-28 14:10:25.616	\N	\N
cmjptkznu00a114eaypkgu7en	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:23:37.098	2025-12-28 14:23:37.098	\N	\N
cmjptkzyn00a214ea57ev4n3z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:23:37.488	2025-12-28 14:23:37.488	\N	\N
cmjptl00v00a314eahg33evrs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:23:37.567	2025-12-28 14:23:37.567	\N	\N
cmjptl04h00a414easrf4eq2x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:23:37.697	2025-12-28 14:23:37.697	\N	\N
cmjptx4vz00a514eazz7o9dck	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:33:03.744	2025-12-28 14:33:03.744	\N	\N
cmjpu25ou00a614ea9xfzzspa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:36:58.063	2025-12-28 14:36:58.063	\N	\N
cmjpu265700a714ea2nyp1wm6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 14:36:58.651	2025-12-28 14:36:58.651	\N	\N
cmjpxh4cm00a814eatnj5h8p3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 16:12:35.015	2025-12-28 16:12:35.015	\N	\N
cmjpy7vob00a914eanacxqsgd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 16:33:23.483	2025-12-28 16:33:23.483	\N	\N
cmjq0wynq00aa14eaakzc91rx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 17:48:52.982	2025-12-28 17:48:52.982	\N	\N
cmjq1suwy00ab14ea1rq5m581	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 18:13:41.122	2025-12-28 18:13:41.122	\N	\N
cmjqakfbn00ac14ea3qjkn7da	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-28 22:19:04.211	2025-12-28 22:19:04.211	\N	\N
cmjqgumg700ad14eavxdlhnbs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 01:14:57.704	2025-12-29 01:14:57.704	\N	\N
cmjqm6uwc00ae14eaannqfuun	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 03:44:26.604	2025-12-29 03:44:26.604	\N	\N
cmjqm853400af14eac9y8hmgq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 03:45:26.464	2025-12-29 03:45:26.464	\N	\N
cmjqo7kok00ag14ea1pek0acc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 04:40:59.253	2025-12-29 04:40:59.253	\N	\N
cmjqo7kp800ah14eapnc22g0o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 04:40:59.277	2025-12-29 04:40:59.277	\N	\N
cmjqo7l1m00ai14eaoe65rvyf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 04:40:59.722	2025-12-29 04:40:59.722	\N	\N
cmjqoikh500aj14eai91erjs4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 04:49:32.201	2025-12-29 04:49:32.201	\N	\N
cmjqov4r900ak14ea7kuf69f3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 04:59:18.357	2025-12-29 04:59:18.357	\N	\N
cmjqr8yz500al14eawk0rnyli	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 06:06:03.281	2025-12-29 06:06:03.281	\N	\N
cmjqz96bm00am14ea0s3frj4f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:50:09.73	2025-12-29 09:50:09.73	\N	\N
cmjqzdipt00an14easvmc7rix	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.417	2025-12-29 09:53:32.417	\N	\N
cmjqzdiqc00ao14ea3izn5obe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.437	2025-12-29 09:53:32.437	\N	\N
cmjqzdiqh00ap14eavqy539k5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.442	2025-12-29 09:53:32.442	\N	\N
cmjqzdiqz00aq14eaajruhglb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.459	2025-12-29 09:53:32.459	\N	\N
cmjqzdir000ar14ea61u6xb3z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.46	2025-12-29 09:53:32.46	\N	\N
cmjqzdirn00as14eabswkf5qu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.483	2025-12-29 09:53:32.483	\N	\N
cmjqzdiru00at14ea30p7tgh1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.49	2025-12-29 09:53:32.49	\N	\N
cmjqzdis800au14ea99to72rg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.505	2025-12-29 09:53:32.505	\N	\N
cmjqzdis900av14ea96z219d7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.505	2025-12-29 09:53:32.505	\N	\N
cmjqzdit400aw14eaw8qu06lc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.537	2025-12-29 09:53:32.537	\N	\N
cmjqzdiwq00ax14eas77br7ei	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:53:32.666	2025-12-29 09:53:32.666	\N	\N
cmjqzel5800ay14eaqbem8zuc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 09:54:22.221	2025-12-29 09:54:22.221	\N	\N
cmjr27be600az14ead47za663	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 11:12:41.838	2025-12-29 11:12:41.838	\N	\N
cmjr2cy8w00b014eaawp2ugvx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 11:17:04.736	2025-12-29 11:17:04.736	\N	\N
cmjr2cya700b114eamds8e899	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 11:17:04.783	2025-12-29 11:17:04.783	\N	\N
cmjr2cza000b214eao452qc8w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 11:17:06.073	2025-12-29 11:17:06.073	\N	\N
cmjr2kqte00b314eabs1yi4c1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 11:23:08.354	2025-12-29 11:23:08.354	\N	\N
cmjr4ji8000b414ea6ecc8g3p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 12:18:09.793	2025-12-29 12:18:09.793	\N	\N
cmjr79hod00b514ea1acl0om0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:34:21.373	2025-12-29 13:34:21.373	\N	\N
cmjr79hod00b614eawq351clf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:34:21.374	2025-12-29 13:34:21.374	\N	\N
cmjr7tbp400b714eagy3jnfq4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:46.744	2025-12-29 13:49:46.744	\N	\N
cmjr7tbqa00b814eaf52el6r8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:46.787	2025-12-29 13:49:46.787	\N	\N
cmjr7tdlw00b914ea7bw6zi60	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:49.22	2025-12-29 13:49:49.22	\N	\N
cmjr7tdwr00ba14eaqbhhg1tb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:49.612	2025-12-29 13:49:49.612	\N	\N
cmjr7te8s00bb14ea3ivv8myy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:50.045	2025-12-29 13:49:50.045	\N	\N
cmjr7tgek00bc14eansfaq6vp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:49:52.844	2025-12-29 13:49:52.844	\N	\N
cmjr7vnuw00bd14ea582g39ql	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:51:35.817	2025-12-29 13:51:35.817	\N	\N
cmjr84p1z00be14eabtbd3u7t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:58:37.271	2025-12-29 13:58:37.271	\N	\N
cmjr84pwh00bf14ea25pk6bj5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-29 13:58:38.37	2025-12-29 13:58:38.37	\N	\N
cmjs5i4u300bg14ea3dlr1d1y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 05:32:51.58	2025-12-30 05:32:51.58	\N	\N
cmjs707up00bh14eauzluvdq7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 06:14:54.913	2025-12-30 06:14:54.913	\N	\N
cmjs708cg00bi14ealj4vu1xr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 06:14:55.553	2025-12-30 06:14:55.553	\N	\N
cmjs7zzp000bj14eau6240rf4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 06:42:43.956	2025-12-30 06:42:43.956	\N	\N
cmjs9e2rp00bk14eaafaqa3p2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 07:21:40.731	2025-12-30 07:21:40.731	\N	\N
cmjsa5zp900bl14eabd7e7zyf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 07:43:23.133	2025-12-30 07:43:23.133	\N	\N
cmjsa5zps00bm14eaidkpgnf4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 07:43:23.152	2025-12-30 07:43:23.152	\N	\N
cmjseppzo00bn14eagw9aj8wy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 09:50:42.132	2025-12-30 09:50:42.132	\N	\N
cmjsgye4e00bo14eaufx0rcbm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 10:53:25.887	2025-12-30 10:53:25.887	\N	\N
cmjsjsnbr00bp14eas9a5vs4z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 12:12:56.728	2025-12-30 12:12:56.728	\N	\N
cmjspp8h500bq14ea4xyws9vz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 14:58:15.209	2025-12-30 14:58:15.209	\N	\N
cmjspp8p700br14eaf65id3yn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-30 14:58:15.499	2025-12-30 14:58:15.499	\N	\N
cmjtivxaj00bs14easypbynwr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 04:35:16.171	2025-12-31 04:35:16.171	\N	\N
cmjtkagbg00bt14ea0tbhfob0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 05:14:33.628	2025-12-31 05:14:33.628	\N	\N
cmjtkyuhe00bu14ea3xb8cc13	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 05:33:31.73	2025-12-31 05:33:31.73	\N	\N
cmjtm8ikd00bv14eaydjsycy1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 06:09:02.461	2025-12-31 06:09:02.461	\N	\N
cmjtspyme00bw14ea1ninm6nq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 09:10:34.118	2025-12-31 09:10:34.118	\N	\N
cmjtspz5z00bx14eatrbeu4qi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 09:10:34.823	2025-12-31 09:10:34.823	\N	\N
cmjttsiv200by14eac02wvjso	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 09:40:33.278	2025-12-31 09:40:33.278	\N	\N
cmjttsiwl00bz14eaaq3js7kp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 09:40:33.333	2025-12-31 09:40:33.333	\N	\N
cmjtxjfeu00c014eakttlrfr4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 11:25:27.367	2025-12-31 11:25:27.367	\N	\N
cmjtxjfh200c114ea1zmc7eju	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 11:25:27.446	2025-12-31 11:25:27.446	\N	\N
cmjtz4o9n00c214eapihks4vo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 12:09:58.236	2025-12-31 12:09:58.236	\N	\N
cmju0cc4n00c314ea2vl8vpmn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 12:43:55.367	2025-12-31 12:43:55.367	\N	\N
cmju0ccnl00c414eahzodpa4a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 12:43:56.049	2025-12-31 12:43:56.049	\N	\N
cmju1tcni00c514ea9mfz7d5m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 13:25:08.815	2025-12-31 13:25:08.815	\N	\N
cmju2br2v00c614eazqxy0ie4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 13:39:27.319	2025-12-31 13:39:27.319	\N	\N
cmju45y5400c714eaw7gw0cha	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 14:30:55.768	2025-12-31 14:30:55.768	\N	\N
cmju465uj00c814eavwcrpiia	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 14:31:05.755	2025-12-31 14:31:05.755	\N	\N
cmju4ghgv00c914ear7rg9ain	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 14:39:07.376	2025-12-31 14:39:07.376	\N	\N
cmju4ghhd00ca14eatql7noiv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 14:39:07.394	2025-12-31 14:39:07.394	\N	\N
cmju6ocdb00cb14eambbt2y7x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 15:41:13.247	2025-12-31 15:41:13.247	\N	\N
cmju6ocm700cc14eaa37kn20j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 15:41:13.568	2025-12-31 15:41:13.568	\N	\N
cmju6okzl00cd14ea3v4pxmng	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 15:41:24.417	2025-12-31 15:41:24.417	\N	\N
cmju855ps00ce14eadt2hpnun	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 16:22:17.393	2025-12-31 16:22:17.393	\N	\N
cmjuc2a2r00cf14eaky9qnqru	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 18:12:01.539	2025-12-31 18:12:01.539	\N	\N
cmjuhiabk00cg14eanmxja6oi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 20:44:26.432	2025-12-31 20:44:26.432	\N	\N
cmjujka5700ch14ealnnn9xy6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2025-12-31 21:41:58.747	2025-12-31 21:41:58.747	\N	\N
cmjuyjcej00ci14ea11vx9glr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 04:41:09.259	2026-01-01 04:41:09.259	\N	\N
cmjuyjcoi00cj14ea71sayw63	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 04:41:09.618	2026-01-01 04:41:09.618	\N	\N
cmjv31wsr00ck14eaxro0xw1t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 06:47:33.964	2026-01-01 06:47:33.964	\N	\N
cmjv5fhqn00cl14ea4ks8huap	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 07:54:06.863	2026-01-01 07:54:06.863	\N	\N
cmjv8ms4q00cm14earanv9deg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 09:23:45.77	2026-01-01 09:23:45.77	\N	\N
cmjv93uf100cn14ead4reviga	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 09:37:01.885	2026-01-01 09:37:01.885	\N	\N
cmjva999e00co14eaa0kztft2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 10:09:14.019	2026-01-01 10:09:14.019	\N	\N
cmjvcfdd800cp14ea4mpuqqwc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 11:09:58.497	2026-01-01 11:09:58.497	\N	\N
cmjvd9pma00cq14eaxe93j5o8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 11:33:34.066	2026-01-01 11:33:34.066	\N	\N
cmjvdf94t00cr14eatzpkkvg3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 11:37:52.638	2026-01-01 11:37:52.638	\N	\N
cmjve1z8d00cs14eaxqgiuehj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 11:55:32.894	2026-01-01 11:55:32.894	\N	\N
cmjvgkmk400ct14eapaf38u9d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 13:06:02.164	2026-01-01 13:06:02.164	\N	\N
cmjvmczkf00cu14earrcxcd61	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 15:48:03.471	2026-01-01 15:48:03.471	\N	\N
cmjvn2ndi00cv14eapaknix70	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 16:08:00.726	2026-01-01 16:08:00.726	\N	\N
cmjvo8a3h00cw14eadrvdrk71	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 16:40:23.069	2026-01-01 16:40:23.069	\N	\N
cmjvq116h00cx14eagvdezm04	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 17:30:44.153	2026-01-01 17:30:44.153	\N	\N
cmjvrn4dx00cy14eaz4c2bgsg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 18:15:54.357	2026-01-01 18:15:54.357	\N	\N
cmjvrn4es00cz14ea7mfgtaow	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 18:15:54.388	2026-01-01 18:15:54.388	\N	\N
cmjvrna2g00d014eaq1mt3aw5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 18:16:01.72	2026-01-01 18:16:01.72	\N	\N
cmjvs7vm600d114eauitn3a6m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 18:32:02.766	2026-01-01 18:32:02.766	\N	\N
cmjvsqxte00d214ea5m9ea9sx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-01 18:46:52.082	2026-01-01 18:46:52.082	\N	\N
cmjwaj0gk00d314ea22qpyiiu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 03:04:35.348	2026-01-02 03:04:35.348	\N	\N
cmjwfw7u100d414eabqzzd8mj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 05:34:49.513	2026-01-02 05:34:49.513	\N	\N
cmjwgo4ta00d514eae24b2ttw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 05:56:31.967	2026-01-02 05:56:31.967	\N	\N
cmjwiciqm00d614eay4pxhb3r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 06:43:29.374	2026-01-02 06:43:29.374	\N	\N
cmjwicj1500d714eannhpg5as	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 06:43:29.753	2026-01-02 06:43:29.753	\N	\N
cmjwkqklt00d814ea1myuc8zl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 07:50:24.209	2026-01-02 07:50:24.209	\N	\N
cmjwlxn8m00d914eacfurzwpk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:53.83	2026-01-02 08:23:53.83	\N	\N
cmjwlxnfk00da14eafyvv4btq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:54.08	2026-01-02 08:23:54.08	\N	\N
cmjwlxng500db14eanhrh7cnp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:54.102	2026-01-02 08:23:54.102	\N	\N
cmjwlxng600dc14ea0j9aqe1v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:54.102	2026-01-02 08:23:54.102	\N	\N
cmjwlxnkx00dd14easqfbbolf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:54.273	2026-01-02 08:23:54.273	\N	\N
cmjwlxnmy00de14eabyvrcr6g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:23:54.347	2026-01-02 08:23:54.347	\N	\N
cmjwn81c200df14ea8jpvyaw1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 08:59:58.275	2026-01-02 08:59:58.275	\N	\N
cmjwua3zp00dg14eaig7zlt27	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 12:17:32.341	2026-01-02 12:17:32.341	\N	\N
cmjwua45f00dh14eabo1yat3j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 12:17:32.547	2026-01-02 12:17:32.547	\N	\N
cmjwwpms000di14eaokhdbkfq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 13:25:35.761	2026-01-02 13:25:35.761	\N	\N
cmjwwpn2i00dj14eazzlmg3w8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 13:25:36.138	2026-01-02 13:25:36.138	\N	\N
cmjwx1zh600dk14eazc5xdhbj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 13:35:12.091	2026-01-02 13:35:12.091	\N	\N
cmjwx1zks00dl14eath7t4p7j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 13:35:12.221	2026-01-02 13:35:12.221	\N	\N
cmjwzie5p00dm14eaenq6ilyj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 14:43:56.845	2026-01-02 14:43:56.845	\N	\N
cmjwziedh00dn14earsculjf4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 14:43:57.125	2026-01-02 14:43:57.125	\N	\N
cmjwzzcjt00do14eaetp9g1oy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 14:57:07.913	2026-01-02 14:57:07.913	\N	\N
cmjx6fuhq00dp14eaoscg0o6v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 17:57:55.358	2026-01-02 17:57:55.358	\N	\N
cmjx77a5800dq14ea5j5zjn5v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 18:19:15.356	2026-01-02 18:19:15.356	\N	\N
cmjx77abk00dr14eaqmefvvqo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 18:19:15.584	2026-01-02 18:19:15.584	\N	\N
cmjx7bz3i00ds14ea89we8s3v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 18:22:54.318	2026-01-02 18:22:54.318	\N	\N
cmjx8yjdn00dt14eab921htum	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-02 19:08:26.651	2026-01-02 19:08:26.651	\N	\N
cmjxohgk300du14eai8m11zzp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 02:23:03.699	2026-01-03 02:23:03.699	\N	\N
cmjxol9h100dv14eawojup7pz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 02:26:01.141	2026-01-03 02:26:01.141	\N	\N
cmjxous9a00dw14eagjpbv0jg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 02:33:25.39	2026-01-03 02:33:25.39	\N	\N
cmjxru4sf00dx14eam308y0nb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 03:56:53.823	2026-01-03 03:56:53.823	\N	\N
cmjxusrdl00dy14eadehojzk6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 05:19:48.634	2026-01-03 05:19:48.634	\N	\N
cmjxv6mwq00dz14ea78lj43y3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 05:30:36.026	2026-01-03 05:30:36.026	\N	\N
cmjxvhhuf00e014earcw2o8er	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 05:39:02.679	2026-01-03 05:39:02.679	\N	\N
cmjy2uty500e114eak218fekc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 09:05:22.206	2026-01-03 09:05:22.206	\N	\N
cmjy4h3cy00e214eavukolc0t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 09:50:40.45	2026-01-03 09:50:40.45	\N	\N
cmjy4t9sa00e314eawaghy6cl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 10:00:08.65	2026-01-03 10:00:08.65	\N	\N
cmjy4zp1j00e414eadhx4jmb3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 10:05:08.36	2026-01-03 10:05:08.36	\N	\N
cmjy57mj500e514ea1y8lucws	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 10:11:18.354	2026-01-03 10:11:18.354	\N	\N
cmjycgvu300e614eaz7raj1wh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:34:27.627	2026-01-03 13:34:27.627	\N	\N
cmjycgvua00e714eatw8xi9ma	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:34:27.634	2026-01-03 13:34:27.634	\N	\N
cmjychaov00e814eaitdoteel	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:34:46.869	2026-01-03 13:34:46.869	\N	\N
cmjychari00e914eawh2mbd71	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:34:46.975	2026-01-03 13:34:46.975	\N	\N
cmjychb2400ea14ea1w8ezts3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:34:47.356	2026-01-03 13:34:47.356	\N	\N
cmjyd8zgi00eb14eab0d4bi25	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:56:18.691	2026-01-03 13:56:18.691	\N	\N
cmjydd9cu00ec14ea3lmgr1gv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 13:59:38.143	2026-01-03 13:59:38.143	\N	\N
cmjyf1gzz00ed14eaa84c4erw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 14:46:27.408	2026-01-03 14:46:27.408	\N	\N
cmjyjzdbj00ee14eabvmv26rw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 17:04:47.407	2026-01-03 17:04:47.407	\N	\N
cmjyqyy8f00ef14eayfeio050	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-03 20:20:25.168	2026-01-03 20:20:25.168	\N	\N
cmjz4qa6m00eg14eajjxq4cnj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 02:45:35.374	2026-01-04 02:45:35.374	\N	\N
cmjz69e9t00eh14earnt7qbom	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 03:28:26.753	2026-01-04 03:28:26.753	\N	\N
cmjz6iyns00ei14eaa6dygwyk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 03:35:53.08	2026-01-04 03:35:53.08	\N	\N
cmjz6pra700ej14eap6cafw7i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 03:41:10.112	2026-01-04 03:41:10.112	\N	\N
cmjz7wllf00ek14ea3rxiktsa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 04:14:28.948	2026-01-04 04:14:28.948	\N	\N
cmjz7wlph00el14eath5oqczb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 04:14:29.093	2026-01-04 04:14:29.093	\N	\N
cmjz7xzh400em14eaq2vx1udo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 04:15:33.591	2026-01-04 04:15:33.591	\N	\N
cmjz99mxe00en14eaxw4ph63m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 04:52:36.819	2026-01-04 04:52:36.819	\N	\N
cmjz9kskm00eo14ea1y06khps	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 05:01:17.35	2026-01-04 05:01:17.35	\N	\N
cmjz9ksyx00ep14eam84x2byx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 05:01:17.866	2026-01-04 05:01:17.866	\N	\N
cmjza0ev400eq14ea6bsum9es	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 05:13:26.081	2026-01-04 05:13:26.081	\N	\N
cmjzcwi6b00er14ea6t11h38w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 06:34:22.596	2026-01-04 06:34:22.596	\N	\N
cmjzcwi8m00es14ea80xrx1n9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 06:34:22.679	2026-01-04 06:34:22.679	\N	\N
cmjzcwicv00et14eahj497r5f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 06:34:22.831	2026-01-04 06:34:22.831	\N	\N
cmjzdhggg00eu14ealb9s0qa6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 06:50:40.134	2026-01-04 06:50:40.134	\N	\N
cmjzghq8600ev14eaaw649iwt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 08:14:51.655	2026-01-04 08:14:51.655	\N	\N
cmjzgq1e600ew14eaed9s7nd0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 08:21:19.374	2026-01-04 08:21:19.374	\N	\N
cmjzh7z3e00ex14ea18zp8yii	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 08:35:16.203	2026-01-04 08:35:16.203	\N	\N
cmjzjd18o00ey14eaofzamuiy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 09:35:11.496	2026-01-04 09:35:11.496	\N	\N
cmjzkgcs900ez14eabu5gkkm5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 10:05:46.041	2026-01-04 10:05:46.041	\N	\N
cmjzkgd9600f014eaf2aox94p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 10:05:46.65	2026-01-04 10:05:46.65	\N	\N
cmjzm43iv00f114eac4nru1hp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 10:52:13.399	2026-01-04 10:52:13.399	\N	\N
cmjzm5nlg00f214ea7bs8w9u5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 10:53:26.068	2026-01-04 10:53:26.068	\N	\N
cmjzmdnq300f314eab5q8pzmy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 10:59:39.484	2026-01-04 10:59:39.484	\N	\N
cmjzqr8r300f414eahxjysb43	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:02:11.727	2026-01-04 13:02:11.727	\N	\N
cmjzqr92n00f514eammvygxof	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:02:12.143	2026-01-04 13:02:12.143	\N	\N
cmjzqu0bl00f614ea1624wy4j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:04:20.77	2026-01-04 13:04:20.77	\N	\N
cmjzrtb0f00f714ea3vx7x1pc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:31:47.584	2026-01-04 13:31:47.584	\N	\N
cmjzruq5v00f814ea64yh6fbc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:32:53.876	2026-01-04 13:32:53.876	\N	\N
cmjzsh09x00f914eahlaijphj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 13:50:13.413	2026-01-04 13:50:13.413	\N	\N
cmjzuc6mt00fa14eavncwfu1s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 14:42:27.606	2026-01-04 14:42:27.606	\N	\N
cmjzwsl4e00fb14eaxnsp374n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:51:12.11	2026-01-04 15:51:12.11	\N	\N
cmjzwsypq00fc14earlajoz74	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:51:29.726	2026-01-04 15:51:29.726	\N	\N
cmjzwsypq00fd14eaevhch86i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:51:29.726	2026-01-04 15:51:29.726	\N	\N
cmjzwsyql00fe14ea6iqm7aib	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:51:29.758	2026-01-04 15:51:29.758	\N	\N
cmjzwsz4600ff14ea1hk9ulvw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:51:30.247	2026-01-04 15:51:30.247	\N	\N
cmjzwudor00fg14eado4fo7b8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 15:52:35.787	2026-01-04 15:52:35.787	\N	\N
cmjzy3w7a00fh14eai0gn1vd9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 16:27:59.302	2026-01-04 16:27:59.302	\N	\N
cmkcwr77g00rh14ea1jgjbh8m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 18:11:07.709	2026-01-13 18:11:07.709	\N	\N
cmkdbkbl400rj14ea0ksi46ie	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 01:05:41.032	2026-01-14 01:05:41.032	\N	\N
cmkdeamhl00rk14eam4aw58i9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 02:22:07.449	2026-01-14 02:22:07.449	\N	\N
cmkdil53c00rm14eahub6anyy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 04:22:16.585	2026-01-14 04:22:16.585	\N	\N
cmkdil57z00rn14ea6clm7nhq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 04:22:16.751	2026-01-14 04:22:16.751	\N	\N
cmkdil5jw00ro14ea835zv3e0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 04:22:17.18	2026-01-14 04:22:17.18	\N	\N
cmke28lap00016kzky2kkv0rf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 13:32:23.378	2026-01-14 13:32:23.378	\N	\N
cmke28mqv00026kzkwxe22edy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 13:32:25.255	2026-01-14 13:32:25.255	\N	\N
cmke303c600056kzkt1ooa8j1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 13:53:46.471	2026-01-14 13:53:46.471	\N	\N
cmkevanv700076kzk08fksa47	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 03:05:48.87	2026-01-15 03:05:48.87	\N	\N
cmkf99bhs000010rp3jcrc74q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 09:36:40.817	2026-01-15 09:36:40.817	\N	\N
cmkfdzt5g000e10rpt0z8z1rm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 11:49:15.221	2026-01-15 11:49:15.221	\N	\N
cmkfgftrb000h10rpymv1icea	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 12:57:41.734	2026-01-15 12:57:41.734	\N	\N
cmkfh7vjd000i10rpwzhdd09h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 13:19:30.41	2026-01-15 13:19:30.41	\N	\N
cmkfh7zbq000j10rp4neav9c7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 13:19:35.318	2026-01-15 13:19:35.318	\N	\N
cmkfivwxe000k10rpawmembck	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 14:06:11.57	2026-01-15 14:06:11.57	\N	\N
cmkfj9mct000l10rpi5jyw1v0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 14:16:51.053	2026-01-15 14:16:51.053	\N	\N
cmkfjdiw4000m10rpdeo3gbla	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 14:19:53.188	2026-01-15 14:19:53.188	\N	\N
cmkfjz85f000n10rpvu1e1kes	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 14:36:45.699	2026-01-15 14:36:45.699	\N	\N
cmkfkscjg000o10rp52akzha0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 14:59:24.413	2026-01-15 14:59:24.413	\N	\N
cmkfmjbua000p10rpmglctj5e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 15:48:22.834	2026-01-15 15:48:22.834	\N	\N
cmkfnqma3000q10rp0u8mk51f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 16:22:02.571	2026-01-15 16:22:02.571	\N	\N
cmkfnqmwk000r10rpr0le9j3g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 16:22:03.381	2026-01-15 16:22:03.381	\N	\N
cmkfp0mhl000s10rp3dd07dcn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 16:57:49.017	2026-01-15 16:57:49.017	\N	\N
cmkfp1ett000t10rpppvsl0rv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 16:58:25.746	2026-01-15 16:58:25.746	\N	\N
cmkfq4tv2000u10rppwmosc5f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 17:29:04.814	2026-01-15 17:29:04.814	\N	\N
cmkfqpmwf000v10rpjdtyiaf3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 17:45:15.567	2026-01-15 17:45:15.567	\N	\N
cmkfqpx26000w10rpdbygontz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 17:45:28.734	2026-01-15 17:45:28.734	\N	\N
cmkfqxft2000x10rpb1lncwfc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 17:51:19.621	2026-01-15 17:51:19.621	\N	\N
cmkfr4t5c000y10rpnslmgqdz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 17:57:03.504	2026-01-15 17:57:03.504	\N	\N
cmkfrj6dy000z10rpsh0idgjr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 18:08:13.846	2026-01-15 18:08:13.846	\N	\N
cmkfsvqjr001010rp8qye1bmv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 18:45:59.463	2026-01-15 18:45:59.463	\N	\N
cmkfszvak001110rpslavrop0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 18:49:12.237	2026-01-15 18:49:12.237	\N	\N
cmkft0y7n001210rpidyttx03	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 18:50:02.675	2026-01-15 18:50:02.675	\N	\N
cmkfv7tdl001310rpwn66z0wi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 19:51:22.233	2026-01-15 19:51:22.233	\N	\N
cmkfv7tdo001410rp3q1gmb1d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 19:51:22.236	2026-01-15 19:51:22.236	\N	\N
cmkgax77h001510rpzid4num4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 03:11:00.797	2026-01-16 03:11:00.797	\N	\N
cmkgbd4a8001610rp1w5yx2fl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 03:23:23.504	2026-01-16 03:23:23.504	\N	\N
cmkgbdj1u001710rpv94zrnyr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 03:23:42.643	2026-01-16 03:23:42.643	\N	\N
cmkge5odz001810rpf9sghhe9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 04:41:35.159	2026-01-16 04:41:35.159	\N	\N
cmkgfjb9i001910rp3bj2cty1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 05:20:10.95	2026-01-16 05:20:10.95	\N	\N
cmkggmj29001a10rpdbinxgbo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 05:50:40.642	2026-01-16 05:50:40.642	\N	\N
cmkgkruwv001i10rp3z3i9oa4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 07:46:47.743	2026-01-16 07:46:47.743	\N	\N
cmkgl20y0001j10rp8dxt9omc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 07:54:42.12	2026-01-16 07:54:42.12	\N	\N
cmkgl8uif001k10rpgx7o8rz1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 08:00:00.375	2026-01-16 08:00:00.375	\N	\N
cmkgl9amy001l10rplexacfn9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 08:00:21.274	2026-01-16 08:00:21.274	\N	\N
cmkgms960001m10rp65s2co8r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 08:43:05.448	2026-01-16 08:43:05.448	\N	\N
cmkgmyxli001n10rpyw6d5gbd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 08:48:17.046	2026-01-16 08:48:17.046	\N	\N
cmjzy3w7b00fi14eahz888plu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 16:27:59.303	2026-01-04 16:27:59.303	\N	\N
cmjzy3wam00fj14eaioj3x0my	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 16:27:59.422	2026-01-04 16:27:59.422	\N	\N
cmjzyt7aw00fk14eaq1ghkebq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-04 16:47:40.089	2026-01-04 16:47:40.089	\N	\N
cmk0janby00fl14ea2xcyh67s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:21:06.334	2026-01-05 02:21:06.334	\N	\N
cmk0janf000fm14eandwjbmwf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:21:06.444	2026-01-05 02:21:06.444	\N	\N
cmk0janp900fn14eaywlufr1x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:21:06.813	2026-01-05 02:21:06.813	\N	\N
cmk0janx700fo14eao66s3n58	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:21:07.099	2026-01-05 02:21:07.099	\N	\N
cmk0k4uin00fp14ea3nvdor58	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:44:35.328	2026-01-05 02:44:35.328	\N	\N
cmk0k4ujm00fq14eaxrsrqzls	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 02:44:35.362	2026-01-05 02:44:35.362	\N	\N
cmk0lmv3g00fr14ea87i2b6s6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 03:26:35.501	2026-01-05 03:26:35.501	\N	\N
cmk0mlcwh00fs14eaz76gbe8e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 03:53:24.881	2026-01-05 03:53:24.881	\N	\N
cmk0nbbkb00ft14eaaofygk47	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 04:13:36.203	2026-01-05 04:13:36.203	\N	\N
cmk0px91j00fu14eagc8u5jc8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:26:38.599	2026-01-05 05:26:38.599	\N	\N
cmk0px94a00fv14eaj72nu6yc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:26:38.699	2026-01-05 05:26:38.699	\N	\N
cmk0pxa8700fw14ea4wj3szqc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:26:40.136	2026-01-05 05:26:40.136	\N	\N
cmk0pxa8800fx14ealeecijgg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:26:40.136	2026-01-05 05:26:40.136	\N	\N
cmk0pxa8900fy14eati6aw81f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:26:40.137	2026-01-05 05:26:40.137	\N	\N
cmk0qze6l00fz14eawhqob4i6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 05:56:18.189	2026-01-05 05:56:18.189	\N	\N
cmk0rw03f00g014eagsuojsj2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:21:39.58	2026-01-05 06:21:39.58	\N	\N
cmk0rw05t00g114ea6crpqke0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:21:39.665	2026-01-05 06:21:39.665	\N	\N
cmk0rw0av00g214eaq3sisckc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:21:39.848	2026-01-05 06:21:39.848	\N	\N
cmk0sersx00g314ea1bxxj59r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:36:15.297	2026-01-05 06:36:15.297	\N	\N
cmk0setnq00g414eae0t7tyeo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:36:17.703	2026-01-05 06:36:17.703	\N	\N
cmk0sev8600g514eadcbq453o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:36:19.734	2026-01-05 06:36:19.734	\N	\N
cmk0swelm00g614ead12cjdl7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:49:57.995	2026-01-05 06:49:57.995	\N	\N
cmk0swena00g714earmuo2h16	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:49:58.054	2026-01-05 06:49:58.054	\N	\N
cmk0swena00g814eajmwuot7l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 06:49:58.055	2026-01-05 06:49:58.055	\N	\N
cmk0uppuw00g914eaa7euhn60	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 07:40:45.224	2026-01-05 07:40:45.224	\N	\N
cmk0xu6mm00ga14eakggyurh6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:08:12.43	2026-01-05 09:08:12.43	\N	\N
cmk0zd5do00gb14eag136xg7j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:56.892	2026-01-05 09:50:56.892	\N	\N
cmk0zd5fu00gc14eay1tz63hy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:56.971	2026-01-05 09:50:56.971	\N	\N
cmk0zd5gt00gd14eamkypshwn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:57.005	2026-01-05 09:50:57.005	\N	\N
cmk0zd65c00ge14eadsm86e59	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:57.888	2026-01-05 09:50:57.888	\N	\N
cmk0zd66k00gf14ean0s6p6d2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:57.933	2026-01-05 09:50:57.933	\N	\N
cmk0zd67n00gg14eatpmguont	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:57.971	2026-01-05 09:50:57.971	\N	\N
cmk0zd69900gh14eag6sqrkh3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 09:50:58.029	2026-01-05 09:50:58.029	\N	\N
cmk114cyu00gi14eay45g20cq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 10:40:06.054	2026-01-05 10:40:06.054	\N	\N
cmk12l93100gj14eaizzbp4l7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 11:21:13.789	2026-01-05 11:21:13.789	\N	\N
cmk13kazu00gk14eat1vqc3dp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 11:48:29.226	2026-01-05 11:48:29.226	\N	\N
cmk13qyc800gm14eatqlonlky	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 11:53:39.416	2026-01-05 11:53:39.416	\N	\N
cmk13qyc800gl14eax812961s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 11:53:39.416	2026-01-05 11:53:39.416	\N	\N
cmk16gfdf00gn14eashh0n9ck	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:09:27.123	2026-01-05 13:09:27.123	\N	\N
cmk16icx500go14ea7wluuwn3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:10:57.257	2026-01-05 13:10:57.257	\N	\N
cmk16ob5y00gp14eap9a9ip1u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:15:34.918	2026-01-05 13:15:34.918	\N	\N
cmk16obfh00gq14eab4c301jx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:15:35.262	2026-01-05 13:15:35.262	\N	\N
cmk16v5p300gr14ead920wi5k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:20:54.423	2026-01-05 13:20:54.423	\N	\N
cmk16v5p300gs14eakaf5657s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:20:54.424	2026-01-05 13:20:54.424	\N	\N
cmk170ehk00gt14eau86x2h8w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:24:59.096	2026-01-05 13:24:59.096	\N	\N
cmk170eu700gu14eatax5uvwb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:24:59.552	2026-01-05 13:24:59.552	\N	\N
cmk181e4j00gv14eafywptps0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:53:44.899	2026-01-05 13:53:44.899	\N	\N
cmk181e4r00gw14eaojminwii	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:53:44.908	2026-01-05 13:53:44.908	\N	\N
cmk181e4s00gx14eax3z0kbsl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:53:44.908	2026-01-05 13:53:44.908	\N	\N
cmk184fs100gy14eash06e874	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 13:56:07.009	2026-01-05 13:56:07.009	\N	\N
cmk18kx4700gz14eavhy3cv2m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 14:08:55.976	2026-01-05 14:08:55.976	\N	\N
cmk18kxq000h014eavxht71eq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 14:08:56.75	2026-01-05 14:08:56.75	\N	\N
cmk19i1j700h114ea46wa07la	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 14:34:41.347	2026-01-05 14:34:41.347	\N	\N
cmk19ovei00h214eaeizu33fk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 14:39:59.994	2026-01-05 14:39:59.994	\N	\N
cmk19ovqa00h314ean6hszzf3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 14:40:00.419	2026-01-05 14:40:00.419	\N	\N
cmk1ayswy00h414eaynp4hwyu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 15:15:42.946	2026-01-05 15:15:42.946	\N	\N
cmk1fdakm00h514ea303ldddx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 17:18:57.478	2026-01-05 17:18:57.478	\N	\N
cmk1fmjhb00h614eabt7cf1uh	Вероника	998974775566	\N	product-oticon-jet-minirite_branch_cmih32wr9001pab1nnv7g29iw	Филиал: Chilonzor	\N	new	2026-01-05 17:26:08.928	2026-01-05 17:26:08.928	https://acoustic.uz/products/oticon-jet-minirite	https://acoustic.uz/services/audiometriya
cmk1h1r5000h714eame2vyrcn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 18:05:58.308	2026-01-05 18:05:58.308	\N	\N
cmk1tdcci00h814ea6vdcodgc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-05 23:50:54.402	2026-01-05 23:50:54.402	\N	\N
cmk23szxq00h914eaeuvvxbi3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 04:43:00.975	2026-01-06 04:43:00.975	\N	\N
cmk26qdal00ha14ea04fsrefx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 06:04:57.166	2026-01-06 06:04:57.166	\N	\N
cmk29anjg00hb14easbck8iao	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 07:16:42.796	2026-01-06 07:16:42.796	\N	\N
cmk2cw2rb00hc14eazf3lbrdu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 08:57:21.143	2026-01-06 08:57:21.143	\N	\N
cmk2cw3u600hd14eafsr2z1yc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 08:57:22.543	2026-01-06 08:57:22.543	\N	\N
cmk2cw4ak00he14eav5etx46i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 08:57:23.133	2026-01-06 08:57:23.133	\N	\N
cmk2cx86j00hf14eaum833w32	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 08:58:14.828	2026-01-06 08:58:14.828	\N	\N
cmk2e8c7800hg14eai8h817n1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 09:34:52.868	2026-01-06 09:34:52.868	\N	\N
cmk2ee1p200hh14eaoaskowme	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 09:39:19.191	2026-01-06 09:39:19.191	\N	\N
cmk2ewfkd00hi14eansz7an0b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 09:53:36.974	2026-01-06 09:53:36.974	\N	\N
cmk2fxd4g00hj14eaup4ykqol	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 10:22:20.081	2026-01-06 10:22:20.081	\N	\N
cmk2jiixi00hk14eapla8qwsi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 12:02:46.23	2026-01-06 12:02:46.23	\N	\N
cmk2nxwks00hl14ea4pyt1k43	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 14:06:42.221	2026-01-06 14:06:42.221	\N	\N
cmk2q1jzb00hm14eagjl1u4c3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 15:05:31.752	2026-01-06 15:05:31.752	\N	\N
cmk2t6eh800hn14earf97qal1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 16:33:16.749	2026-01-06 16:33:16.749	\N	\N
cmk2w4bc000ho14eam70pgsts	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 17:55:38.208	2026-01-06 17:55:38.208	\N	\N
cmk2ycbm200hp14ea4gkvxicj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 18:57:51.05	2026-01-06 18:57:51.05	\N	\N
cmk2zd90h00hq14eayy77t27n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-06 19:26:33.953	2026-01-06 19:26:33.953	\N	\N
cmk3il7ej00hr14eaolkdmcgz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 04:24:37.82	2026-01-07 04:24:37.82	\N	\N
cmk3jln6300hs14eaqrmqxm6v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 04:52:57.867	2026-01-07 04:52:57.867	\N	\N
cmk3kmpt200ht14eabhsbzgn8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 05:21:47.559	2026-01-07 05:21:47.559	\N	\N
cmk3lwo5600hu14ean9zegkz0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 05:57:31.578	2026-01-07 05:57:31.578	\N	\N
cmk3ma4rc00hv14eazssi8toz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 06:07:59.641	2026-01-07 06:07:59.641	\N	\N
cmk3mjhdy00hw14eacxq5ozfm	Вероника	998974775566	\N	product-desktop-charger-for-key-linx-quattro_branch_cmih32wr9001pab1nnv7g29iw	Филиал: Chilonzor	\N	new	2026-01-07 06:15:15.91	2026-01-07 06:15:15.91	https://acoustic.uz/products/desktop-charger-for-key-linx-quattro	https://www.google.com/
cmk3o7yyr00hx14eav8s84qtu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 07:02:18.051	2026-01-07 07:02:18.051	\N	\N
cmk3rsif700hy14ea5go1pz6t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 08:42:15.235	2026-01-07 08:42:15.235	\N	\N
cmk3y70mt00hz14ealrfs5zv8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 11:41:29.717	2026-01-07 11:41:29.717	\N	\N
cmk3yd9w300i014ea2yps4bz7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 11:46:21.651	2026-01-07 11:46:21.651	\N	\N
cmk3z4zmm00i114ea1e8wm9wn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 12:07:54.718	2026-01-07 12:07:54.718	\N	\N
cmk41ycwl00i214ea0ea0l8gc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 13:26:44.182	2026-01-07 13:26:44.182	\N	\N
cmk464za200i314eajh4ezzje	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:23:51.578	2026-01-07 15:23:51.578	\N	\N
cmk46rbtf00i414ea2go1wzep	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:41:14.26	2026-01-07 15:41:14.26	\N	\N
cmk46tpeb00i514eaqqp3ltir	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:43:05.171	2026-01-07 15:43:05.171	\N	\N
cmk46voeg00i614eambalaunb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:44:37.192	2026-01-07 15:44:37.192	\N	\N
cmk46voqi00i714eacdunojzp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:44:37.627	2026-01-07 15:44:37.627	\N	\N
cmk46vovm00i814eannuhiv7n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:44:37.81	2026-01-07 15:44:37.81	\N	\N
cmk46vqyu00i914eahat2x1y3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 15:44:40.518	2026-01-07 15:44:40.518	\N	\N
cmk487hml00ia14ea95ldrjme	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 16:21:47.902	2026-01-07 16:21:47.902	\N	\N
cmk494k0s00ib14eab5bw0rpj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 16:47:30.652	2026-01-07 16:47:30.652	\N	\N
cmk49y5t900ic14eafhag9efw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 17:10:31.917	2026-01-07 17:10:31.917	\N	\N
cmk4c68vb00id14eae6dmjakw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 18:12:48.359	2026-01-07 18:12:48.359	\N	\N
cmk4co8yz00ie14ea7792s06v	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 18:26:48.299	2026-01-07 18:26:48.299	\N	\N
cmk4grk3t00if14eacdx7u4mv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-07 20:21:21.161	2026-01-07 20:21:21.161	\N	\N
cmk4mynoa00ig14eah0t2lb8l	Азиз С	998993731525	\N	product-oticon-jet-bte-pp_branch_cmih32wr9001tab1nd9sxv6uv	Filial: Sergeli	\N	new	2026-01-07 23:14:50.074	2026-01-07 23:14:50.074	https://acoustic.uz/products/oticon-jet-bte-pp	http://m.facebook.com/
cmk4tudcs00ih14eawt7vmg4g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 02:27:27.388	2026-01-08 02:27:27.388	\N	\N
cmk4wnks800ii14eabcxdv7yw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 03:46:09.272	2026-01-08 03:46:09.272	\N	\N
cmk4wnl9f00ij14eay94531yd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 03:46:09.891	2026-01-08 03:46:09.891	\N	\N
cmk5339pu00ik14eayageyqie	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 06:46:19.123	2026-01-08 06:46:19.123	\N	\N
cmk540iwc00il14ea1wrpvpl1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 07:12:10.668	2026-01-08 07:12:10.668	\N	\N
cmk5578ij00im14eak0k9dsbe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 07:45:23.419	2026-01-08 07:45:23.419	\N	\N
cmk5578ij00in14ea2vt724j2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 07:45:23.42	2026-01-08 07:45:23.42	\N	\N
cmk56f2u000io14eajfivcjqu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 08:19:28.921	2026-01-08 08:19:28.921	\N	\N
cmk57rv0s00ip14eaekttsbt1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 08:57:24.94	2026-01-08 08:57:24.94	\N	\N
cmk57sz2q00iq14ea8ldylqh0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 08:58:16.85	2026-01-08 08:58:16.85	\N	\N
cmk59b3u700ir14eamutry6ke	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 09:40:22.448	2026-01-08 09:40:22.448	\N	\N
cmk5at60o00is14eajm0cvu3p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 10:22:24.686	2026-01-08 10:22:24.686	\N	\N
cmk5at61i00it14ea7fju7xrv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 10:22:24.727	2026-01-08 10:22:24.727	\N	\N
cmk5ckilr00iu14eaqva4n6do	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 11:11:40.336	2026-01-08 11:11:40.336	\N	\N
cmk5iaug200iv14eao1uggoac	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 13:52:06.819	2026-01-08 13:52:06.819	\N	\N
cmk5icqfx00iw14eauxrtirva	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 13:53:34.941	2026-01-08 13:53:34.941	\N	\N
cmk5kebqd00ix14eabae0m3if	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 14:50:48.421	2026-01-08 14:50:48.421	\N	\N
cmk5kfe6900iy14eap07qhh0q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 14:51:38.242	2026-01-08 14:51:38.242	\N	\N
cmk5kw5ly00iz14eal36vdmwr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 15:04:40.294	2026-01-08 15:04:40.294	\N	\N
cmk5mcxuy00j014ea03bgbgnf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 15:45:43.018	2026-01-08 15:45:43.018	\N	\N
cmk5mj0fb00j114eas4atngtx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 15:50:26.279	2026-01-08 15:50:26.279	\N	\N
cmk5mq3r500j214eaqm9mb2gx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 15:55:57.185	2026-01-08 15:55:57.185	\N	\N
cmk5qu0hp00j314ear1u1kefe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 17:50:58.045	2026-01-08 17:50:58.045	\N	\N
cmk5quam600j414ea9uaxl3p9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 17:51:11.167	2026-01-08 17:51:11.167	\N	\N
cmk5rfl5700j514ean5mji5vj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 18:07:44.587	2026-01-08 18:07:44.587	\N	\N
cmk5sykev00j614eab4tz8i7q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 18:50:29.719	2026-01-08 18:50:29.719	\N	\N
cmk5zbt5600j714eaeqcggkgy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-08 21:48:45.258	2026-01-08 21:48:45.258	\N	\N
cmk6bwxur00j814ear7lnv1wl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 03:41:06.532	2026-01-09 03:41:06.532	\N	\N
cmk6df5cf00j914eayk5yeu0y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 04:23:15.663	2026-01-09 04:23:15.663	\N	\N
cmk6dm3vl00ja14ea362yfokt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 04:28:40.353	2026-01-09 04:28:40.353	\N	\N
cmk6g4nnl00jb14eabluhmzpi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 05:39:05.026	2026-01-09 05:39:05.026	\N	\N
cmk6nf39l00jc14eaqc6gn9cw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 09:03:09.129	2026-01-09 09:03:09.129	\N	\N
cmk6ok87800jd14eaormvaons	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 09:35:08.409	2026-01-09 09:35:08.409	\N	\N
cmk6pnq2r00je14eafwjjm2fn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 10:05:51.171	2026-01-09 10:05:51.171	\N	\N
cmk6uhmy500jf14eagdgsuu68	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 12:21:05.261	2026-01-09 12:21:05.261	\N	\N
cmk6vcaxz00jg14eaqlrnejpd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 12:44:56.039	2026-01-09 12:44:56.039	\N	\N
cmk6x2xrk00jh14eavzrdaqmn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 13:33:38.289	2026-01-09 13:33:38.289	\N	\N
cmk6ysp7z00ji14eak3opfsvu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 14:21:39.887	2026-01-09 14:21:39.887	\N	\N
cmk7186qi00jj14eaygyeyx07	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 15:29:41.659	2026-01-09 15:29:41.659	\N	\N
cmk72f46x00jk14eay8p11yuc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 16:03:04.57	2026-01-09 16:03:04.57	\N	\N
cmk74tria00jl14eaciubq4fg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 17:10:27.203	2026-01-09 17:10:27.203	\N	\N
cmk77gsel00jm14eao7czavfy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 18:24:20.686	2026-01-09 18:24:20.686	\N	\N
cmk77mo4o00jn14eah96rf324	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 18:28:55.08	2026-01-09 18:28:55.08	\N	\N
cmk77mo9900jo14eam6t9whlv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 18:28:55.245	2026-01-09 18:28:55.245	\N	\N
cmk78vv6300jp14eadh80r30p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 19:04:03.723	2026-01-09 19:04:03.723	\N	\N
cmk7cpc6s00jq14ea2olh4gfs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-09 20:50:57.652	2026-01-09 20:50:57.652	\N	\N
cmk7o5oz400jr14eaxzuzsij6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 02:11:36.497	2026-01-10 02:11:36.497	\N	\N
cmk7opns600js14eaix9x8nqj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 02:27:08.071	2026-01-10 02:27:08.071	\N	\N
cmk7opo2r00jt14ea3xqzxhbe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 02:27:08.451	2026-01-10 02:27:08.451	\N	\N
cmk7q9gbn00ju14eaznb7ibyo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 03:10:31.139	2026-01-10 03:10:31.139	\N	\N
cmk7s6le200jv14eaeky0up8x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 04:04:16.97	2026-01-10 04:04:16.97	\N	\N
cmk7thlqz00jw14eazpj6qoyq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 04:40:50.268	2026-01-10 04:40:50.268	\N	\N
cmk7ugsoa00jx14eayqj8d1bl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 05:08:12.202	2026-01-10 05:08:12.202	\N	\N
cmk7uwmwn00jy14ean3e15cuf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 05:20:31.223	2026-01-10 05:20:31.223	\N	\N
cmk7w0uey00jz14eacvg5z4mw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 05:51:47.195	2026-01-10 05:51:47.195	\N	\N
cmk7zp6z100k014ea9y3iboha	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 07:34:42.062	2026-01-10 07:34:42.062	\N	\N
cmk81j68u00k114eac159vr0d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 08:26:00.415	2026-01-10 08:26:00.415	\N	\N
cmk81oq1a00k214eaqluw6yep	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 08:30:19.342	2026-01-10 08:30:19.342	\N	\N
cmk8212mv00k314eaftstixe8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 08:39:55.543	2026-01-10 08:39:55.543	\N	\N
cmk835p6s00k414eau22scg6x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:11:31.012	2026-01-10 09:11:31.012	\N	\N
cmk83adzn00k514ea6rag7zvw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:09.779	2026-01-10 09:15:09.779	\N	\N
cmk83afdw00k614ean6ukpf9y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:11.589	2026-01-10 09:15:11.589	\N	\N
cmk83ai1500k714earw6l4ye0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:15.017	2026-01-10 09:15:15.017	\N	\N
cmk83aiyd00k814eamzlmiryx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:16.213	2026-01-10 09:15:16.213	\N	\N
cmk83ak0m00k914eaui7pjqbs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:17.591	2026-01-10 09:15:17.591	\N	\N
cmk83b4y000ka14ea2hj83xz6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:44.713	2026-01-10 09:15:44.713	\N	\N
cmk83b78f00kb14eauomwuaez	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:47.679	2026-01-10 09:15:47.679	\N	\N
cmk83b8re00kc14eahk9ig010	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:49.659	2026-01-10 09:15:49.659	\N	\N
cmk83b9rs00kd14ea50bjv9fr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:50.969	2026-01-10 09:15:50.969	\N	\N
cmk83badm00ke14eaxv5dncu0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:51.754	2026-01-10 09:15:51.754	\N	\N
cmk83bagh00kf14ea0nzwhswd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:51.857	2026-01-10 09:15:51.857	\N	\N
cmk83bapk00kg14eaduu5zy9t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:52.184	2026-01-10 09:15:52.184	\N	\N
cmk83barz00kh14eawqaai4hn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:52.272	2026-01-10 09:15:52.272	\N	\N
cmk83bb1h00ki14earg5sv2t9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:52.614	2026-01-10 09:15:52.614	\N	\N
cmk83bcib00kj14ea0kqgq57s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:54.516	2026-01-10 09:15:54.516	\N	\N
cmk83bck700kk14ea21jhwsqf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:54.583	2026-01-10 09:15:54.583	\N	\N
cmk83bcu900kl14eazzp9plmk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:54.945	2026-01-10 09:15:54.945	\N	\N
cmk83bcxp00km14eaa4jwncaf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:55.069	2026-01-10 09:15:55.069	\N	\N
cmk83bd7800kn14eadxz5wr2u	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:55.413	2026-01-10 09:15:55.413	\N	\N
cmk83bdbm00ko14ea86khaipx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:55.57	2026-01-10 09:15:55.57	\N	\N
cmk83bf8y00kp14eak83dcyrv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:58.066	2026-01-10 09:15:58.066	\N	\N
cmk83bfca00kq14ea09zquh7c	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:58.186	2026-01-10 09:15:58.186	\N	\N
cmk83bfls00kr14eai2j4bq62	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:15:58.528	2026-01-10 09:15:58.528	\N	\N
cmk83bi3s00ks14ea1bsso72f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:01.768	2026-01-10 09:16:01.768	\N	\N
cmk83bkmv00kt14eawkbmibg7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:05.048	2026-01-10 09:16:05.048	\N	\N
cmk83bl3t00ku14eajkudn0ei	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:05.658	2026-01-10 09:16:05.658	\N	\N
cmk83bleq00kv14ea0rfnv0my	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:06.05	2026-01-10 09:16:06.05	\N	\N
cmk83bn1b00kw14eajtfmp7ao	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:08.16	2026-01-10 09:16:08.16	\N	\N
cmk83bn5o00kx14eaxnc81ulw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:08.316	2026-01-10 09:16:08.316	\N	\N
cmk83bndy00ky14eago3z81g9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:08.615	2026-01-10 09:16:08.615	\N	\N
cmk83boif00kz14eazoudh6fg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:10.071	2026-01-10 09:16:10.071	\N	\N
cmk83boo700l014ea5mndslge	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:10.279	2026-01-10 09:16:10.279	\N	\N
cmk83bov900l114eag4mzfqtv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:16:10.534	2026-01-10 09:16:10.534	\N	\N
cmk83uyz000l214eahcce3eub	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:31:10.093	2026-01-10 09:31:10.093	\N	\N
cmk83uzam00l314eadeclp1o8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:31:10.51	2026-01-10 09:31:10.51	\N	\N
cmk83uzfe00l414ea5nshe2hc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:31:10.683	2026-01-10 09:31:10.683	\N	\N
cmk83uzpt00l514ead7nfbqin	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:31:11.057	2026-01-10 09:31:11.057	\N	\N
cmk83uzu900l614easy93cnkc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:31:11.217	2026-01-10 09:31:11.217	\N	\N
cmk841qo900l714eaxzcou09b	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 09:36:25.929	2026-01-10 09:36:25.929	\N	\N
cmk85k6uq00l814eak4lmmogw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 10:18:46.322	2026-01-10 10:18:46.322	\N	\N
cmk85kgkn00l914eah0oe6slt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 10:18:58.919	2026-01-10 10:18:58.919	\N	\N
cmk86wxor00la14ealgtctpz0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 10:56:40.587	2026-01-10 10:56:40.587	\N	\N
cmk87xpu300lb14ea3p9fu5fa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 11:25:16.684	2026-01-10 11:25:16.684	\N	\N
cmk88o2zi00lc14eazifv2am3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 11:45:46.782	2026-01-10 11:45:46.782	\N	\N
cmk89h1xo00ld14ea0fdt5267	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 12:08:18.444	2026-01-10 12:08:18.444	\N	\N
cmk8c92k800le14eapikh0td5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 13:26:04.856	2026-01-10 13:26:04.856	\N	\N
cmk8dnase00lf14eas3tcfqtc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:05:08.319	2026-01-10 14:05:08.319	\N	\N
cmk8dnasf00lg14eaktv4jm8r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:05:08.319	2026-01-10 14:05:08.319	\N	\N
cmk8euh3m00lh14eapp2lll0n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:38:42.706	2026-01-10 14:38:42.706	\N	\N
cmk8eyih200li14eaxf2ketf0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:41:51.11	2026-01-10 14:41:51.11	\N	\N
cmk8eyj3h00lj14eaqon7uutc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:41:51.918	2026-01-10 14:41:51.918	\N	\N
cmk8ffv7900lk14ea5b7j4usp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:55:20.758	2026-01-10 14:55:20.758	\N	\N
cmk8fg2vc00ll14ea51a6t1fo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 14:55:30.697	2026-01-10 14:55:30.697	\N	\N
cmk8fw9iz00lm14ea0hu9zf63	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:08:05.82	2026-01-10 15:08:05.82	\N	\N
cmk8g01ll00ln14ea00nwyqi8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:11:02.17	2026-01-10 15:11:02.17	\N	\N
cmk8g27hs00lo14earox60yj6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:12:43.121	2026-01-10 15:12:43.121	\N	\N
cmk8gl2rh00lp14ea7vnhag8w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:27:23.453	2026-01-10 15:27:23.453	\N	\N
cmk8gl2rj00lq14ea4jrjv0ur	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:27:23.456	2026-01-10 15:27:23.456	\N	\N
cmk8gvsrh00lr14ead89x33kw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:35:43.709	2026-01-10 15:35:43.709	\N	\N
cmk8gvss000ls14eaaciazco1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 15:35:43.728	2026-01-10 15:35:43.728	\N	\N
cmk8itfjs00lt14ea2719n8px	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 16:29:52.504	2026-01-10 16:29:52.504	\N	\N
cmk8itfoc00lu14ea0dvbw06f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 16:29:52.669	2026-01-10 16:29:52.669	\N	\N
cmk8itful00lv14ea5rs1c6oj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 16:29:52.894	2026-01-10 16:29:52.894	\N	\N
cmk8itg1f00lw14ea8mfj5jeu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 16:29:53.139	2026-01-10 16:29:53.139	\N	\N
cmk8iwxb600lx14ea3h8x1vm6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 16:32:35.49	2026-01-10 16:32:35.49	\N	\N
cmk8kuxio00ly14eaqhlup57r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 17:27:01.68	2026-01-10 17:27:01.68	\N	\N
cmk8mqop000lz14eahy068yey	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 18:19:42.852	2026-01-10 18:19:42.852	\N	\N
cmk8mr28600m014eajp9xvn7k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 18:20:00.391	2026-01-10 18:20:00.391	\N	\N
cmk8mtt5z00m114ea7i9mbrha	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 18:22:08.616	2026-01-10 18:22:08.616	\N	\N
cmk8mttgd00m214ea7e0lnb6f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 18:22:08.989	2026-01-10 18:22:08.989	\N	\N
cmk8muli700m314ead587fqr1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 18:22:45.344	2026-01-10 18:22:45.344	\N	\N
cmk8qtd0x00m414eauoxltdfv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 20:13:46.162	2026-01-10 20:13:46.162	\N	\N
cmk8y81c300m514eahx31dzwx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-10 23:41:08.163	2026-01-10 23:41:08.163	\N	\N
cmk94cdmp00m614ea3xr3o36p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 02:32:28.417	2026-01-11 02:32:28.417	\N	\N
cmk94dlp300m714eabp6d58d0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 02:33:25.527	2026-01-11 02:33:25.527	\N	\N
cmk94h5eo00m814eap2pk3ily	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 02:36:11.041	2026-01-11 02:36:11.041	\N	\N
cmk94we1g00m914eairkyxqj1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 02:48:02.068	2026-01-11 02:48:02.068	\N	\N
cmk955b1400ma14eaeip1ko6r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 02:54:58.072	2026-01-11 02:54:58.072	\N	\N
cmk95hq1k00mb14eaenacd7d5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:04:37.4	2026-01-11 03:04:37.4	\N	\N
cmk96438100mc14ealofc7ti9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:22:00.913	2026-01-11 03:22:00.913	\N	\N
cmk967wvc00md14eakbu21gsx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:24:59.304	2026-01-11 03:24:59.304	\N	\N
cmk96qftv00me14eazub4ehmm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:39:23.683	2026-01-11 03:39:23.683	\N	\N
cmk96t4u900mf14ea1aav6p9z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:29.41	2026-01-11 03:41:29.41	\N	\N
cmk96t5dx00mg14ea2n7ovtt2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:30.117	2026-01-11 03:41:30.117	\N	\N
cmk96t62500mh14ea7x378e3p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:30.99	2026-01-11 03:41:30.99	\N	\N
cmk96t6vl00mi14eaqkd95l4l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:32.049	2026-01-11 03:41:32.049	\N	\N
cmk96t7dk00mj14eawulm970c	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:32.697	2026-01-11 03:41:32.697	\N	\N
cmk96t7xx00mk14eawc19aqg7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:33.429	2026-01-11 03:41:33.429	\N	\N
cmk96t89200ml14eax6x2vhmr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:33.831	2026-01-11 03:41:33.831	\N	\N
cmk96t8fr00mm14eakhn63irl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:34.072	2026-01-11 03:41:34.072	\N	\N
cmk96tkbn00mn14eaobcm34a5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:41:49.475	2026-01-11 03:41:49.475	\N	\N
cmk96vt6400mo14eaxel0xnb0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:43:34.252	2026-01-11 03:43:34.252	\N	\N
cmk97dsyz00mp14eago0has5y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:57:33.803	2026-01-11 03:57:33.803	\N	\N
cmk97dt2b00mq14eaunb5nv5i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:57:33.924	2026-01-11 03:57:33.924	\N	\N
cmk97dt7v00mr14ea92224nk1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 03:57:34.123	2026-01-11 03:57:34.123	\N	\N
cmk99af2r00ms14eacnmy0pww	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.059	2026-01-11 04:50:55.059	\N	\N
cmk99affl00mt14eaf5mab74y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.522	2026-01-11 04:50:55.522	\N	\N
cmk99afhh00mu14eaxegpypqd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.589	2026-01-11 04:50:55.589	\N	\N
cmk99afhq00mv14eacg58ifev	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.598	2026-01-11 04:50:55.598	\N	\N
cmk99afhr00mw14eadmx4hkol	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.599	2026-01-11 04:50:55.599	\N	\N
cmk99afl500mx14ea2scb5dht	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.721	2026-01-11 04:50:55.721	\N	\N
cmk99afoe00my14eai4yqqvnz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.839	2026-01-11 04:50:55.839	\N	\N
cmk99afpu00mz14ea3s1hljc6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:55.891	2026-01-11 04:50:55.891	\N	\N
cmk99afu700n014ealjicsp8l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:56.047	2026-01-11 04:50:56.047	\N	\N
cmk99afwz00n114eacohbjzvj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:56.148	2026-01-11 04:50:56.148	\N	\N
cmk99afx000n214eaoqtkfdop	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:50:56.148	2026-01-11 04:50:56.148	\N	\N
cmk99bpkf00n314ea7usaxn9t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 04:51:55.311	2026-01-11 04:51:55.311	\N	\N
cmk99qx2g00n414eadr9fekz5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 05:03:44.873	2026-01-11 05:03:44.873	\N	\N
cmk9c4wge00n514ea37v8ecpf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 06:10:36.495	2026-01-11 06:10:36.495	\N	\N
cmk9d6lwu00n614eaz57wbgor	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 06:39:55.759	2026-01-11 06:39:55.759	\N	\N
cmk9dg6dn00n714eaxyw7m7ll	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 06:47:22.188	2026-01-11 06:47:22.188	\N	\N
cmk9dsklu00n814ean90aetdh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 06:57:00.498	2026-01-11 06:57:00.498	\N	\N
cmk9eqs3f00n914ea8fzmeclc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 07:23:36.508	2026-01-11 07:23:36.508	\N	\N
cmk9hwehk00na14ea9y4ob3cm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 08:51:57.656	2026-01-11 08:51:57.656	\N	\N
cmk9ieffg00nb14ead8u1yhg6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 09:05:58.685	2026-01-11 09:05:58.685	\N	\N
cmk9iqlg800nc14eaxgyu4002	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 09:15:26.36	2026-01-11 09:15:26.36	\N	\N
cmk9kul0d00nd14ea4ck0nkwq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:14:31.645	2026-01-11 10:14:31.645	\N	\N
cmk9kv5be00ne14ea2405yyut	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:14:57.962	2026-01-11 10:14:57.962	\N	\N
cmk9kv8tn00nf14eagbgnjbgj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.507	2026-01-11 10:15:02.507	\N	\N
cmk9kv8uj00ng14eaxk6lliq9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.539	2026-01-11 10:15:02.539	\N	\N
cmk9kv8vl00nh14earabbl0vt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.578	2026-01-11 10:15:02.578	\N	\N
cmk9kv8w200ni14ear4g7ignw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.595	2026-01-11 10:15:02.595	\N	\N
cmk9kv90300nj14ea9vywy65j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.74	2026-01-11 10:15:02.74	\N	\N
cmk9kv92k00nk14eabsbj56so	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.828	2026-01-11 10:15:02.828	\N	\N
cmk9kv93z00nl14ea5byvg1eg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:15:02.879	2026-01-11 10:15:02.879	\N	\N
cmk9kx6ky00nm14eapccujfcq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:16:32.903	2026-01-11 10:16:32.903	\N	\N
cmk9kxuns00nn14eav39jaatb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:17:04.12	2026-01-11 10:17:04.12	\N	\N
cmk9mcqw900no14eascyg5bur	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 10:56:38.697	2026-01-11 10:56:38.697	\N	\N
cmk9oivoo00np14ea2rqiximz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 11:57:24.072	2026-01-11 11:57:24.072	\N	\N
cmk9oivtz00nq14eatxphu2wu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 11:57:24.263	2026-01-11 11:57:24.263	\N	\N
cmk9q8y2s00nr14eajxox8n5e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 12:45:39.845	2026-01-11 12:45:39.845	\N	\N
cmk9qvoe000ns14eaosez5kor	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:03:20.376	2026-01-11 13:03:20.376	\N	\N
cmk9ra12300nt14eac87govxq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:14:29.979	2026-01-11 13:14:29.979	\N	\N
cmk9rgacq00nu14eanzpsh7mp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:19:21.962	2026-01-11 13:19:21.962	\N	\N
cmk9rn5xl00nv14ealhzqyzzn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:24:42.826	2026-01-11 13:24:42.826	\N	\N
cmk9s57cs00nw14eaycsg1lnz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:38:44.476	2026-01-11 13:38:44.476	\N	\N
cmk9s57cw00nx14ea2kt88qxe	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:38:44.48	2026-01-11 13:38:44.48	\N	\N
cmk9s57h000ny14ea365qgphu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:38:44.629	2026-01-11 13:38:44.629	\N	\N
cmk9shbuc00nz14ea7ef3wxri	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:48:10.164	2026-01-11 13:48:10.164	\N	\N
cmk9shbuc00o014ea9goed2cy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:48:10.164	2026-01-11 13:48:10.164	\N	\N
cmk9spemw00o114eac6mcx738	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 13:54:27.032	2026-01-11 13:54:27.032	\N	\N
cmka2d46u00o214ea8wkpc6xc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 18:24:49.782	2026-01-11 18:24:49.782	\N	\N
cmka4zc7w00o314eafb7yi1vk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 19:38:05.852	2026-01-11 19:38:05.852	\N	\N
cmka55cil00o414eauvvbap1y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 19:42:46.173	2026-01-11 19:42:46.173	\N	\N
cmka7gzxn00o514eawe1dv3un	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 20:47:48.971	2026-01-11 20:47:48.971	\N	\N
cmkaa052j00o614ealh4o8qx2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-11 21:58:41.323	2026-01-11 21:58:41.323	\N	\N
cmkaivi0s00o714eahqrilghh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 02:07:01.373	2026-01-12 02:07:01.373	\N	\N
cmkaivi1c00o814eatnxp102z	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 02:07:01.392	2026-01-12 02:07:01.392	\N	\N
cmkakag4j00o914eavpnw8ocm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 02:46:38.371	2026-01-12 02:46:38.371	\N	\N
cmkam0v9h00oa14eaofws1xsb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 03:35:10.662	2026-01-12 03:35:10.662	\N	\N
cmkanwz6r00ob14eaci44rpp1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:28:08.355	2026-01-12 04:28:08.355	\N	\N
cmkanwzc300oc14eac3q8tpj4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:28:08.548	2026-01-12 04:28:08.548	\N	\N
cmkao46cg00od14eabxcd0zjb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:33:44.224	2026-01-12 04:33:44.224	\N	\N
cmkaofciv00oe14eaqravrpep	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:42:25.448	2026-01-12 04:42:25.448	\N	\N
cmkaog95600of14ealmgmqq5a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:43:07.723	2026-01-12 04:43:07.723	\N	\N
cmkaogvo500og14ea79zxzxh7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:43:36.917	2026-01-12 04:43:36.917	\N	\N
cmkaor35800oh14eaio6fdn8m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:51:33.165	2026-01-12 04:51:33.165	\N	\N
cmkaow9d900oi14eanxyti499	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:55:34.509	2026-01-12 04:55:34.509	\N	\N
cmkaowagb00oj14eakcfgv314	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:55:35.915	2026-01-12 04:55:35.915	\N	\N
cmkaowaoe00ok14eawt7gb6ha	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:55:36.207	2026-01-12 04:55:36.207	\N	\N
cmkaoyjpc00ol14eayl29o4zn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 04:57:21.216	2026-01-12 04:57:21.216	\N	\N
cmkapi78q00om14eacv9uqike	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 05:12:38.187	2026-01-12 05:12:38.187	\N	\N
cmkaqmsr800on14eauxxnttp7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 05:44:12.309	2026-01-12 05:44:12.309	\N	\N
cmkaqmsy900oo14eaab3xga8g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 05:44:12.562	2026-01-12 05:44:12.562	\N	\N
cmkaqmt8m00op14eaogq7f5vi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 05:44:12.934	2026-01-12 05:44:12.934	\N	\N
cmkar0djw00oq14ea3h9m0a8p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 05:54:45.788	2026-01-12 05:54:45.788	\N	\N
cmkatlphf00or14ea7xuvvsut	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 07:07:20.259	2026-01-12 07:07:20.259	\N	\N
cmkauxl2900os14ea0p7wh1ec	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 07:44:34.017	2026-01-12 07:44:34.017	\N	\N
cmkauxlav00ot14eanbralklh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 07:44:34.327	2026-01-12 07:44:34.327	\N	\N
cmkauxm4l00ou14eauk4xnesy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 07:44:35.397	2026-01-12 07:44:35.397	\N	\N
cmkawuk7e00ov14eagyaezqzy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 08:38:12.171	2026-01-12 08:38:12.171	\N	\N
cmkawukdk00ow14ea504qa243	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 08:38:12.393	2026-01-12 08:38:12.393	\N	\N
cmkawukmg00ox14eaw2hf9ftz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 08:38:12.713	2026-01-12 08:38:12.713	\N	\N
cmkaxh9bi00oy14ea4au066f5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 08:55:51.151	2026-01-12 08:55:51.151	\N	\N
cmkaxh9g200oz14eais96k30y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 08:55:51.315	2026-01-12 08:55:51.315	\N	\N
cmkaxq3ok00p014eat50rjpiq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 09:02:43.749	2026-01-12 09:02:43.749	\N	\N
cmkaxs5yh00p114eafg2qgi7r	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 09:04:20.01	2026-01-12 09:04:20.01	\N	\N
cmkayvmfs00p214eabh1492p8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 09:35:00.953	2026-01-12 09:35:00.953	\N	\N
cmkayvmmn00p314eae8l3bxxu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 09:35:01.199	2026-01-12 09:35:01.199	\N	\N
cmkb05pez00p414eaiuifinwy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 10:10:50.987	2026-01-12 10:10:50.987	\N	\N
cmkb7oe5800p514ea67758p9s	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 13:41:20.156	2026-01-12 13:41:20.156	\N	\N
cmkb92v6k00p614ea4xzr4273	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:20:35.027	2026-01-12 14:20:35.027	\N	\N
cmkb92vmg00p714eawqi637lq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:20:35.609	2026-01-12 14:20:35.609	\N	\N
cmkb98e1p00p814ea38iynd0a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:24:52.765	2026-01-12 14:24:52.765	\N	\N
cmkb98hxo00p914eas6g1ko9e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:24:57.804	2026-01-12 14:24:57.804	\N	\N
cmkb98pmi00pa14eaev1g3vtb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:25:07.77	2026-01-12 14:25:07.77	\N	\N
cmkb98q2r00pb14eajeau4b2x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 14:25:08.356	2026-01-12 14:25:08.356	\N	\N
cmkbakmgv00pc14eana1kdltd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:02:23.167	2026-01-12 15:02:23.167	\N	\N
cmkbbcar800pd14eatseyxl3t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:23:54.356	2026-01-12 15:23:54.356	\N	\N
cmkbbqkmk00pe14earmu7hlez	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:35:00.332	2026-01-12 15:35:00.332	\N	\N
cmkbbql0b00pf14eaqqx8gvn6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:35:00.827	2026-01-12 15:35:00.827	\N	\N
cmkbbql8j00pg14eavhsl184w	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:35:01.123	2026-01-12 15:35:01.123	\N	\N
cmkbcbp0100ph14eaxqn8hjg1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 15:51:25.777	2026-01-12 15:51:25.777	\N	\N
cmkbcyvav00pi14ea7lu2rnhn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 16:09:27.031	2026-01-12 16:09:27.031	\N	\N
cmkbd04p700pj14eayyeeog1f	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 16:10:25.867	2026-01-12 16:10:25.867	\N	\N
cmkbfdvbz00pk14eahqw9kqov	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-12 17:17:06.144	2026-01-12 17:17:06.144	\N	\N
cmkbw56ch00pl14eal4oi9onr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 01:06:13.985	2026-01-13 01:06:13.985	\N	\N
cmkc0qv9e00pm14eanhcqkqxf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:15:04.514	2026-01-13 03:15:04.514	\N	\N
cmkc0qvkh00pn14ea3pqoiucn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:15:04.914	2026-01-13 03:15:04.914	\N	\N
cmkc0qw3d00po14eawuzoc4wt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:15:05.594	2026-01-13 03:15:05.594	\N	\N
cmkc12qg600pp14eaxhrnut6g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:24:18.15	2026-01-13 03:24:18.15	\N	\N
cmkc12qgr00pq14eavjc3bl4n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:24:18.172	2026-01-13 03:24:18.172	\N	\N
cmkc1frxc00pr14eakqub40j5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 03:34:26.592	2026-01-13 03:34:26.592	\N	\N
cmkc3j6os00ps14eaxd7396c1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 04:33:04.925	2026-01-13 04:33:04.925	\N	\N
cmkc58vdd00pt14eam216ahgk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 05:21:02.929	2026-01-13 05:21:02.929	\N	\N
cmkc69s7600pu14eafn4pz1jj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 05:49:45.09	2026-01-13 05:49:45.09	\N	\N
cmkc69s7700pv14eaxhoo4n1d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 05:49:45.091	2026-01-13 05:49:45.091	\N	\N
cmkc7j4il00pw14earlcownrv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 06:25:00.574	2026-01-13 06:25:00.574	\N	\N
cmkcczs3400px14ea01xgofcb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 08:57:55.696	2026-01-13 08:57:55.696	\N	\N
cmkcdjcdw00py14eahxqek8a9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:13:08.469	2026-01-13 09:13:08.469	\N	\N
cmkcdqjtm00pz14eafnx4y2ox	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:18:44.697	2026-01-13 09:18:44.697	\N	\N
cmkcdv4f000q014ea4cy3xnok	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:22:18.013	2026-01-13 09:22:18.013	\N	\N
cmkcdv4s600q114eao94bm5mk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:22:18.487	2026-01-13 09:22:18.487	\N	\N
cmkcdv53f00q214ea0catvyaa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:22:18.892	2026-01-13 09:22:18.892	\N	\N
cmkceioid00q314eazo8pwocp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 09:40:37.141	2026-01-13 09:40:37.141	\N	\N
cmkcf9di900q414ea6pmo92sr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:01:22.593	2026-01-13 10:01:22.593	\N	\N
cmkcfwt2c00q514eamvcj3xfz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:35.845	2026-01-13 10:19:35.845	\N	\N
cmkcfwxw300q614eay5b8l8nk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:42.099	2026-01-13 10:19:42.099	\N	\N
cmkcfwy8300q714eap8qsnf9p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:42.532	2026-01-13 10:19:42.532	\N	\N
cmkcfwyey00q814eabo3ahfme	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:42.779	2026-01-13 10:19:42.779	\N	\N
cmkcfwyr700q914eafm613xao	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:43.22	2026-01-13 10:19:43.22	\N	\N
cmkcfwyuj00qa14eaicpdgwjk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:43.339	2026-01-13 10:19:43.339	\N	\N
cmkcfwz7800qb14eapwzune22	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:43.797	2026-01-13 10:19:43.797	\N	\N
cmkcfwzg300qc14eaukc965il	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:19:44.116	2026-01-13 10:19:44.116	\N	\N
cmkcgbya700qd14eaks7me2kk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:31:22.448	2026-01-13 10:31:22.448	\N	\N
cmkchafoe00qe14ea4488e6dm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:58:11.294	2026-01-13 10:58:11.294	\N	\N
cmkchbd7r00qf14ea7yjupzhl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:58:54.76	2026-01-13 10:58:54.76	\N	\N
cmkchbdru00qg14eam8q3xxkg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 10:58:55.482	2026-01-13 10:58:55.482	\N	\N
cmkchl1j200qh14eaf28ckur5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:06:26.174	2026-01-13 11:06:26.174	\N	\N
cmkciclrx00qi14eazv60d5hr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:27:52.126	2026-01-13 11:27:52.126	\N	\N
cmkcj6l8a00qj14ealnprl5pq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:11.099	2026-01-13 11:51:11.099	\N	\N
cmkcj6lbu00qk14earkwmvjmp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:11.226	2026-01-13 11:51:11.226	\N	\N
cmkcj6lbu00ql14eauieeiho4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:11.227	2026-01-13 11:51:11.227	\N	\N
cmkcj6lcg00qm14eau3vtqi6d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:11.248	2026-01-13 11:51:11.248	\N	\N
cmkcj6ljm00qn14eai4jzvhk6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:11.507	2026-01-13 11:51:11.507	\N	\N
cmkcj6qoo00qo14eakanit2sq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:18.168	2026-01-13 11:51:18.168	\N	\N
cmkcj6we400qp14ea5dfwtpwm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:25.565	2026-01-13 11:51:25.565	\N	\N
cmkcj6wil00qq14eaqnpw34r3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 11:51:25.726	2026-01-13 11:51:25.726	\N	\N
cmkck5fqv00qr14eaqg5moma8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 12:18:16.951	2026-01-13 12:18:16.951	\N	\N
cmkckgmdl00qs14eaf18l6lu0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 12:26:58.762	2026-01-13 12:26:58.762	\N	\N
cmkclm18t00qt14ea0rzpx7kz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 12:59:10.925	2026-01-13 12:59:10.925	\N	\N
cmkcm47cy00qu14eaoruyixg6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:13:18.659	2026-01-13 13:13:18.659	\N	\N
cmkcm66co00qv14ea3wqajfum	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:14:50.665	2026-01-13 13:14:50.665	\N	\N
cmkcmpi1f00qw14eae03363mf	Диёр	998907937001	\N	service-audiometriya_branch_cmih32wr9001vab1naktd62h1	Filial: Sebzor	\N	new	2026-01-13 13:29:52.275	2026-01-13 13:29:52.275	https://acoustic.uz/services/audiometriya	https://www.google.com/
cmkcn3mjj00qx14eaxy29b0xw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:40:51.296	2026-01-13 13:40:51.296	\N	\N
cmkcn48zi00qy14ea59tnet0d	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:41:20.381	2026-01-13 13:41:20.381	\N	\N
cmkcnay5b00qz14ea5kkgt3mp	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:46:32.928	2026-01-13 13:46:32.928	\N	\N
cmkcnozvq00r014eaerlmlrmz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 13:57:28.358	2026-01-13 13:57:28.358	\N	\N
cmkcnu1c600r114eaouj78gbf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:01:23.526	2026-01-13 14:01:23.526	\N	\N
cmkco04rm00r214ea59whkwps	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:06:07.907	2026-01-13 14:06:07.907	\N	\N
cmkcp3i7k00r314eak01twqe6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:36:44.913	2026-01-13 14:36:44.913	\N	\N
cmkcp3ilq00r414eavmemubbc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:36:45.423	2026-01-13 14:36:45.423	\N	\N
cmkcpga5f00r514eakxkxetwo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:46:40.995	2026-01-13 14:46:40.995	\N	\N
cmkcpgk1400r614eafmsbesfj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 14:46:53.8	2026-01-13 14:46:53.8	\N	\N
cmkcrvrrl00r714eargwf9etn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 15:54:42.897	2026-01-13 15:54:42.897	\N	\N
cmkcssbta00r814eaw35eoffa	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 16:20:01.87	2026-01-13 16:20:01.87	\N	\N
cmkcssc4700r914eay3mz1lqs	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 16:20:02.263	2026-01-13 16:20:02.263	\N	\N
cmkctn6dj00ra14ealprpmigt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 16:44:01.159	2026-01-13 16:44:01.159	\N	\N
cmkcuc63z00rb14eajzihft1l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:03:27.215	2026-01-13 17:03:27.215	\N	\N
cmkcupcmr00rc14eam0d4eu07	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:13:42.195	2026-01-13 17:13:42.195	\N	\N
cmkcuzvhp00re14eao6a3etx5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:21:53.198	2026-01-13 17:21:53.198	\N	\N
cmkcuzvhp00rd14ea94hu23m4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:21:53.198	2026-01-13 17:21:53.198	\N	\N
cmkcvk8lw00rf14ea7tbi95a3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:37:43.316	2026-01-13 17:37:43.316	\N	\N
cmkcvnt0100rg14eaq1cthlzi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 17:40:29.713	2026-01-13 17:40:29.713	\N	\N
cmkcx6msf00ri14ea5yttodxy	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-13 18:23:07.743	2026-01-13 18:23:07.743	\N	\N
cmkdfrmnw00rl14eaeepzfhvr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 03:03:20.445	2026-01-14 03:03:20.445	\N	\N
cmkdy5jsf00006kzkmlae5p9y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 11:38:02.991	2026-01-14 11:38:02.991	\N	\N
cmke2mih500036kzkt94f1pgt	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 13:43:12.905	2026-01-14 13:43:12.905	\N	\N
cmke2mj2t00046kzkisu89wfr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 13:43:13.686	2026-01-14 13:43:13.686	\N	\N
cmkemi86800066kzk34rre9mj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-14 22:59:45.248	2026-01-14 22:59:45.248	\N	\N
cmkf1hsqa000p6kzk85svu9m3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 05:59:19.475	2026-01-15 05:59:19.475	\N	\N
cmkfd0p6e000610rpel86numm	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 11:21:57.111	2026-01-15 11:21:57.111	\N	\N
cmkfd0pio000710rpso6scyeb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-15 11:21:57.552	2026-01-15 11:21:57.552	\N	\N
cmkgnebqe001o10rp8id1dom6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:00:15.206	2026-01-16 09:00:15.206	\N	\N
cmkgnebqf001p10rpnf110gl8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:00:15.207	2026-01-16 09:00:15.207	\N	\N
cmkgnebqf001q10rpjs44z4ht	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:00:15.208	2026-01-16 09:00:15.208	\N	\N
cmkgnebqg001r10rpbmaewor9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:00:15.208	2026-01-16 09:00:15.208	\N	\N
cmkgnrnu0001s10rp5egos9yb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:37.416	2026-01-16 09:10:37.416	\N	\N
cmkgnrptq001t10rprab7mf3e	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:39.998	2026-01-16 09:10:39.998	\N	\N
cmkgnrr5y001u10rpypfs5tih	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:41.735	2026-01-16 09:10:41.735	\N	\N
cmkgnrr6m001v10rpfhtxvtsi	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:41.758	2026-01-16 09:10:41.758	\N	\N
cmkgnrrf2001w10rp8le4d4yh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.063	2026-01-16 09:10:42.063	\N	\N
cmkgnrrf3001x10rpqemgmkg7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.063	2026-01-16 09:10:42.063	\N	\N
cmkgnrrhq001y10rpsfyzpatb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.158	2026-01-16 09:10:42.158	\N	\N
cmkgnrrsm001z10rp9z0qlk39	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.551	2026-01-16 09:10:42.551	\N	\N
cmkgnrrvx002010rpovpiejt8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.67	2026-01-16 09:10:42.67	\N	\N
cmkgnrrw5002110rppoxjdfts	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.678	2026-01-16 09:10:42.678	\N	\N
cmkgnrrw6002210rp9b5w1q1y	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 09:10:42.678	2026-01-16 09:10:42.678	\N	\N
cmkgpjg4t002a10rpft1nukbd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:00:13.421	2026-01-16 10:00:13.421	\N	\N
cmkgq4hpa002c10rp9deyffls	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:16:35.231	2026-01-16 10:16:35.231	\N	\N
cmkgqwles002d10rph7kvcrrd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:38:26.404	2026-01-16 10:38:26.404	\N	\N
cmkgr4llu002e10rpyczbkolj	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:44:39.907	2026-01-16 10:44:39.907	\N	\N
cmkgr4lmx002f10rpo41iv915	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:44:39.946	2026-01-16 10:44:39.946	\N	\N
cmkgr4lrk002g10rpzdduh0e3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:44:40.113	2026-01-16 10:44:40.113	\N	\N
cmkgrcnh3002h10rpt0xsm6s0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 10:50:55.576	2026-01-16 10:50:55.576	\N	\N
cmkgs9c2s002i10rpn5u1hp6i	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 11:16:20.452	2026-01-16 11:16:20.452	\N	\N
cmkgsa60q002j10rpvl6okum3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 11:16:59.258	2026-01-16 11:16:59.258	\N	\N
cmkguzy7y002k10rptvkhx2dl	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:33:01.439	2026-01-16 12:33:01.439	\N	\N
cmkgv7w4p002l10rp3i2jili9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:39:11.977	2026-01-16 12:39:11.977	\N	\N
cmkgvb13i002m10rp1pvurjvk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:41:38.383	2026-01-16 12:41:38.383	\N	\N
cmkgvb1f1002n10rpjma7qk4k	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:41:38.797	2026-01-16 12:41:38.797	\N	\N
cmkgvb1qj002o10rpknr6a6bd	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:41:39.211	2026-01-16 12:41:39.211	\N	\N
cmkgvb23x002p10rphlentafw	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 12:41:39.693	2026-01-16 12:41:39.693	\N	\N
cmkgxbeta002q10rp29bqk5l6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 13:37:55.39	2026-01-16 13:37:55.39	\N	\N
cmkgxbh84002r10rpowdte0tz	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 13:37:58.516	2026-01-16 13:37:58.516	\N	\N
cmkgxdml1002s10rpxeu1e2s5	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 13:39:38.773	2026-01-16 13:39:38.773	\N	\N
cmkgxwns7002t10rpdz4aqs2o	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 13:54:26.791	2026-01-16 13:54:26.791	\N	\N
cmkgy3z49002u10rp6cmj1xe0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:00:08.074	2026-01-16 14:00:08.074	\N	\N
cmkgy3zcv002v10rpz2o3qm14	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:00:08.383	2026-01-16 14:00:08.383	\N	\N
cmkgzf6jq002w10rpith46k7n	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:36:50.534	2026-01-16 14:36:50.534	\N	\N
cmkgzf6sx002x10rptvaa8x5q	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:36:50.865	2026-01-16 14:36:50.865	\N	\N
cmkgzf71v002y10rprzsacpum	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:36:51.187	2026-01-16 14:36:51.187	\N	\N
cmkgztf82002z10rpagbnuxg2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 14:47:54.962	2026-01-16 14:47:54.962	\N	\N
cmkh1tkj50000t6rvor9whkub	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 15:44:01.073	2026-01-16 15:44:01.073	\N	\N
cmkh4k31u0001t6rvv82vyi4t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 17:00:37.362	2026-01-16 17:00:37.362	\N	\N
cmkh7tn3h0002t6rv16jmej4h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 18:32:02.093	2026-01-16 18:32:02.093	\N	\N
cmkh82hts0003t6rvxvmomp1g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 18:38:55.168	2026-01-16 18:38:55.168	\N	\N
cmkh82id90004t6rvb6n2p0k1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 18:38:55.869	2026-01-16 18:38:55.869	\N	\N
cmkh9ao920005t6rv6mguymad	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 19:13:16.358	2026-01-16 19:13:16.358	\N	\N
cmkhcerhe0006t6rv582gqyjk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-16 20:40:26.019	2026-01-16 20:40:26.019	\N	\N
cmkhozg5n0007t6rvlyldmlhf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 02:32:26.507	2026-01-17 02:32:26.507	\N	\N
cmkhqb7bp0008t6rvwo1kclkh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 03:09:34.549	2026-01-17 03:09:34.549	\N	\N
cmkhqb7kf0009t6rvvtqjnv3j	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 03:09:34.863	2026-01-17 03:09:34.863	\N	\N
cmkhqfmz4000at6rv5izxxddh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 03:13:01.456	2026-01-17 03:13:01.456	\N	\N
cmkhrp4po000bt6rv7k2blrq3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 03:48:23.964	2026-01-17 03:48:23.964	\N	\N
cmkhsdh84000ct6rvyicet5mf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 04:07:19.924	2026-01-17 04:07:19.924	\N	\N
cmkhshco9000dt6rvqbkt9o0m	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 04:10:20.649	2026-01-17 04:10:20.649	\N	\N
cmkhshd0h000et6rvbrnvhdk4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 04:10:21.089	2026-01-17 04:10:21.089	\N	\N
cmkhsmqh5000ft6rvvcvlqz9a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 04:14:31.818	2026-01-17 04:14:31.818	\N	\N
cmkhtvxfd000gt6rv2b2vrnb6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 04:49:40.345	2026-01-17 04:49:40.345	\N	\N
cmkhvkgaz000ht6rv2gb87lhf	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:36:44.172	2026-01-17 05:36:44.172	\N	\N
cmkhvkgfv000it6rvjbd6fnml	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:36:44.347	2026-01-17 05:36:44.347	\N	\N
cmkhvkgmg000jt6rv2jpj7dru	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:36:44.584	2026-01-17 05:36:44.584	\N	\N
cmkhvkgum000kt6rvlrgfplo7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:36:44.878	2026-01-17 05:36:44.878	\N	\N
cmkhwbc68000lt6rvgyjbj1sc	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:57:38.528	2026-01-17 05:57:38.528	\N	\N
cmkhwbtin000mt6rvdgkytla1	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 05:58:01.007	2026-01-17 05:58:01.007	\N	\N
cmkhxtp6i000rt6rv6a42153a	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 06:39:54.811	2026-01-17 06:39:54.811	\N	\N
cmkhy0rbo000st6rvw9qti89x	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 06:45:24.18	2026-01-17 06:45:24.18	\N	\N
cmkhz8agu000tt6rv4r5pusgk	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 07:19:15.198	2026-01-17 07:19:15.198	\N	\N
cmkhzkkhy000ut6rvgiygy90t	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 07:28:48.07	2026-01-17 07:28:48.07	\N	\N
cmkhzwzx7000vt6rv3pwyxpex	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 07:38:27.931	2026-01-17 07:38:27.931	\N	\N
cmki2550z000014jfrabwm3hh	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 08:40:47.028	2026-01-17 08:40:47.028	\N	\N
cmki255ai000114jfbkdzpg78	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 08:40:47.371	2026-01-17 08:40:47.371	\N	\N
cmki255ig000214jf7k5rfgkn	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 08:40:47.656	2026-01-17 08:40:47.656	\N	\N
cmki2ja5g000314jfruluv5mg	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 08:51:46.853	2026-01-17 08:51:46.853	\N	\N
cmki46dw0000414jf3uir0ou7	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 09:37:44.4	2026-01-17 09:37:44.4	\N	\N
cmki4c35n000514jfwkh7i2q9	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 09:42:10.427	2026-01-17 09:42:10.427	\N	\N
cmki7pxxs000614jfdr05p4n0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 11:16:55.696	2026-01-17 11:16:55.696	\N	\N
cmki7uslk000714jf7pagidep	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 11:20:42.056	2026-01-17 11:20:42.056	\N	\N
cmki8sopc000814jfvzo529xx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 11:47:03.311	2026-01-17 11:47:03.311	\N	\N
cmki9ursd000914jf0zp35fqx	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 12:16:40.238	2026-01-17 12:16:40.238	\N	\N
cmkia1gal000a14jf0h5w2spr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 12:21:51.933	2026-01-17 12:21:51.933	\N	\N
cmkia22da000b14jfd3kh86k8	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 12:22:20.542	2026-01-17 12:22:20.542	\N	\N
cmkia22ln000c14jfn65514rv	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-17 12:22:20.843	2026-01-17 12:22:20.843	\N	\N
cmks8p6ku0000xg6dokla7idr	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:01.614	2026-01-24 11:42:01.614	\N	\N
cmks8p6kv0001xg6d6h1xjwz2	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:01.615	2026-01-24 11:42:01.615	\N	\N
cmks8p6to0002xg6dnqu66peq	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:01.932	2026-01-24 11:42:01.932	\N	\N
cmks8p8wj0003xg6dhd7d2si3	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:04.627	2026-01-24 11:42:04.627	\N	\N
cmks8q5d90004xg6dfh5drijb	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:46.701	2026-01-24 11:42:46.701	\N	\N
cmks8q5fy0005xg6d8ifoe17l	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:46.798	2026-01-24 11:42:46.798	\N	\N
cmks8q5k50006xg6dmokvw5ax	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:46.949	2026-01-24 11:42:46.949	\N	\N
cmks8q5rc0007xg6djiwf9gwo	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:47.208	2026-01-24 11:42:47.208	\N	\N
cmks8qd850008xg6d8viav1vu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:56.886	2026-01-24 11:42:56.886	\N	\N
cmks8qd9n0009xg6dgw0yg7c4	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:56.939	2026-01-24 11:42:56.939	\N	\N
cmks8qdev000axg6dg27oosxu	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:42:57.128	2026-01-24 11:42:57.128	\N	\N
cmks8quxn000bxg6du70gew4p	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:43:19.836	2026-01-24 11:43:19.836	\N	\N
cmks8qv0r000cxg6dja9hiwng	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:43:19.947	2026-01-24 11:43:19.947	\N	\N
cmks8qv6s000dxg6dbqgv2hc6	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:43:20.165	2026-01-24 11:43:20.165	\N	\N
cmks8qxzw000exg6d784c9z0g	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:43:23.804	2026-01-24 11:43:23.804	\N	\N
cmks99f6v000fxg6dotf3qh8h	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:57:45.895	2026-01-24 11:57:45.895	\N	\N
cmks9br4s000gxg6d2npn3uld	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 11:59:34.685	2026-01-24 11:59:34.685	\N	\N
cmksdkte4000hxg6dtrkhm6v0	Telegram Button Click	N/A	\N	telegram_button_click	User clicked Telegram button	\N	new	2026-01-24 13:58:35.981	2026-01-24 13:58:35.981	\N	\N
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Media" (id, url, alt_uz, alt_ru, filename, "mimeType", size, "createdAt", "updatedAt") FROM stdin;
cmih4zyn0000b11vijys2w1de	/uploads/2025-11-27-1764230013467-1763838248004-logo_web-u3i9d0.webp	\N	\N	2025-11-27-1764230013467-1763838248004-logo_web-u3i9d0.webp	image/webp	8506	2025-11-27 07:53:33.469	2025-11-27 07:53:33.469
cmiiueoji000011q8cnnd5a1e	/uploads/2025-11-28-1764333156487-flow_img_20250422_153621_10_084-hvwltc.jpg	\N	\N	2025-11-28-1764333156487-flow_img_20250422_153621_10_084-hvwltc.jpg	image/jpeg	475778	2025-11-28 12:32:36.798	2025-11-28 12:32:36.798
cmiiuey40000111q8wevt2ptk	/uploads/2025-11-28-1764333168940-flow_img_20250422_155916_10_086-ixtgjm.jpg	\N	\N	2025-11-28-1764333168940-flow_img_20250422_155916_10_086-ixtgjm.jpg	image/jpeg	386362	2025-11-28 12:32:49.2	2025-11-28 12:32:49.2
cmiiuf536000211q8kzheamtr	/uploads/2025-11-28-1764333178008-flow_img_20250422_155524_10_085-ngnfbo.jpg	\N	\N	2025-11-28-1764333178008-flow_img_20250422_155524_10_085-ngnfbo.jpg	image/jpeg	305340	2025-11-28 12:32:58.243	2025-11-28 12:32:58.243
cmikduzls000411q8nk7yo3mp	/uploads/2025-11-29-1764426295853-img_20251129_192139_307-b8i7ax.jpg	\N	\N	2025-11-29-1764426295853-img_20251129_192139_307-b8i7ax.jpg	image/jpeg	583843	2025-11-29 14:24:56.512	2025-11-29 14:24:56.512
cmikdv79u000511q8se1xlmvi	/uploads/2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg	\N	\N	2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg	image/jpeg	608724	2025-11-29 14:25:06.45	2025-11-29 14:25:06.45
cmikdxy0h000611q8804qro04	/uploads/2025-11-29-1764426433947-img_20251129_191711_956-tx69pd.jpg	\N	\N	2025-11-29-1764426433947-img_20251129_191711_956-tx69pd.jpg	image/jpeg	309084	2025-11-29 14:27:14.417	2025-11-29 14:27:14.417
cmikdyfds000711q8k04987iu	/uploads/2025-11-29-1764426456427-img_20251129_192055_636-07eojq.jpg	\N	\N	2025-11-29-1764426456427-img_20251129_192055_636-07eojq.jpg	image/jpeg	315472	2025-11-29 14:27:36.929	2025-11-29 14:27:36.929
cmike3eiw000811q8l5bs1rut	/uploads/2025-11-29-1764426688655-2-mryau7.jpg	\N	\N	2025-11-29-1764426688655-2-mryau7.jpg	image/jpeg	272380	2025-11-29 14:31:29.096	2025-11-29 14:31:29.096
cmike519p000911q85y93au07	/uploads/2025-11-29-1764426764690-3-9scdly.jpg	\N	\N	2025-11-29-1764426764690-3-9scdly.jpg	image/jpeg	268995	2025-11-29 14:32:45.229	2025-11-29 14:32:45.229
cmike5ojq000a11q8wixl5u97	/uploads/2025-11-29-1764426794936-4-1pj4x9.jpg	\N	\N	2025-11-29-1764426794936-4-1pj4x9.jpg	image/jpeg	291675	2025-11-29 14:33:15.398	2025-11-29 14:33:15.398
cmiknmhtu00003fedtmseeloq	/uploads/products/oticon-siya-2-cic-opn_cic.webp	Oticon Siya 2 CIC	Oticon Siya 2 CIC	oticon-siya-2-cic-opn_cic.webp	image/webp	3856	2025-11-29 18:58:16.387	2025-11-29 18:58:16.387
cmiknmhu800033fedfzxgwenw	/uploads/products/oticon-siya-2-itc-opn_itc.webp	Oticon Siya 2 ITC	Oticon Siya 2 ITC	oticon-siya-2-itc-opn_itc.webp	image/webp	4946	2025-11-29 18:58:16.401	2025-11-29 18:58:16.401
cmiknmhug00063fedh20uj395	/uploads/products/oticon-opn-s-minirite-opns_minirite-1.webp	Oticon Opn S miniRITE	Oticon Opn S miniRITE	oticon-opn-s-minirite-opns_minirite-1.webp	image/webp	4898	2025-11-29 18:58:16.408	2025-11-29 18:58:16.408
cmiknmhum00093fedraa86d7e	/uploads/products/oticon-opn-cic-opn_cic.webp	Oticon Opn CIC	Oticon Opn CIC	oticon-opn-cic-opn_cic.webp	image/webp	3856	2025-11-29 18:58:16.414	2025-11-29 18:58:16.414
cmiknmhur000c3fedi6xe4eml	/uploads/products/oticon-xceed-bte-sp-xceedsp.webp	Oticon Xceed BTE SP	Oticon Xceed BTE SP	oticon-xceed-bte-sp-xceedsp.webp	image/webp	4460	2025-11-29 18:58:16.42	2025-11-29 18:58:16.42
cmiknmhux000f3fedqav63e6o	/uploads/products/oticon-opn-s-bte-pp-opn_btepp.webp	Oticon Opn S BTE PP	Oticon Opn S BTE PP	oticon-opn-s-bte-pp-opn_btepp.webp	image/webp	3768	2025-11-29 18:58:16.425	2025-11-29 18:58:16.425
cmiknmhv2000i3fedo0usss8j	/uploads/products/oticon-xceed-bte-up-xceedup.webp	Oticon Xceed BTE UP	Oticon Xceed BTE UP	oticon-xceed-bte-up-xceedup.webp	image/webp	4336	2025-11-29 18:58:16.431	2025-11-29 18:58:16.431
cmiknmhv8000l3fedxjo0f1e1	/uploads/products/oticon-ruby-2-bte-pp-ruby2_btepp.webp	Oticon Ruby 2 BTE PP	Oticon Ruby 2 BTE PP	oticon-ruby-2-bte-pp-ruby2_btepp.webp	image/webp	3888	2025-11-29 18:58:16.437	2025-11-29 18:58:16.437
cmiknmhvd000o3fedp314adsd	/uploads/products/oticon-ruby-2-minirite-ruby2_minirite.webp	Oticon Ruby 2 miniRITE	Oticon Ruby 2 miniRITE	oticon-ruby-2-minirite-ruby2_minirite.webp	image/webp	5734	2025-11-29 18:58:16.441	2025-11-29 18:58:16.441
cmiknmhvi000r3fed6eeo2dlz	/uploads/products/oticon-siya-2-bte-pp-siya2_btepp.webp	Oticon Siya 2 BTE PP	Oticon Siya 2 BTE PP	oticon-siya-2-bte-pp-siya2_btepp.webp	image/webp	4080	2025-11-29 18:58:16.446	2025-11-29 18:58:16.446
cmiknmhvm000u3fed256j8kin	/uploads/products/oticon-more-minirite-t-more_minirite_t.webp	Oticon More miniRITE T	Oticon More miniRITE T	oticon-more-minirite-t-more_minirite_t.webp	image/webp	7020	2025-11-29 18:58:16.45	2025-11-29 18:58:16.45
cmiknmhvr000x3fedrbuylod3	/uploads/products/oticon-get-bte-getbte.webp	Oticon Get BTE	Oticon Get BTE	oticon-get-bte-getbte.webp	image/webp	4662	2025-11-29 18:58:16.455	2025-11-29 18:58:16.455
cmiknmhvv00103fedd08yh221	/uploads/products/signia-motion-13p-nx-motion13p_nx-1.webp	Signia Motion 13P NX	Signia Motion 13P NX	signia-motion-13p-nx-motion13p_nx-1.webp	image/webp	7648	2025-11-29 18:58:16.459	2025-11-29 18:58:16.459
cmiknmhvz00133fed1sdv5ip5	/uploads/products/signia-run-p-runp-1.webp	Signia Run P	Signia Run P	signia-run-p-runp-1.webp	image/webp	4920	2025-11-29 18:58:16.464	2025-11-29 18:58:16.464
cmiknmhw300163fedwuiqcr7l	/uploads/products/signia-prompt-s-prompts-1.webp	Signia Prompt S	Signia Prompt S	signia-prompt-s-prompts-1.webp	image/webp	3194	2025-11-29 18:58:16.468	2025-11-29 18:58:16.468
cmiknmhw400173fed0zhy7l4i	/uploads/products/signia-prompt-sp-promptsp.webp	Signia Prompt S	Signia Prompt S	signia-prompt-sp-promptsp.webp	image/webp	5278	2025-11-29 18:58:16.468	2025-11-29 18:58:16.468
cmiknmhw8001a3feddd6uxe7g	/uploads/products/signia-active-active_pro.webp	Signia Active	Signia Active	signia-active-active_pro.webp	image/webp	7766	2025-11-29 18:58:16.472	2025-11-29 18:58:16.472
cmiknmhwd001d3fedti3evbjm	/uploads/products/signia-insio-nx-cic-insio_nx_cic.webp	Signia Insio NX CIC	Signia Insio NX CIC	signia-insio-nx-cic-insio_nx_cic.webp	image/webp	8326	2025-11-29 18:58:16.477	2025-11-29 18:58:16.477
cmiknmhwi001g3fedis8rkd4q	/uploads/products/signia-intuis-m-intuis_m.webp	Signia Intuis M	Signia Intuis M	signia-intuis-m-intuis_m.webp	image/webp	4902	2025-11-29 18:58:16.482	2025-11-29 18:58:16.482
cmiknmhwn001j3feds7xvugml	/uploads/products/signia-intuis-p-intuis_p.webp	Signia Intuis P	Signia Intuis P	signia-intuis-p-intuis_p.webp	image/webp	6146	2025-11-29 18:58:16.488	2025-11-29 18:58:16.488
cmiknmhwt001m3fedeyf4minj	/uploads/products/signia-intuis-sp-intuis_sp.webp	Signia Intuis SP	Signia Intuis SP	signia-intuis-sp-intuis_sp.webp	image/webp	4956	2025-11-29 18:58:16.493	2025-11-29 18:58:16.493
cmiknmhwy001p3fed3khcxuuf	/uploads/products/signia-motion-charge-go-x-motion_chargego.webp	Signia Motion Charge&Go X	Signia Motion Charge&Go X	signia-motion-charge-go-x-motion_chargego.webp	image/webp	4890	2025-11-29 18:58:16.498	2025-11-29 18:58:16.498
cmiknmhwz001q3feda00e8nnx	/uploads/products/signia-motion-charge-go-x-p-motion_chargego_p.jpg.webp	Signia Motion Charge&Go X	Signia Motion Charge&Go X	signia-motion-charge-go-x-p-motion_chargego_p.jpg.webp	image/webp	4142	2025-11-29 18:58:16.499	2025-11-29 18:58:16.499
cmiknmhwz001r3fed9pfeo4ro	/uploads/products/signia-motion-charge-go-x-sp-motion_chargego_sp.webp	Signia Motion Charge&Go X	Signia Motion Charge&Go X	signia-motion-charge-go-x-sp-motion_chargego_sp.webp	image/webp	4578	2025-11-29 18:58:16.5	2025-11-29 18:58:16.5
cmiknmhxe001y3fed8q8sfcrx	/uploads/products/signia-motion-sp-px-motionsp.webp	Signia Motion SP PX	Signia Motion SP PX	signia-motion-sp-px-motionsp.webp	image/webp	5736	2025-11-29 18:58:16.514	2025-11-29 18:58:16.514
cmiknmoac002vyud4oaidmnbt	/uploads/products/eclipse-eclipse-thumb.webp	ECLIPSE	ECLIPSE	eclipse-eclipse-thumb.webp	image/webp	3798	2025-11-29 18:58:24.756	2025-11-29 18:58:24.756
cmiknmhxi00213fedunyry4v3	/uploads/products/signia-prompt-click-cic-prompt_click_cic.webp	Signia Prompt Click CIC	Signia Prompt Click CIC	signia-prompt-click-cic-prompt_click_cic.webp	image/webp	4810	2025-11-29 18:58:16.518	2025-11-29 18:58:16.518
cmiknmhxm00243fed1kh045ih	/uploads/products/signia-prompt-click-itc-prompt_click_itc.webp	Signia Prompt Click ITC	Signia Prompt Click ITC	signia-prompt-click-itc-prompt_click_itc.webp	image/webp	5012	2025-11-29 18:58:16.523	2025-11-29 18:58:16.523
cmiknmhxq00273fedremlu38b	/uploads/products/signia-prompt-cic-promptcic.webp	Signia Prompt CIC	Signia Prompt CIC	signia-prompt-cic-promptcic.webp	image/webp	2908	2025-11-29 18:58:16.527	2025-11-29 18:58:16.527
cmiknmhxz002a3fedzn5waex0	/uploads/products/signia-prompt-p-promptp.webp	Signia Prompt P	Signia Prompt P	signia-prompt-p-promptp.webp	image/webp	4420	2025-11-29 18:58:16.535	2025-11-29 18:58:16.535
cmiknmo6a0004yud43xj4ia9x	/uploads/products/signia-pure-charge-go-ax-pure_chargego_ax.webp	Signia Pure Charge&Go AX	Signia Pure Charge&Go AX	signia-pure-charge-go-ax-pure_chargego_ax.webp	image/webp	10798	2025-11-29 18:58:24.611	2025-11-29 18:58:24.611
cmiknmo6g0007yud4winmrnp3	/uploads/products/signia-pure-312-ax-pure312ax.webp	Signia Pure 312 AX	Signia Pure 312 AX	signia-pure-312-ax-pure312ax.webp	image/webp	8526	2025-11-29 18:58:24.616	2025-11-29 18:58:24.616
cmiknmo6l000ayud46ifvdskn	/uploads/products/signia-pure-312-x-pure312x.webp	Signia Pure 312 X	Signia Pure 312 X	signia-pure-312-x-pure312x.webp	image/webp	13382	2025-11-29 18:58:24.621	2025-11-29 18:58:24.621
cmiknmo6q000dyud4pmi6odnc	/uploads/products/signia-styletto-ax-styletto_ax.webp	Signia Styletto AX	Signia Styletto AX	signia-styletto-ax-styletto_ax.webp	image/webp	9566	2025-11-29 18:58:24.627	2025-11-29 18:58:24.627
cmiknmo6w000gyud4ob4an89u	/uploads/products/signia-styletto-x-stylettox-1.webp	Signia Styletto X	Signia Styletto X	signia-styletto-x-stylettox-1.webp	image/webp	6408	2025-11-29 18:58:24.633	2025-11-29 18:58:24.633
cmiknmo71000jyud4gs23ke1l	/uploads/products/resound-enya-288-enya88.webp	ReSound Enya 288	ReSound Enya 288	resound-enya-288-enya88.webp	image/webp	3930	2025-11-29 18:58:24.637	2025-11-29 18:58:24.637
cmiknmo75000myud4g887c4xb	/uploads/products/resound-enzo-q-998-enzo_q98.webp	ReSound Enzo Q 998	ReSound Enzo Q 998	resound-enzo-q-998-enzo_q98.webp	image/webp	6152	2025-11-29 18:58:24.642	2025-11-29 18:58:24.642
cmiknmo79000pyud4lzbdd6g7	/uploads/products/resound-key-61-key61.webp	ReSound Key 61	ReSound Key 61	resound-key-61-key61.webp	image/webp	4594	2025-11-29 18:58:24.645	2025-11-29 18:58:24.645
cmiknmo7c000syud4a1fhnqy5	/uploads/products/resound-key-461-drwc-key_61_DRWC.webp	ReSound Key 461 DRWC	ReSound Key 461 DRWC	resound-key-461-drwc-key_61_DRWC.webp	image/webp	6790	2025-11-29 18:58:24.648	2025-11-29 18:58:24.648
cmiknmo7g000vyud4dyvupx4p	/uploads/products/resound-key-77-key_77.webp	ReSound Key 77	ReSound Key 77	resound-key-77-key_77.webp	image/webp	5794	2025-11-29 18:58:24.652	2025-11-29 18:58:24.652
cmiknmo7j000yyud4nij2mszc	/uploads/products/resound-key-88-key88.webp	ReSound Key 88	ReSound Key 88	resound-key-88-key88.webp	image/webp	5042	2025-11-29 18:58:24.656	2025-11-29 18:58:24.656
cmiknmo7o0011yud4h84en4fq	/uploads/products/resound-key-98-key_98.webp	ReSound Key 98	ReSound Key 98	resound-key-98-key_98.webp	image/webp	3884	2025-11-29 18:58:24.66	2025-11-29 18:58:24.66
cmiknmo7s0014yud4v1han5q8	/uploads/products/resound-match-ma3t90-ma3t90.webp	ReSound Match MA3T90	ReSound Match MA3T90	resound-match-ma3t90-ma3t90.webp	image/webp	3768	2025-11-29 18:58:24.665	2025-11-29 18:58:24.665
cmiknmo7v0017yud4ovu9kv19	/uploads/products/resound-one-561-one61.webp	ReSound ONE 561	ReSound ONE 561	resound-one-561-one61.webp	image/webp	4704	2025-11-29 18:58:24.668	2025-11-29 18:58:24.668
cmiknmo80001ayud445bt0alo	/uploads/products/resound-linx-quattro-88-linx_quattro88.webp	ReSound LiNX Quattro 88	ReSound LiNX Quattro 88	resound-linx-quattro-88-linx_quattro88.webp	image/webp	4482	2025-11-29 18:58:24.672	2025-11-29 18:58:24.672
cmiknmo84001dyud45n0nd7q6	/uploads/products/resound-omnia-60-drwc-omnia60.webp	ReSound OMNIA 60 DRWC	ReSound OMNIA 60 DRWC	resound-omnia-60-drwc-omnia60.webp	image/webp	5080	2025-11-29 18:58:24.676	2025-11-29 18:58:24.676
cmiknmo88001gyud4jw2nn9x3	/uploads/products/resound-omnia-61-omnia61.webp	ReSound OMNIA 61	ReSound OMNIA 61	resound-omnia-61-omnia61.webp	image/webp	6522	2025-11-29 18:58:24.681	2025-11-29 18:58:24.681
cmiknmo8c001jyud47xlt546e	/uploads/products/resound-omnia-88-dwc-omnia88.webp	ReSound OMNIA 88 DWC	ReSound OMNIA 88 DWC	resound-omnia-88-dwc-omnia88.webp	image/webp	4378	2025-11-29 18:58:24.684	2025-11-29 18:58:24.684
cmiknmo8g001myud4y3ltco4a	/uploads/products/resound-omnia-cic-omnia_cic.webp	ReSound OMNIA CIC	ReSound OMNIA CIC	resound-omnia-cic-omnia_cic.webp	image/webp	2300	2025-11-29 18:58:24.688	2025-11-29 18:58:24.688
cmiknmo8k001pyud40bg5pgbp	/uploads/products/premium-charger-for-omnia-omnia_premium_charger.webp	Premium Charger for OMNIA	Premium Charger for OMNIA	premium-charger-for-omnia-omnia_premium_charger.webp	image/webp	7454	2025-11-29 18:58:24.693	2025-11-29 18:58:24.693
cmiknmo8o001syud4fg16m2m9	/uploads/products/desktop-charger-for-omnia-desktop_charger.webp	Desktop Charger for OMNIA	Desktop Charger for OMNIA	desktop-charger-for-omnia-desktop_charger.webp	image/webp	5786	2025-11-29 18:58:24.696	2025-11-29 18:58:24.696
cmiknmo8r001vyud4iioppf93	/uploads/products/desktop-charger-for-key-linx-quattro-desktop_charger.webp	Desktop Charger for Key / LiNX Quattro	Desktop Charger for Key / LiNX Quattro	desktop-charger-for-key-linx-quattro-desktop_charger.webp	image/webp	5786	2025-11-29 18:58:24.699	2025-11-29 18:58:24.699
cmiknmo8v001yyud4re40wfzd	/uploads/products/premium-charger-for-key-linx-quattro-key_quattro_premium_charger.webp	Premium Charger for Key / LiNX Quattro	Premium Charger for Key / LiNX Quattro	premium-charger-for-key-linx-quattro-key_quattro_premium_charger.webp	image/webp	7026	2025-11-29 18:58:24.703	2025-11-29 18:58:24.703
cmiknmo8y0021yud4mdzfbdh1	/uploads/products/oticon-jet-cic-jet_cic.webp	Oticon Jet CIC	Oticon Jet CIC	oticon-jet-cic-jet_cic.webp	image/webp	3856	2025-11-29 18:58:24.706	2025-11-29 18:58:24.706
cmiknmo920024yud4061m57si	/uploads/products/oticon-jet-minirite-jet_minirite.webp	Oticon Jet miniRITE	Oticon Jet miniRITE	oticon-jet-minirite-jet_minirite.webp	image/webp	6156	2025-11-29 18:58:24.711	2025-11-29 18:58:24.711
cmiknmo960027yud402cckj1a	/uploads/products/oticon-jet-bte-jet_bte.webp	Oticon Jet BTE	Oticon Jet BTE	oticon-jet-bte-jet_bte.webp	image/webp	4434	2025-11-29 18:58:24.715	2025-11-29 18:58:24.715
cmiknmo970028yud42hyerbuo	/uploads/products/oticon-jet-bte-pp-jet_bte.webp	Oticon Jet BTE	Oticon Jet BTE	oticon-jet-bte-pp-jet_bte.webp	image/webp	4434	2025-11-29 18:58:24.715	2025-11-29 18:58:24.715
cmiknmo9g002dyud427t90nna	/uploads/products/oticon-own-iic-own_iic.webp	Oticon Own IIC	Oticon Own IIC	oticon-own-iic-own_iic.webp	image/webp	3604	2025-11-29 18:58:24.725	2025-11-29 18:58:24.725
cmiknmo9l002gyud47nf6f7sd	/uploads/products/oticon-own-cic-own_cic.webp	Oticon Own CIC	Oticon Own CIC	oticon-own-cic-own_cic.webp	image/webp	4856	2025-11-29 18:58:24.729	2025-11-29 18:58:24.729
cmiknmo9p002jyud4bi4diho7	/uploads/products/oticon-own-itc-own_itc.webp	Oticon Own ITC	Oticon Own ITC	oticon-own-itc-own_itc.webp	image/webp	5606	2025-11-29 18:58:24.734	2025-11-29 18:58:24.734
cmiknmo9u002myud4scr21xtf	/uploads/products/visualeyes-x2122-product_image.webp	VisualEyes&#x2122;	VisualEyes&#x2122;	visualeyes-x2122-product_image.webp	image/webp	10860	2025-11-29 18:58:24.739	2025-11-29 18:58:24.739
cmiknmoa1002pyud408stygdm	/uploads/products/eyeseecam-product_image-1.webp	EyeSeeCam	EyeSeeCam	eyeseecam-product_image-1.webp	image/webp	14700	2025-11-29 18:58:24.745	2025-11-29 18:58:24.745
cmiknmoa6002syud4czqaduge	/uploads/products/titan-titanfront-cbbba.webp	Titan	Titan	titan-titanfront-cbbba.webp	image/webp	8370	2025-11-29 18:58:24.75	2025-11-29 18:58:24.75
cmiknmoah002yyud471qhzggs	/uploads/products/at-235-at235.webp	AT 235	AT 235	at-235-at235.webp	image/webp	11296	2025-11-29 18:58:24.761	2025-11-29 18:58:24.761
cmiknmoal0031yud49cjgxlbs	/uploads/products/affinity-2-0-Affinity-2.0.webp	Affinity 2.0	Affinity 2.0	affinity-2-0-Affinity-2.0.webp	image/webp	7370	2025-11-29 18:58:24.765	2025-11-29 18:58:24.765
cmiknmoap0034yud49fr61lg3	/uploads/products/ad629-ad629.webp	AD629	AD629	ad629-ad629.webp	image/webp	11198	2025-11-29 18:58:24.769	2025-11-29 18:58:24.769
cmiknmoau0037yud4qgxctobe	/uploads/products/ad226-ad226.webp	AD226	AD226	ad226-ad226.webp	image/webp	7992	2025-11-29 18:58:24.775	2025-11-29 18:58:24.775
cmiknmoaz003ayud4y47rqn9t	/uploads/products/ac40-AC40.webp	AC40	AC40	ac40-AC40.webp	image/webp	11808	2025-11-29 18:58:24.779	2025-11-29 18:58:24.779
cmiknmob5003dyud46c837fkk	/uploads/products/aa222-aa222.webp	AA222	AA222	aa222-aa222.webp	image/webp	11226	2025-11-29 18:58:24.785	2025-11-29 18:58:24.785
cmiokr1xy0000tpunrc4150z6	/uploads/2025-12-02-1764679734781-blob-bsaxzz.webp	\N	\N	2025-12-02-1764679734781-blob-bsaxzz.webp	image/webp	20112	2025-12-02 12:48:54.934	2025-12-02 12:48:54.934
cmiokrpfg0001tpunn22cc06f	/uploads/2025-12-02-1764679765136-blob-phwrii.webp	\N	\N	2025-12-02-1764679765136-blob-phwrii.webp	image/webp	83944	2025-12-02 12:49:25.372	2025-12-02 12:49:25.372
cmioksjoj0002tpune1t1inrn	/uploads/2025-12-02-1764679804444-blob-wlsfj3.webp	\N	\N	2025-12-02-1764679804444-blob-wlsfj3.webp	image/webp	23604	2025-12-02 12:50:04.58	2025-12-02 12:50:04.58
cmiol278l0000hbl8lxx85gfp	/uploads/2025-12-02-1764680254921-blob-42ksqo.webp	\N	\N	2025-12-02-1764680254921-blob-42ksqo.webp	image/webp	36500	2025-12-02 12:57:35.013	2025-12-02 12:57:35.013
cmiqzwih00002eo0rlaahk592	/uploads/2025-12-04-1764826116207-blob-o8dne3.webp	\N	\N	2025-12-04-1764826116207-blob-o8dne3.webp	image/webp	3242	2025-12-04 05:28:36.228	2025-12-04 05:28:36.228
cmiqzxmum0003eo0r2oj1etqr	/uploads/2025-12-04-1764826168539-blob-q4n7js.webp	\N	\N	2025-12-04-1764826168539-blob-q4n7js.webp	image/webp	10314	2025-12-04 05:29:28.559	2025-12-04 05:29:28.559
cmiqzy7id0004eo0rmk7a34fn	/uploads/2025-12-04-1764826195295-blob-7sqdtk.webp	\N	\N	2025-12-04-1764826195295-blob-7sqdtk.webp	image/webp	6864	2025-12-04 05:29:55.333	2025-12-04 05:29:55.333
cmir01dtj0005eo0re5xb0a9p	/uploads/2025-12-04-1764826343438-blob-7gjty1.webp	\N	\N	2025-12-04-1764826343438-blob-7gjty1.webp	image/webp	12854	2025-12-04 05:32:23.479	2025-12-04 05:32:23.479
cmir029uz0006eo0r6ezzmaas	/uploads/2025-12-04-1764826384957-blob-pl4dg0.webp	\N	\N	2025-12-04-1764826384957-blob-pl4dg0.webp	image/webp	13144	2025-12-04 05:33:05.004	2025-12-04 05:33:05.004
cmir03ncn0007eo0r8payehi2	/uploads/2025-12-04-1764826449099-blob-fhe7n9.webp	\N	\N	2025-12-04-1764826449099-blob-fhe7n9.webp	image/webp	6236	2025-12-04 05:34:09.143	2025-12-04 05:34:09.143
cmir04cvt0008eo0rtx4l38c0	/uploads/2025-12-04-1764826482209-blob-vlv0eo.webp	\N	\N	2025-12-04-1764826482209-blob-vlv0eo.webp	image/webp	4474	2025-12-04 05:34:42.233	2025-12-04 05:34:42.233
cmir05i5n0009eo0r3n5fqasb	/uploads/2025-12-04-1764826535676-blob-iu3i6j.webp	\N	\N	2025-12-04-1764826535676-blob-iu3i6j.webp	image/webp	17168	2025-12-04 05:35:35.723	2025-12-04 05:35:35.723
cmir1fzhx000aeo0raw1r299d	/uploads/2025-12-04-1764828704211-blob-wguwid.webp	\N	\N	2025-12-04-1764828704211-blob-wguwid.webp	image/webp	72236	2025-12-04 06:11:44.373	2025-12-04 06:11:44.373
cmir1wnhu000eeo0rd3unte6f	/uploads/2025-12-04-1764829481908-blob-nphexm.webp	\N	\N	2025-12-04-1764829481908-blob-nphexm.webp	image/webp	22850	2025-12-04 06:24:41.97	2025-12-04 06:24:41.97
cmir2l5fh000meo0ravobjb5t	/uploads/2025-12-04-1764830624892-blob-nv1y71.webp	\N	\N	2025-12-04-1764830624892-blob-nv1y71.webp	image/webp	18388	2025-12-04 06:43:44.957	2025-12-04 06:43:44.957
cmir4fwwa000qeo0r5ysvq7vb	/uploads/2025-12-04-1764833739794-blob-d5a907.webp	\N	\N	2025-12-04-1764833739794-blob-d5a907.webp	image/webp	24772	2025-12-04 07:35:39.85	2025-12-04 07:35:39.85
cmir4gj8k000reo0rjh3ohqwj	/uploads/2025-12-04-1764833768750-blob-rbrw6k.webp	\N	\N	2025-12-04-1764833768750-blob-rbrw6k.webp	image/webp	22976	2025-12-04 07:36:08.805	2025-12-04 07:36:08.805
cmir4pk6w000seo0rqaf6ktix	/uploads/2025-12-04-1764834189884-blob-ko5uve.webp	\N	\N	2025-12-04-1764834189884-blob-ko5uve.webp	image/webp	21342	2025-12-04 07:43:09.944	2025-12-04 07:43:09.944
cmir52a2b000weo0rz5319tp3	/uploads/2025-12-04-1764834783289-blob-i2es8c.webp	\N	\N	2025-12-04-1764834783289-blob-i2es8c.webp	image/webp	22460	2025-12-04 07:53:03.348	2025-12-04 07:53:03.348
cmir98dpm000zeo0rhafuwnah	/uploads/2025-12-04-1764841786417-blob-evrvhs.webp	\N	\N	2025-12-04-1764841786417-blob-evrvhs.webp	image/webp	28752	2025-12-04 09:49:46.475	2025-12-04 09:49:46.475
cmir9ssu20019eo0rbznej3yi	/uploads/2025-12-04-1764842739143-blob-pjpk6j.webp	\N	\N	2025-12-04-1764842739143-blob-pjpk6j.webp	image/webp	10924	2025-12-04 10:05:39.194	2025-12-04 10:05:39.194
cmirbnja3001beo0rg7g68kvw	/uploads/2025-12-04-1764845852738-blob-26u056.webp	\N	\N	2025-12-04-1764845852738-blob-26u056.webp	image/webp	7216	2025-12-04 10:57:32.763	2025-12-04 10:57:32.763
cmirbo8b6001ceo0r0ly3tfim	/uploads/2025-12-04-1764845885179-blob-rp9s60.webp	\N	\N	2025-12-04-1764845885179-blob-rp9s60.webp	image/webp	1916	2025-12-04 10:58:05.203	2025-12-04 10:58:05.203
cmire8o4z001eeo0rt6i0yxik	/uploads/2025-12-04-1764850197921-blob-rtgrq1.webp	\N	\N	2025-12-04-1764850197921-blob-rtgrq1.webp	image/webp	54658	2025-12-04 12:09:58.068	2025-12-04 12:09:58.068
cmireo2m5001feo0rldlhxu37	/uploads/2025-12-04-1764850916646-blob-zmytr8.webp	\N	\N	2025-12-04-1764850916646-blob-zmytr8.webp	image/webp	3918	2025-12-04 12:21:56.67	2025-12-04 12:21:56.67
cmireo7ux001geo0rrvob3sv0	/uploads/2025-12-04-1764850923435-blob-51hxaf.webp	\N	\N	2025-12-04-1764850923435-blob-51hxaf.webp	image/webp	8070	2025-12-04 12:22:03.466	2025-12-04 12:22:03.466
cmit8gr8c0000h6qikpcjldvv	/uploads/2025-12-05-1764961429907-favicon-hhcbi5.webp	\N	\N	2025-12-05-1764961429907-favicon-hhcbi5.webp	image/webp	1636	2025-12-05 19:03:49.98	2025-12-05 19:03:49.98
cmizkm4pu0002co33x39pbxgz	/uploads/2025-12-10-1765344633077-blob-lxgcr5.webp	\N	\N	2025-12-10-1765344633077-blob-lxgcr5.webp	image/webp	10228	2025-12-10 05:30:33.186	2025-12-10 05:30:33.186
cmizkukh30006co33g6mk6yb8	/uploads/2025-12-10-1765345026758-blob-h6ub9g.webp	\N	\N	2025-12-10-1765345026758-blob-h6ub9g.webp	image/webp	10660	2025-12-10 05:37:06.855	2025-12-10 05:37:06.855
cmizkx9nk0007co3391tpxbt0	/uploads/2025-12-10-1765345152640-blob-qaezm8.webp	\N	\N	2025-12-10-1765345152640-blob-qaezm8.webp	image/webp	24126	2025-12-10 05:39:12.8	2025-12-10 05:39:12.8
cmizkxyyg0008co33tkvv1nhk	/uploads/2025-12-10-1765345185432-blob-1l4fx4.webp	\N	\N	2025-12-10-1765345185432-blob-1l4fx4.webp	image/webp	15376	2025-12-10 05:39:45.592	2025-12-10 05:39:45.592
cmizky9340009co33cwb9elf8	/uploads/2025-12-10-1765345198562-blob-mq4svc.webp	\N	\N	2025-12-10-1765345198562-blob-mq4svc.webp	image/webp	32792	2025-12-10 05:39:58.72	2025-12-10 05:39:58.72
cmizkyoog000aco33gu5xl84u	/uploads/2025-12-10-1765345218770-blob-64n8su.webp	\N	\N	2025-12-10-1765345218770-blob-64n8su.webp	image/webp	15042	2025-12-10 05:40:18.928	2025-12-10 05:40:18.928
cmizkyzzh000bco33ievqwru3	/uploads/2025-12-10-1765345233423-blob-2ep01g.webp	\N	\N	2025-12-10-1765345233423-blob-2ep01g.webp	image/webp	21154	2025-12-10 05:40:33.582	2025-12-10 05:40:33.582
cmizkzcq3000cco33ljm27lue	/uploads/2025-12-10-1765345249923-blob-uhrw9v.webp	\N	\N	2025-12-10-1765345249923-blob-uhrw9v.webp	image/webp	32826	2025-12-10 05:40:50.091	2025-12-10 05:40:50.091
cmizkzvqu000dco33x34jndvc	/uploads/2025-12-10-1765345274580-blob-rb2xub.webp	\N	\N	2025-12-10-1765345274580-blob-rb2xub.webp	image/webp	27532	2025-12-10 05:41:14.742	2025-12-10 05:41:14.742
cmizl09t0000eco330x0y66cl	/uploads/2025-12-10-1765345292789-blob-avs78h.webp	\N	\N	2025-12-10-1765345292789-blob-avs78h.webp	image/webp	28866	2025-12-10 05:41:32.964	2025-12-10 05:41:32.964
cmj5hn6s40000uzp4s0pghs3g	/uploads/2025-12-14-1765702440656-blob-65pk99.webp	\N	\N	2025-12-14-1765702440656-blob-65pk99.webp	image/webp	21218	2025-12-14 08:54:00.725	2025-12-14 08:54:00.725
cmj5hneut0001uzp4lw4l4ns2	/uploads/2025-12-14-1765702451123-blob-wj7p09.webp	\N	\N	2025-12-14-1765702451123-blob-wj7p09.webp	image/webp	28900	2025-12-14 08:54:11.189	2025-12-14 08:54:11.189
cmj5hnhte0002uzp4yo2t5vkx	/uploads/2025-12-14-1765702454958-blob-ml09qx.webp	\N	\N	2025-12-14-1765702454958-blob-ml09qx.webp	image/webp	27824	2025-12-14 08:54:15.027	2025-12-14 08:54:15.027
cmj71kf3a000k11tauh230j89	/uploads/2025-12-15-1765796369942-blob-68abz8.webp	\N	\N	2025-12-15-1765796369942-blob-68abz8.webp	image/webp	26542	2025-12-15 10:59:30.022	2025-12-15 10:59:30.022
cmj71pz5f000n11takmxdwl8t	/uploads/2025-12-15-1765796629219-blob-8z7g2t.webp	\N	\N	2025-12-15-1765796629219-blob-8z7g2t.webp	image/webp	63768	2025-12-15 11:03:49.3	2025-12-15 11:03:49.3
cmkez0psk00086kzkrwr61hdg	/uploads/2026-01-15-1768452603047-blob-s2k16h.webp	\N	\N	2026-01-15-1768452603047-blob-s2k16h.webp	image/webp	70286	2026-01-15 04:50:03.284	2026-01-15 04:50:03.284
cmkez4dbw00096kzkoaqhjnuc	/uploads/2026-01-15-1768452773642-blob-e4hxoz.webp	\N	\N	2026-01-15-1768452773642-blob-e4hxoz.webp	image/webp	67774	2026-01-15 04:52:53.756	2026-01-15 04:52:53.756
cmkez4nao000a6kzky39zn7sn	/uploads/2026-01-15-1768452786568-blob-3c57k5.webp	\N	\N	2026-01-15-1768452786568-blob-3c57k5.webp	image/webp	70014	2026-01-15 04:53:06.672	2026-01-15 04:53:06.672
cmkez4w9v000b6kzk685j2a9e	/uploads/2026-01-15-1768452798197-blob-1yppnw.webp	\N	\N	2026-01-15-1768452798197-blob-1yppnw.webp	image/webp	73678	2026-01-15 04:53:18.308	2026-01-15 04:53:18.308
cmkez538s000c6kzk9mlr4cjf	/uploads/2026-01-15-1768452807246-blob-xxcp2i.webp	\N	\N	2026-01-15-1768452807246-blob-xxcp2i.webp	image/webp	52924	2026-01-15 04:53:27.34	2026-01-15 04:53:27.34
cmkez5afi000d6kzkfwq7o9zw	/uploads/2026-01-15-1768452816526-blob-o2tdin.webp	\N	\N	2026-01-15-1768452816526-blob-o2tdin.webp	image/webp	64946	2026-01-15 04:53:36.655	2026-01-15 04:53:36.655
cmkez6rbe000e6kzktrn68u8c	/uploads/2026-01-15-1768452885080-blob-v2bxlo.webp	\N	\N	2026-01-15-1768452885080-blob-v2bxlo.webp	image/webp	56900	2026-01-15 04:54:45.194	2026-01-15 04:54:45.194
cmkez713v000f6kzk73qqo7yh	/uploads/2026-01-15-1768452897753-blob-kf65lm.webp	\N	\N	2026-01-15-1768452897753-blob-kf65lm.webp	image/webp	61540	2026-01-15 04:54:57.884	2026-01-15 04:54:57.884
cmkez78u2000g6kzkx37hewaw	/uploads/2026-01-15-1768452907786-blob-kil76s.webp	\N	\N	2026-01-15-1768452907786-blob-kil76s.webp	image/webp	52304	2026-01-15 04:55:07.898	2026-01-15 04:55:07.898
cmkez84w5000h6kzk4x696ydh	/uploads/2026-01-15-1768452949328-blob-tb8i15.webp	\N	\N	2026-01-15-1768452949328-blob-tb8i15.webp	image/webp	70538	2026-01-15 04:55:49.446	2026-01-15 04:55:49.446
cmkez9ynw000i6kzkackz4ub4	/uploads/2026-01-15-1768453034569-blob-wb3t9u.webp	\N	\N	2026-01-15-1768453034569-blob-wb3t9u.webp	image/webp	39894	2026-01-15 04:57:14.684	2026-01-15 04:57:14.684
cmkeza4la000j6kzk4r5q0u6i	/uploads/2026-01-15-1768453042256-blob-w1ldt3.webp	\N	\N	2026-01-15-1768453042256-blob-w1ldt3.webp	image/webp	60884	2026-01-15 04:57:22.366	2026-01-15 04:57:22.366
cmkezabvb000k6kzkig33eis4	/uploads/2026-01-15-1768453051702-blob-bcnn0g.webp	\N	\N	2026-01-15-1768453051702-blob-bcnn0g.webp	image/webp	58282	2026-01-15 04:57:31.799	2026-01-15 04:57:31.799
cmkezb4cn000l6kzklir4mv20	/uploads/2026-01-15-1768453088568-blob-u40ymq.webp	\N	\N	2026-01-15-1768453088568-blob-u40ymq.webp	image/webp	57078	2026-01-15 04:58:08.712	2026-01-15 04:58:08.712
cmkf0xlrd000m6kzk6tkbgjgx	/uploads/2026-01-15-1768455817214-blob-02sjl5.webp	\N	\N	2026-01-15-1768455817214-blob-02sjl5.webp	image/webp	70354	2026-01-15 05:43:37.322	2026-01-15 05:43:37.322
cmkf0y0w9000n6kzkkci5flsj	/uploads/2026-01-15-1768455836847-blob-3wi7ji.webp	\N	\N	2026-01-15-1768455836847-blob-3wi7ji.webp	image/webp	41036	2026-01-15 05:43:56.938	2026-01-15 05:43:56.938
cmkf0yi95000o6kzkk030mh0u	/uploads/2026-01-15-1768455859335-blob-lc2t8c.webp	\N	\N	2026-01-15-1768455859335-blob-lc2t8c.webp	image/webp	53966	2026-01-15 05:44:19.434	2026-01-15 05:44:19.434
cmkfbg3oh000210rpldh0vtu5	/uploads/2026-01-15-1768473476420-blob-yuq15r.webp	\N	\N	2026-01-15-1768473476420-blob-yuq15r.webp	image/webp	4206	2026-01-15 10:37:56.513	2026-01-15 10:37:56.513
cmkhwdgz6000nt6rv5tt51dpv	/uploads/2026-01-17-1768629557886-blob-t6y0bl.webp	\N	\N	2026-01-17-1768629557886-blob-t6y0bl.webp	image/webp	73432	2026-01-17 05:59:18.066	2026-01-17 05:59:18.066
cmkhwekhp000ot6rve9aqsoff	/uploads/2026-01-17-1768629609160-blob-yhjgrd.webp	\N	\N	2026-01-17-1768629609160-blob-yhjgrd.webp	image/webp	61376	2026-01-17 06:00:09.277	2026-01-17 06:00:09.277
cmkhwevqp000pt6rvgpfpr3r6	/uploads/2026-01-17-1768629623756-blob-kmylql.webp	\N	\N	2026-01-17-1768629623756-blob-kmylql.webp	image/webp	43246	2026-01-17 06:00:23.858	2026-01-17 06:00:23.858
cmkhwf32g000qt6rv6gg013p5	/uploads/2026-01-17-1768629633254-blob-288n65.webp	\N	\N	2026-01-17-1768629633254-blob-288n65.webp	image/webp	54140	2026-01-17 06:00:33.353	2026-01-17 06:00:33.353
cmki00fj9000wt6rv39kteex2	/uploads/2026-01-17-1768635668004-blob-a5p8q0.webp	\N	\N	2026-01-17-1768635668004-blob-a5p8q0.webp	image/webp	3114	2026-01-17 07:41:08.133	2026-01-17 07:41:08.133
cmki07m6w000yt6rvin50bq8q	/uploads/2026-01-17-1768636003302-blob-6ekuiz.webp	\N	\N	2026-01-17-1768636003302-blob-6ekuiz.webp	image/webp	5116	2026-01-17 07:46:43.352	2026-01-17 07:46:43.352
cmki0ikf30011t6rvzdqv7wx6	/uploads/2026-01-17-1768636514196-blob-dtc4ks.webp	\N	\N	2026-01-17-1768636514196-blob-dtc4ks.webp	image/webp	3182	2026-01-17 07:55:14.272	2026-01-17 07:55:14.272
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Menu" (id, name, items, "updatedAt") FROM stdin;
cmih33jbb000211vi01xavwm7	footer	[{"id": "footer-about", "href": "/about", "order": 10, "title_ru": "О нас", "title_uz": "Biz haqimizda"}, {"id": "footer-branches", "href": "/branches", "order": 20, "title_ru": "Адреса филиалов", "title_uz": "Filial manzillari"}, {"id": "footer-services", "href": "/services", "order": 30, "title_ru": "Услуги", "title_uz": "Xizmatlar"}, {"id": "footer-contacts", "href": "/contacts", "order": 40, "title_ru": "Контакты", "title_uz": "Bog‘lanish"}, {"id": "footer-faq", "href": "/faq", "order": 50, "title_ru": "Вопросы", "title_uz": "Savollar"}, {"id": "footer-feedback", "href": "/feedback", "order": 60, "title_ru": "Обратная связь", "title_uz": "Fikr bildirish"}]	2025-11-27 07:00:20.999
cmih33jb4000011vin9n528i7	header	[{"id": "menu-services", "href": "/services", "order": 10, "title_ru": "Услуги", "title_uz": "Xizmatlar"}, {"id": "menu-catalog", "href": "/catalog", "order": 20, "children": [{"id": "menu-catalog-hearing-aids", "href": "/catalog?productType=hearing-aids", "order": 10, "title_ru": "Слуховые аппараты", "title_uz": "Eshitish moslamalari"}, {"id": "menu-catalog-children", "href": "/catalog?productType=hearing-aids&filter=children", "order": 20, "title_ru": "Детские", "title_uz": "Bolalar uchun"}, {"id": "menu-catalog-wireless", "href": "/catalog?productType=accessories&filter=wireless", "order": 30, "title_ru": "Беспроводные аксессуары", "title_uz": "Simsiz aksessuarlar"}, {"id": "menu-catalog-interacoustics", "href": "/catalog?productType=interacoustics", "order": 40, "title_ru": "Interacoustics", "title_uz": "Interacoustics"}, {"id": "menu-catalog-accessories", "href": "/catalog?productType=accessories", "order": 50, "title_ru": "Аксессуары", "title_uz": "Aksessuarlar"}, {"id": "menu-catalog-earmolds", "href": "/catalog/earmolds", "order": 60, "title_ru": "Ушные вкладыши", "title_uz": "Quloq qo'shimchalari"}, {"id": "menu-catalog-batteries", "href": "/catalog/batteries", "order": 70, "title_ru": "Батарейки", "title_uz": "Batareyalar"}, {"id": "menu-catalog-care", "href": "/catalog/care", "order": 80, "title_ru": "Средства ухода", "title_uz": "Parvarish vositalari"}], "title_ru": "Каталог", "title_uz": "Katalog"}, {"id": "menu-doctors", "href": "/doctors", "order": 30, "title_ru": "Специалисты", "title_uz": "Mutaxassislar"}, {"id": "menu-patients", "href": "/patients", "order": 40, "title_ru": "Пациентам", "title_uz": "Bemorlar"}, {"id": "menu-children", "href": "/children-hearing", "order": 50, "title_ru": "Дети и слух", "title_uz": "Bolalar"}, {"id": "menu-about", "href": "/about", "order": 60, "title_ru": "О нас", "title_uz": "Biz haqimizda"}, {"id": "menu-branches", "href": "/branches", "order": 70, "title_ru": "Наши адреса", "title_uz": "Manzillar"}]	2026-01-24 09:29:21.039
\.


--
-- Data for Name: Page; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Page" (id, slug, title_uz, title_ru, body_uz, body_ru, "metaTitle_uz", "metaTitle_ru", "metaDescription_uz", "metaDescription_ru", status, "createdAt", "updatedAt", "galleryIds", "usefulArticleSlugs", "videoUrl") FROM stdin;
cmih32wrc002bab1ng1o2aoq9	contacts	Kontaktlar	Контакты	Biz bilan bog'laning: +998 71 202 14 41	Свяжитесь с нами: +998 71 202 14 41	\N	\N	\N	\N	published	2025-11-27 06:59:51.769	2025-11-27 06:59:51.769	{}	{}	\N
cmirexq2u001heo0ry37gl2vg	children-hearing	Bolalar va eshitish	Дети и слух	\N	\N	\N	\N	\N	\N	archived	2025-12-04 12:29:26.983	2025-12-04 12:29:26.983	{}	{}	\N
cmise5ugu001ieo0ragbg5wmy	patients	Inson eshitish organi qanday tuzilgan?	Как устроен орган слуха человека?	<p>Inson eshitish organi uch asosiy qismdan iborat: <strong>tashqi quloq</strong>, <strong>o‘rta quloq</strong> va <strong>ichki quloq</strong>. Tashqi quloq tovush to‘lqinlarini yig‘ib, ularni quloq kanaliga yo‘naltiradi. Quloq pardasi (timpan) to‘lqinlarni qabul qilib, ularni uchta suyakcha—malleus, incus va stapes—orqali ichki quloqqa uzatadi. Ichki quloqdagi koklea (ulita) tebranishlarni nerv impulslariga aylantirib, ularni eshitish nervi orqali miyaga yuboradi.</p><p><strong>Asosiy elementlar va ularning vazifasi</strong></p><ul><li><p><em>Tashqi quloq</em>: pavilon (quloq peshonasiga yaqin tashqi qismi) va tashqi quloq kanali — tovushni to‘playdi.</p></li><li><p><em>Timpanik qavat va suyakchalar</em>: tovushni mexanik tarzda kuchaytiradi.</p></li><li><p><em>Eustahiy trubasi</em>: o‘rta quloq bosimini muvozanatlashtiradi.</p></li><li><p><em>Koklea (ulita)</em>: ichki quloqdagi tukchali hujayralar tovushni elektrokimyoviy signallarga aylantiradi.</p></li><li><p><em>Eshitish nervi va miya</em>: impulslardan ma’lumotni qayta ishlaydi va tovushni sezish/anglashni ta’minlaydi.</p></li></ul><p></p>	<p>Орган слуха человека состоит из трёх отделов: <strong>наружного уха</strong>, <strong>среднего уха</strong> и <strong>внутреннего уха</strong>. Наружное ухо собирает звуковые волны и направляет их к барабанной перепонке. Среднее ухо с помощью трёх слуховых косточек усиливает звук и передаёт его во внутреннее ухо. Внутреннее ухо (улитка) преобразует механические колебания в нервные импульсы, которые направляются в мозг.</p><p><strong>Ключевые элементы и их функции</strong></p><ul><li><p><em>Наружное ухо</em>: улавливает звук и направляет в слуховой проход.</p></li><li><p><em>Барабанная перепонка и слуховые косточки</em>: усиливают колебания.</p></li><li><p><em>Евстахиева труба</em>: выравнивает давление в среднем ухе.</p></li><li><p><em>Улитка</em>: превращает вибрации в нервные сигналы.</p></li><li><p><em>Слуховой нерв и мозг</em>: обрабатывают сигналы и распознают звук.</p></li></ul><p></p>	\N	\N	\N	\N	published	2025-12-05 04:55:32.478	2025-12-10 09:50:38.168	{}	{bolalarda-eshitish-buzilishini-davolash-va-reabilitatsiya,bolalarda-eshitish-buzilishining-sabablari,bolalarda-eshitish-buzilishining-belgilari,bolalarda-eshitish-qanday-rivojlanadi}	\N
cmih32wrc002aab1n409i1d8r	about	Biz haqimizda — Acoustic eshitish markazi	О нас — Центр слуха Acoustic	<p><strong>Acoustic — bu O‘zbekistonda eshitish salomatligini yaxshilashga ixtisoslashgan zamonaviy eshitish markazlari tarmog‘i. Biz bolalar va kattalarning eshitish qobiliyatini chuqur diagnostika qilish, to‘g‘ri yechim tanlash va doimiy qo‘llab-quvvatlash orqali hayot sifatini oshirishga xizmat qilamiz.</strong></p><h3><br><strong>🎧 Bizning faoliyatimiz</strong></h3><p><strong><br>🔹 Eshitishni to‘liq diagnostika qilish</strong><br>\t•\t🎯 Audiometriya — tovushlarni eshitish darajasini aniqlash<br>\t•\t📈 Timpanometriya — o‘rta quloq holatini tekshirish<br>\t•\t🧠 KSVP (ABR) — eshitish nervi faoliyatini baholash<br>\t•\t👶 OAE testi — yangi tug‘ilgan chaqaloqlardan kattalargacha<br>\t•\t⚖️ Vestibulyar diagnostika — bosh aylanishi va muvozanat buzilishlarini aniqlash</p><h3><br><strong>🎛 Biz taklif qiladigan yechimlar</strong></h3><p><br><strong>🔹 Eshitish moslamalarini tanlash va sozlash</strong><br><strong>Rasmiy hamkor brendlar:</strong><br>\t•\tReSound (Daniya)<br>\t•\tOticon (Daniya)<br>\t•\tSignia (Germaniya)<br>\t•\tInteracoustics (tibbiy jihozlar)<br><strong>Moslamalar turlari:</strong><br>\t•\tBTE — quloq orqasidagi apparatlar<br>\t•\tRIC — ingichka va qulay modellari<br>\t•\tITE/ITC/CIC — quloq ichidagi individual moslamalar<br>\t•\tKuchli va ultra-kuchli modellar<br><strong>🔹 Servis va kuzatuv</strong><br>\t•\tShaxsiy audiogramma asosida sozlash<br>\t•\tMuntazam profilaktika<br>\t•\tTozalash va texnik xizmat<br>\t•\tMobil ilovalar orqali boshqaruv bo‘yicha yordam<br><strong>🔹 Bir tomonlama eshitish pasayishi uchun yechimlar</strong><br>\t•\tCROS/BiCROS tizimlari<br>\t•\tOchiq turdagi RIC moslamalar<br>\t•\tKuchli individual yechimlar</p><h3><br><strong>🤝 Bizning yondashuv</strong></h3><p><br>\t•\t✔ Individual yondashuv — har bir bemor uchun alohida reja<br>\t•\t✔ Aniq diagnostika — Interacoustics jihozlarida<br>\t•\t✔ Tajribali mutaxassislar — audiolog, surdolog, LOR shifokorlar<br>\t•\t✔ Bolalar uchun maxsus sharoitlar — xavfsiz, tezkor va og‘riqsiz usullar</p><h3><br><strong>🎯 Bizning maqsad</strong></h3><p><br>Odamlarga tabiiy, ravshan va aniq eshitish imkonini qaytarish, hayot sifatini yaxshilash va eshitish muammosi sababli cheklovlarsiz yashashga ko‘maklashish.<br><strong>⭐ Nega aynan Acoustic?</strong><br>\t•\t10+ yillik tajriba<br>\t•\tKo‘plab filiallar va qulay joylashuv<br>\t•\tMinglab bemorlarga yordam<br>\t•\tAsl, sertifikatlangan jihozlar<br>\t•\tDoimiy qo‘llab-quvvatlash va halol xizmat<br></p><p></p>	<p><strong>Acoustic — это сеть современных центров слуха, специализирующихся на диагностике, подборе и обслуживании слуховых аппаратов. Мы помогаем детям и взрослым улучшить слух, комфортно общаться и жить полной жизнью.</strong></p><h3><br>🎧 Наша деятельность</h3><p>\n🔹 Комплексная диагностика слуха\n\t•\t🎯 Аудиометрия — определение снижения на разных частотах\n\t•\t📈 Тимпанометрия — оценка состояния среднего уха\n\t•\t🧠 КСВП (ABR) — проверка работы слухового нерва\n\t•\t👶 ОАЭ — быстрый тест для детей и взрослых\n\t•\t⚖️ Вестибулярная диагностика — определение причин головокружения</p><h3><br><strong>🎛 Наши решения</strong><br></h3><p><strong>🔹 Подбор и настройка слуховых аппаратов</strong></p><p>\nОфициальные партнёры:\n\t•\tReSound (Дания)\n\t•\tOticon (Дания)\n\t•\tSignia (Германия)\n\t•\tInteracoustics (медицинское оборудование)\n<strong>Типы аппаратов:</strong>\n\t•\tBTE — заушные аппараты\n\t•\tRIC — компактные модели\n\t•\tITE/ITC/CIC — внутриушные и внутриканальные устройства\n\t•\tУстройства высокой и сверхвысокой мощности\n<strong>🔹 Сопровождение и сервис</strong>\n\t•\tИндивидуальная настройка по аудиограмме\n\t•\tРегулярная профилактика\n\t•\tЧистка и обслуживание\n\t•\tКонсультации по мобильным приложениям и аксессуарам\n<strong>🔹 Решения при односторонней тугоухости</strong>\n\t•\tСистемы CROS/BiCROS\n\t•\tОткрытые RIC-модели\n\t•\tУсиленные аппараты для сложных случаев</p><h3><br><strong>🤝 Наш подход</strong></h3><p>\n\t•\t✔ Индивидуальность — учитываем возраст, потребности и стиль жизни\n\t•\t✔ Точная диагностика — оборудование Interacoustics\n\t•\t✔ Опытные специалисты — сурдологи, аудиологи, ЛОР-врачи\n\t•\t✔ Комфорт для детей — отдельные кабинеты, адаптированные методы</p><h3><br><strong>🎯 Наша миссия</strong></h3><p><br>Возвращать людям чистый, естественный звук, помогать уверенно общаться и жить без ограничений, связанных с нарушениями слуха.</p><h3><br><strong>⭐ Почему выбирают Acoustic?</strong></h3><p>\n\t•\tБолее 10 лет опыта\n\t•\tЦентры в разных регионах\n\t•\tТысячи довольных пациентов\n\t•\tСертифицированное оборудование\n\t•\tПостоянная поддержка и честный сервис</p><p></p>	\N	\N	\N	\N	published	2025-11-27 06:59:51.769	2025-12-15 08:06:42.029	{}	{audiologiya-amaliyotidan-muhim-bilimlar-seminar-videodan-lavhalar,eshitishning-yomonlashishiga-tasir-qiluvchi-sabablar,bolalarda-eshitish-qanday-rivojlanadi,karliqlikni-davolash-mumkinmi,inson-eshitish-organi-qanday-tuzilgan,oticon-more-1-yangi-avlod,bolalar-uchun-eshitish-apparatlari,eshitish-yoqotilishi-demensiya,diabet-eshitish-yoqotilishi}	https://www.youtube.com/watch?v=vE50kUsexjA
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Post" (id, title_uz, title_ru, body_uz, body_ru, slug, excerpt_uz, excerpt_ru, "coverId", tags, status, "publishAt", "createdAt", "updatedAt", "authorId", "categoryId", "postType") FROM stdin;
cmj5i2dy00008uzp4f48lb62s	Inson eshitish organi qanday tuzilgan?	Как устроен орган слуха человека?	<p>Eshitish organi inson tanasidagi eng murakkab tizimlardan biridir. U tovush tebranishlarini qabul qilib, ularni miyaga yetkazadigan murakkab mexanizmdan iborat. Inson eshitish organi <strong>uch asosiy qismdan</strong> tashkil topgan.</p><p><strong>1. Tashqi quloq</strong></p><p>Tashqi quloq quloq peshonasi va quloq kanalidan iborat. U tovush to‘lqinlarini yig‘ib, quloq pardasiga yo‘naltiradi. Quloq peshonasining shakli tovush manbasini aniqlashga yordam beradi.</p><p><strong>2. O‘rta quloq</strong></p><p>O‘rta quloqda quloq pardasi va uchta mayda suyakcha — bolg‘acha, sandoncha va uzangi joylashgan. Quloq pardasi tebranganda, suyakchalar bu tebranishni kuchaytirib ichki quloqqa uzatadi. O‘rta quloqda joylashgan Eustaxiy nayi bosimni tenglashtirish vazifasini bajaradi.</p><p><strong>3. Ichki quloq</strong></p><p>Ichki quloqning asosiy qismi — koklea. U suyuqlik bilan to‘lgan bo‘lib, ichida tukchali hujayralar joylashgan. Ushbu hujayralar tovush tebranishlarini nerv impulslariga aylantiradi. Hosil bo‘lgan impulslar eshitish nervi orqali miyaga uzatiladi.</p><p><strong>Miyaning roli</strong></p><p>Miya tovushni faqat eshitibgina qolmay, balki uni tahlil qiladi: balandlik, tembr, yo‘nalish va ma’nosini aniqlaydi. Shu sababli eshitish — bu faqat quloq emas, balki <strong>miya faoliyati bilan bog‘liq murakkab jarayon</strong>.</p>	<p>Орган слуха является одной из самых сложных систем в организме человека. Он представляет собой сложный механизм, который принимает звуковые колебания и передаёт их в головной мозг. Орган слуха человека состоит из <strong>трёх основных частей</strong>.</p><p><strong>1. Наружное ухо</strong></p><p>Наружное ухо состоит из ушной раковины и слухового прохода. Оно собирает звуковые волны и направляет их к барабанной перепонке. Форма ушной раковины помогает определить направление источника звука.</p><p><strong>2. Среднее ухо</strong></p><p>В среднем ухе расположены барабанная перепонка и три маленькие слуховые косточки — молоточек, наковальня и стремечко. При колебании барабанной перепонки эти косточки усиливают звук и передают его во внутреннее ухо.<br>Также в среднем ухе находится евстахиева труба, которая выполняет функцию выравнивания давления.</p><p><strong>3. Внутреннее ухо</strong></p><p>Основной частью внутреннего уха является улитка. Она заполнена жидкостью и содержит чувствительные волосковые клетки. Эти клетки преобразуют звуковые колебания в нервные импульсы. Образованные импульсы передаются в мозг по слуховому нерву.</p><p><strong>Роль головного мозга</strong></p><p>Головной мозг не просто воспринимает звук, но и анализирует его: определяет громкость, тембр, направление и смысл. Именно поэтому слух — это не только работа уха, но и <strong>сложный процесс, связанный с деятельностью головного мозга</strong>.</p>	inson-eshitish-organi-qanday-tuzilgan	Inson eshitish organi uch asosiy qismdan tashkil topgan.	Орган слуха человека состоит из трёх основных частей.	cmj5hneut0001uzp4lw4l4ns2	{eshitish,quloq,organ,tuzilma}	published	2025-12-14 09:02:53.655	2025-12-14 09:05:49.849	2025-12-14 18:20:42.014	\N	cmj61r1jo0000t05muzl2433a	article
cmj6sgjpg000311taykn94zu8	Bolalarda eshitish qanday rivojlanadi?	Как развивается слух у ребёнка?	<p>Bola dunyoga kelgan ilk kunlardan boshlab eshitish orqali atrof-muhitni anglay boshlaydi. Eshitish — nutq, fikrlash, ijtimoiy ko‘nikmalar va idrok rivojlanishining eng asosiy omillaridan biridir. Bola eshitmasa, u atrofdagi tovushlarni qabul qila olmaydi, shu sababli nutq shakllanishi sekinlashadi yoki to‘xtab qoladi.</p><h3><strong>Yangi tug‘ilgan chaqaloqda eshitishning shakllanishi</strong></h3><ul><li><p>Tug‘ilgan paytda eshitish tizimi yetarli darajada rivojlangan bo‘ladi.</p></li><li><p>Chaqaloq baland tovushlardan cho‘chishi, ovoz yo‘nalishiga e’tibor qaratishi mumkin.</p></li><li><p>2–3 oyligidan boshlab bola tanish ovozlarga kulib javob qaytara boshlaydi.</p></li><li><p>6 oyligida tovush manbasini aniqroq izlaydi.</p></li><li><p>9–12 oylikda eshitish orqali so‘zlarni tanish va oddiy buyruqlarni tushunish boshlanadi.</p></li></ul><p>Aynan shu davrda eshitishning buzilishi sezilsa, uni erta aniqlash juda muhim hisoblanadi.</p><h3><strong>Eshitish normal rivojlanmasa nima bo‘ladi?</strong></h3><p>Agar bola eshitmasa yoki past eshitadigan bo‘lsa:</p><ul><li><p>nutqi kechikadi,</p></li><li><p>tovushlarni to‘g‘ri talaffuz qilolmaydi,</p></li><li><p>atrofga javob reaksiyasi sust bo‘ladi,</p></li><li><p>ijtimoiy muloqotda qiynaladi,</p></li><li><p>o‘rganish jarayoni sekinlashadi.</p></li></ul><p>Buning oldini olishning yagona yo‘li — <strong>erta diagnostika</strong>.</p><h3><strong>Eshitish nega erta tekshiriladi?</strong></h3><p>Erta aniqlangan eshitish buzilishlari:</p><ul><li><p>osonroq korreksiya qilinadi,</p></li><li><p>reabilitatsiya samaradorligi yuqori bo‘ladi,</p></li><li><p>nutq rivojlanishi to‘liq tiklanishi mumkin,</p></li><li><p>ijtimoiy moslashuv sezilarli ravishda yaxshilanadi.</p></li></ul><p></p>	<p>Ребёнок с первых дней жизни начинает познавать окружающий мир с помощью слуха. Слух является одним из ключевых факторов развития речи, мышления, социальных навыков и общего восприятия. Если ребёнок не слышит, он не может воспринимать звуки окружающей среды, из-за чего формирование речи замедляется или может полностью остановиться.</p><h3><strong>Формирование слуха у новорождённого</strong></h3><ul><li><p>При рождении слуховая система ребёнка уже достаточно развита.</p></li><li><p>Младенец может вздрагивать от громких звуков и реагировать на направление голоса.</p></li><li><p>С 2–3 месяцев ребёнок начинает улыбаться и реагировать на знакомые голоса.</p></li><li><p>В 6 месяцев он более точно ищет источник звука.</p></li><li><p>В возрасте 9–12 месяцев начинается распознавание слов на слух и понимание простых команд.</p></li></ul><p>Именно в этот период особенно важно своевременно выявить возможные нарушения слуха.</p><h3><strong>Что происходит, если слух развивается неправильно?</strong></h3><p>Если ребёнок не слышит или слышит плохо:</p><ul><li><p>задерживается развитие речи,</p></li><li><p>нарушается правильное произношение звуков,</p></li><li><p>снижается реакция на окружающие раздражители,</p></li><li><p>возникают трудности в социальном общении,</p></li><li><p>замедляется процесс обучения.</p></li></ul><p>Единственный способ предотвратить эти последствия — <strong>ранняя диагностика</strong>.</p><h3><strong>Почему важно раннее обследование слуха?</strong></h3><p>Раннее выявление нарушений слуха позволяет:</p><ul><li><p>легче проводить коррекцию,</p></li><li><p>добиться высокой эффективности реабилитации,</p></li><li><p>полностью восстановить или значительно улучшить развитие речи,</p></li><li><p>существенно улучшить социальную адаптацию ребёнка.</p></li></ul><p></p>	bolalarda-eshitish-qanday-rivojlanadi	Bola dunyoga kelgan ilk kunlardan boshlab eshitish orqali atrof-muhitni anglay boshlaydi.	Ребёнок с первых дней жизни начинает познавать окружающий мир с помощью слуха.	cmizkyoog000aco33gu5xl84u	{}	published	2025-12-15 06:41:25.59	2025-12-15 06:44:32.836	2025-12-15 06:44:58.453	\N	cmj6qjzwc000111tar6rwirvl	article
cmj6stya7000511taomddxq7w	Karliqlikni davolash mumkinmi?	Можно ли вылечить тугоухость?	<p>Karliqlik — eshitish qobiliyatining qisman yoki to‘liq yo‘qolishi bo‘lib, u turli sabablarga ko‘ra yuzaga keladi. Ko‘pchilikni qiziqtiradigan eng muhim savol: <strong>karliqlikni davolash mumkinmi?</strong> Bu savolga javob bir xil emas, chunki davolash imkoniyati karliqlikning <strong>turiga, sababiga va qanchalik erta aniqlanganiga</strong> bog‘liq.</p><p><strong>Karliqlik turlari</strong></p><p>Karliqlik asosan ikki asosiy turga bo‘linadi:</p><p><strong>1. O‘tkazuvchi karliqlik</strong></p><p>Bu tovushning tashqi yoki o‘rta quloqdan ichki quloqqa yetib borishida to‘sqinlik bo‘lganda yuzaga keladi. Masalan:</p><ul><li><p>quloqdagi mum to‘planishi,</p></li><li><p>o‘rta quloq yallig‘lanishi,</p></li><li><p>quloq pardasining shikastlanishi,</p></li><li><p>o‘rta quloq suyakchalarining harakatsizlanishi.</p></li></ul><p><span>👉</span> <strong>Bu turdagi karliqlik ko‘p hollarda to‘liq davolanadi.</strong> To‘g‘ri davo yoki kichik jarrohlik muolajalari orqali eshitish tiklanadi.</p><p><strong>2. Sensorinevral karliqlik</strong></p><p>Bu ichki quloqdagi tukchali hujayralar yoki eshitish nervining shikastlanishi natijasida yuzaga keladi. Sabablari:</p><ul><li><p>yoshga bog‘liq o‘zgarishlar,</p></li><li><p>baland shovqin ta’siri,</p></li><li><p>tug‘ma omillar,</p></li><li><p>ayrim dori vositalari,</p></li><li><p>kuchli infeksiyalar.</p></li></ul><p><span>👉</span> <strong>Bu turdagi karliqlik odatda to‘liq davolanmaydi</strong>, ammo zamonaviy texnologiyalar yordamida eshitish sezilarli darajada yaxshilanishi mumkin.</p><p><strong>Davolash va yordam usullari</strong></p><p><strong>Eshitish moslamalari</strong></p><p>Sensorinevral karliqlikda eng samarali yechimlardan biri. Ular tovushni kuchaytirib, nutqni aniqroq eshitishga yordam beradi va kundalik hayotni yengillashtiradi.</p><p><strong>Koxlear implant</strong></p><p>Agar ichki quloq butunlay ishlamasa va eshitish moslamasi foyda bermasa, koxlear implant qo‘llaniladi. U eshitish nervini bevosita stimulyatsiya qilib, miyaga tovush signalini uzatadi.</p><p><strong>Reabilitatsiya</strong></p><p>Eshitish moslamasi yoki implantdan keyin nutq va eshitishni qayta o‘rganish muhim. Maxsus mashg‘ulotlar orqali miya yangi tovushlarni anglashga moslashadi.</p><p><strong>Xulosa</strong></p><p>Karliqlikni davolash mumkinmi degan savolga javob — <strong>ha, lekin hamma holatda emas</strong>. Eng muhim omil — <strong>erta tashxis va to‘g‘ri yondashuv</strong>. Qanchalik erta murojaat qilinsa, natija shunchalik yaxshi bo‘ladi.</p>	<p>Тугоухость — это частичная или полная потеря слуха, которая может возникать по различным причинам. Один из самых частых вопросов: <strong>можно ли вылечить тугоухость?</strong><br>Ответ на этот вопрос не всегда однозначен, поскольку возможность лечения зависит от <strong>типа тугоухости, причины её возникновения и того, насколько рано она была выявлена</strong>.</p><p><strong>Виды тугоухости</strong></p><p>Тугоухость в основном подразделяется на два основных типа:</p><p><strong>1. Проводящая тугоухость</strong></p><p>Этот вид возникает, когда звук не может свободно проходить из наружного или среднего уха во внутреннее ухо. К таким причинам относятся:</p><ul><li><p>скопление серы в слуховом проходе,</p></li><li><p>воспаление среднего уха,</p></li><li><p>повреждение барабанной перепонки,</p></li><li><p>ограничение подвижности слуховых косточек среднего уха.</p></li></ul><p><span>👉</span> <strong>В большинстве случаев проводящая тугоухость полностью поддаётся лечению.</strong><br>При правильном медикаментозном лечении или небольшом хирургическом вмешательстве слух может полностью восстановиться.</p><p><strong>2. Сенсоневральная тугоухость</strong></p><p>Этот тип тугоухости связан с повреждением волосковых клеток внутреннего уха или слухового нерва. Основные причины:</p><ul><li><p>возрастные изменения,</p></li><li><p>длительное воздействие громкого шума,</p></li><li><p>врождённые факторы,</p></li><li><p>приём некоторых лекарственных препаратов,</p></li><li><p>тяжёлые инфекционные заболевания.</p></li></ul><p><span>👉</span> <strong>Сенсоневральная тугоухость, как правило, не поддаётся полному излечению</strong>,<br>однако с помощью современных технологий слух можно значительно улучшить.</p><p><strong>Методы лечения и помощи</strong></p><p><strong>Слуховые аппараты</strong></p><p>Один из самых эффективных способов помощи при сенсоневральной тугоухости. Слуховые аппараты усиливают звук, улучшают разборчивость речи и значительно облегчают повседневную жизнь.</p><p><strong>Кохлеарный имплант</strong></p><p>Если внутреннее ухо полностью утратило свою функцию и слуховые аппараты не приносят пользы, применяется кохлеарная имплантация. Имплант напрямую стимулирует слуховой нерв и передаёт звуковые сигналы в мозг.</p><p><strong>Реабилитация</strong></p><p>После установки слухового аппарата или кохлеарного импланта важно заново обучать слух и речь. С помощью специальных занятий мозг адаптируется к новым звукам и учится их правильно воспринимать.</p><p><strong>Заключение</strong></p><p>На вопрос <strong>«можно ли вылечить тугоухость?»</strong> ответ следующий:<br><strong>да, но не во всех случаях</strong>.</p><p>Самым важным фактором является <strong>ранняя диагностика и правильный подход к лечению</strong>. Чем раньше человек обращается за помощью, тем выше вероятность сохранить слух и улучшить качество жизни.</p>	karliqlikni-davolash-mumkinmi	Ko‘pchilikni qiziqtiradigan eng muhim savol: karliqlikni davolash mumkinmi?	Один из самых частых вопросов: можно ли вылечить тугоухость?	cmj5hn6s40000uzp4s0pghs3g	{}	published	2025-12-15 06:53:55.801	2025-12-15 06:54:58.256	2025-12-15 06:54:58.256	\N	cmj61r1jo0000t05muzl2433a	article
cmj6t2ick000711taotdvz4fi	Eshitishning yomonlashishiga ta’sir qiluvchi sabablar	Причины ухудшения слуха	<p>Eshitish qobiliyati hayot davomida turli omillar ta’sirida pasayishi mumkin. Bu jarayon ba’zan sekin, ba’zan esa to‘satdan yuz beradi. Sabablarni bilish — eshitishni saqlab qolishning eng muhim yo‘lidir.</p><h2><strong>Asosiy sabablar</strong></h2><h3><strong>1. Baland shovqin ta’siri</strong></h3><p>Uzoq vaqt davomida baland tovushda ishlash yoki musiqa tinglash ichki quloqdagi tukchali hujayralarni shikastlaydi. Bu hujayralar tiklanmaydi, natijada eshitish sekin-asta pasayadi.</p><h3><strong>2. Yoshga bog‘liq o‘zgarishlar</strong></h3><p>Yoshi ulg‘aygan sari eshitish tizimi ham tabiiy ravishda eskiradi. Avval baland bo‘lmagan va yuqori chastotali tovushlar eshitilmay qoladi.</p><h3><strong>3. Quloq kasalliklari</strong></h3><p>O‘rta quloq yallig‘lanishi, surunkali otit, quloq pardasining shikastlanishi eshitish pasayishiga olib keladi. Vaqtida davolanmasa, muammo doimiy tus olishi mumkin.</p><h3><strong>4. Quloqdagi mum to‘planishi</strong></h3><p>Oddiy, ammo juda keng tarqalgan sabab. Mum quloq kanalini to‘sib qo‘yadi va tovush o‘tishini kamaytiradi.</p><h3><strong>5. Dori vositalari</strong></h3><p>Ba’zi kuchli dorilar ichki quloqqa zarar yetkazishi mumkin. Shuning uchun dorilarni faqat shifokor tavsiyasi bilan qabul qilish kerak.</p><h3><strong>6. Travmalar</strong></h3><p>Boshga zarba, portlash ovozi, quloq pardasining yirtilishi eshitish nerviga jiddiy zarar yetkazadi.</p><p><strong>Oldini olish</strong></p><ul><li><p>baland shovqindan himoyalanish,</p></li><li><p>quloq gigiyenasiga rioya qilish,</p></li><li><p>muntazam tekshiruvdan o‘tish,</p></li><li><p>o‘z vaqtida shifokorga murojaat qilish.</p></li></ul><p></p>	<p>Слуховая способность может снижаться на протяжении жизни под воздействием различных факторов. Этот процесс иногда развивается постепенно, а иногда происходит внезапно. Знание причин — один из самых важных способов сохранить слух.</p><h2><strong>Основные причины</strong></h2><h3><strong>1. Воздействие громкого шума</strong></h3><p>Длительная работа в условиях громкого шума или регулярное прослушивание громкой музыки повреждает волосковые клетки внутреннего уха. Эти клетки не восстанавливаются, в результате чего слух постепенно ухудшается.</p><h3><strong>2. Возрастные изменения</strong></h3><p>С возрастом слуховая система естественным образом изнашивается. В первую очередь снижается восприятие тихих и высокочастотных звуков.</p><h3><strong>3. Заболевания уха</strong></h3><p>Воспаление среднего уха, хронический отит, повреждение барабанной перепонки приводят к снижению слуха. При отсутствии своевременного лечения проблема может стать постоянной.</p><h3><strong>4. Скопление ушной серы</strong></h3><p>Простая, но очень распространённая причина. Сера перекрывает слуховой проход и снижает прохождение звука.</p><h3><strong>5. Лекарственные препараты</strong></h3><p>Некоторые сильнодействующие препараты могут повреждать внутреннее ухо. Поэтому любые лекарства следует принимать только по рекомендации врача.</p><h3><strong>6. Травмы</strong></h3><p>Удары по голове, взрывные звуки, разрыв барабанной перепонки могут серьёзно повредить слуховой нерв.</p><p><strong>Профилактика</strong></p><ul><li><p>защита от громкого шума,</p></li><li><p>соблюдение гигиены ушей,</p></li><li><p>регулярные профилактические обследования,</p></li><li><p>своевременное обращение к врачу.</p></li></ul><p></p>	eshitishning-yomonlashishiga-tasir-qiluvchi-sabablar	Sabablarni bilish — eshitishni saqlab qolishning eng muhim yo‘lidir.	Знание причин — один из самых важных способов сохранить слух.	cmj5hnhte0002uzp4yo2t5vkx	{}	published	2025-12-15 06:58:57.633	2025-12-15 07:01:37.509	2025-12-15 07:15:37.045	cmizkm8gg0004co331xg28rqz	cmj61r1jo0000t05muzl2433a	article
cmj6tqew5000911tah92317o1	Audiologiya amaliyotidan muhim bilimlar — seminar videodan lavhalar 🎥	Важные знания из практики аудиологии — фрагменты с семинара 🎥	<p>🎓 Seminar otolaringolog-surdolog Tohir Nishonov tomonidan olib borildi.</p><p>Videoda zamonaviy audiologik tashxislar, klinik yondashuvlar va amaliy tajribalar haqida muhim tushunchalar berilgan.</p><p>Bu kabi tadbirlar mutaxassislar uchun:</p><p>🔹 bilimlarni mustahkamlash</p><p>🔹 tajriba almashish</p><p>🔹 amaliy ko‘nikmalarni rivojlantirishga xizmat qiladi.</p><p>Acoustic eshitish markazi audiologiya sohasida professional rivojlanishni qo‘llab-quvvatlashda davom etadi. 🎧</p><p>Videoni YouTube-da tomosha qiling : [youtube id="UEhPsLHnTSQ"]</p>	<p>🎓 <strong>Семинар был проведён оториноларингологом-сурдологом Тохиром Нишоновым.</strong></p><p>В видео представлены важные сведения о современных аудиологических методах диагностики, клинических подходах и практическом опыте.</p><p>Подобные мероприятия способствуют профессиональному развитию специалистов, а именно:</p><p>🔹 укреплению знаний<br>🔹 обмену опытом<br>🔹 развитию практических навыков</p><p><strong>Слуховой центр Acoustic</strong> продолжает поддерживать профессиональное развитие в области аудиологии. 🎧</p><p><strong>Смотрите видео на YouTube:</strong><br>[youtube id="UEhPsLHnTSQ"]</p>	audiologiya-amaliyotidan-muhim-bilimlar-seminar-videodan-lavhalar	\N	\N	cmj71kf3a000k11tauh230j89	{}	published	2025-12-15 07:18:34.792	2025-12-15 07:20:12.773	2025-12-15 10:59:32.967	\N	\N	news
cmj71pexm000m11ta9xcc8hel	Acoustic eshitish markazida o‘quv seminar boshlandi 🎓	В центре слуха Acoustic начался обучающий семинар 🎓	<p>Acoustic eshitish markazi xodimlarining malakasini oshirish maqsadida navbatdagi o‘quv seminar boshlandi. 📘</p><p>Mazkur darslar davomida xizmat ko‘rsatish sifatini yanada yaxshilash, zamonaviy yondashuvlarni o‘rganish va yangi bilim hamda ko‘nikmalarni egallashga alohida e’tibor qaratiladi. 👂🔍</p><p>Seminarlar mutaxassislarning kasbiy rivojlanishi, bilimlarni yangilab borish va mijozlarga yanada aniq, ishonchli va sifatli xizmat ko‘rsatishga xizmat qiladi. 🤝✨</p><p>Acoustic — bilim va sifatni ustuvor deb biladi. 🎧</p>	<p><strong>В центре слуха Acoustic стартовал очередной обучающий семинар, направленный на повышение квалификации сотрудников. 📘</strong></p><p>В ходе занятий особое внимание уделяется повышению качества обслуживания, изучению современных подходов, а также освоению новых знаний и практических навыков. 👂🔍</p><p>Семинары способствуют профессиональному развитию специалистов, регулярному обновлению знаний и обеспечению более точного, надёжного и качественного сервиса для клиентов. 🤝✨</p><p><strong>Acoustic — мы выбираем знания и качество как приоритет. 🎧</strong></p>	acoustic-eshitish-markazida-oquv-seminar-boshlandi	\N	\N	cmj71pz5f000n11takmxdwl8t	{}	published	2025-12-15 11:01:21.322	2025-12-15 11:03:23.098	2025-12-15 11:03:51.863	\N	\N	news
\.


--
-- Data for Name: PostCategory; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."PostCategory" (id, name_uz, name_ru, slug, description_uz, description_ru, "order", status, "createdAt", "updatedAt", section, "imageId") FROM stdin;
cmj61r1jo0000t05muzl2433a	Eshitish muammolari	Проблемы слуха	eshitish-muammolari	\N	\N	0	published	2025-12-14 18:16:52.884	2025-12-14 18:20:01.248	patients	\N
cmj6qjzwc000111tar6rwirvl	Bolalarda eshitish muammolari	Проблемы слуха у детей	Bolalarda-eshitish-muammolari	\N	\N	0	published	2025-12-15 05:51:14.556	2025-12-15 05:51:14.556	children	\N
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Product" (id, name_uz, name_ru, slug, description_uz, description_ru, price, stock, "brandId", "categoryId", "galleryIds", status, "createdAt", "updatedAt", audience, "availabilityStatus", "formFactors", "hearingLossLevels", "paymentOptions", "powerLevel", "signalProcessing", "smartphoneCompatibility", "specsText", "tinnitusSupport", benefits_ru, benefits_uz, features_ru, features_uz, "fittingRange_ru", "fittingRange_uz", "galleryUrls", intro_ru, intro_uz, "regulatoryNote_ru", "regulatoryNote_uz", "relatedProductIds", tech_ru, tech_uz, "usefulArticleSlugs", "productType", "thumbnailId") FROM stdin;
cmks9k5j70000dlb82uzbygt4	SIGNIA Active Pro	SIGNIA Active Pro	signia-active-pro	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.595	2026-01-24 12:06:06.595	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5je0001dlb8qohh7m54	SIGNIA Active	SIGNIA Active	signia-active	\N	\N	8450000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.603	2026-01-24 12:06:06.603	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5jj0002dlb8l8fegw6b	SIGNIA INTUIS SP 4.0	SIGNIA INTUIS SP 4.0	signia-intuis-sp-40	\N	\N	3900000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.607	2026-01-24 12:06:06.607	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5jn0003dlb81c786442	SIGNIA INTUIS P 4.0	SIGNIA INTUIS P 4.0	signia-intuis-p-40	\N	\N	3900000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.612	2026-01-24 12:06:06.612	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5js0004dlb87x5741u2	SIGNIA INTUIS M 4.0	SIGNIA INTUIS M 4.0	signia-intuis-m-40	\N	\N	3900000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.616	2026-01-24 12:06:06.616	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5jv0005dlb8lq2dhx81	SIGNIA INTUIS SP 4.2	SIGNIA INTUIS SP 4.2	signia-intuis-sp-42	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.62	2026-01-24 12:06:06.62	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5k00006dlb8j40qlh52	SIGNIA INTUIS P 4.2	SIGNIA INTUIS P 4.2	signia-intuis-p-42	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.624	2026-01-24 12:06:06.624	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5k40007dlb8aj749020	SIGNIA INTUIS M 4.2	SIGNIA INTUIS M 4.2	signia-intuis-m-42	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.629	2026-01-24 12:06:06.629	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5k90008dlb87jppk4it	SIGNIA INTUIS SP 4.1	SIGNIA INTUIS SP 4.1	signia-intuis-sp-41	\N	\N	5200000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.633	2026-01-24 12:06:06.633	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5ke0009dlb8xvn6k6rc	SIGNIA INTUIS P 4.1	SIGNIA INTUIS P 4.1	signia-intuis-p-41	\N	\N	5200000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.638	2026-01-24 12:06:06.638	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5ki000adlb8kks0uhc1	SIGNIA INTUIS M 4.1	SIGNIA INTUIS M 4.1	signia-intuis-m-41	\N	\N	5200000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.642	2026-01-24 12:06:06.642	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5kl000bdlb8ujsxfh71	SIGNIA Insio 7NX CIC	SIGNIA Insio 7NX CIC	signia-insio-7nx-cic	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.646	2026-01-24 12:06:06.646	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5kq000cdlb8gevkfxbo	SIGNIA Insio 3NX CIC	SIGNIA Insio 3NX CIC	signia-insio-3nx-cic	\N	\N	7800000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.65	2026-01-24 12:06:06.65	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5kv000ddlb84kbif2w7	SIGNIA Styletto 7AX	SIGNIA Styletto 7AX	signia-styletto-7ax	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.655	2026-01-24 12:06:06.655	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5kz000edlb8copz4wzb	SIGNIA Styletto 3AX	SIGNIA Styletto 3AX	signia-styletto-3ax	\N	\N	12000000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.659	2026-01-24 12:06:06.659	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5l3000fdlb8qjn3hn26	SIGNIA Styletto 1AX	SIGNIA Styletto 1AX	signia-styletto-1ax	\N	\N	7800000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.664	2026-01-24 12:06:06.664	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5l7000gdlb83jdbtsf0	SIGNIA Styletto 7X	SIGNIA Styletto 7X	signia-styletto-7x	\N	\N	18200000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.668	2026-01-24 12:06:06.668	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5lb000hdlb8qskok5az	SIGNIA Styletto 3X	SIGNIA Styletto 3X	signia-styletto-3x	\N	\N	10725000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.672	2026-01-24 12:06:06.672	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5lg000idlb8msbmzxrc	SIGNIA Styletto 1X	SIGNIA Styletto 1X	signia-styletto-1x	\N	\N	7150000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.676	2026-01-24 12:06:06.676	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5lj000jdlb8hq7ru97x	SIGNIA Pure 312 7AX	SIGNIA Pure 312 7AX	signia-pure-312-7ax	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.68	2026-01-24 12:06:06.68	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5lo000kdlb8e3j5pwvh	SIGNIA Pure 312 3AX	SIGNIA Pure 312 3AX	signia-pure-312-3ax	\N	\N	10400000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.684	2026-01-24 12:06:06.684	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5lt000ldlb8kzxghqs3	SIGNIA Pure 312 1AX	SIGNIA Pure 312 1AX	signia-pure-312-1ax	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.69	2026-01-24 12:06:06.69	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5m1000mdlb8cgtqk7tt	SIGNIA PURE CHARGE&GO 7AX	SIGNIA PURE CHARGE&GO 7AX	signia-pure-chargego-7ax	\N	\N	20800000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.697	2026-01-24 12:06:06.697	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5m7000ndlb8ey7wrgvx	SIGNIA PURE CHARGE&GO 3AX	SIGNIA PURE CHARGE&GO 3AX	signia-pure-chargego-3ax	\N	\N	11050000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.703	2026-01-24 12:06:06.703	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5mb000odlb8vf5qbapp	SIGNIA PURE CHARGE&GO 1AX	SIGNIA PURE CHARGE&GO 1AX	signia-pure-chargego-1ax	\N	\N	6500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.708	2026-01-24 12:06:06.708	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5mg000pdlb81zvbhwkt	SIGNIA Pure 312 7X	SIGNIA Pure 312 7X	signia-pure-312-7x	\N	\N	16900000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.712	2026-01-24 12:06:06.712	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5ml000qdlb8zcx1km1p	SIGNIA Pure 312 3X	SIGNIA Pure 312 3X	signia-pure-312-3x	\N	\N	9100000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.717	2026-01-24 12:06:06.717	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5mq000rdlb8oe01qrez	SIGNIA Pure 312 1X	SIGNIA Pure 312 1X	signia-pure-312-1x	\N	\N	5200000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.722	2026-01-24 12:06:06.722	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5mu000sdlb8uk45884a	SIGNIA Motion SP 7Px	SIGNIA Motion SP 7Px	signia-motion-sp-7px	\N	\N	13000000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.727	2026-01-24 12:06:06.727	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5mz000tdlb8d5g09a9y	SIGNIA Motion SP 3Px	SIGNIA Motion SP 3Px	signia-motion-sp-3px	\N	\N	7800000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.731	2026-01-24 12:06:06.731	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5n4000udlb8w2hnn4w2	SIGNIA Motion SP 1Px	SIGNIA Motion SP 1Px	signia-motion-sp-1px	\N	\N	3900000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.737	2026-01-24 12:06:06.737	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5n8000vdlb83qy36zrh	SIGNIA MOTION CHARGE&GO 7X	SIGNIA MOTION CHARGE&GO 7X	signia-motion-chargego-7x	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.741	2026-01-24 12:06:06.741	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5nc000wdlb85twos9bo	SIGNIA MOTION CHARGE&GO 3X	SIGNIA MOTION CHARGE&GO 3X	signia-motion-chargego-3x	\N	\N	11050000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.745	2026-01-24 12:06:06.745	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5ng000xdlb81tkuwehc	SIGNIA MOTION CHARGE&GO 1X	SIGNIA MOTION CHARGE&GO 1X	signia-motion-chargego-1x	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.748	2026-01-24 12:06:06.748	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5nl000ydlb895rp1e44	SIGNIA MOTION CHARGE&GO SP 7X	SIGNIA MOTION CHARGE&GO SP 7X	signia-motion-chargego-sp-7x	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.753	2026-01-24 12:06:06.753	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5np000zdlb8io9wl8ze	SIGNIA MOTION CHARGE&GO SP 3X	SIGNIA MOTION CHARGE&GO SP 3X	signia-motion-chargego-sp-3x	\N	\N	11050000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.757	2026-01-24 12:06:06.757	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5nt0010dlb8w68z3v5s	SIGNIA MOTION CHARGE&GO SP 1X	SIGNIA MOTION CHARGE&GO SP 1X	signia-motion-chargego-sp-1x	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.762	2026-01-24 12:06:06.762	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5nx0011dlb86fss1rq9	SIGNIA MOTION CHARGE&GO P 7X	SIGNIA MOTION CHARGE&GO P 7X	signia-motion-chargego-p-7x	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.765	2026-01-24 12:06:06.765	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5o10012dlb858ipja48	SIGNIA MOTION CHARGE&GO P 3X	SIGNIA MOTION CHARGE&GO P 3X	signia-motion-chargego-p-3x	\N	\N	11050000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.77	2026-01-24 12:06:06.77	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5o50013dlb8e1qlu8gn	SIGNIA MOTION CHARGE&GO P 1X	SIGNIA MOTION CHARGE&GO P 1X	signia-motion-chargego-p-1x	\N	\N	5850000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.774	2026-01-24 12:06:06.774	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5o90014dlb8luvfgagc	SIGNIA Motion 13P 7Nx	SIGNIA Motion 13P 7Nx	signia-motion-13p-7nx	\N	\N	19500000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.778	2026-01-24 12:06:06.778	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5oo0017dlb8vfei4bfh	SIGNIA Motion 13P 3Nx	SIGNIA Motion 13P 3Nx	signia-motion-13p-3nx	\N	\N	10400000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.792	2026-01-24 12:06:06.792	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5os0018dlb8ve6xisn3	SIGNIA PROMPT CIC	SIGNIA PROMPT CIC	signia-prompt-cic	\N	\N	4550000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.796	2026-01-24 12:06:06.796	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5ow0019dlb85mwjlxdp	SIGNIA Prompt Click ITC L	SIGNIA Prompt Click ITC L	signia-prompt-click-itc-l	\N	\N	3250000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.801	2026-01-24 12:06:06.801	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5p1001adlb82omsod7o	SIGNIA Prompt Click CIC	SIGNIA Prompt Click CIC	signia-prompt-click-cic	\N	\N	3250000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.805	2026-01-24 12:06:06.805	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5p4001bdlb8j50scsgn	SIGNIA Prompt SP	SIGNIA Prompt SP	signia-prompt-sp	\N	\N	3250000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.809	2026-01-24 12:06:06.809	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5p8001cdlb8ga5y6yee	SIGNIA Prompt P	SIGNIA Prompt P	signia-prompt-p	\N	\N	3250000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.812	2026-01-24 12:06:06.812	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5pc001ddlb8nctmwc18	SIGNIA Prompt S	SIGNIA Prompt S	signia-prompt-s	\N	\N	3250000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.816	2026-01-24 12:06:06.816	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5pg001edlb8nfqfp8db	SIGNIA Run P	SIGNIA Run P	signia-run-p	\N	\N	1550000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.821	2026-01-24 12:06:06.821	{}	in-stock	{}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmks9k5oj0016dlb8ungx959w	SIGNIA Motion 13P 1Nx	SIGNIA Motion 13P 1Nx	signia-motion-13p-1nx	<p>SIGNIA Motion 13P 1Nx — bu zamonaviy eshitish moslamasi bo‘lib, 16 ta ovozni qayta ishlash kanali bilan jihozlangan va o‘rtacha hamda o‘rtacha-og‘ir darajadagi eshitish yo‘qotilishi bo‘lgan foydalanuvchilar uchun mo‘ljallangan. Model 105 dB gacha kuchaytirish imkonini beradi, bu esa shovqinli muhitda ham nutqni aniq eshitishga yordam beradi. 5900 Hz gacha bo‘lgan chastota diapazoni tovushlarning keng spektrini qamrab olib, tabiiy va boy eshitilishni ta’minlaydi.</p><p>NX platformasi atrof-muhitga intellektual moslashishni kafolatlab, murakkab akustik sharoitlarda nutqning aniqligini oshiradi. Qurilma shovqinni kamaytirish tizimi, nutqni ajratib berish texnologiyasi va ovoz balandligini avtomatik sozlash funksiyalari bilan jihozlangan. Ergonomik dizayn va ventilyatsiya tizimi esa kun bo‘yi qulay taqishni ta’minlaydi.</p><p>Shuningdek, Motion 13P 1Nx Bluetooth aksessuarlariga ulanishni qo‘llab-quvvatlaydi, bu telefon, televizor va boshqa qurilmalardan audiotni to‘g‘ridan-to‘g‘ri eshitish moslamasiga uzatish imkonini beradi. Bu model faol foydalanuvchilar uchun — yuqori ovoz sifati, qulaylik va zamonaviy texnologiyalarni qadrlaydiganlar uchun ideal tanlovdir.</p>	<p>SIGNIA Motion 13P 1Nx — это современный слуховой аппарат, оснащённый 16 каналами обработки звука и разработанный для пользователей с умеренной и средне-тяжёлой потерей слуха. Модель обеспечивает усиление до 105 дБ, что позволяет чётко воспринимать речь даже в шумной обстановке. Частотный диапазон до 5900 Hz охватывает широкий спектр звуков, обеспечивая естественное и насыщенное звучание. Платформа NX гарантирует интеллектуальную адаптацию к окружающей среде, улучшая разборчивость речи в сложных акустических условиях. Модель оснащена системой подавления шума, технологией выделения речи и функцией автоматической регулировки громкости. Эргономичный дизайн и система вентиляции обеспечивают комфортное ношение в течение всего дня. Motion 13P 1Nx также поддерживает возможность подключения к Bluetooth-аксессуарам, что позволяет транслировать аудио с телефона, телевизора и других устройств непосредственно в слуховой аппарат. Это делает модель идеальным выбором для активных пользователей, которые ценят качество звука, удобство и современные технологии.</p>	4550000.00	0	cmiknllmo000476v71d73sn03	\N	{}	archived	2026-01-24 12:06:06.788	2026-01-24 12:08:58.288	{}	in-stock	{bte}	{}	{cash,installment}	standard	digital	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	Платформа NX гарантирует интеллектуальную адаптацию к окружающей среде, улучшая разборчивость речи в сложных акустических условиях. Модель оснащена системой подавления шума, технологией...	NX platformasi atrof-muhitga intellektual moslashishni kafolatlab, murakkab akustik sharoitlarda nutqning aniqligini oshiradi. Qurilma shovqinni kamaytirish tizimi, nutqni ajratib berish texnologiyasi...	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmiknmo8t001xyud4fordflax	Desktop Charger for Key / LiNX Quattro	Desktop Charger for Key / LiNX Quattro	desktop-charger-for-key-linx-quattro	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo8r001vyud4iioppf93}	archived	2025-11-29 18:58:24.701	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/desktop-charger-for-key-linx-quattro-desktop_charger.webp}	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8r001vyud4iioppf93
cmiknmoae002xyud4nws3ffqz	ECLIPSE	ECLIPSE	eclipse	ixtiyoriy	Системы регистрации слуховых вызванных потенциалов Interacoustics Eclipse – оборудование, позволяющее выявлять широкий спектр патологий слуха. В процессе исследования фиксируются изменения электрической активности слуховой зоны мозга. Таким образом, специалист может определять минимальный уровень звука, стимулирующего ответную реакцию мозга.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5012 size-full" src="https://a.acoustic.uz/uploads/products/eclipse-eclipse-thumb.webp" alt="" width="1308" height="872" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;">Системы регистрации слуховых вызванных потенциалов приобретают в специализированные сурдологические центры, отделения неонатологии и клиники для исследования слуховой нейропатии, выявления возможных проблем со слухом у новорожденных, проверки работы кохлеарных имлантов, слуховых\r\nаппаратов. Система в сочетании с ПК включает в себя возможности для измерения всех аспектов слуховых вызванных потенциалов и отоакустической эмиссии. Данные управляются через единую базу данных с отчетами в печатном или в формате EMR (Electronocal Medical Report – электронная медицинская документация). Пользователи создают свои собственные системы, выбирая только те модули, которые им нужны, с возможностью функционального расширения системы при изменении потребностей.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Удвойте</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="21:10">амплитуду</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:4">вашего</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:8">отклика</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:17">Революционное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="70:6">семейство</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="61:8">стимулов</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="51:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="53:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="54:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="59:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="77:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="91:10">оценки</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="81:9">пороговых</span> значений <span class="EzKURWReUAB5oZgtQNkl" data-src-align="102:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="103:9">разработанное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="116:5">Клаусом</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="122:9">Элберлингом</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="131:1">)</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="133:15">компенсирует</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="184:5">время</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="177:6">прохождения</span> сигнала <span class="EzKURWReUAB5oZgtQNkl" data-src-align="159:8">по</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="168:8">улитке</span>, зависящее от <span class="EzKURWReUAB5oZgtQNkl" data-src-align="149:9">частоты</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="190:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="194:9">генерирует</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="204:18">сигналы</span>, которые в два <span class="EzKURWReUAB5oZgtQNkl" data-src-align="229:5">раза</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="239:4">больше</span>, чем у <span class="EzKURWReUAB5oZgtQNkl" data-src-align="247:11">традиционных</span> стимулов типа <span class="EzKURWReUAB5oZgtQNkl" data-src-align="259:5">щелчка</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="265:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="273:5">всплеска</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="268:4">звуковых</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="279:7">сигналов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="286:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="291:12">Оригинальный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="304:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="306:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="307:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="312:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="314:3">был</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="318:8">разработан</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="327:3">для</span> обеспечения <span class="EzKURWReUAB5oZgtQNkl" data-src-align="331:7">оптимальной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="348:9">амплитуды</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="339:8">отклика</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="358:2">при</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="361:6">средней</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="380:11">интенсивности</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="368:11">стимуляции</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="391:1">.</span></td>\r\n<td style="width: 50%;"><img class="alignnone wp-image-5013 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/VEMP_Annette-Kjaer-Knudsen-88367951.jpg" alt="" width="1920" height="1357" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="624:3">Для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="631:6">упрощения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="638:6">визуальной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="645:10">оценки</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="659:3:676:9">реакций</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="663:2">NB</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="666:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="668:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="669:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="674:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="687:4">каждый</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="692:2">из</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="712:7">стимулов</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="699:2">NB</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="702:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="704:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="705:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="710:1">®</span> был <span class="EzKURWReUAB5oZgtQNkl" data-src-align="735:7">сдвинут</span> по <span class="EzKURWReUAB5oZgtQNkl" data-src-align="730:4">времени</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="743:2">чтобы</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="746:7">обеспечить</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="754:9">задержки</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="764:7">аналогичные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="775:5">щелчку</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="781:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="802:8">стимул</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="789:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="791:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="792:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="797:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="799:2">LS</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="810:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="812:3">Модели</span> NB CE-Chirp® со <span class="EzKURWReUAB5oZgtQNkl" data-src-align="821:7">сдвигом</span> во <span class="EzKURWReUAB5oZgtQNkl" data-src-align="816:4">времени</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="846:5">называются</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="829:2:852:2">NB</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="832:2:855:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="834:1:857:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="835:5:858:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="840:1:863:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="865:2">LS</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="867:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="869:2">поскольку</span> места <span class="EzKURWReUAB5oZgtQNkl" data-src-align="876:10">размещения</span> зависят от <span class="EzKURWReUAB5oZgtQNkl" data-src-align="891:5">уровня</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="905:1">.</span> В <span class="EzKURWReUAB5oZgtQNkl" data-src-align="907:9">остальном</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="918:3">модели</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="922:2">NB</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="925:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="927:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="928:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="933:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="935:2">LS</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="942:9">идентичны</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="959:8">оригинальным</span> моделям <span class="EzKURWReUAB5oZgtQNkl" data-src-align="968:2">NB</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="971:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="973:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="974:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="979:1">®</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="980:1">.</span>\r\n\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="985:3:1008:6">Семейство</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="999:8">стимулов</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="989:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="991:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="992:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="997:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1018:12">включено</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1031:2">в</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1073:8">программные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1034:3:1082:7">модули</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1038:4">EP25</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1043:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="1044:1">*</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="1045:8">опционально</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1054:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1058:4">EP15</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="1062:1">)</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1064:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1068:4">ASSR</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1090:4">от</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="1095:14">Interacoustics</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="1109:1">.</span>\r\n\r\n<img class="aligncenter wp-image-5014 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/teoae-ba84fc3a.jpg" alt="" width="800" height="416" />	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoac002vyud4oaidmnbt}	published	2025-11-29 18:58:24.758	2025-12-11 19:28:45.438	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/eclipse-eclipse-thumb.webp}	Системы регистрации слуховых вызванных потенциалов Interacoustics Eclipse – оборудование, позволяющее выявлять широкий спектр патологий слуха	ixtiyoriy	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoac002vyud4oaidmnbt
cmiknmoan0033yud4111ce9ed	Affinity 2.0	Affinity 2.0	affinity-2-0	Программное обеспечение для тестирования слуховых аппаратов HIT440\r\n\r\nПрограммное обеспечение “Hearing Instrument Test” HIT440 для Affinity обеспечивает проведение количественных измерений слуховых аппаратов.Широкий выбор параметров для анализа и специальные тестовые сигналы позволяют тестировать цифровые аппараты. Этот модуль предназначен для использования как производителями слуховых аппаратов, так и в центрах слухопротезирования. Врач легко может составить свою собственную программу для тестирования слуховых аппаратов.\r\n\r\n&nbsp;\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5017 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-2-6efac5cc.jpg" alt="" width="450" height="253" /></td>\r\n<td style="width: 50%;">Программное обеспечение для измерений в реальном ухе REM440\r\n\r\nМодуль REM служит для настройки слуховых аппаратов на ухе\r\nпациента. Прибор сначала измеряет акустические параметры\r\nсобственной слуховой системы пациента, и учитывает ее частотные\r\nхарактеристики при настройке аппаратов. Измерения в реальном\r\nухе пациента позволяют произвести максимально точный выбор\r\nпараметров слухопротезирования.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">Программное обеспечение для измерений в реальном ухе REM440 для Affinity является таким инструментом для протезирования, верификации и решения проблем во всех ситуациях, возникающих при слухопротезировании. Оно предназначено для использования в центрах слухопротезирования.</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5018 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-1-90a2df0f.jpg" alt="" width="500" height="281" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	Программное обеспечение для тестирования слуховых аппаратов HIT440\r\n\r\nПрограммное обеспечение “Hearing Instrument Test” HIT440 для Affinity обеспечивает проведение количественных измерений слуховых аппаратов.Широкий выбор параметров для анализа и специальные тестовые сигналы позволяют тестировать цифровые аппараты. Этот модуль предназначен для использования как производителями слуховых аппаратов, так и в центрах слухопротезирования. Врач легко может составить свою собственную программу для тестирования слуховых аппаратов.\r\n\r\n&nbsp;\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5017 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-2-6efac5cc.jpg" alt="" width="450" height="253" /></td>\r\n<td style="width: 50%;">Программное обеспечение для измерений в реальном ухе REM440\r\n\r\nМодуль REM служит для настройки слуховых аппаратов на ухе\r\nпациента. Прибор сначала измеряет акустические параметры\r\nсобственной слуховой системы пациента, и учитывает ее частотные\r\nхарактеристики при настройке аппаратов. Измерения в реальном\r\nухе пациента позволяют произвести максимально точный выбор\r\nпараметров слухопротезирования.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">Программное обеспечение для измерений в реальном ухе REM440 для Affinity является таким инструментом для протезирования, верификации и решения проблем во всех ситуациях, возникающих при слухопротезировании. Оно предназначено для использования в центрах слухопротезирования.</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5018 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-1-90a2df0f.jpg" alt="" width="500" height="281" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoal0031yud49cjgxlbs}	published	2025-11-29 18:58:24.767	2025-12-11 19:08:59.976	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/affinity-2-0-Affinity-2.0.webp}	Программное обеспечение для тестирования слуховых аппаратов HIT440	Программное обеспечение для тестирования слуховых аппаратов HIT440	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoal0031yud49cjgxlbs
cmiknmoa3002ryud4trp89ri7	EyeSeeCam	EyeSeeCam	eyeseecam	<strong><span style="font-size: 18pt;"><img src="https://eyeseetec.de/uploads/2021/05/eyeseetec-sci_sci-2-1024x768.jpg" alt="EyeSeeCam Sci - EyeSeeTec GmbH" />\r\nВидеотест импульсного движения головы</span></strong>\r\nБыстрое и объективное измерение вестибулоокулярного движения (VOR). Результаты позволяют специалисту эффективно оценить состояние вестибулярного аппарата пациента и определить, связано ли головокружение с вестибулярным расстройством.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%; text-align: center;"><!-- Image removed: file not found -->\r\n<strong><span style="font-size: 18pt;">Здоровый</span>\r\n</strong>Видеотест импульсного движения головы (vHIT) - это измерение вестибулярно-глазного рефлекса пациента (VOR). Пациент со здоровой вестибулярной функцией может удерживать взгляд сфокусированным на неподвижной цели во время движения головы.<strong>\r\n</strong></td>\r\n<td style="width: 50%; text-align: center;"><!-- Image removed: file not found -->\r\n<strong><span style="font-size: 18pt;">Расстройство</span>\r\n</strong>У пациентов с вестибулярным расстройством глаза двигаются в такт движению головы. Для этого требуется корректирующее движение глаз назад к цели, также известное как саккада "догоняющий взгляд".<strong>\r\n</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<strong><span style="font-size: 18pt;">Выполняйте видеотест импульсного движения головы</span></strong>\r\n\r\nEyeSeeCam vHIT имеет удобное руководство, позволяющее понять, когда импульсы головы выполняются с правильной скоростью, которая составляет 150-300 градусов в секунду. Обратная связь показывает, находятся ли ваши импульсы головы в этом диапазоне, и отображается в виде заштрихованной области. Импульсы головы в заштрихованной области сопровождаются звуком «дзинь» и зеленой галочкой. Импульсы головы за пределами заштрихованной области вызывают звук «дзинь» и красный крестик.\r\n\r\n<strong><span style="font-size: 18pt;">Преимущества видеотеста импульсного движения головы (vHIT)\r\n</span></strong>\r\nСкрытые саккады не видны без аппаратного и программного обеспечения для видеотестирования импульсов головы (vHIT). Таким образом, традиционный прикроватный или клинический импульсный тест головы (cHIT) способен выявить только явные саккады. Скрытые саккады - это аномальные движения глаз, которые происходят во время (видео) импульсного теста головы. EyeSeeCam vHIT способен фиксировать и измерять эти движения глаз, устраняя риск ложноотрицательных результатов.\r\n\r\n<strong><span style="font-size: 18pt;">Тщательная оценка функции полукружных каналов\r\n</span></strong>\r\nEyeSeeCam vHIT можно использовать для измерения и отображения усиления вестибулярно-окулярного рефлекса (VOR) для всех шести полукружных каналов. Вертикальные каналы проверяются путем наклона головы пациента в 45-градусной плоскости, в то время как пациент продолжает фокусироваться на цели перед собой. В программном обеспечении имеются полярные графики, которые помогут вам сориентироваться и обеспечить обратную связь, чтобы убедиться, что вы делаете выпады в правильных плоскостях.	<strong><span style="font-size: 18pt;"><img src="https://eyeseetec.de/uploads/2021/05/eyeseetec-sci_sci-2-1024x768.jpg" alt="EyeSeeCam Sci - EyeSeeTec GmbH" />\r\nВидеотест импульсного движения головы</span></strong>\r\nБыстрое и объективное измерение вестибулоокулярного движения (VOR). Результаты позволяют специалисту эффективно оценить состояние вестибулярного аппарата пациента и определить, связано ли головокружение с вестибулярным расстройством.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%; text-align: center;"><!-- Image removed: file not found -->\r\n<strong><span style="font-size: 18pt;">Здоровый</span>\r\n</strong>Видеотест импульсного движения головы (vHIT) - это измерение вестибулярно-глазного рефлекса пациента (VOR). Пациент со здоровой вестибулярной функцией может удерживать взгляд сфокусированным на неподвижной цели во время движения головы.<strong>\r\n</strong></td>\r\n<td style="width: 50%; text-align: center;"><!-- Image removed: file not found -->\r\n<strong><span style="font-size: 18pt;">Расстройство</span>\r\n</strong>У пациентов с вестибулярным расстройством глаза двигаются в такт движению головы. Для этого требуется корректирующее движение глаз назад к цели, также известное как саккада "догоняющий взгляд".<strong>\r\n</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<strong><span style="font-size: 18pt;">Выполняйте видеотест импульсного движения головы</span></strong>\r\n\r\nEyeSeeCam vHIT имеет удобное руководство, позволяющее понять, когда импульсы головы выполняются с правильной скоростью, которая составляет 150-300 градусов в секунду. Обратная связь показывает, находятся ли ваши импульсы головы в этом диапазоне, и отображается в виде заштрихованной области. Импульсы головы в заштрихованной области сопровождаются звуком «дзинь» и зеленой галочкой. Импульсы головы за пределами заштрихованной области вызывают звук «дзинь» и красный крестик.\r\n\r\n<strong><span style="font-size: 18pt;">Преимущества видеотеста импульсного движения головы (vHIT)\r\n</span></strong>\r\nСкрытые саккады не видны без аппаратного и программного обеспечения для видеотестирования импульсов головы (vHIT). Таким образом, традиционный прикроватный или клинический импульсный тест головы (cHIT) способен выявить только явные саккады. Скрытые саккады - это аномальные движения глаз, которые происходят во время (видео) импульсного теста головы. EyeSeeCam vHIT способен фиксировать и измерять эти движения глаз, устраняя риск ложноотрицательных результатов.\r\n\r\n<strong><span style="font-size: 18pt;">Тщательная оценка функции полукружных каналов\r\n</span></strong>\r\nEyeSeeCam vHIT можно использовать для измерения и отображения усиления вестибулярно-окулярного рефлекса (VOR) для всех шести полукружных каналов. Вертикальные каналы проверяются путем наклона головы пациента в 45-градусной плоскости, в то время как пациент продолжает фокусироваться на цели перед собой. В программном обеспечении имеются полярные графики, которые помогут вам сориентироваться и обеспечить обратную связь, чтобы убедиться, что вы делаете выпады в правильных плоскостях.	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoa1002pyud408stygdm}	published	2025-11-29 18:58:24.747	2025-12-11 19:25:54.869	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/eyeseecam-product_image-1.webp}	<strong><span style="font-size: 18pt;"><img src="https://eyeseetec	<strong><span style="font-size: 18pt;"><img src="https://eyeseetec	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoa1002pyud408stygdm
cmiknmo9y002oyud4kvuw5990	VisualEyes x2122	VisualEyes x2122	visualeyes-x2122	<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 48.3539%;"><img class="" src="https://a.acoustic.uz/uploads/products/at-235-at235.webp" alt="Female clinician looking at young female patient in Orion Reclining chair wearing VNG goggles" width="403" height="637" /></td>\r\n<td style="width: 51.6461%;"><strong><span style="font-size: 18pt;">Выберите вестибулярный пакет</span></strong>\r\n\r\n<span style="font-size: 14pt;">Имея на выбор различные пакеты программного обеспечения и варианты оборудования, вы можете приобрести то, что вам нужно сейчас, и следовать простым путям обновления в будущем по мере изменения потребностей вашего бизнеса.</span><strong><span style="font-size: 18pt;">\r\n</span></strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<img src="https://www.interacoustics.com/templates/yootheme/cache/1b/sacccadometry-1b670dfe.jpeg" alt="Male clinician looking at Anti-Saccade results" />\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 525</strong></span></h3>\r\nVisualEyes&#x2122; 525 - это наша полнофункциональная система VNG, которая предоставляет центрам вестибулярных заболеваний, врачам общей практики и неврологам возможность количественно оценить функциональность периферической вестибулярной системы и центральных вестибулярных путей. Вы можете выбирать между различными алгоритмами отслеживания, которые позволяют отслеживать движение глаз всех пациентов для получения более достоверных результатов анализов.\r\n\r\nТакие протоколы, как Ocular Counter Roll с функцией отслеживания движения глаз при кручении, 3D-моделирование головы и саккадометрия, помогут вам получить еще более детальное представление о вестибулярных нарушениях ваших пациентов.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img src="https://www.interacoustics.com/templates/yootheme/cache/c0/torsional-analysis-c0a984e5.jpeg" alt="Female patient looking at eye recording with torsional analysis" /></td>\r\n<td style="width: 50%;">\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 515</strong></span></h3>\r\nVisualEyes&#x2122; 515 - это оптимальный выбор для ЛОР-кабинетов и вестибулярных клиник, которым не требуется продвинутая система тестирования глазодвигательных функций. VisualEyes&#x2122; 515 предлагает быстрые протоколы, автоматизированный анализ данных и множество алгоритмов отслеживания. Кроме того, вы можете добавить оценочный пакет VORTEQ&#x2122; с расширенными возможностями ДППГ или модуль EyeSeeCam vHIT для дальнейшего измерения вестибулярно-глазного рефлекса (VOR). Возможность комбинирования VisualEyes&#x2122; 515/525 с калорическими ирригаторами Air Fx и Aqua Stim, а также с вращающимися креслами Orion предоставляет вам дополнительные средства для оценки вестибулярной функции и может способствовать дальнейшему вестибулярному тестированию у детей.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 505</strong></span></h3>\r\nС помощью видеосистемы Френцеля VisualEyes&#x2122; 505 физиотерапевты и врачи общей практики могут получить доступ к значительному объему клинических данных с помощью теста на спонтанный нистагм, который использует алгоритм обнаружения нистагма, что обеспечивает большую поддержку при диагностике вестибулярных расстройств.\r\n\r\nДля дальнейшей оценки ваших функциональных возможностей вы можете воспользоваться комплектом VORTEQ&#x2122; Assessment bundle, который предоставляет вам дополнительные возможности, такие как расширенный тест Дикса-Холлпайка, боковой поворот головы, стабилизация взгляда и динамические тесты на остроту зрения.</td>\r\n<td style="width: 50%;"><img src="https://www.interacoustics.com/templates/yootheme/cache/29/dix-hallpike-right-297137ba.jpeg" alt="Female clinician performing Dix Hallpike Advanced on the left side with torsional analysis" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 48.3539%;"><img class="" src="https://a.acoustic.uz/uploads/products/at-235-at235.webp" alt="Female clinician looking at young female patient in Orion Reclining chair wearing VNG goggles" width="403" height="637" /></td>\r\n<td style="width: 51.6461%;"><strong><span style="font-size: 18pt;">Выберите вестибулярный пакет</span></strong>\r\n\r\n<span style="font-size: 14pt;">Имея на выбор различные пакеты программного обеспечения и варианты оборудования, вы можете приобрести то, что вам нужно сейчас, и следовать простым путям обновления в будущем по мере изменения потребностей вашего бизнеса.</span><strong><span style="font-size: 18pt;">\r\n</span></strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<img src="https://www.interacoustics.com/templates/yootheme/cache/1b/sacccadometry-1b670dfe.jpeg" alt="Male clinician looking at Anti-Saccade results" />\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 525</strong></span></h3>\r\nVisualEyes&#x2122; 525 - это наша полнофункциональная система VNG, которая предоставляет центрам вестибулярных заболеваний, врачам общей практики и неврологам возможность количественно оценить функциональность периферической вестибулярной системы и центральных вестибулярных путей. Вы можете выбирать между различными алгоритмами отслеживания, которые позволяют отслеживать движение глаз всех пациентов для получения более достоверных результатов анализов.\r\n\r\nТакие протоколы, как Ocular Counter Roll с функцией отслеживания движения глаз при кручении, 3D-моделирование головы и саккадометрия, помогут вам получить еще более детальное представление о вестибулярных нарушениях ваших пациентов.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img src="https://www.interacoustics.com/templates/yootheme/cache/c0/torsional-analysis-c0a984e5.jpeg" alt="Female patient looking at eye recording with torsional analysis" /></td>\r\n<td style="width: 50%;">\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 515</strong></span></h3>\r\nVisualEyes&#x2122; 515 - это оптимальный выбор для ЛОР-кабинетов и вестибулярных клиник, которым не требуется продвинутая система тестирования глазодвигательных функций. VisualEyes&#x2122; 515 предлагает быстрые протоколы, автоматизированный анализ данных и множество алгоритмов отслеживания. Кроме того, вы можете добавить оценочный пакет VORTEQ&#x2122; с расширенными возможностями ДППГ или модуль EyeSeeCam vHIT для дальнейшего измерения вестибулярно-глазного рефлекса (VOR). Возможность комбинирования VisualEyes&#x2122; 515/525 с калорическими ирригаторами Air Fx и Aqua Stim, а также с вращающимися креслами Orion предоставляет вам дополнительные средства для оценки вестибулярной функции и может способствовать дальнейшему вестибулярному тестированию у детей.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">\r\n<h3><span style="font-size: 18pt;"><strong>Visual Eyes&#x2122; 505</strong></span></h3>\r\nС помощью видеосистемы Френцеля VisualEyes&#x2122; 505 физиотерапевты и врачи общей практики могут получить доступ к значительному объему клинических данных с помощью теста на спонтанный нистагм, который использует алгоритм обнаружения нистагма, что обеспечивает большую поддержку при диагностике вестибулярных расстройств.\r\n\r\nДля дальнейшей оценки ваших функциональных возможностей вы можете воспользоваться комплектом VORTEQ&#x2122; Assessment bundle, который предоставляет вам дополнительные возможности, такие как расширенный тест Дикса-Холлпайка, боковой поворот головы, стабилизация взгляда и динамические тесты на остроту зрения.</td>\r\n<td style="width: 50%;"><img src="https://www.interacoustics.com/templates/yootheme/cache/29/dix-hallpike-right-297137ba.jpeg" alt="Female clinician performing Dix Hallpike Advanced on the left side with torsional analysis" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmo9u002myud4scr21xtf}	published	2025-11-29 18:58:24.742	2025-12-11 19:25:54.88	{}	in-stock	{}	{}	{}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/visualeyes-x2122-product_image.webp}	<table style="border-collapse: collapse; width: 100%;">	<table style="border-collapse: collapse; width: 100%;">	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmo9u002myud4scr21xtf
cmiknmob7003fyud4p0mfizue	AA222	AA222	aa222	Полнофункциональный импедансометр AA222 сочетает в себе новейшие технологии проверки слуха, точную аудиометрию, обширные диагностические возможности. И все это облачено в современный дизайн с удобной клавиатурой и большим ЖК-экраном. Ассортимент аудиометрических тестов, выполняемых с помощью импедансометра, позволяет ЛОР-врачу успешно проводить диагностику заболеваний слуха, устанавливать границы слышимости и многое другое. Тесты распада рефлекса позволят обнаружить нарушения в работе среднего уха, выявить поражения лицевого и слухового нервов, объективно оценить фактический порог слышимости и порог слухового дискомфорта. Кроме того, импедансометр AA222 может использоваться для оценки состояния слуха после проведенной стапедопластики у пациентов с диагностированным отосклерозом.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><strong>Технические характеристики:</strong>\r\n\r\n- Тимпанометрия: интенсивность до 110 дБ; частота исследования 4000 Гц, 3000 Гц, 2000 Гц,\r\n1000 Гц, 500 Гц, 250 Гц, белый, низкочастотный и высокочастотный шум\r\n- Контрлатеральный акустический рефлекс: интенсивность до 120 дБ; частота исследования\r\n125 Гц – 8000 Гц, белый, низкочастотный и высокочастотный шум\r\n- Аудиометрия: интенсивность 10 дБ – 120 дБ; интенсивность по воздушному\r\nзвукопроведению 10 дБ – 80 дБ; интенсивность по костному звукопроведению с шагом 1 или\r\n5 дБ; частота исследования 125 Гц – 8000 Гц;\r\n- Функция автоматического определения порога\r\n- Уникальные режимы тестирования: Stenger, Stenger Speech, SISI, ABLB\r\n- Интегрированная память\r\n- Термопринтер\r\n- Функция подключения к персональному компьютеру с помощью USB порта\r\n- Размеры установки: 360*260*100 мм\r\n- Вес устройства: 2,8 кг с источником питания</td>\r\n</tr>\r\n</tbody>\r\n</table>	Полнофункциональный импедансометр AA222 сочетает в себе новейшие технологии проверки слуха, точную аудиометрию, обширные диагностические возможности. И все это облачено в современный дизайн с удобной клавиатурой и большим ЖК-экраном. Ассортимент аудиометрических тестов, выполняемых с помощью импедансометра, позволяет ЛОР-врачу успешно проводить диагностику заболеваний слуха, устанавливать границы слышимости и многое другое. Тесты распада рефлекса позволят обнаружить нарушения в работе среднего уха, выявить поражения лицевого и слухового нервов, объективно оценить фактический порог слышимости и порог слухового дискомфорта. Кроме того, импедансометр AA222 может использоваться для оценки состояния слуха после проведенной стапедопластики у пациентов с диагностированным отосклерозом.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><strong>Технические характеристики:</strong>\r\n\r\n- Тимпанометрия: интенсивность до 110 дБ; частота исследования 4000 Гц, 3000 Гц, 2000 Гц,\r\n1000 Гц, 500 Гц, 250 Гц, белый, низкочастотный и высокочастотный шум\r\n- Контрлатеральный акустический рефлекс: интенсивность до 120 дБ; частота исследования\r\n125 Гц – 8000 Гц, белый, низкочастотный и высокочастотный шум\r\n- Аудиометрия: интенсивность 10 дБ – 120 дБ; интенсивность по воздушному\r\nзвукопроведению 10 дБ – 80 дБ; интенсивность по костному звукопроведению с шагом 1 или\r\n5 дБ; частота исследования 125 Гц – 8000 Гц;\r\n- Функция автоматического определения порога\r\n- Уникальные режимы тестирования: Stenger, Stenger Speech, SISI, ABLB\r\n- Интегрированная память\r\n- Термопринтер\r\n- Функция подключения к персональному компьютеру с помощью USB порта\r\n- Размеры установки: 360*260*100 мм\r\n- Вес устройства: 2,8 кг с источником питания</td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmob5003dyud46c837fkk}	published	2025-11-29 18:58:24.787	2025-12-11 19:28:45.501	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/aa222-aa222.webp}	Полнофункциональный импедансометр AA222 сочетает в себе новейшие технологии проверки слуха, точную аудиометрию, обширные диагностические возможности	Полнофункциональный импедансометр AA222 сочетает в себе новейшие технологии проверки слуха, точную аудиометрию, обширные диагностические возможности	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmob5003dyud46c837fkk
cmiknmoaj0030yud4hin0ld5k	AT 235	AT 235	at-235	АТ235 - автоматический анализатор среднего уха, созданный как\r\nдля скрининга, так и для диагностики. АТ235 обладает всей совокупностью тестов\r\nимпеданса с ручным или автоматическим тестированием акустического рефлекса;\r\nослабления ипсилатерального и контралатерального рефлекса, а также теста функции\r\nЕвстахиевой трубы. АТ235 также функционирует как тоновый скрининговый аудиометр.\r\nАТ235 обладает двумя программируемыми протоколами для автоматического\r\nтестирования пороговой величины рефлекса. Результаты исследований могут быть\r\nраспечатаны на встроенном термопринтере или отправлены на компьютер\r\nпосредством NOAH или OtoAccess&#x2122;. В АТ235 есть уникальная система\r\nвзаимозаменяемых щупов для клинических или скрининговых исследований. АТ235\r\nавтоматически определяет изменения и назначает соответствующие калиброванные\r\nтоны\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5001 size-full" src="https://a.acoustic.uz/uploads/products/at-235-at235.webp" alt="" width="1920" height="1080" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<strong>Прибор имеет 2 типа зонда:</strong>\r\n- Диагностический зонд\r\n- Клинический зонд\r\n<strong>Импедансный аудиометр имеет 2 варианта модификации:</strong>\r\n- AT 235 (226Hz)\r\n- AT 235 h (226Hz, 800Hz &amp; 1000Hz)\r\n<table>\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><strong>Особенности аудиометра AT 235</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">- Ослабление рефлексов\r\n- Программируемая последовательность\r\n- Анимация на экране для облегчения проведения исследований у детей\r\n- Быстрая печать;\r\n- Скрининговая аудиометрия воздушной проводимости\r\n- Взаимозаменяемые зонды для скрининговой и диагностической аудиометрии</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5000 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/banner.jpg" alt="" width="1168" height="1080" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	АТ235 - автоматический анализатор среднего уха, созданный как\r\nдля скрининга, так и для диагностики. АТ235 обладает всей совокупностью тестов\r\nимпеданса с ручным или автоматическим тестированием акустического рефлекса;\r\nослабления ипсилатерального и контралатерального рефлекса, а также теста функции\r\nЕвстахиевой трубы. АТ235 также функционирует как тоновый скрининговый аудиометр.\r\nАТ235 обладает двумя программируемыми протоколами для автоматического\r\nтестирования пороговой величины рефлекса. Результаты исследований могут быть\r\nраспечатаны на встроенном термопринтере или отправлены на компьютер\r\nпосредством NOAH или OtoAccess&#x2122;. В АТ235 есть уникальная система\r\nвзаимозаменяемых щупов для клинических или скрининговых исследований. АТ235\r\nавтоматически определяет изменения и назначает соответствующие калиброванные\r\nтоны\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5001 size-full" src="https://a.acoustic.uz/uploads/products/at-235-at235.webp" alt="" width="1920" height="1080" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<strong>Прибор имеет 2 типа зонда:</strong>\r\n- Диагностический зонд\r\n- Клинический зонд\r\n<strong>Импедансный аудиометр имеет 2 варианта модификации:</strong>\r\n- AT 235 (226Hz)\r\n- AT 235 h (226Hz, 800Hz &amp; 1000Hz)\r\n<table>\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><strong>Особенности аудиометра AT 235</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">- Ослабление рефлексов\r\n- Программируемая последовательность\r\n- Анимация на экране для облегчения проведения исследований у детей\r\n- Быстрая печать;\r\n- Скрининговая аудиометрия воздушной проводимости\r\n- Взаимозаменяемые зонды для скрининговой и диагностической аудиометрии</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-5000 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/banner.jpg" alt="" width="1168" height="1080" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoah002yyud471qhzggs}	published	2025-11-29 18:58:24.763	2025-12-11 19:25:54.944	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/at-235-at235.webp}	АТ235 - автоматический анализатор среднего уха, созданный как	АТ235 - автоматический анализатор среднего уха, созданный как	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoah002yyud471qhzggs
cmiknmoar0036yud4s61drqvz	AD629	AD629	ad629	Аудиометр AD 629 представляет собой современный клинико-\r\nдиагностический аудиометр для двухканальной речевой аудиометрии по методу\r\nШтенгера. Модель отличается компактными размерами, легким весом, расширенным\r\nфункционалом и возможностью подключения к ПК. Аудиометр имеет 2 варианта\r\nмодификации:\r\n- AD 629 Licence B — Вasic со стандартными надпороговыми тестами: Stenger\r\n(Штенгера), ABLB (Фоулера), тест автоматического определения порогов слуха.\r\n- AD 629 Licence E — Еxtended с дополнительными тестами. SISI, Langenbeck, тест\r\nБекеши + Licence B.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><span style="font-size: 24pt;"><strong>Особенности аудиометра AD 629</strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">- Широкий спектр тестов (стандартный набор или расширенный)\r\n- Совместимость с персональным компьютером\r\n- Эргономичный цветной экран с регулировкой угла наклона\r\n- Частота диапазона может быть расширена до 20 кГц (опции)\r\n- Высокая эргономичность управления\r\n- Небольшой размер, компактный дизайн\r\n- Высокая скорость работы\r\n- Входы для подключения магнитофона/CD для проведения речевой\r\nаудиометрии\r\n- Выходы для подключения звукоусиливающей аппаратуры для проведения\r\nречевой аудиометрии в свободном звуковом поле\r\n- Встроенный микрофон для связи с пациентом\r\n- Кнопка ответа пациента\r\n- Интенсивность стимула: Воздух: от -10 до 120 дБ ПС с шагом в 1, 2 или 5 дБ.\r\nКость: от -10 до 80 дБ с шагом в 1, 2 или 5 дБ.</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4992 size-full" src="https://a.acoustic.uz/uploads/products/ad629-ad629.webp" alt="" width="1200" height="854" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:14">Диагностическая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">тестовая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:7">батарея</span></strong></span></td>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:10">Аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span></strong></span></td>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">Аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span></strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 33.3333%;">\r\n<p style="text-align: center;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:5">AD629</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="6:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">все</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:9">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="55:8">функции</span> очистки <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:3">воздуха</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="36:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:4">костей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="43:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="47:7">маскировки</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="64:8">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="73:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="77:5">базовой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="83:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:8">продвинутой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="95:10">диагностики</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="106:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="110:8">клинического</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:3">применения</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="122:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="124:9">Встроенный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="133:1:153:5">цветной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="159:7">дисплей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:2">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:4">высоким</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="142:10">разрешением</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="167:6">предлагает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="174:9">специальные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="184:4">тестовые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="189:7">экраны</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="197:2">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="200:4">а</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="205:2">также</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="208:4">множество</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="230:7">вариантов</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="213:7">отображения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="221:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="225:4">тестирования</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="237:1">.</span></span></p>\r\n</td>\r\n<td style="width: 33.3333%;">&nbsp;\r\n<ul>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="4:10">Воздухопроводность.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Костная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:10">проводимость</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="24:11">Расчет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:7">среднего</span> значения <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:3">PTA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="22:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="35:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Определите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:7">специальные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:10">аудиометрические</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">символы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Легко</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:6">переключайтесь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:2">на</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:5">ступени</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="17:3">1,2</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="22:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:1">5</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:2">дБ</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="35:1">.</span></span></li>\r\n \t<li class="el-item" style="text-align: left;">\r\n<div class="el-content uk-panel"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:7">Отобразите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">информацию</span> о <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:7">маскировке</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></span></div></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речевой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:6">банан</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:11">Оценка</span> шума в <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">ушах</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 10pt;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Дополнительная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:10">аудиометрия</span> с <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:13">усилением</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">зрения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="41:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:3">VRA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="45:1">)</span></span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="46:1">.</span></span></li>\r\n</ul>\r\n</td>\r\n<td style="width: 33.3333%;">&nbsp;\r\n<ul>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:5">Графический</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="6:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:5">табличный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">режим</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Живой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:5">голос</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:2">CD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:1">/</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">MP3</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:8">встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="39:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="48:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:9">Порог</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:11">распознавания</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:3">SRT</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:13">Некомфортный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:5">уровень</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:8">громкости</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:3">UCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Записанная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">оценка</span> за <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:11">распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Бинауральная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речь</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">Оценка</span> "<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:2">в</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:5">шуме</span>"<span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></span></li>\r\n</ul>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4993 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/diagnostic-suite_3sw_screeens-d6366cf9.webp" alt="" width="1200" height="472" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	Аудиометр AD 629 представляет собой современный клинико-\r\nдиагностический аудиометр для двухканальной речевой аудиометрии по методу\r\nШтенгера. Модель отличается компактными размерами, легким весом, расширенным\r\nфункционалом и возможностью подключения к ПК. Аудиометр имеет 2 варианта\r\nмодификации:\r\n- AD 629 Licence B — Вasic со стандартными надпороговыми тестами: Stenger\r\n(Штенгера), ABLB (Фоулера), тест автоматического определения порогов слуха.\r\n- AD 629 Licence E — Еxtended с дополнительными тестами. SISI, Langenbeck, тест\r\nБекеши + Licence B.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><span style="font-size: 24pt;"><strong>Особенности аудиометра AD 629</strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">- Широкий спектр тестов (стандартный набор или расширенный)\r\n- Совместимость с персональным компьютером\r\n- Эргономичный цветной экран с регулировкой угла наклона\r\n- Частота диапазона может быть расширена до 20 кГц (опции)\r\n- Высокая эргономичность управления\r\n- Небольшой размер, компактный дизайн\r\n- Высокая скорость работы\r\n- Входы для подключения магнитофона/CD для проведения речевой\r\nаудиометрии\r\n- Выходы для подключения звукоусиливающей аппаратуры для проведения\r\nречевой аудиометрии в свободном звуковом поле\r\n- Встроенный микрофон для связи с пациентом\r\n- Кнопка ответа пациента\r\n- Интенсивность стимула: Воздух: от -10 до 120 дБ ПС с шагом в 1, 2 или 5 дБ.\r\nКость: от -10 до 80 дБ с шагом в 1, 2 или 5 дБ.</td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4992 size-full" src="https://a.acoustic.uz/uploads/products/ad629-ad629.webp" alt="" width="1200" height="854" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:14">Диагностическая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">тестовая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:7">батарея</span></strong></span></td>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:10">Аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span></strong></span></td>\r\n<td style="width: 33.3333%;"><span style="font-size: 12pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">Аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span></strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 33.3333%;">\r\n<p style="text-align: center;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:5">AD629</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="6:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">все</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:9">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="55:8">функции</span> очистки <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:3">воздуха</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="36:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:4">костей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="43:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="47:7">маскировки</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="64:8">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="73:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="77:5">базовой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="83:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:8">продвинутой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="95:10">диагностики</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="106:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="110:8">клинического</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:3">применения</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="122:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="124:9">Встроенный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="133:1:153:5">цветной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="159:7">дисплей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:2">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:4">высоким</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="142:10">разрешением</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="167:6">предлагает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="174:9">специальные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="184:4">тестовые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="189:7">экраны</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="197:2">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="200:4">а</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="205:2">также</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="208:4">множество</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="230:7">вариантов</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="213:7">отображения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="221:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="225:4">тестирования</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="237:1">.</span></span></p>\r\n</td>\r\n<td style="width: 33.3333%;">&nbsp;\r\n<ul>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="4:10">Воздухопроводность.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Костная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:10">проводимость</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="24:11">Расчет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:7">среднего</span> значения <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:3">PTA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="22:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="35:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Определите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:7">специальные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:10">аудиометрические</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">символы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Легко</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:6">переключайтесь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:2">на</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:5">ступени</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="17:3">1,2</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="22:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:1">5</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:2">дБ</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="35:1">.</span></span></li>\r\n \t<li class="el-item" style="text-align: left;">\r\n<div class="el-content uk-panel"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:7">Отобразите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">информацию</span> о <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:7">маскировке</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></span></div></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речевой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:6">банан</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:11">Оценка</span> шума в <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">ушах</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 10pt;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Дополнительная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:10">аудиометрия</span> с <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:13">усилением</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">зрения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="41:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:3">VRA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="45:1">)</span></span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="46:1">.</span></span></li>\r\n</ul>\r\n</td>\r\n<td style="width: 33.3333%;">&nbsp;\r\n<ul>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:5">Графический</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="6:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:5">табличный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">режим</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Живой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:5">голос</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:2">CD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:1">/</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">MP3</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:8">встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="39:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="48:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:9">Порог</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:11">распознавания</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:3">SRT</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:13">Некомфортный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:5">уровень</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:8">громкости</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:3">UCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Записанная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">оценка</span> за <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:11">распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Бинауральная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речь</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:1">.</span></span></li>\r\n \t<li style="text-align: left;"><span style="font-size: 12pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">Оценка</span> "<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:2">в</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:5">шуме</span>"<span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></span></li>\r\n</ul>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4993 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/diagnostic-suite_3sw_screeens-d6366cf9.webp" alt="" width="1200" height="472" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoap0034yud49fr61lg3}	published	2025-11-29 18:58:24.771	2025-12-11 19:25:54.968	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/ad629-ad629.webp}	Аудиометр AD 629 представляет собой современный клинико-	Аудиометр AD 629 представляет собой современный клинико-	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoap0034yud49fr61lg3
cmiknmob1003cyud4dkyyftsf	AC40	AC40	ac40	Клинический высокочастотный аудиометр AC 40 с двумя\r\nнезависимыми каналами для исследований по воздушному и костному\r\nзвукопроведению на 11 тестовых частотах. Цветной ЖК-дисплей на 2 уха, специальные\r\nрежимы тестирования. Современный аудиометр с удобными настройками и широким\r\nфункционалом. Аппарат отличается высокой эргономичностью, полностью\r\nсовмещается с персональным компьютером, предполагает ручное или реверсивное\r\nпредъявление тона. Аудиометр имеет 2 варианта модификации:\r\n- AC 40 Licence B — аудиометр с двумя кнопками ответа пациента и клиническим\r\nнабором тестов: HW, MHA, HLS, SISI, ABLB, Bekesy, Stenger, Weber, Langenbeck.\r\n- AC 40 Licence E — аудиометр с двумя кнопками ответа пациента и клиническим\r\nнабором тестов: HW, MHA, HLS, SISI, ABLB, Bekesy, Stenger, Weber, Langenbeck,\r\nTEN, MLD, MF, PED — педиатрический шум, QuickSin Test.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;">\r\n<p style="text-align: center;"><strong><span style="font-size: 24pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Работайте</span> так, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:2">как</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:3">вам</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:6">нравится</span></span></strong></p>\r\n<p style="text-align: center;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:2">Как</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:10">автономный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:10">аудиометр</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:4">AC40</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:3">все</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="46:3:94:8">функции</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="50:3">воздушной</span> и <span class="EzKURWReUAB5oZgtQNkl" data-src-align="66:4">костной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="54:10:71:10">проводимости</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="64:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="82:3">а</span> также <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:7">маскировки</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="103:8">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="112:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="116:8">расширенного</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="125:8">клинического</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:3">применения</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:1">.</span></p>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4982 size-large" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-b33961c7-1024x552.webp" alt="" width="1024" height="552" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignright wp-image-4983 size-medium" src="https://a.acoustic.uz/uploads/products/ac40-AC40.webp" alt="" width="300" height="152" /></td>\r\n<td style="width: 50%; text-align: left;"><strong><span style="font-size: 24pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Широкий</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:5">спектр</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:15">применения</span></span></strong>\r\n\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">AC40</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:1">оснащен</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="11:13">универсальной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:4">тестовой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:7">батареей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:4">широкого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="49:5">спектра</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="58:8">клинических</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="67:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="71:8">исследовательских</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="80:12">применений</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="92:1">.</span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;">\r\n<p style="text-align: left;"><strong><span style="font-size: 24pt;">Особенности аудиометра Interacoustics AC 40</span></strong></p>\r\n<p style="text-align: left;">- Высокочастотный клинический аудиометр\r\n- Два независимых канала\r\n- Исследования по воздушному и костному звукопроведению на 11 тестовых\r\nчастотах\r\n- Функция речевой аудиометрии\r\n- Расширенный частотный диапазон: 125 – 20 000 Гц\r\n- Удобные настройки для коррекции частоты.\r\n- Специальные режимы тестирования: SISI, ABLB, Stenger, Lombard, Doerfler-\r\nStewart, MLD, MLB, тест Бекеши, тест Вебера, TTdecay (тест исчезающего тона)\r\nи др.\r\n- Автоопределение порога\r\n- Цветной ЖК-экран на 2 уха с регулировкой угла наклона\r\n- 2 кнопки ответа пациента\r\n- Двухсторонняя связь с персональным компьютером</p>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><span style="font-size: 24pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:8">Особенности</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">аудиометрии</span></strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4984 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/on-screen-speech-a0f4f15f-1.webp" alt="" width="640" height="480" /></td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4985 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/on-screen-tone-b32a01ca.webp" alt="" width="640" height="480" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">аудиометрия речи</span>\r\n<ul>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Живой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:5">голос</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:2">CD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:1">/</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">MP3</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:8">встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="39:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="48:1">.</span></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:3">SRT</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="3:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:11">Распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="21:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:3">MCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:3">UCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="31:1">.</span></div></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Записанная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">оценка</span> за <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:11">распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Бинауральная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:12">приложений</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:4">CAPD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="37:1">.</span></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:10">Оценка</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:2">в</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:5">шуме</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">.</span></li>\r\n</ul>\r\n</td>\r\n<td style="width: 50%;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:10">аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span>\r\n<ul>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:9">Автоматический</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:11">расчет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:7">среднего</span> значения <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">тона</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:3">PTA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="45:1">.</span></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:7">Определяемая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">пользователем</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:6">схема</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:6">символов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речевой банан.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:7">Отобразите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">информацию</span> о <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:7">маскировке</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:1">.</span></div></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:12">Медиаплеер</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="17:8">записи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:6">речевых</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:9">материалов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:1">.</span></li>\r\n</ul>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>	Клинический высокочастотный аудиометр AC 40 с двумя\r\nнезависимыми каналами для исследований по воздушному и костному\r\nзвукопроведению на 11 тестовых частотах. Цветной ЖК-дисплей на 2 уха, специальные\r\nрежимы тестирования. Современный аудиометр с удобными настройками и широким\r\nфункционалом. Аппарат отличается высокой эргономичностью, полностью\r\nсовмещается с персональным компьютером, предполагает ручное или реверсивное\r\nпредъявление тона. Аудиометр имеет 2 варианта модификации:\r\n- AC 40 Licence B — аудиометр с двумя кнопками ответа пациента и клиническим\r\nнабором тестов: HW, MHA, HLS, SISI, ABLB, Bekesy, Stenger, Weber, Langenbeck.\r\n- AC 40 Licence E — аудиометр с двумя кнопками ответа пациента и клиническим\r\nнабором тестов: HW, MHA, HLS, SISI, ABLB, Bekesy, Stenger, Weber, Langenbeck,\r\nTEN, MLD, MF, PED — педиатрический шум, QuickSin Test.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;">\r\n<p style="text-align: center;"><strong><span style="font-size: 24pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Работайте</span> так, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:2">как</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:3">вам</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:6">нравится</span></span></strong></p>\r\n<p style="text-align: center;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:2">Как</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:10">автономный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:10">аудиометр</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:4">AC40</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:3">все</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="46:3:94:8">функции</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="50:3">воздушной</span> и <span class="EzKURWReUAB5oZgtQNkl" data-src-align="66:4">костной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="54:10:71:10">проводимости</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="64:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="82:3">а</span> также <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:7">маскировки</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="103:8">необходимые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="112:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="116:8">расширенного</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="125:8">клинического</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:3">применения</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:1">.</span></p>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4982 size-large" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/sw-ac440-b33961c7-1024x552.webp" alt="" width="1024" height="552" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignright wp-image-4983 size-medium" src="https://a.acoustic.uz/uploads/products/ac40-AC40.webp" alt="" width="300" height="152" /></td>\r\n<td style="width: 50%; text-align: left;"><strong><span style="font-size: 24pt;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Широкий</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:5">спектр</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:15">применения</span></span></strong>\r\n\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">AC40</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:1">оснащен</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="11:13">универсальной</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:4">тестовой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="30:7">батареей</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:4">широкого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="49:5">спектра</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="58:8">клинических</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="67:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="71:8">исследовательских</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="80:12">применений</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="92:1">.</span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;">\r\n<p style="text-align: left;"><strong><span style="font-size: 24pt;">Особенности аудиометра Interacoustics AC 40</span></strong></p>\r\n<p style="text-align: left;">- Высокочастотный клинический аудиометр\r\n- Два независимых канала\r\n- Исследования по воздушному и костному звукопроведению на 11 тестовых\r\nчастотах\r\n- Функция речевой аудиометрии\r\n- Расширенный частотный диапазон: 125 – 20 000 Гц\r\n- Удобные настройки для коррекции частоты.\r\n- Специальные режимы тестирования: SISI, ABLB, Stenger, Lombard, Doerfler-\r\nStewart, MLD, MLB, тест Бекеши, тест Вебера, TTdecay (тест исчезающего тона)\r\nи др.\r\n- Автоопределение порога\r\n- Цветной ЖК-экран на 2 уха с регулировкой угла наклона\r\n- 2 кнопки ответа пациента\r\n- Двухсторонняя связь с персональным компьютером</p>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><span style="font-size: 24pt;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:8">Особенности</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">аудиометрии</span></strong></span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4984 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/on-screen-speech-a0f4f15f-1.webp" alt="" width="640" height="480" /></td>\r\n<td style="width: 50%;"><img class="aligncenter wp-image-4985 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/on-screen-tone-b32a01ca.webp" alt="" width="640" height="480" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:10">аудиометрия речи</span>\r\n<ul>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">Живой</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:5">голос</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="12:2">CD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:1">/</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:3">MP3</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:2">или</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:8">встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="39:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="48:1">.</span></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:3">SRT</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="3:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:11">Распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="21:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="23:3">MCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:3">UCL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="31:1">.</span></div></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Записанная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:7">оценка</span> за <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:11">распознавание</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:4">слов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:1">.</span></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Бинауральная</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:12">приложений</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:4">CAPD</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="37:1">.</span></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:10">Оценка</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">речи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:2">в</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:5">шуме</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">.</span></li>\r\n</ul>\r\n</td>\r\n<td style="width: 50%;"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:10">аудиометрия</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:4">тона</span>\r\n<ul>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:9">Автоматический</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:11">расчет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:7">среднего</span> значения <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:4">чистого</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="15:4">тона</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="28:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="29:3">PTA</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="32:1">)</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="45:1">.</span></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="5:7">Определяемая</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:4">пользователем</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="20:6">схема</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:6">символов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:1">.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Речевой банан.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:7">Отобразите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:11">информацию</span> о <span class="EzKURWReUAB5oZgtQNkl" data-src-align="8:7">маскировке</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="27:1">.</span></div></li>\r\n \t<li class="el-item">\r\n<div class="el-content uk-panel"><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:8">Встроенные</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="9:6">речевые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="16:9">материалы</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:1">.</span></div></li>\r\n \t<li><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:12">Медиаплеер</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:3">для</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="17:8">записи</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="26:6">речевых</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="33:9">материалов</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:1">.</span></li>\r\n</ul>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoaz003ayud4y47rqn9t}	published	2025-11-29 18:58:24.781	2025-12-11 19:25:54.975	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/ac40-AC40.webp}	Клинический высокочастотный аудиометр AC 40 с двумя	Клинический высокочастотный аудиометр AC 40 с двумя	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoaz003ayud4y47rqn9t
cmiknmoax0039yud4mq7l7vni	AD226	AD226	ad226	Аудиометр AD 226 – диагностический поликлинический аудиометр\r\nс возможностью сохранения в памяти всех данных, полученных в результате\r\nобследования. Данный аппарат малогабаритный и компактный. Его назначение –\r\nобследования по костной и воздушной проводимости. Предполагается 11 тестовых\r\nчастот. Аудиометр имеет 2 варианта модификации:\r\n- AD 226 Licence B — диагностический аудиометр с надпороговыми тестами:\r\nABLB, Stenger, тест автоматического определения порогов слуха HW.\r\n- AD 226 Licence E — диагностический аудиометр с надпороговыми тестами: SISI,\r\nABLB, Stenger, Langenbeck , тест Бекеши, тест автоматического определения\r\nпорогов слуха.\r\n<p style="text-align: center;"><strong>Особенности аудиометра AD 226</strong></p>\r\n- Исследование по воздушному и костному звукопроведению на 11 тестовых\r\nчастотах.\r\n- Частотный диапазон: 125 – 8 000 Гц.\r\n- Интенсивность: от –10 дБ до 120 дБ по воздушному звукопроведению и от –10\r\nдБ до 80 дБ по костному звукопроведению с шагом 1 или 5 дБ.\r\n- Специальные режимы тестирования: SISI, ABLB, Stenger, Langenbeck, тест\r\nБекеши.\r\n- Автоопределение порога.\r\n- Встроенный микрофон для связи с пациентом.\r\n- Кнопка ответа пациента.\r\n- Индикация режима тестирования на монохромном ЖК-экране.\r\n- Передачи результатов исследования на ПК.\r\n- Помимо стандартной комплектации предусмотрены дополнительные\r\nпринадлежности.\r\n- Маскировка узкополосным / белым шумом.\r\n- Данные сохраняются в памяти аудиометра.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4993 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/diagnostic-suite_3sw_screeens-d6366cf9.webp" alt="" width="1200" height="472" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	Аудиометр AD 226 – диагностический поликлинический аудиометр\r\nс возможностью сохранения в памяти всех данных, полученных в результате\r\nобследования. Данный аппарат малогабаритный и компактный. Его назначение –\r\nобследования по костной и воздушной проводимости. Предполагается 11 тестовых\r\nчастот. Аудиометр имеет 2 варианта модификации:\r\n- AD 226 Licence B — диагностический аудиометр с надпороговыми тестами:\r\nABLB, Stenger, тест автоматического определения порогов слуха HW.\r\n- AD 226 Licence E — диагностический аудиометр с надпороговыми тестами: SISI,\r\nABLB, Stenger, Langenbeck , тест Бекеши, тест автоматического определения\r\nпорогов слуха.\r\n<p style="text-align: center;"><strong>Особенности аудиометра AD 226</strong></p>\r\n- Исследование по воздушному и костному звукопроведению на 11 тестовых\r\nчастотах.\r\n- Частотный диапазон: 125 – 8 000 Гц.\r\n- Интенсивность: от –10 дБ до 120 дБ по воздушному звукопроведению и от –10\r\nдБ до 80 дБ по костному звукопроведению с шагом 1 или 5 дБ.\r\n- Специальные режимы тестирования: SISI, ABLB, Stenger, Langenbeck, тест\r\nБекеши.\r\n- Автоопределение порога.\r\n- Встроенный микрофон для связи с пациентом.\r\n- Кнопка ответа пациента.\r\n- Индикация режима тестирования на монохромном ЖК-экране.\r\n- Передачи результатов исследования на ПК.\r\n- Помимо стандартной комплектации предусмотрены дополнительные\r\nпринадлежности.\r\n- Маскировка узкополосным / белым шумом.\r\n- Данные сохраняются в памяти аудиометра.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-4993 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/diagnostic-suite_3sw_screeens-d6366cf9.webp" alt="" width="1200" height="472" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoau0037yud4qgxctobe}	published	2025-11-29 18:58:24.777	2025-12-11 19:09:00.106	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/ad226-ad226.webp}	Аудиометр AD 226 – диагностический поликлинический аудиометр	Аудиометр AD 226 – диагностический поликлинический аудиометр	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoau0037yud4qgxctobe
cmiknmoa9002uyud49qhcag57	Titan	Titan	titan	Универсальное, функциональное, компактное, надежное и быстрое\r\nустройство, подходящее как для быстрого скринингового исследования, так и для комплексного\r\nобследования среднего уха. Платформа Titan – это оптимальное решение для проведения скрининга\r\nслуха новорожденных или последующей диагностики. Это модульную систему можно\r\nконфигурировать для автоматического выполнения тестов ABR, DPOAE и тимпанометрии, что\r\nпозволяет проверить весь слуховой путь. Данный аудиометр является гибридным (технология true\r\nhybrid), что означает возможность работы на устройстве как с использованием компьютера, так и без\r\nнего. Эргономичная платформа Titan предлагает полностью настраиваемые протоколы, тестовые\r\nэкраны и отчеты о пациентах. Такие возможности в сочетании с потрясающим стимулом CE-Chirp,\r\nБайесовским взвешиванием и возможностями автоматического или ручного взвешивания делают эту\r\nсистему первой и единной в своем роде.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5006 size-full" src="https://a.acoustic.uz/uploads/products/titan-titanfront-cbbba.webp" alt="" width="1920" height="1281" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><strong>Модули импедансометрии:</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">\r\n<p class="uk-scrollspy-inview "><strong>Automated ABR</strong></p>\r\n<p class="uk-scrollspy-inview "><span class="EzKURWReUAB5oZgtQNkl" data-src-align="4:9">Автоматизированный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:3:18:6">модуль</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:3">ABR</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:4">использует</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:8">стимул</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="36:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="37:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="53:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="57:8">взвешенное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="66:9">усреднение</span>, что <span class="EzKURWReUAB5oZgtQNkl" data-src-align="76:2">позволяет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="79:6">сократить</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="91:5">время</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:4">тестирования</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="100:2">до</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="106:2">50</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="108:1">%</span> по <span class="EzKURWReUAB5oZgtQNkl" data-src-align="110:8">сравнению</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:2">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="122:11">традиционными</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="140:7">стимулами</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:5">щелчка</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="147:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="152:4">Благодаря</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="160:4">удобному</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="179:7">дисплею</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="186:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="194:13">совместимости</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="188:5">треков</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="208:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="217:12">настраиваемым</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="212:4">пользователем</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="230:9">протоколам</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="239:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="245:5">Titan</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="251:8">сочетает</span> в себе <span class="EzKURWReUAB5oZgtQNkl" data-src-align="260:4">быстрое</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="264:1">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="266:7">качественное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="274:7">тестирование</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="282:4">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="287:9">непревзойденным</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="297:9">удобством</span> использования<span class="EzKURWReUAB5oZgtQNkl" data-src-align="306:1">.</span></p>\r\n</td>\r\n<td style="width: 50%;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Просто</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:5">нажмите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:1">“</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:5">ПУСК</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:1">”</span></strong>\r\n\r\n&nbsp;\r\n\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:9">После</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:11">подготовки</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:7">пациента</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="31:6">просто</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:5">нажмите</span> "<span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:5">Пуск</span>" <span class="EzKURWReUAB5oZgtQNkl" data-src-align="50:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="54:5">дождитесь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="67:5">получения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="73:6">результата</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="79:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="102:8">Требуется</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="81:7">минимальное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="94:4">время</span> на <span class="EzKURWReUAB5oZgtQNkl" data-src-align="89:4">тестирование</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="111:3">а</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:7">стандартный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="149:8">протокол</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="127:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="129:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="130:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="135:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="138:2">35</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="141:2">дБ</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="144:3">nHL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="147:1">)</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="158:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="169:8">надежный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="178:9">автоматизированный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="192:4">тест</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="188:3">ABR</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="197:4">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="204:11">чувствительностью</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="219:4">99,9</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="223:1">%</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="225:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="231:11">специфичностью</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="246:9">более</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="256:2">96</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="258:1">%</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="259:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="264:6">Выберите</span> один <span class="EzKURWReUAB5oZgtQNkl" data-src-align="271:4">из</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="276:4">четырех</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="281:11">датчиков</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="293:4">которые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="302:13">автоматически</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="316:8">обнаруживаются</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="325:4">при</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="330:9">подключении</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="340:2">к</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="347:12">предусилителю</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="359:1">.</span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5007 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/wbt-efe695f5.webp" alt="" width="798" height="550" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	Универсальное, функциональное, компактное, надежное и быстрое\r\nустройство, подходящее как для быстрого скринингового исследования, так и для комплексного\r\nобследования среднего уха. Платформа Titan – это оптимальное решение для проведения скрининга\r\nслуха новорожденных или последующей диагностики. Это модульную систему можно\r\nконфигурировать для автоматического выполнения тестов ABR, DPOAE и тимпанометрии, что\r\nпозволяет проверить весь слуховой путь. Данный аудиометр является гибридным (технология true\r\nhybrid), что означает возможность работы на устройстве как с использованием компьютера, так и без\r\nнего. Эргономичная платформа Titan предлагает полностью настраиваемые протоколы, тестовые\r\nэкраны и отчеты о пациентах. Такие возможности в сочетании с потрясающим стимулом CE-Chirp,\r\nБайесовским взвешиванием и возможностями автоматического или ручного взвешивания делают эту\r\nсистему первой и единной в своем роде.\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5006 size-full" src="https://a.acoustic.uz/uploads/products/titan-titanfront-cbbba.webp" alt="" width="1920" height="1281" /></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%; text-align: center;"><strong>Модули импедансометрии:</strong></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;">\r\n<p class="uk-scrollspy-inview "><strong>Automated ABR</strong></p>\r\n<p class="uk-scrollspy-inview "><span class="EzKURWReUAB5oZgtQNkl" data-src-align="4:9">Автоматизированный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:3:18:6">модуль</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:3">ABR</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="25:4">использует</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:8">стимул</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="34:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="36:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="37:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="42:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="53:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="57:8">взвешенное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="66:9">усреднение</span>, что <span class="EzKURWReUAB5oZgtQNkl" data-src-align="76:2">позволяет</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="79:6">сократить</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="91:5">время</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="86:4">тестирования</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="100:2">до</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="106:2">50</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="108:1">%</span> по <span class="EzKURWReUAB5oZgtQNkl" data-src-align="110:8">сравнению</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:2">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="122:11">традиционными</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="140:7">стимулами</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="134:5">щелчка</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="147:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="152:4">Благодаря</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="160:4">удобному</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="179:7">дисплею</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="186:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="194:13">совместимости</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="188:5">треков</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="208:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="217:12">настраиваемым</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="212:4">пользователем</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="230:9">протоколам</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="239:1">,</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="245:5">Titan</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="251:8">сочетает</span> в себе <span class="EzKURWReUAB5oZgtQNkl" data-src-align="260:4">быстрое</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="264:1">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="266:7">качественное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="274:7">тестирование</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="282:4">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="287:9">непревзойденным</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="297:9">удобством</span> использования<span class="EzKURWReUAB5oZgtQNkl" data-src-align="306:1">.</span></p>\r\n</td>\r\n<td style="width: 50%;"><strong><span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:6">Просто</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="7:5">нажмите</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="13:1">“</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="14:5">ПУСК</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="19:1">”</span></strong>\r\n\r\n&nbsp;\r\n\r\n<span class="EzKURWReUAB5oZgtQNkl" data-src-align="0:9">После</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="18:11">подготовки</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="10:7">пациента</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="31:6">просто</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="38:5">нажмите</span> "<span class="EzKURWReUAB5oZgtQNkl" data-src-align="44:5">Пуск</span>" <span class="EzKURWReUAB5oZgtQNkl" data-src-align="50:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="54:5">дождитесь</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="67:5">получения</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="73:6">результата</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="79:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="102:8">Требуется</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="81:7">минимальное</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="94:4">время</span> на <span class="EzKURWReUAB5oZgtQNkl" data-src-align="89:4">тестирование</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="111:3">а</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="119:7">стандартный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="149:8">протокол</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="127:2">CE</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="129:1">-</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="130:5">Chirp</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="135:1">®</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="137:1">(</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="138:2">35</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="141:2">дБ</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="144:3">nHL</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="147:1">)</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="158:8">обеспечивает</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="169:8">надежный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="178:9">автоматизированный</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="192:4">тест</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="188:3">ABR</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="197:4">с</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="204:11">чувствительностью</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="219:4">99,9</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="223:1">%</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="225:3">и</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="231:11">специфичностью</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="246:9">более</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="256:2">96</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="258:1">%</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="259:1">.</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="264:6">Выберите</span> один <span class="EzKURWReUAB5oZgtQNkl" data-src-align="271:4">из</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="276:4">четырех</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="281:11">датчиков</span>, <span class="EzKURWReUAB5oZgtQNkl" data-src-align="293:4">которые</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="302:13">автоматически</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="316:8">обнаруживаются</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="325:4">при</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="330:9">подключении</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="340:2">к</span> <span class="EzKURWReUAB5oZgtQNkl" data-src-align="347:12">предусилителю</span><span class="EzKURWReUAB5oZgtQNkl" data-src-align="359:1">.</span></td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 100%;"><img class="aligncenter wp-image-5007 size-full" src="http://acoustic-healthcare.uz/wp-content/uploads/2024/12/wbt-efe695f5.webp" alt="" width="798" height="550" /></td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000dab1n3gho77dm	\N	{cmiknmoa6002syud4czqaduge}	published	2025-11-29 18:58:24.753	2025-12-11 19:25:55.002	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/titan-titanfront-cbbba.webp}	Универсальное, функциональное, компактное, надежное и быстрое	Универсальное, функциональное, компактное, надежное и быстрое	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	interacoustics	cmiknmoa6002syud4czqaduge
cmiknmo86001fyud4ieip6sck	ReSound OMNIA 60 DRWC	ReSound OMNIA 60 DRWC	resound-omnia-60-drwc	Сhastota diapazoni\nPremium texnologiyalar\n- Tinnitus tovush generatori\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\nImpuls shovqinni kamaytirish\nBinaural yo’nalish\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\nStandart texnologik uskunalar\n— Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\nQabul qiluvchining quvvatini avtomatik aniqlash\nAsosiy ovozni  shaxsiylashtirish imkoniyatlariga ega bo’lgan ReSound Smart 3D™ ilovasi\n- Yangi dizayn - silliq chiziqlar va kichraytirilgan o'lcham\n— Zaryadlanuvchi model – 1 martalik zaryadda 30 soatgacha, 50% oqimda 24 soat\n— Tanlash uchun 3 turdagi zaryadlovchi qurilmalar: — premium (3 ta toʻliq quvvat olish uchun quvvat banki) — standart (zaryadlash qutisi, tarmoqdan quvvatlanadi)\n— iSolat TM nanotexnologik qoplama\n— Har qanday almashtiriladigan quvvat turini qabul qiladi (LP, MP, HP, UP, MM)\n— Cochlear Nucleus 7 va Kanso 2 bilan bimodal yechim\nZamonaviy turmush tarzi uchun samarali  yechim.\nAsosiy texnologik jihozlar\n17 ta kanal\nAtrof-muhitni optimallashtiruvchi II\nAtrof-muhitni optimallashtiruvchi\nUshbu Texnologiya bilan Atrofni 360 gradusda fazoviy idrok etish.\nBinaural yo'nalish bilan fazoviy idrok etish III\nFront Focus (Old fokus)\nKo'p darajali impuls shovqinini berish\nKengaytirilgan audio moslashtirish opsiyalariga ega ReSound Smart 3D™ ilovasi	<div class="icon-block">\r\n\r\n<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 48.7654%;"><!-- Image removed: file not found -->\r\n\r\n<hr />\r\n\r\n<!-- Image removed: file not found --></td>\r\n<td style="width: 51.2346%;">— Премиальные технологии\r\n— Новый дизайн — гладкие линии и уменьшенный размер\r\n— Перезаряжаемая модель- до 30 ч от 1 заряда, 24 ч при 50% стриминга\r\n— 3 вида зарядных устройств на выбор: — премиум (powerbank на 3 полных заряда) — стандарт (зарядный футляр, работающий от сети) — настольная (база, работающая от сети)\r\n— IP68\r\n— Покрытие iSolate TM nanotech\r\n— Сменный ресивер на любой тип мощности (LP, MP, HP, UP,MM)\r\n— Прямой аудиостриминг с устройств Apple и Android\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear Nucleus 7 и Kanso 2\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 748px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 960 DRWC</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 560 DRWC</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 460 DRWC</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для современного продуктивного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для умеренного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Стандартная технологическая комплектация</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Базовая технологическая комплектация</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">17 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения ІІ</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">-</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с технологией Все вокруг на 360</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с Бинауральной Haправленностью III</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Бинауральная направленность</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;">Front Focus (Фокус спереди)</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;">Многоуровневое подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000; height: 61px;">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000; height: 61px;">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr style="height: 91px;">\r\n<td style="border: 1px solid #000000; height: 91px;">Приложение ReSound Smart 3D™ с широкими возможностями персонализации звука</td>\r\n<td style="border: 1px solid #000000; height: 91px;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n<td style="border: 1px solid #000000; height: 91px;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;">Автоматическое определение мощности ресивера</td>\r\n<td style="border: 1px solid #000000; height: 61px;">Автоматическое определение мощности ресивера</td>\r\n<td style="border: 1px solid #000000; height: 61px;">Автоматическое определение мощности ресивера</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>\r\n</div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo84001dyud45n0nd7q6}	archived	2025-11-29 18:58:24.678	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-omnia-60-drwc-omnia60.webp}	<div class="icon-block">	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo84001dyud45n0nd7q6
cmiknmo9s002lyud4gen1pc9x	Oticon Own 1 CIC	Oticon Own 1 CIC	oticon-own-1-cic	<p>Oticon Own 1 CIC — bu OWN seriyasining 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (75 dB gacha) uchun mo‘ljallangan va Polaris platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni tovushning ajoyib tafsilotlari va qabul qilishning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model keksa foydalanuvchilar va turli vaziyatlarda nutq tushunarliligini yaxshilash uchun oddiy, ammo samarali yechimni talab qiladigan odamlar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;75 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 1 CIC — слуховоqй аппарат серии OWN 1 с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с лёгкой потерей слуха (до 75 дБ) и оснащена 64 каналами обработки звука на платформе Polaris. Частотный диапазон до 10 000 Hz обеспечивает исключительную детализацию звука и естественность восприятия. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон OWN Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пожилых пользователей и людей, которым требуется простое, но эффективное решение для улучшения разборчивости речи в различных ситуациях.</p><p><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;75 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris</p>	20500000.00	\N	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmo9l002gyud47nf6f7sd}	published	2025-11-29 18:58:24.736	2026-01-24 14:42:04.705	{adults}	in-stock	{cic-iic}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	<p>Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).</p>	<p>Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).</p>	{/uploads/products/oticon-own-itc-own_itc.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	<p>Цифровая платформа обработки звука с акцентом на разборчивость речи.</p>	<p>Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.</p>	{}	hearing-aids	cmiknmo9p002jyud4bi4diho7
cmkgp1a60002710rpofajaejp	OTICON JET 1 BTE PP	OTICON JET 1 BTE PP	oticon-jet-1-bte-pp	<p>OTICON JET 1 BTE PP — bu JET 1 seriyasining oshirilgan quvvatga ega quloq orqali eshitish apparati bo‘lib, o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (105 dB gacha) uchun mo‘ljallangan. Model Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, buzilishlarsiz kuchli va toza tovush kuchaytirishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutq tushunarliligida muhim bo‘lgan yuqori chastotali tovushlarni farqlash imkonini beradi. Apparat avtomatik shovqinni susaytirish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv mexanik balandlik regulyatori va dasturlarni almashtirish tugmasi orqali amalga oshiriladi. Korpus mustahkam, namlikdan himoyalangan materialdan yasalgan bo‘lib, ter va namlik ta'siriga chidamli. Model o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan, kundalik muloqot uchun kuchli kuchaytirishga muhtoj bo‘lgan foydalanuvchilar uchun mos keladi. Komplektatsiya standart 13-turli batareyalar, zaxira filtrlar va tozalash cho‘tkasini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 1 BTE PP — это заушный слуховой аппарат повышенной мощности серии JET 1, созданный для пользователей с умеренной и тяжёлой потерей слуха (до 105 дБ). Модель оснащена 48 каналами обработки звука на платформе Velox, что обеспечивает мощное и чистое усиление звука без искажений. Частотный диапазон до 8000 Hz позволяет различать высокочастотные звуки, важные для разборчивости речи. Аппарат оснащён системой автоматического шумоподавления, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется механическим регулятором громкости и кнопкой переключения программ. Корпус выполнен из прочного, влагозащищённого материала, устойчивого к воздействию пота и влаги. Модель подходит для пользователей с умеренной и тяжёлой потерей слуха, которым требуется мощное усиление для повседневного общения. Комплектация включает стандартные батарейки типа 13, запасные фильтры и чистую щётку.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	5850000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmo960027yud402cckj1a}	published	2026-01-16 09:46:05.88	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgp4y6n002810rp4dbwaxby	OTICON JET 1 MINIRITE	OTICON JET 1 MINIRITE	oticon-jet-1-minirite	<p>OTICON JET 1 MINIRITE — bu JET seriyasining sozlanadigan kuchaytirish (60/85/100/105 dB) bilan ixcham ichki kanalli eshitish apparati bo‘lib, eshitish qobiliyatini yo‘qotishning keng diapazoni uchun mos keladi. Model Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, yuqori sifatli tovush va nutqni tabiiy qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni hatto murakkab akustik sharoitlarda ham nutqning ajoyib tushunarliligiga yordam beradi. Apparat atrof-muhitga avtomatik moslashish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv masofadan boshqarish pulti yoki Oticon ON ilovasi yordamida amalga oshiriladi. IXcham dizayn va ergonomik shakl butun kun davomida qulay kiyishni ta'minlayadi. Model sezilmaslik, tovush sifati va zamonaviy texnologiyalarni qadrlaydigan foydalanuvchilar uchun mos keladi. Komplektatsiya simsiz masofadan boshqarish pulti, zaryadlovchi qurilma va silikon kallaklar to‘plamini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;60/85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 1 MINIRITE — это миниатюрный внутриканальный слуховой аппарат серии JET с регулируемым усилением (60/85/100/105 дБ), подходящий для широкого диапазона потерь слуха. Модель оснащена 48 каналами обработки звука на платформе Velox, что обеспечивает высокое качество звука и естественное восприятие речи. Частотный диапазон до 8000 Hz способствует отличной разборчивости речи даже в сложных акустических условиях. Аппарат оснащён системой автоматической адаптации к окружающей среде, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется с помощью пульта дистанционного управления или приложения Oticon ON. Компактный дизайн и эргономичная форма обеспечивают комфортное ношение в течение всего дня. Модель подходит для пользователей, которые ценят незаметность, качество звука и современные технологии. Комплектация включает беспроводной пульт дистанционного управления, зарядное устройство и набор силиконовых вкладышей.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;60/85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	6240000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmj000376v7lcbvog6c	{cmiknmo920024yud4061m57si}	published	2026-01-16 09:48:56.976	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfe94rt000f10rphyffflw2	OTICON XCEED 3 BTE SP 	OTICON XCEED 3 BTE SP 	oticon-xceed-3-bte-sp	<p>OTICON XCEED 3 BTE SP — bu o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (110 dB gacha) uchun mo‘ljallangan, standart o‘lchamdagi batareya bo‘limiga ega o‘rta sinf quloq orqali eshitish apparati. Model 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, turli akustik vaziyatlarga yuqori aniqlikda sozlash va moslashishni ta'minlayadi. 6500 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi bilan jihozlangan bo‘lib, u akustik muhitga avtomatik moslashadi va nutqni fon shovqinidan ajratib oladi. Shovqinni susaytirish texnologiyasi fon shovqini darajasini pasaytiradi, tinglash qulayligini yaxshilaydi. Fikr-mulohazalarni susaytirish funktsiyasi vizillashning paydo bo‘lishining oldini oladi. Boshqaruv mexanik balandlik regulyatori yordamida amalga oshiriladi. Apparat korpusi mustahkam materialdan yasalgan bo‘lib, namlik va changga chidamli. Model kundalik vaziyatlarda eshitishni yaxshilash uchun ishonchli va arzon yechim izlayotgan foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;110 dB<br><strong>Chastota diapazoni:</strong>&nbsp;6500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S</p>	<p>OTICON XCEED 3 BTE SP — это заушный слуховой аппарат среднего класса с батарейным отсеком стандартного размера, созданный для пользователей с умеренной и тяжёлой потерей слуха (до 110 дБ). Модель оснащена 48 каналами обработки звука, что обеспечивает высокую точность настройки и адаптацию к различным акустическим ситуациям. Частотный диапазон до 6500 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов, которая автоматически адаптируется к акустической обстановке, выделяя речь из фонового шума. Технология шумоподавления снижает уровень фонового шума, улучшая комфорт прослушивания. Функция подавления обратной связи предотвращает возникновение свиста. Управление осуществляется с помощью механического регулятора громкости. Корпус аппарата выполнен из прочного материала, устойчивого к влаге и пыли. Модель подходит для пользователей, которые ищут надёжное и доступное решение для улучшения слуха в повседневных ситуациях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;110 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 6500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhur000c3fedi6xe4eml}	published	2026-01-15 11:56:30.185	2026-01-24 14:42:04.705	{adults,elderly,children}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgpdrw6002910rp9mj2710n	OTICON JET 2 CIC	OTICON JET 2 CIC	oticon-jet-2-cic	<p>OTICON JET 2 CIC — bu JET 2 seriyasining 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (75 dB gacha) uchun mo‘ljallangan va Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi bilan jihozlangan bo‘lib, u akustik muhitga avtomatik moslashadi va nutqni fon shovqinidan ajratib oladi. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model keksa foydalanuvchilar va turli vaziyatlarda nutq tushunarliligini yaxshilash uchun oddiy, ammo samarali yechimni talab qiladigan odamlar uchun idealdir.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;75 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 2 CIC — слуховой аппарат серии JET 2 с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с лёгкой потерей слуха (до 75 дБ) и оснащена 48 каналами обработки звука на платформе Velox. Частотный диапазон до 8000 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов, которая автоматически адаптируется к акустической обстановке, выделяя речь из фонового шума. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пожилых пользователей и людей, которым требуется простое, но эффективное решение для улучшения разборчивости речи в различных ситуациях.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;75 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	5450000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmo8y0021yud4mdzfbdh1}	published	2026-01-16 09:55:48.726	2026-01-24 14:42:04.705	{}	in-stock	{cic-iic}	{}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgpmu54002b10rpoiiac2pe	OTICON JET 2 ITC	OTICON JET 2 ITC	oticon-jet-2-itc	<p>OTICON JET 2 ITC — bu JET seriyasining 312-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Modellar engil va o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan va Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi bilan jihozlangan bo‘lib, u akustik muhitga avtomatik moslashadi va nutqni fon shovqinidan ajratib oladi. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model shovqinli sharoitda nutqni yaxshiroq qabul qilishni talab qiladigan foydalanuvchilar uchun idealdir.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 2 ITC — слуховой аппарат  серии JET  с батарейным отсеком типа 312 и технологией беспроводного микрофона NFM. Модели предназначены для пользователей с лёгкой и умеренной потерей слуха (до 85 дБ) и оснащены 48 каналами обработки звука на платформе Velox. Частотный диапазон до 8000 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов, которая автоматически адаптируется к акустической обстановке, выделяя речь из фонового шума. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пользователей, которым требуется улучшенное восприятие речи в шумных условиях.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	5450000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhu800033fedfzxgwenw}	published	2026-01-16 10:02:51.544	2026-01-24 14:42:04.705	{adults}	in-stock	{bte}	{moderate,mild,severe}	{cash-card,installment-0,installment-6}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkf3r0b2000s6kzkl9adii2j	Oticon Own 5 CIC	Oticon Own 5 CIC	oticon-own-5-cic	<p>Oticon Own 5 CIC — bu OWN seriyasining boshlang‘ich darajadagi 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (75 dB gacha) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model keksa foydalanuvchilar va turli vaziyatlarda nutq tushunarliligini yaxshilash uchun oddiy, ammo samarali yechimni talab qiladigan odamlar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;75 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 5 CIC — слуховой аппарат начального уровня серии OWN с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с лёгкой потерей слуха (до 75 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пожилых пользователей и людей, которым требуется простое, но эффективное решение для улучшения разборчивости речи в различных ситуациях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;75 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmo9l002gyud47nf6f7sd}	published	2026-01-15 07:02:28.43	2026-01-24 14:42:04.705	{adults}	in-stock	{cic-iic}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkf2gvhe000q6kzkhpww399s	Oticon Own 3 ITC	Oticon Own 3 ITC	oticon-own-3-itc	<p>Oticon Own 3 ITC — bu OWN seriyasining 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (90 dB gacha) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yuqori ravshanligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model shovqinli sharoitda nutqni yaxshiroq qabul qilishni talab qiladigan foydalanuvchilar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;90 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 3 ITC — слуховой аппарат серии OWN с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с умеренной потерей слуха (до 90 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает высокую чёткость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пользователей, которым требуется улучшенное восприятие речи в шумных условиях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;90 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></p>	10900000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmiknmo9p002jyud4bi4diho7}	published	2026-01-15 06:26:36.003	2026-01-24 14:42:04.705	{adults}	in-stock	{itc}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkghmf5j001c10rpozyggfoh	OTICON XCEED 1 BTE SP	OTICON XCEED 1 BTE SP	oticon-xceed-1-bte-sp	<p>XCEED 1 BTE SP — bu 13-turdagi batareya bo‘limiga ega, og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (110 dB gacha) uchun mo‘ljallangan kuchli quloq orqali eshitish apparati. Model VELOX S platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, yuqori tovush ravshanligi va nutqni tabiiy qabul qilishni ta'minlayadi. 6500 Hz gacha bo‘lgan chastota diapazoni hatto murakkab akustik sharoitlarda ham nutqning ajoyib tushunarliligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi, shovqinni susaytirish va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. 2.4G texnologiyasi Oticon aksessuarlari bilan ishonchli simsiz ulanishni ta'minlayadi. Apparat korpusi mustahkam materialdan yasalgan bo‘lib, IP68 namlik himoyasiga ega, bu uni ter va namlik ta'siriga chidamli qiladi. Model og‘ir eshitish qobiliyatini yo‘qotgan, faol hayot tarzini olib boradigan yoki yuqori namlik sharoitida ishlaydigan foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;110 dB<br><strong>Chastota diapazoni:</strong>&nbsp;6500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></span></p>	<p>XCEED 1 BTE SP — это мощный заушный слуховой аппарат с батарейным отсеком типа 13, созданный для пользователей с тяжёлой потерей слуха (до 110 дБ). Модель оснащена 48 каналами обработки звука на платформе VELOX S, что обеспечивает высокую чёткость звука и естественное восприятие речи. Частотный диапазон до 6500 Hz обеспечивает отличную разборчивость речи даже в сложных акустических условиях. Аппарат оснащён системой направленных микрофонов, шумоподавлением и функцией подавления обратной связи. Технология 2.4G обеспечивает надёжное беспроводное соединение с аксессуарами Oticon. Корпус аппарата выполнен из прочного материала с влагозащитой IP68, что делает его устойчивым к воздействию пота и влаги. Модель подходит для пользователей с тяжёлой потерей слуха, которые ведут активный образ жизни или работают в условиях повышенной влажности.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;110 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 6500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></p>	16350000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhur000c3fedi6xe4eml}	published	2026-01-16 06:18:35.192	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkf3bmac000r6kzklcjp2dm2	Oticon Own 5 ITC	Oticon Own 5 ITC	oticon-own-5-itc	<p>Oticon Own 5 ITC — bu OWN 5 seriyasining boshlang‘ich darajadagi 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (90 dB gacha) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model shovqinli sharoitda nutqni yaxshiroq qabul qilishni talab qiladigan foydalanuvchilar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;90 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 5 ITC — это слуховой аппарат начального уровня серии OWN 5 с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с умеренной потерей слуха (до 90 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пользователей, которым требуется улучшенное восприятие речи в шумных условиях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;90 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmiknmo9p002jyud4bi4diho7}	published	2026-01-15 06:50:30.421	2026-01-24 14:42:04.705	{adults}	in-stock	{itc}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkghhlrb001b10rprkqchk29	OTICON XCEED 1 BTE UP 	OTICON XCEED 1 BTE UP 	oticon-xceed-1-bte-up	<p>XCEED 1 BTE UP 675 2.4G 120 — bu chuqur eshitish qobiliyatini yo‘qotgan foydalanuvchilar (120 dB gacha) uchun mo‘ljallangan o‘ta kuchli quloq orqali eshitish apparati. Model innovatsion VELOX S platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, hatto maksimal kuchaytirishda ham ajoyib tovush ravshanligini ta'minlayadi. 6500 Hz gacha bo‘lgan chastota diapazoni nutqning maksimal tushunarliligi uchun optimallashtirilgan. Apparat UltraPower texnologiyasi bilan jihozlangan bo‘lib, u yuqori balandlik darajalarida ham buzilishlarsiz barqaror va toza kuchaytirishni ta'minlayadi. Shovqinni susaytirish tizimi va yo‘naltirilgan mikrofonlar shovqinli muhtida nutqni qabul qilishni yaxshilaydi. 2.4G texnologiyasini qo‘llab-quvvatlash Oticon aksessuarlari bilan ishonchli simsiz ulanishni ta'minlayadi. Apparat korpusi o‘ta mustahkam materialdan yasalgan bo‘lib, IP68 namlik himoyasiga ega, bu uni ekstremal foydalanish sharoitlariga chidamli qiladi. Model eng og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar, shu jumladan yuqori darajadagi shovqin sharoitida ishlaydigan yoki faol hayot tarzini olib boradiganlar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;120 dB<br><strong>Chastota diapazoni:</strong>&nbsp;6500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></p>	<p>XCEED 1 BTE UP 675 2.4G 120 — это сверхмощный заушный слуховой аппарат, созданный для пользователей с глубокой потерей слуха (до 120 дБ). Модель оснащена 48 каналами обработки звука на инновационной платформе VELOX S, что обеспечивает исключительную чёткость звука даже при максимальном усилении. Частотный диапазон до 6500 Hz оптимизирован для максимальной разборчивости речи. Аппарат оснащён технологией UltraPower, которая обеспечивает стабильное и чистое усиление без искажений даже на высоких уровнях громкости. Система шумоподавления и направленные микрофоны улучшают восприятие речи в шумной обстановке. Поддержка технологии 2.4G обеспечивает надёжное беспроводное соединение с аксессуарами Oticon. Корпус аппарата выполнен из сверхпрочного материала с влагозащитой IP68, что делает его устойчивым к экстремальным условиям использования. Модель подходит для пользователей с самой тяжёлой потерей слуха, включая тех, кто работает в условиях высокого уровня шума или ведёт активный образ жизни.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;120 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 6500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></p>	9100000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhv2000i3fedo0usss8j}	published	2026-01-16 06:14:50.472	2026-01-24 14:42:04.705	{}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfegfbv000g10rp64rk45r8	OTICON XCEED 3 BTE UP	OTICON XCEED 3 BTE UP	oticon-xceed-3-bte-up	<p>OTICON XCEED 3 BTE UP — bu oshirilgan quvvatga ega, og‘ir va chuqur eshitish qobiliyatini yo‘qotgan foydalanuvchilar (120 dB gacha) uchun mo‘ljallangan quloq orqali eshitish apparati. Model 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, turli akustik vaziyatlarga yuqori aniqlikda sozlash va moslashishni ta'minlayadi. 6300 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi bilan jihozlangan bo‘lib, u akustik muhitga avtomatik moslashadi va nutqni fon shovqinidan ajratib oladi. Shovqinni susaytirish texnologiyasi fon shovqini darajasini pasaytiradi, tinglash qulayligini yaxshilaydi. Fikr-mulohazalarni susaytirish funktsiyasi vizillashning paydo bo‘lishining oldini oladi. Boshqaruv mexanik balandlik regulyatori yordamida amalga oshiriladi. Apparat korpusi mustahkam materialdan yasalgan bo‘lib, namlik va changga chidamli. Model og‘ir eshitish qobiliyatini yo‘qotgan, kundalik muloqot uchun kuchli kuchaytirishga muhtoj bo‘lgan foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;120 dB<br><strong>Chastota diapazoni:</strong>&nbsp;6300 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></p>	<p>OTICON XCEED 3 BTE UP — это заушный слуховой аппарат с увеличенной мощностью, созданный для пользователей с тяжёлой и глубокой потерей слуха (до 120 дБ). Модель оснащена 48 каналами обработки звука, что обеспечивает высокую точность настройки и адаптацию к различным акустическим ситуациям. Частотный диапазон до 6300 Hz обеспечивает хорошую разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов, которая автоматически адаптируется к акустической обстановке, выделяя речь из фонового шума. Технология шумоподавления снижает уровень фонового шума, улучшая комфорт прослушивания. Функция подавления обратной связи предотвращает возникновение свиста. Управление осуществляется с помощью механического регулятора громкости. Корпус аппарата выполнен из прочного материала, устойчивого к влаге и пыли. Модель подходит для пользователей с тяжёлой потерей слуха, которые нуждаются в мощном усилении для повседневного общения.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;120 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 6300 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhv2000i3fedo0usss8j}	published	2026-01-15 12:02:10.46	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfdy8gs000d10rpk1uxus2f	OTICON OPN S 3 MINIRITE	OTICON OPN S 3 MINIRITE	oticon-opn-s-3-minirite	<p>OTICON OPN S 3 MINIRITE — bu simsiz aloqa uchun 2.4G texnologiyasini qo‘llab-quvvatlovchi ixcham ichki kanalli eshitish apparati. Model engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/100/105 dB) uchun mo‘ljallangan va 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 7500 Hz gacha bo‘lgan chastota diapazoni yuqori darajadagi tovush tafsilotlari va qabul qilishning tabiiyligini ta'minlayadi. Apparat Spatial Sound funktsiyasiga ega OpenSound Navigator tizimi bilan jihozlangan bo‘lib, u 360 gradusli tovush landshaftini yaratadi, bu foydalanuvchiga tovush fazosida osongina harakatlanish imkonini beradi. OpenSound Optimizer texnologiyasi fikr-mulohazalar xavfini butunlay bartaraf etadi. Bluetooth qo‘llab-quvvatlash tovush oqimini uzatish uchun smartfonlar va boshqa qurilmalarga bevosita ulanish imkonini beradi. Boshqaruv Oticon ON ilovasi orqali yoki apparatdagi sensorli panel yordamida amalga oshiriladi. IXcham va ergonomik dizayn kun davomida qulay kiyishni ta'minlayadi. Model sezilmaslik, tovush sifati va zamonaviy texnologiyalarni qadrlaydigan foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br></p>	<p>OTICON OPN S 3 MINIRITE — это миниатюрный внутриканальный слуховой аппарат с поддержкой технологии 2.4G для беспроводной связи. Модель предназначена для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/100/105 дБ) и оснащена 48 каналами обработки звука. Частотный диапазон до 7500 Hz обеспечивает высокую детализацию звука и естественность восприятия. Аппарат оснащён системой OpenSound Navigator с функцией Spatial Sound, которая создаёт 360-градусный звуковой ландшафт, позволяя пользователю легко ориентироваться в звуковом пространстве. Технология OpenSound Optimizer полностью устраняет риск обратной связи. Поддержка Bluetooth позволяет напрямую подключаться к смартфонам и другим устройствам для потоковой передачи звука. Управление осуществляется через приложение Oticon ON или с помощью сенсорной панели на аппарате. Компактный и эргономичный дизайн обеспечивает комфортное ношение в течение всего дня. Модель подходит для пользователей, которые ценят незаметность, качество звука и современные технологии.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX<br><br></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmj000376v7lcbvog6c	{cmiknmhug00063fedh20uj395}	published	2026-01-15 11:48:01.756	2026-01-24 14:42:04.705	{adults,elderly}	in-stock	{ric}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfbsdtc000410rpongtm2pt	Oticon OPN S 1 BTE PP	Oticon OPN S 1 BTE PP	oticon-opn-s-1-bte-pp	<p>Oticon OPN S 1 BTE PP — bu og‘ir va chuqur eshitish qobiliyatini yo‘qotgan foydalanuvchilar uchun mo‘ljallangan, maksimal 105 dB kuchaytirishga ega premium quloq orqali eshitish apparati. Model innovatsion VELOX S platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, ajoyib tovush ravshanligi va nutqni tabiiy qabul qilishni ta'minlaydi. 10 000 Hz gacha bo‘lgan chastota diapazoni hatto eng yuqori tovushlarni ham qabul qilish imkonini beradi, bu undosh tovushlarni farqlash va musiqani qabul qilish uchun muhimdir. Apparat OpenSound Navigator texnologiyasi bilan jihozlangan bo‘lib, u atrof-muhit tovush muhitini soniyada 100 marta tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. Bluetooth 5.0 qo‘llab-quvvatlash iPhone, Android qurilmalari, televizorlar va boshqa gadjetlardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv Oticon ON ilovasi orqali amalga oshiriladi, bu dasturlarni sozlash, balandlikni tartibga solish va batareya zaryadini kuzatish imkonini beradi. Apparat korpusi mustahkam, namlikdan himoyalangan materialdan yasalgan bo‘lib, uni ter va namlik ta'siriga chidamli qiladi. Model tovush sifati, texnologik jihatlar va qulaylikni qadrlaydigan faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></span></p>	<p>Oticon OPN S 1 BTE PP — это премиальный заушный слуховой аппарат с максимальным усилением 105 дБ, предназначенный для пользователей с тяжёлой и глубокой потерей слуха. Модель оснащена 64 каналами обработки звука на инновационной платформе VELOX S, что обеспечивает исключительную чёткость звука и естественное восприятие речи. Частотный диапазон до 10 000 Hz позволяет улавливать даже самые высокие звуки, что важно для различения согласных и восприятия музыки. Аппарат оснащён технологией OpenSound Navigator, которая анализирует окружающую звуковую среду 100 раз в секунду и автоматически адаптирует настройки для оптимального восприятия речи. Поддержка Bluetooth 5.0 обеспечивает прямую потоковую передачу звука с iPhone, Android-устройств, телевизоров и других гаджетов. Управление осуществляется через приложение Oticon ON, которое позволяет настраивать программы, регулировать громкость и отслеживать заряд батареи. Корпус аппарата выполнен из прочного, влагозащищённого материала, что делает его устойчивым к воздействию пота и влаги. Модель подходит для активных пользователей, которые ценят качество звука, технологичность и удобство.</p><p><span><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></span></p>	20450000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhux000f3fedqav63e6o}	published	2026-01-15 10:47:29.521	2026-01-24 14:42:04.705	{adults,elderly,children}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfbhq6k000310rpg4k56tkf	Oticon RIA2 PRO ITC	Oticon RIA2 PRO ITC	oticon-ria2-pro-itc	<p>Oticon RIA2 PRO ITC — bu chap va o‘ng quloq uchun mo‘ljallangan, engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/90/100 dB) uchun professional ichki kanalli eshitish apparatlari. Model INIUM SENSE platformasida 6 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, turli akustik vaziyatlarga yuqori aniqlikda sozlash va moslashishni ta'minlaydi. 7500 Hz gacha bo‘lgan chastota diapazoni nutqning ajoyib tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat yo‘naltirilgan mikrofonlar tizimi, shovqinni susaytirish va fikr-mulohazalarni susaytirish bilan jihozlangan. Boshqaruv Oticon ON ilovasi orqali yoki masofadan boshqarish pulti yordamida amalga oshirilishi mumkin. Model tez-tez shovqinli muhtida bo‘ladigan va ravshan tovushga muhtoj bo‘lgan faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;6<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/90/100 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7500 Hz gacha<br><strong>Platforma:</strong>&nbsp;INIUM SENSE<br><br></span></p>	<p>Oticon RIA2 PRO ITC — это профессиональные внутриканальные слуховые аппараты для левого и правого уха, предназначенные для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/90/100 дБ). Модель оснащена 6 каналами обработки звука на платформе INIUM SENSE, что обеспечивает высокую точность настройки и адаптацию к различным акустическим ситуациям. Частотный диапазон до 7500 Hz обеспечивает отличную разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов, шумоподавлением и подавлением обратной связи. Управление возможно через приложение Oticon ON или с помощью пульта дистанционного управления. Модель подходит для активных пользователей, которые часто находятся в шумной обстановке и нуждаются в чётком звуке.</p><p><span><strong>Количество каналов:</strong>&nbsp;6<br><strong>Максимальное усиление:</strong>&nbsp;85/90/100 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7500 Hz<br><strong>Платформа:</strong>&nbsp;INIUM SENSE<br><br></span></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmkfbg3oh000210rpldh0vtu5}	published	2026-01-15 10:39:12.332	2026-01-24 14:42:04.705	{}	in-stock	{itc}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkghr7kd001d10rpq9m79fax	OTICON RUBY 2 BTE PP	OTICON RUBY 2 BTE PP	OTICON RUBY 2 BTE PP	<p>RUBY 2 BTE PP — bu ochiq tovush texnologiyasiga ega, o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (105 dB gacha) uchun mo‘ljallangan quloq orqali eshitish apparati. Model VELOX platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, yuqori tovush ravshanligi va nutqni tabiiy qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning ajoyib tushunarliligi va tovush tafsilotlarini ta'minlayadi. Apparat OpenSound Navigator tizimi bilan jihozlangan bo‘lib, u atrof-muhitni soniyada 100 marta tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. OpenSound Optimizer texnologiyasi fikr-mulohazalar xavfini butunlay bartaraf etadi. Bluetooth qo‘llab-quvvatlash tovush oqimini uzatish uchun smartfonlar va boshqa qurilmalarga bevosita ulanish imkonini beradi. Boshqaruv Oticon ON ilovasi orqali yoki apparatdagi tugmalar yordamida amalga oshiriladi. Apparat korpusi IP68 namlik himoyasi darajasiga ega, bu uni ter, yomg‘ir va changga chidamli qiladi. Model tovush sifati va qulaylikni qadrlaydigan faol foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br></p>	<p>RUBY 2 BTE PP — это заушный слуховой аппарат с технологией открытого звука, созданный для пользователей с умеренной и тяжёлой потерей слуха (до 105 дБ). Модель оснащена 48 каналами обработки звука на платформе VELOX, что обеспечивает высокую чёткость звука и естественное восприятие речи. Частотный диапазон до 8000 Hz обеспечивает отличную разборчивость речи и детализацию звука. Аппарат оснащён системой OpenSound Navigator, которая анализирует окружающую среду 100 раз в секунду и автоматически адаптирует настройки для оптимального восприятия речи. Технология OpenSound Optimizer полностью устраняет риск обратной связи. Поддержка Bluetooth позволяет напрямую подключаться к смартфонам и другим устройствам для потоковой передачи звука. Управление осуществляется через приложение Oticon ON или с помощью кнопок на аппарате. Корпус аппарата имеет степень влагозащиты IP68, что делает его устойчивым к поту, дождю и пыли. Модель подходит для активных пользователей, которые ценят качество звука и удобство.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX<br><br></p>	6150000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhv8000l3fedxjo0f1e1}	published	2026-01-16 06:22:18.638	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-6,installment-0}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfbymho000510rpv1szwv58	Oticon OPN S 1 MINI RITE	Oticon OPN S 1 MINI RITE	oticon-opn-s-1-mini-rite	<p>Oticon OPN S 1 MINI RITE — bu ochiq tovush texnologiyasiga ega, engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/100/105 dB) uchun mo‘ljallangan ixcham ichki kanalli eshitish apparati. Model VELOX S platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, tovushni tabiiy va qulay qabul qilishni ta'minlaydi. 10 000 Hz gacha bo‘lgan chastota diapazoni nutqning ajoyib tushunarliligi va tovush tafsilotlarini ta'minlayadi. Apparat OpenSound Optimizer tizimi bilan jihozlangan bo‘lib, u paydo bo‘lishidan oldin fikr-mulohazalarni susaytiradi va tovushning barqarorligini ta'minlayadi. Bluetooth qo‘llab-quvvatlash tovush oqimini uzatish uchun smartfonlar va boshqa qurilmalarga bevosita ulanish imkonini beradi. Boshqaruv Oticon ON ilovasi orqali yoki apparatdagi sensorli panel yordamida amalga oshiriladi. IXcham va ergonomik dizayn kun davomida qulay kiyishni ta'minlayadi. Model sezilmaslik, tovush sifati va zamonaviy texnologiyalarni qadrlaydigan foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></span></p>	<p>Oticon OPN S 1 MINI RITE — это миниатюрный внутриканальный слуховой аппарат с технологией открытого звука, предназначенный для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/100/105 дБ). Модель оснащена 64 каналами обработки звука на платформе VELOX S, что обеспечивает естественное и комфортное восприятие звука. Частотный диапазон до 10 000 Hz обеспечивает отличную разборчивость речи и детализацию звука. Аппарат оснащён системой OpenSound Optimizer, которая подавляет обратную связь до её возникновения, обеспечивая стабильность звучания. Поддержка Bluetooth позволяет напрямую подключаться к смартфонам и другим устройствам для потоковой передачи звука. Управление осуществляется через приложение Oticon ON или с помощью сенсорной панели на аппарате. Компактный и эргономичный дизайн обеспечивает комфортное ношение в течение всего дня. Модель подходит для пользователей, которые ценят незаметность, качество звука и современные технологии.</p><p><span><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></span></p>	15000000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmj000376v7lcbvog6c	{cmiknmo920024yud4061m57si}	published	2026-01-15 10:52:20.7	2026-01-24 14:42:04.705	{}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfd7315000810rpxom3gqdr	Oticon OPN 1 CIC	Oticon OPN 1 CIC	oticon-opn-1-cic	<p>Oticon OPN 1 CIC — bu to‘liq ichki kanalli eshitish apparati bo‘lib, u eshitish yo‘lida to‘liq joylashgan va atrof-muhit uchun deyarli ko‘rinmasdir. Model engil va o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan va VELOX platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni nutq va atrof-muhit tovushlarini tabiiy qabul qilishni ta'minlayadi. Apparat OpenSound Navigator tizimi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. OpenSound Optimizer texnologiyasi fikr-mulohazalarning paydo bo‘lishining oldini oladi. Boshqaruv masofadan boshqarish pulti yoki Oticon ON ilovasi yordamida amalga oshiriladi. IXcham o‘lcham va individual shakl qulay kiyishni ta'minlayadi. Model sezilmaslik va tovushning tabiiyligini qadrlaydigan foydalanuvchilar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br></p>	<p>Oticon OPN 1 CIC — это полностью внутриканальный слуховой аппарат, который полностью располагается в слуховом проходе и практически невидим для окружающих. Модель предназначена для пользователей с лёгкой и умеренной потерей слуха (до 85 дБ) и оснащена 64 каналами обработки звука на платформе VELOX. Частотный диапазон до 10 000 Hz обеспечивает естественное восприятие речи и звуков окружающей среды. Аппарат оснащён системой OpenSound Navigator, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Технология OpenSound Optimizer предотвращает возникновение обратной связи. Управление осуществляется с помощью пульта дистанционного управления или приложения Oticon ON. Компактный размер и индивидуальная форма обеспечивают комфортное ношение. Модель идеально подходит для пользователей, которые ценят незаметность и естественность звучания.</p><p><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX<br><br></p>	20450000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmhtu00003fedtmseeloq}	published	2026-01-15 11:26:55.002	2026-01-24 14:42:04.705	{adults}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgoyu4l002610rpynnggfp0	OTICON JET 1 BTE	OTICON JET 1 BTE	oticon-jet-1-bte	<p>OTICON JET 1 BTE — bu JET 1 seriyasining boshlang‘ich darajadagi quloq orqali eshitish apparati bo‘lib, engil va o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan. Model Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, sifatli tovush kuchaytirish va nutqni qulay qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutq tushunarliligida muhim bo‘lgan yuqori chastotali tovushlarni farqlash imkonini beradi. Apparat avtomatik shovqinni susaytirish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv mexanik balandlik regulyatori va dasturlarni almashtirish tugmasi orqali amalga oshiriladi. Korpus mustahkam, namlikdan himoyalangan materialdan yasalgan bo‘lib, ter va namlik ta'siriga chidamli. Model eshitish apparatlaridan birinchi marta foydalanayotgan yoki kundalik muloqot uchun oddiy va ishonchli yechim izlayotgan foydalanuvchilar uchun mos keladi. Komplektatsiya standart 13-turli batareyalar, zaxira filtrlar va tozalash cho‘tkasini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 1 BTE — это заушный слуховой аппарат начального уровня серии JET 1, созданный для пользователей с лёгкой и умеренной потерей слуха (до 85 дБ). Модель оснащена 48 каналами обработки звука на платформе Velox, что обеспечивает качественное усиление звука и комфортное восприятие речи. Частотный диапазон до 8000 Hz позволяет различать высокочастотные звуки, важные для разборчивости речи. Аппарат оснащён системой автоматического шумоподавления, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется механическим регулятором громкости и кнопкой переключения программ. Корпус выполнен из прочного, влагозащищённого материала, устойчивого к воздействию пота и влаги. Модель подходит для пользователей, которые впервые используют слуховые аппараты или ищут простое и надёжное решение для повседневного общения. Комплектация включает стандартные батарейки типа 13, запасные фильтры и чистую щётку.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox</span></p>	5400000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmo960027yud402cckj1a}	published	2026-01-16 09:44:11.782	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmiknmo9i002fyud4si8uz4xr	Oticon Own 3 CIC	Oticon Own 3 CIC	oticon-own-3-cic	<p>Oticon Own 3 CIC — OWN seriyasining 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (75 dB gacha) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yuqori ravshanligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model keksa foydalanuvchilar va turli vaziyatlarda nutq tushunarliligini yaxshilash uchun oddiy, ammo samarali yechimni talab qiladigan odamlar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;75 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 3 CIC — слуховой аппарат серии OWN с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с лёгкой потерей слуха (до 75 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает высокую чёткость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пожилых пользователей и людей, которым требуется простое, но эффективное решение для улучшения разборчивости речи в различных ситуациях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;75 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></p>	10900000.00	\N	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmo9l002gyud47nf6f7sd}	published	2025-11-29 18:58:24.727	2026-01-24 14:42:04.705	{adults}	in-stock	{cic-iic}	{}	{}	powerful	digital	{}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	<p>Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).</p>	<p>Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).</p>	{/uploads/products/oticon-own-iic-own_iic.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	<p>Цифровая платформа обработки звука с акцентом на разборчивость речи.</p>	<p>Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.</p>	{}	hearing-aids	cmiknmo9g002dyud427t90nna
cmki0gujv0010t6rvpj4kvh2s	OTICON MORE 3 MINI RITE T	OTICON MORE 3 MINI RITE T	oticon-more-3-mini-rite-t	<p>OTICON MORE 3 MINI RITE T — bu telekatushka (T-coil) bilan MORE 3 seriyasining ixcham ichki kanalli eshitish apparati. Model engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (60/85/100/105 dB) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yuqori ravshanligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. Telekatushka induksion halqalar bilan jihozlangan jamoat joylarida nutqni ravshan qabul qilishni ta'minlayadi. Bluetooth qo‘llab-quvvatlash mos keladigan qurilmalardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv Oticon ON ilovasi orqali amalga oshiriladi. IXcham dizayn va ergonomik shakl kun davomida qulay kiyishni ta'minlayadi. Model tez-tez jamoat joylariga tashrif buyuradigan, tovush sifati, sezilmaslik va qulaylikni qadrlaydigan faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;60/85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></span></p>	<p>OTICON MORE 3 MINI RITE T — это миниатюрный внутриканальный слуховой аппарат серии MORE 3 с телекатушкой (T-coil). Модель предназначена для пользователей с потерей слуха от лёгкой до тяжёлой степени (60/85/100/105 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает высокую чёткость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Телекатушка обеспечивает чёткое восприятие речи в общественных местах, оборудованных индукционными петлями. Поддержка Bluetooth обеспечивает прямую потоковую передачу звука с совместимых устройств. Управление осуществляется через приложение Oticon ON. Компактный дизайн и эргономичная форма обеспечивают комфортное ношение в течение всего дня. Модель подходит для активных пользователей, которые часто посещают общественные места и ценят качество звука, незаметность и удобство.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;60/85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></span></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmj000376v7lcbvog6c	{cmki07m6w000yt6rvin50bq8q}	published	2026-01-17 07:53:54.091	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{ric}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmki061xd000xt6rvdek65912	OTICON MORE 1 MINI BTE R 	OTICON MORE 1 MINI BTE R 	oticon-more-1-mini-bte-r	<p>OTICON MORE 1 MINI BTE R — bu o‘ng quloq uchun mo‘ljallangan MORE 1 premium-seriyasining ixcham quloq orqali eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan va innovatsion Polaris platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni tovushning ajoyib tafsilotlari va qabul qilishning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. Spatial Sound tizimi 360 gradusli tovush landshaftini yaratadi, bu foydalanuvchiga tovush fazosida osongina harakatlanish imkonini beradi. Bluetooth 5.0 qo‘llab-quvvatlash har qanday mos keladigan qurilmalardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv intuitiv Oticon ON ilovasi orqali amalga oshiriladi. Apparat korpusi IP68 namlik himoyasi darajasiga ega, bu uni ter, yomg‘ir va changga chidamli qiladi. Model tovush sifati, texnologik jihatlar va qulaylikni qadrlaydigan eng faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></span></p>	<p>OTICON MORE 1 MINI BTE R — это миниатюрный заушный слуховой аппарат премиум-серии MORE 1, созданный для правого уха. Модель предназначена для пользователей с лёгкой потерей слуха (до 85 дБ) и оснащена 64 каналами обработки звука на инновационной платформе Polaris. Частотный диапазон до 10 000 Hz обеспечивает исключительную детализацию звука и естественность восприятия. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Система Spatial Sound создаёт 360-градусный звуковой ландшафт, позволяя пользователю легко ориентироваться в звуковом пространстве. Поддержка Bluetooth 5.0 обеспечивает прямую потоковую передачу звука с любых совместимых устройств. Управление осуществляется через интуитивное приложение Oticon ON. Корпус аппарата имеет степень влагозащиты IP68, что делает его устойчивым к поту, дождю и пыли. Модель подходит для самых активных пользователей, ценящих качество звука, технологичность и удобство.</p><p><span><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></span></p>	23400000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000oab1n91ycil5w	{cmki00fj9000wt6rv39kteex2}	published	2026-01-17 07:45:30.434	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{mini-bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmiknmo9n002iyud4whzousuy	Oticon Own 1 ITC	Oticon Own 1 ITC	oticon-own-1-itc	<p>Oticon Own 1 ITC — bu OWN seriyasining 10-turdagi batareya bo‘limi va simsiz mikrofon NFM texnologiyasiga ega eshitish apparati. Model o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (90 dB gacha) uchun mo‘ljallangan va Polaris platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni tovushning ajoyib tafsilotlari va qabul qilishning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. To‘plam Roger On simsiz mikrofonini o‘z ichiga oladi, uni stolga yoki kiyimga joylashtirish mumkin, bu guruhli suhbatlarda nutq tushunarliligini yaxshilaydi. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, zaryadlovchi qurilma va almashtiriladigan filtrlar to‘plami mavjud. Model shovqinli sharoitda nutqni yaxshiroq qabul qilishni talab qiladigan foydalanuvchilar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;90 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></p>	<p>Oticon Own 1 ITC — слуховой аппарат серии OWN с батарейным отсеком типа 10 и технологией беспроводного микрофона NFM. Модель предназначена для пользователей с умеренной потерей слуха (до 90 дБ) и оснащена 64 каналами обработки звука на платформе Polaris. Частотный диапазон до 10 000 Hz обеспечивает исключительную детализацию звука и естественность восприятия. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Комплект включает беспроводной микрофон Roger On, который можно разместить на столе или носите для улучшения разборчивости речи в групповых беседах. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядное устройство и набор сменных фильтров. Модель идеально подходит для пользователей, которым требуется улучшенное восприятие речи в шумных условиях.</p><p><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;90 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></p>	20500000.00	\N	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmiknmo9p002jyud4bi4diho7}	published	2025-11-29 18:58:24.731	2026-01-24 14:42:04.705	{adults}	in-stock	{itc}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	<p>Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).</p>	<p>Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).</p>	{/uploads/products/oticon-own-cic-own_cic.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	<p>Цифровая платформа обработки звука с акцентом на разборчивость речи.</p>	<p>Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.</p>	{}	hearing-aids	cmiknmo9l002gyud47nf6f7sd
cmkgor95q002410rpcsw69a2t	OTICON JET 2 BTE PP	OTICON JET 2 BTE PP	oticon-jet-2-bte-pp	<p>OTICON JET 2 BTE PP — bu JET 2 seriyasining oshirilgan quvvatga ega quloq orqali eshitish apparati bo‘lib, o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (105 dB gacha) uchun mo‘ljallangan. Model Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, buzilishlarsiz kuchli va toza tovush kuchaytirishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutq tushunarliligida muhim bo‘lgan yuqori chastotali tovushlarni farqlash imkonini beradi. Apparat avtomatik shovqinni susaytirish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv mexanik balandlik regulyatori va dasturlarni almashtirish tugmasi orqali amalga oshiriladi. Korpus mustahkam, namlikdan himoyalangan materialdan yasalgan bo‘lib, ter va namlik ta'siriga chidamli. Model o‘rtacha va og‘ir eshitish qobiliyatini yo‘qotgan, kundalik muloqot uchun kuchli kuchaytirishga muhtoj bo‘lgan foydalanuvchilar uchun mos keladi. Komplektatsiya standart 13-turli batareyalar, zaxira filtrlar va tozalash cho‘tkasini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 2 BTE PP — это заушный слуховой аппарат повышенной мощности серии JET 2, созданный для пользователей с умеренной и тяжёлой потерей слуха (до 105 дБ). Модель оснащена 48 каналами обработки звука на платформе Velox, что обеспечивает мощное и чистое усиление звука без искажений. Частотный диапазон до 8000 Hz позволяет различать высокочастотные звуки, важные для разборчивости речи. Аппарат оснащён системой автоматического шумоподавления, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется механическим регулятором громкости и кнопкой переключения программ. Корпус выполнен из прочного, влагозащищённого материала, устойчивого к воздействию пота и влаги. Модель подходит для пользователей с умеренной и тяжёлой потерей слуха, которым требуется мощное усиление для повседневного общения. Комплектация включает стандартные батарейки типа 13, запасные фильтры и чистую щётку.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	4450000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmo970028yud42hyerbuo}	published	2026-01-16 09:38:18.014	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgottiv002510rphb8s573f	OTICON JET 2 MINIRITE	OTICON JET 2 MINIRITE	oticon-jet-2-minirite	<p>OTICON JET 2 MINIRITE — bu JET 2 seriyasining sozlanadigan kuchaytirish (60/85/100/105 dB) bilan ixcham ichki kanalli eshitish apparati bo‘lib, eshitish qobiliyatini yo‘qotishning keng diapazoni uchun mos keladi. Model Velox platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, yuqori sifatli tovushni qayta ishlash va nutqni tabiiy qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yaxshi tushunarliligiga yordam beradi. Apparat atrof-muhitga avtomatik moslashish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv masofadan boshqarish pulti yoki Oticon ON ilovasi yordamida amalga oshiriladi. IXcham dizayn va ergonomik shakl butun kun davomida qulay kiyishni ta'minlayadi. Model sezilmaslik, tovush sifati va zamonaviy texnologiyalarni qadrlaydigan foydalanuvchilar uchun mos keladi. Komplektatsiya simsiz masofadan boshqarish pulti, zaryadlovchi qurilma va silikon kallaklar to‘plamini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;60/85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 2 MINIRITE — это миниатюрный внутриканальный слуховой аппарат серии JET 2 с регулируемым усилением (60/85/100/105 дБ), подходящий для широкого диапазона потерь слуха. Модель оснащена 48 каналами обработки звука на платформе Velox, что обеспечивает качественную обработку звука и естественное восприятие речи. Частотный диапазон до 8000 Hz способствует хорошей разборчивости речи. Аппарат оснащён системой автоматической адаптации к окружающей среде, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется с помощью пульта дистанционного управления или приложения Oticon ON. Компактный дизайн и эргономичная форма обеспечивают комфортное ношение в течение всего дня. Модель подходит для пользователей, которые ценят незаметность, качество звука и современные технологии. Комплектация включает беспроводной пульт дистанционного управления, зарядное устройство и набор силиконовых вкладышей.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;60/85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	4800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmo920024yud4061m57si}	published	2026-01-16 09:40:17.719	2026-01-24 14:42:04.705	{}	in-stock	{bte}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmki0btwv000zt6rvh7ok7tul	OTICON MORE 1 MINI RITE T	OTICON MORE 1 MINI RITE T	oticon-more-1-mini-rite-t	<p>OTICON MORE 1 MINI RITE T — bu telekatushka (T-coil) bilan MORE 1 premium-seriyasining ixcham ichki kanalli eshitish apparati. Model engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (60/85/100/105 dB) uchun mo‘ljallangan va innovatsion Polaris platformasida 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni tovushning ajoyib tafsilotlari va qabul qilishning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. Spatial Sound tizimi 360 gradusli tovush landshaftini yaratadi, bu foydalanuvchiga tovush fazosida osongina harakatlanish imkonini beradi. Telekatushka induksion halqalar bilan jihozlangan jamoat joylarida (teatrlar, cherkovlar, vokzallar) nutqni ravshan qabul qilishni ta'minlayadi. Bluetooth 5.0 qo‘llab-quvvatlash har qanday mos keladigan qurilmalardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv intuitiv Oticon ON ilovasi orqali amalga oshiriladi. IXcham dizayn va ergonomik shakl kun davomida qulay kiyishni ta'minlayadi. Model tovush sifati, texnologik jihatlar va universalilikni qadrlaydigan eng talabchan foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;60/85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></span></p>	<p>OTICON MORE 1 MINI RITE T — это миниатюрный внутриканальный слуховой аппарат премиум-серии MORE 1 с телекатушкой (T-coil). Модель предназначена для пользователей с потерей слуха от лёгкой до тяжёлой степени (60/85/100/105 дБ) и оснащена 64 каналами обработки звука на инновационной платформе Polaris. Частотный диапазон до 10 000 Hz обеспечивает исключительную детализацию звука и естественность восприятия. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Система Spatial Sound создаёт 360-градусный звуковой ландшафт, позволяя пользователю легко ориентироваться в звуковом пространстве. Телекатушка обеспечивает чёткое восприятие речи в общественных местах, оборудованных индукционными петлями (театры, церкви, вокзалы). Поддержка Bluetooth 5.0 обеспечивает прямую потоковую передачу звука с любых совместимых устройств. Управление осуществляется через интуитивное приложение Oticon ON. Компактный дизайн и эргономичная форма обеспечивают комфортное ношение в течение всего дня. Модель подходит для самых требовательных пользователей, ценящих качество звука, технологичность и универсальность.</p><p><span><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;60/85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></span></p>	20500000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmj000376v7lcbvog6c	{cmki07m6w000yt6rvin50bq8q}	published	2026-01-17 07:49:59.983	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{ric}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfdbg42000910rp0s56r1c2	Oticon OPN 1 ITC	Oticon OPN 1 ITC	oticon-opn-1-itc	<p>Oticon OPN 1 ITC — bu VELOX platformasi asosidagi, aksessuarlar bilan simsiz aloqa uchun 2.4G texnologiyasini qo‘llab-quvvatlovchi eshitish apparatlari . Modellar engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/90/100 dB) uchun mo‘ljallangan va 64 ta tovushni qayta ishlash kanallari bilan jihozlangan. 10 000 Hz gacha bo‘lgan chastota diapazoni yuqori darajadagi tovush tafsilotlarini ta'minlaydi. Apparat OpenSound Navigator tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. To‘plam simsiz mikrofon, masofadan boshqarish pulti va zaryadlovchi qurilmani o‘z ichiga oladi. Model masofada, shovqinli muhtida yoki televizor ko‘rayotganda nutq tushunarliligini yaxshilash zarur bo‘lgan foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;64<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/90/100 dB (chap model), 85/90/101 dB (o‘ng model)<br><strong>Chastota diapazoni:</strong>&nbsp;10 000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br><br></span></p>	<p>Oticon OPN 1 ITC — это слуховой аппарат на базе платформы VELOX с поддержкой технологии 2.4G для беспроводной связи с аксессуарами. Модели предназначены для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/90/100 дБ) и оснащены 64 каналами обработки звука. Частотный диапазон до 10 000 Hz обеспечивает высокую детализацию звука. Аппарат оснащён системой OpenSound Navigator, направленными микрофонами и функцией подавления обратной связи. Комплект включает беспроводной микрофон, пульт дистанционного управления и зарядное устройство. Модель подходит для пользователей, которым необходимо улучшить разборчивость речи на расстоянии, в шумной обстановке или при просмотре телевизора.</p><p><strong>Количество каналов:</strong>&nbsp;64<br><strong>Максимальное усиление:</strong>&nbsp;85/90/100 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 10 000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX</p>	20450000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmiknmhu800033fedfzxgwenw}	published	2026-01-15 11:30:18.578	2026-01-24 14:42:04.705	{adults}	in-stock	{itc}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkghzp08001h10rpsr33691a	OTICON RUBY 2 MINI RITE 	OTICON RUBY 2 MINI RITE 	ruby-2-mini-rite	<p>RUBY 2 MINI RITE — bu ochiq tovush texnologiyasiga ega, engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/100/105 dB) uchun mo‘ljallangan ixcham ichki kanalli eshitish apparati. Model VELOX platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, tovushni tabiiy va qulay qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning ajoyib tushunarliligi va tovush tafsilotlarini ta'minlayadi. Apparat OpenSound Navigator tizimi bilan jihozlangan bo‘lib, u atrof-muhitni soniyada 100 marta tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. OpenSound Optimizer texnologiyasi fikr-mulohazalar xavfini butunlay bartaraf etadi. Bluetooth qo‘llab-quvvatlash tovush oqimini uzatish uchun smartfonlar va boshqa qurilmalarga bevosita ulanish imkonini beradi. Boshqaruv Oticon ON ilovasi orqali yoki apparatdagi sensorli panel yordamida amalga oshiriladi. IXcham va ergonomik dizayn kun davomida qulay kiyishni ta'minlayadi. Model sezilmaslik, tovush sifati va zamonaviy texnologiyalarni qadrlaydigan foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/100/105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX</p>	<p>RUBY 2 MINI RITE — это миниатюрный внутриканальный слуховой аппарат с технологией открытого звука, созданный для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/100/105 дБ). Модель оснащена 48 каналами обработки звука на платформе VELOX, что обеспечивает естественное и комфортное восприятие звука. Частотный диапазон до 8000 Hz обеспечивает отличную разборчивость речи и детализацию звука. Аппарат оснащён системой OpenSound Navigator, которая анализирует окружающую среду 100 раз в секунду и автоматически адаптирует настройки для оптимального восприятия речи. Технология OpenSound Optimizer полностью устраняет риск обратной связи. Поддержка Bluetooth позволяет напрямую подключаться к смартфонам и другим устройствам для потоковой передачи звука. Управление осуществляется через приложение Oticon ON или с помощью сенсорной панели на аппарате. Компактный и эргономичный дизайн обеспечивает комфортное ношение в течение всего дня. Модель подходит для пользователей, которые ценят незаметность, качество звука и современные технологии.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85/100/105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;VELOX</p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhvd000o3fedp314adsd}	published	2026-01-16 06:28:54.488	2026-01-24 14:42:04.705	{}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkgoni0e002310rp92cc63as	OTICON JET 2 BTE	OTICON JET 2 BTE	oticon-jet-2-bte	<p>OTICON JET 2 BTE — bu JET 2 seriyasining boshlang‘ich darajadagi quloq orqali eshitish apparati bo‘lib, engil va o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan. Model Velox platformasida 45 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, sifatli tovush kuchaytirish va nutqni qulay qabul qilishni ta'minlayadi. 8000 Hz gacha bo‘lgan chastota diapazoni nutq tushunarliligida muhim bo‘lgan yuqori chastotali tovushlarni farqlash imkonini beradi. Apparat avtomatik shovqinni susaytirish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. Speech Guard texnologiyasi shovqinli muhtida ham nutqni optimal qayta ishlashni ta'minlayadi. Boshqaruv mexanik balandlik regulyatori va dasturlarni almashtirish tugmasi orqali amalga oshiriladi. Korpus mustahkam, namlikdan himoyalangan materialdan yasalgan bo‘lib, ter va namlik ta'siriga chidamli. Model eshitish apparatlaridan birinchi marta foydalanayotgan yoki kundalik muloqot uchun oddiy va ishonchli yechim izlayotgan foydalanuvchilar uchun mos keladi. Komplektatsiya standart 13-turli batareyalar, zaxira filtrlar va tozalash cho‘tkasini o‘z ichiga oladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;45<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Velox<br><br></span></p>	<p>OTICON JET 2 BTE — это заушный слуховой аппарат начального уровня серии JET 2, созданный для пользователей с лёгкой и умеренной потерей слуха (до 85 дБ). Модель оснащена 45 каналами обработки звука на платформе Velox, что обеспечивает качественное усиление звука и комфортное восприятие речи. Частотный диапазон до 8000 Hz позволяет различать высокочастотные звуки, важные для разборчивости речи. Аппарат оснащён системой автоматического шумоподавления, направленными микрофонами и функцией подавления обратной связи. Технология Speech Guard обеспечивает оптимальную обработку речи даже в шумной обстановке. Управление осуществляется механическим регулятором громкости и кнопкой переключения программ. Корпус выполнен из прочного, влагозащищённого материала, устойчивого к воздействию пота и влаги. Модель подходит для пользователей, которые впервые используют слуховые аппараты или ищут простое и надёжное решение для повседневного общения. Комплектация включает стандартные батарейки типа 13, запасные фильтры и чистую щётку.</p><p><span><strong>Количество каналов:</strong>&nbsp;45<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Velox<br><br></span></p>	4100000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmo960027yud402cckj1a}	published	2026-01-16 09:35:22.862	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmki0lj5t0012t6rv4lqtymxi	OTICON MORE 3 MINI BTE T	OTICON MORE 3 MINI BTE T	oticon-more-3-mini-bte-t	<p>OTICON MORE 3 MINI BTE T — bu telekatushka (T-coil) bilan MORE 3 seriyasining ixcham quloq orqali eshitish apparati. Model engil eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85 dB gacha) uchun mo‘ljallangan va Polaris platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 8000 Hz gacha bo‘lgan chastota diapazoni nutqning yuqori ravshanligi va tovushning tabiiyligini ta'minlayadi. Apparat chuqur o‘rganish texnologiyasi bilan jihozlangan bo‘lib, u tovush muhitini tahliylaydi va nutqni optimal qabul qilish uchun sozlamalarni avtomatik moslashtiradi. Telekatushka induksion halqalar bilan jihozlangan jamoat joylarida nutqni ravshan qabul qilishni ta'minlayadi. Bluetooth qo‘llab-quvvatlash mos keladigan qurilmalardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv Oticon ON ilovasi orqali amalga oshiriladi. Apparat korpusi IP68 namlik himoyasi darajasiga ega, bu uni ter, yomg‘ir va changga chidamli qiladi. Model tez-tez jamoat joylariga tashrif buyuradigan, tovush sifati va qulaylikni qadrlaydigan faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85 dB<br><strong>Chastota diapazoni:</strong>&nbsp;8000 Hz gacha<br><strong>Platforma:</strong>&nbsp;Polaris<br><br></span></p>	<p>OTICON MORE 3 MINI BTE T — это миниатюрный заушный слуховой аппарат серии MORE 3 с телекатушкой (T-coil). Модель предназначена для пользователей с лёгкой потерей слуха (до 85 дБ) и оснащена 48 каналами обработки звука на платформе Polaris. Частотный диапазон до 8000 Hz обеспечивает высокую чёткость речи и естественность звучания. Аппарат оснащён технологией глубокого обучения, которая анализирует звуковую среду и автоматически адаптирует настройки для оптимального восприятия речи. Телекатушка обеспечивает чёткое восприятие речи в общественных местах, оборудованных индукционными петлями. Поддержка Bluetooth обеспечивает прямую потоковую передачу звука с совместимых устройств. Управление осуществляется через приложение Oticon ON. Корпус аппарата имеет степень влагозащиты IP68, что делает его устойчивым к поту, дождю и пыли. Модель подходит для активных пользователей, которые часто посещают общественные места и ценят качество звука и удобство.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 8000 Hz<br><strong>Платформа:</strong>&nbsp;Polaris<br><br></span></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000oab1n91ycil5w	{cmki0ikf30011t6rvzdqv7wx6}	published	2026-01-17 07:57:32.61	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{mini-bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{iphone,android,remote}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfdi1qm000a10rpmj7xf8il	Oticon OPN S 3 BTE PP	Oticon OPN S 3 BTE PP	oticon-opn-s-3-bte-pp	<p>Oticon OPN S 3 BTE PP — bu og‘ir eshitish qobiliyatini yo‘qotgan foydalanuvchilar (105 dB gacha) uchun mo‘ljallangan premium-klassdagi kuchli quloq orqali eshitish apparati. Model ilg‘or VELOX S platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, ajoyib tovush ravshanligi va nutqni tabiiy qabul qilishni ta'minlaydi. 7300 Hz gacha bo‘lgan chastota diapazoni hatto murakkab akustik sharoitlarda ham nutqning maksimal tushunarliligi uchun optimallashtirilgan. Apparat Spatial Sound funktsiyasiga ega OpenSound Navigator texnologiyasi bilan jihozlangan bo‘lib, u 360 gradusli tovush landshaftini yaratadi, bu foydalanuvchiga tovush fazosida osongina harakatlanish va muhim tovushlarga diqqatni jamlash imkonini beradi. OpenSound Optimizer tizimi fikr-mulohazalar xavfini butunlay bartaraf etadi. Bluetooth 5.0 qo‘llab-quvvatlash har qanday mos keladigan qurilmalardan tovushni bevosita oqimini uzatishni ta'minlayadi. Boshqaruv intuitiv Oticon ON ilovasi orqali amalga oshiriladi, u shuningdek, geojoylashuv funktsiyasini taklif etadi — foydalanuvchining joylashuvi bo‘yicha dasturlarni avtomatik almashtirish. Apparat korpusi IP68 namlik himoyasi darajasiga ega, bu uni ter, yomg‘ir va changga chidamli qiladi. Model sportchilar, sayohatchilar va ekstremal sharoitda ishlaydigan mutaxassislarni o‘z ichiga olgan eng faol foydalanuvchilar uchun mos keladi.</p><p><span><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;105 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7300 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX S<br><br></span></p>	<p>Oticon OPN S 3 BTE PP — это мощный заушный слуховой аппарат премиум-класса, созданный для пользователей с тяжёлой потерей слуха (до 105 дБ). Модель оснащена 48 каналами обработки звука на передовой платформе VELOX S, что обеспечивает исключительную чёткость звука и естественное восприятие речи. Частотный диапазон до 7300 Hz оптимизирован для максимальной разборчивости речи даже в сложных акустических условиях. Аппарат оснащён технологией OpenSound Navigator с функцией Spatial Sound, которая создаёт 360-градусный звуковой ландшафт, позволяя пользователю легко ориентироваться в звуковом пространстве и сосредотачиваться на важных звуках. Система OpenSound Optimizer полностью устраняет риск обратной связи. Поддержка Bluetooth 5.0 обеспечивает прямую потоковую передачу звука с любых совместимых устройств. Управление осуществляется через интуитивное приложение Oticon ON, которое также предлагает функцию геозонирования — автоматическое переключение программ в зависимости от местоположения пользователя. Корпус аппарата имеет степень влагозащиты IP68, что делает его устойчивым к поту, дождю и пыли. Модель подходит для самых активных пользователей, включая спортсменов, путешественников и профессионалов, работающих в экстремальных условиях.</p><p><span><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;105 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7300 Hz<br><strong>Платформа:</strong>&nbsp;VELOX S<br><br></span></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhux000f3fedqav63e6o}	published	2026-01-15 11:35:26.542	2026-01-24 14:42:04.705	{children,adults,elderly}	in-stock	{bte}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfdnqt5000b10rpx31w6zg9	OTICON OPN 3 CIC	OTICON OPN 3 CIC	oticon-opn-3-cic	<p>OTICON OPN 3 CIC — bu simsiz aloqa uchun 2.4G texnologiyasini qo‘llab-quvvatlovchi, o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (90 dB gacha) uchun mo‘ljallangan professional eshitish apparatlari to‘plami. Model VELOX platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan bo‘lib, turli akustik vaziyatlarga yuqori aniqlikda sozlash va moslashishni ta'minlayadi. 7500 Hz gacha bo‘lgan chastota diapazoni nutqning ajoyib tushunarliligi va tovushning tabiiyligini ta'minlayadi. Apparat Spatial Sound yo‘naltirilgan mikrofonlar tizimi bilan jihozlangan bo‘lib, u foydalanuvchiga barcha yo‘nalishlardan tovushlarni eshitish imkonini beradi va fazoda orientatsiyani yaxshilaydi. To‘plam Roger Select simsiz mikrofonini o‘z ichiga oladi, u kim gapiryotganiga qarab mikrofonlar o‘rtasida avtomatik ravishda o‘tadi, bu guruhli suhbatlarda ayniqsa foydalidir. Model biznes uchrashuvlari, konferentsiyalar, o‘quv mashg‘ulotlari va ijtimoiy tadbirlar uchun idealdir.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;90 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br></p>	<p>OTICON OPN 3 CIC — это профессиональные комплекты слуховых аппаратов с поддержкой технологии 2.4G для беспроводной связи, созданные для пользователей с умеренной потерей слуха (до 90 дБ). Модель оснащена 48 каналами обработки звука на платформе VELOX, что обеспечивает высокую точность настройки и адаптацию к различным акустическим ситуациям. Частотный диапазон до 7500 Hz обеспечивает отличную разборчивость речи и естественность звучания. Аппарат оснащён системой направленных микрофонов Spatial Sound, которая позволяет пользователю слышать звуки со всех направлений, улучшая ориентацию в пространстве. Комплект включает беспроводной микрофон Roger Select, который автоматически переключается между микрофонами в зависимости от того, кто говорит, что особенно полезно в групповых беседах. Модель идеально подходит для деловых встреч, конференций, учебных занятий и социальных мероприятий.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;90 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX<br><br></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000mab1nm1djt2ln	{cmiknmhum00093fedraa86d7e}	published	2026-01-15 11:39:52.313	2026-01-24 14:42:04.705	{adults}	in-stock	{cic-iic}	{}	{cash-card,installment-0,installment-6}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfb6ob1000110rpphnezs35	Oticon Siya 2 ITC	Oticon Siya 2 ITC	Oticon-Siya-2-ITC	<p>Oticon Siya 2 ITC — bu aksessuarlar bilan simsiz aloqa uchun 2.4G texnologiyasi bilan jihozlangan, zamonaviy eshitish apparatlari. Modellar engildan og‘ir darajadagi eshitish qobiliyatini yo‘qotgan foydalanuvchilar (85/90/100 dB) uchun mo‘ljallangan va 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 7500 Hz gacha bo‘lgan chastota diapazoni yuqori darajadagi tovush tafsilotlarini ta'minlaydi. Apparat shovqinni susaytirish tizimi, yo‘naltirilgan mikrofonlar va fikr-mulohazalarni susaytirish funktsiyasi bilan jihozlangan. To‘plam simsiz mikrofon, masofadan boshqarish pulti va zaryadlovchi qurilmani o‘z ichiga oladi. Model masofada yoki shovqinli muhtida nutq tushunarliligini yaxshilash zarur bo‘lgan foydalanuvchilar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;85/90/100 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7500 Hz gacha<br><strong>Platforma:</strong>&nbsp;Ko‘rsatilmagan<br><br></p>	<p>Oticon Siya 2 ITC — это современные слуховые аппараты, оснащённые технологией 2.4G для беспроводной связи с аксессуарами. Модели предназначены для пользователей с потерей слуха от лёгкой до тяжёлой степени (85/90/100 дБ) и оснащены 48 каналами обработки звука. Частотный диапазон до 7500 Hz обеспечивает высокую детализацию звука. Аппарат оснащён системой шумоподавления, направленными микрофонами и функцией подавления обратной связи. Комплект включает беспроводной микрофон, пульт дистанционного управления и зарядное устройство. Модель подходит для пользователей, которым необходимо улучшить разборчивость речи на расстоянии или в шумной обстановке.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;85/90/100 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7500 Hz<br><strong>Платформа:</strong>&nbsp;Не указана<br><br></p>	6800000.00	0	cmih32wqq000fab1nimu18r3b	cmih32wqr000jab1nslninwfl	{cmiknmhu800033fedfzxgwenw}	published	2026-01-15 10:30:36.685	2026-01-24 14:42:04.705	{}	in-stock	{itc}	{}	{}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmkfdsi5s000c10rpi7bbagdw	OTICON OPN 3 ITC	OTICON OPN 3 ITC	oticon-opn-3-itc	<p>OTICON OPN 3 ITC — bu 2.4G texnologiyasi va simsiz mikrofonni qo‘llab-quvvatlovchi, chap quloq uchun ixtisoslashtirilgan eshitish apparati to‘plami. Model o‘rtacha eshitish qobiliyatini yo‘qotgan foydalanuvchilar (90 dB gacha) uchun mo‘ljallangan va VELOX platformasida 48 ta tovushni qayta ishlash kanallari bilan jihozlangan. 7500 Hz gacha bo‘lgan chastota diapazoni nutqning yuqori ravshanligi va tovushning tabiiyligini ta'minlayadi. Apparat Focus in Noise funktsiyasiga ega OpenSound Navigator tizimi bilan jihozlangan bo‘lib, u murakkab akustik vaziyatlarda nutqni fon shovqinidan avtomatik ravishda ajratib oladi. Tinnitus SoundSupport texnologiyasi tinnitus alomatlarini yengillashtirish uchun terapevtik tovushlarning keng tanlovini taklif etadi. To‘plam Roger Pen simsiz mikrofonini o‘z ichiga oladi, uni diktofon yoki masofada nutq tushunarliligini yaxshilash uchun yo‘naltirilgan mikrofon sifatida ishlatish mumkin. Shuningdek, to‘plamda: to‘g‘ridan-to‘g‘ri translyatsiya funktsiyasiga ega masofadan boshqarish pulti, induksion zaryadlash bilan zaryadlovchi futli va gigienik aksessuarlar to‘plami mavjud. Model tinnitusdan aziyat chekadigan odamlar, shuningdek, shovqinli sharoitda nutqni yaxshiroq qabul qilishni talab qiladiganlar uchun mos keladi.</p><p><strong>Kanallar soni:</strong>&nbsp;48<br><strong>Maksimal kuchaytirish:</strong>&nbsp;90 dB<br><strong>Chastota diapazoni:</strong>&nbsp;7500 Hz gacha<br><strong>Platforma:</strong>&nbsp;VELOX<br><br></p>	<p>OTICON OPN 3 ITC — это специализированный комплект слухового аппарата для левого уха с поддержкой технологии 2.4G и беспроводным микрофоном. Модель предназначена для пользователей с умеренной потерей слуха (до 90 дБ) и оснащена 48 каналами обработки звука на платформе VELOX. Частотный диапазон до 7500 Hz обеспечивает высокую чёткость речи и естественность звука. Аппарат оснащён системой OpenSound Navigator с функцией Focus in Noise, которая автоматически выделяет речь из фонового шума в сложных акустических ситуациях. Технология Tinnitus SoundSupport предлагает широкий выбор терапевтических звуков для облегчения симптомов тиннитуса. Комплект включает беспроводной микрофон Roger Pen, который можно использовать как диктофон или как направленный микрофон для улучшения разборчивости речи на расстоянии. Также в комплекте: пульт дистанционного управления с функцией прямой трансляции, зарядный футляр с индукционной зарядкой и набор гигиенических аксессуаров. Модель подходит для людей, страдающих тиннитусом, а также для тех, кому требуется улучшенное восприятие речи в шумных условиях.</p><p><strong>Количество каналов:</strong>&nbsp;48<br><strong>Максимальное усиление:</strong>&nbsp;90 дБ<br><strong>Частотный диапазон:</strong>&nbsp;до 7500 Hz<br><strong>Платформа:</strong>&nbsp;VELOX<br><br></p>	10950000.00	0	cmih32wqq000fab1nimu18r3b	cmiknllmf000176v7ycw8spzb	{cmiknmhu800033fedfzxgwenw}	published	2026-01-15 11:43:34.385	2026-01-24 14:42:04.705	{adults}	in-stock	{itc}	{mild,moderate,severe}	{cash-card,installment-0,installment-6}	\N	\N	{}	\N	f	{}	{}	{}	{}	\N	\N	{}	\N	\N	\N	\N	{}	\N	\N	{}	hearing-aids	\N
cmiknmo7a000ryud4hg6fxb7i	ReSound Key 61	ReSound Key 61	resound-key-61	Сhastota diapazoni\nPremium texnologiyalar\n— Simsiz aksessuarlarning Resound liniyasiga mos keladi\n- Tinnitus tovush generatori\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\n6 ta kanal\nImpuls shovqinni kamaytirish\nApple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Batareya 312 sink-havo\n— Har qanday almashtiriladigan  quvvat turini qabul qiladi\niSolateTM nanotexnologik qoplama\n- Cochlear bilan bimodal yechim (faqat aksessuarlar)\nBinaural protezlar  hamda samarali turmush tarzi uchun ideal\nShovqinlik  darajasi juda yuqori bo'lgan akustik vaziyatlar uchun mos keladi.\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\nStandart texnologik uskunalar\nTabiiy yo'nalish!\nReSound Smart 3D™ ilovasi	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found -->\r\n\r\n<hr />\r\n\r\n<!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 312 цинк-воздушная\r\n— Сменный ресивер на любой тип мощности\r\n— IP 68\r\nПокрытие iSolateTM nanotech\r\n— Совместимы с линейкой беспроводных аксессуаров Resound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear (только аксессуары)\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 96.8107%; height: 542px;">\r\n<tbody>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208"><strong>ReSound Key 461</strong></td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208"><strong>ReSound Key 261</strong></td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Идеальны для продуктивного образа жизни и бинаурального протезирования</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Подходят для самых сложных акустических ситуаций с высоким уровнем шума</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Стандартная технологическая комплектация</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">6 каналов</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Естественная направленность !</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Приложение ReSound Smart 3D™</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Приложение ReSound Smart 3D™</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;">-</td>\r\n</tr>\r\n</tbody>\r\n</table>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo79000pyud4lzbdd6g7}	archived	2025-11-29 18:58:24.647	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-key-61-key61.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo79000pyud4lzbdd6g7
cmiknmo7q0013yud4rdtn9r4a	ReSound Key 98	ReSound Key 98	resound-key-98	Сhastota diapazoni\nPremium texnologiyalar\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nFaol turmush tarzi va binaural protezlar uchun ideal\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\n8 ta kanal\n6 ta kanal\nAsosiy segmentdagi maksimal texnologik uskunalar\nAsosiy segmentdagi ilg'or texnologik uskunalar\nAsosiy segmentdagi standart texnologik uskunalar\nImpuls shovqinni kamaytirish\nReSound Smart 3DT™ ilovasi\nApple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\n— iSolat TM nanotexnologik qoplama\nShovqin darajasi yuqori bo'lgan qiyin akustik vaziyatlar uchun mos keladi\n- Batareya 675 sink-havo\n- Yuqori quvvatga ega, IV bosqich eshitish qobiliyatini yo'qotganlar uchun mos\n- Telekoil va DAI (to'g'ridan-to'g'ri audio kiritish) mavjud\nEng qiyin akustik vaziyatlar uchun mos\nSinxronlashtirilgan ovoz balandligini boshqarish.\nTabiiy diqqat	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 675 цинк-воздушная\r\n— Сверхмощный, подходит для IV степени снижения слуха\r\n— IP 68\r\n— Покрытие iSolate TM nanotech\r\n— Имеет индукционную катушку и DAI (Прямой аудиовход)\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 444px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 498</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 398</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 298</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Идеальны для активного образа жизни и бинаурального протезирования</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для умеренного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Подходят для сложных акустических ситуаций с высоким уровнем шума</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Подходят для большинства сложных акустических ситуаций</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Стандартная технологическая комплектация в базовом сегменте</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">8 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">6 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Максимальная технологическая комплектация в базовом сегменте</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Продвинутая технологическая комплектация в базовом сегменте</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Стандартная технологическая комплектация в базовом сегменте</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Синхронизированный регулятор громкости.</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Синхронизированный регулятор громкости.</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">-</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;">Естественная направленность</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7o0011yud4h84en4fq}	archived	2025-11-29 18:58:24.662	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-key-98-key_98.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7o0011yud4h84en4fq
cmiknmo73000lyud4d6ar7rcf	ReSound Enya 288	ReSound Enya 288	resound-enya-288	Сhastota diapazoni\nPremium texnologiyalar\n- Tinnitus tovush generatori\nOvoz balandligini boshqarish.\n- Batareya 13 sink-havo\n- III darajadagi  eshitish qobiliyatini yo'qotganlar uchun mos keladi\n- Kamroq shovqinli akustik vaziyatlarda foydalanish uchun qulay\n- ReSound Unite 2 masofadan boshqarish pulti mavjud\nKuchli ReSound ENYA EY288-DW eshitish vositasi faol ijtimoiy hayotga ega bo'lgan mijozlar uchun mo'ljallangan.   Yuqori sifatli ovoz etkazib berganligi  hamda boshqarish  oson bo’lganliga sababli  foydalanish juda qulay.\nSignalni qayta ishlash kanallari – 6\nMoslashuvchan diqqat.\nRuxsat etilgan yo'nalish.\nNoiseTracker II shovqinni kamaytirish texnologiyasi.\nKengaytirish.\nDFS Ultra II qayta aloqani bostirish tizimi.\nTinnitus generatori.\nTo‘liq moslashtirilgan dasturlar – 3.\nMoslik:\nReSound Unite masofadan boshqarish pulti\nReSound Unite masofadan boshqarish pulti 2.\nAventa dasturiy ta'minoti 3.9 yoki undan yuqori.\nSozlash kanallari – maks. 6.\nJurnal kitobi II.\nXavfsiz sozlash.\nIn Situ Audiometriya.\nAirlink 2 bilan simsiz ulanishni sozlash.\nDasturni almashtirish tugmasi.\nInduksion lasan.\nTo'g'ridan-to'g'ri audio kiritish (DAI).\nNanotexnologik qoplama iSolate.	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">- Премиальные технологии\r\n- Батарейка 13 цинк-воздушная\r\n- Подходит для III степени снижения слуха\r\n- Удобны для использования в менее шумных акустических ситуациях;\r\n- Совместимы с пультом дистанционного управления ReSound Unite 2;\r\n- Звуковой Генератор Тиннитуса</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\nМощный слуховой аппарат ReSound ENYA EY288-DW создан для клиентов, ведущих активную социальную жизнь. Он комфортен в использовании, надежен, прост в управлении и обеспечивает высокое качество звука.\r\n<h2>Основные характеристики:</h2>\r\n<ul>\r\n \t<li>Каналы обработки сигнала – 6.</li>\r\n \t<li>Адаптивная направленность.</li>\r\n \t<li>Фиксированная направленность.</li>\r\n \t<li>Технология шумоподавления NoiseTracker II.</li>\r\n \t<li>Экспансия.</li>\r\n \t<li>Система подавления обратной связи DFS Ultra II.</li>\r\n \t<li>Авто DFS.</li>\r\n \t<li>Генератор Тиннитуса.</li>\r\n \t<li>Полностью настраиваемые программы – 3.</li>\r\n \t<li>SmartStart.</li>\r\n \t<li>PhoneNow.</li>\r\n \t<li>Совместимость:\r\n<ul>\r\n \t<li>ReSound Unite ПДУ.</li>\r\n \t<li>ReSound Unite ПДУ 2.</li>\r\n</ul>\r\n</li>\r\n \t<li>Программное обеспечение Aventa 3.9 или выше.</li>\r\n \t<li>Каналы регулировки – макс. 6.</li>\r\n \t<li>Бортовой журнал II.</li>\r\n \t<li>Безопасная настройка.</li>\r\n \t<li>In Situ Аудиометрия.</li>\r\n \t<li>Беспроводная настройка с Airlink 2.</li>\r\n \t<li>Кнопка переключения программ.</li>\r\n \t<li>Регулятор громкости.</li>\r\n \t<li>Индукционная катушка.</li>\r\n \t<li>Прямой аудиовход (DAI).</li>\r\n \t<li>Нанотехнологическое покрытие iSolatе.</li>\r\n</ul>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo71000jyud4gs23ke1l}	archived	2025-11-29 18:58:24.639	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-enya-288-enya88.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo71000jyud4gs23ke1l
cmiknmo7x0019yud4440qwlv8	ReSound ONE 561	ReSound ONE 561	resound-one-561	Сhastota diapazoni\nPremium texnologiyalar\n— iSolateTM nanotexnologik qoplama\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\n12 ta kanal\nImpuls shovqinni kamaytirish\n— Batareya 312 sink-havo\nStandart texnologik uskunalar\n— Har qanday quvvat turi uchun almashtiriladigan qabul qiluvchi (LP, MP, HP, UP, MM\n— Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\nAtrof-muhitni optimallashtiruvchi\nQabul qiluvchining quvvatini avtomatik aniqlash\nAsosiy ovozni  shaxsiylashtirish imkoniyatlariga ega bo’lgan ReSound Smart 3D™ ilovasi	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found -->\r\n\r\n<hr />\r\n\r\n<!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 312 цинк-воздушная\r\n— IP68\r\n— Покрытие iSolateTM nanotech\r\n— Сменный ресивер на любой тип мощности (LP, MP, HP, UP, MM)\r\n— Прямой аудиостриминг с устройств Apple и Android\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 318px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208"><strong>ReSound ONE 561</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px; width: 50%;" width="208">Подходят для умеренного образа жизни</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 59px; width: 50%;" width="208">Стандартная технологическая комплектация</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">12 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">Оптимизатор окружений</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 48px; width: 50%;" width="208">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;">Автоматическое определение мощности ресивера</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; width: 50%; height: 30px;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7v0017yud4ovu9kv19}	archived	2025-11-29 18:58:24.669	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-one-561-one61.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7v0017yud4ovu9kv19
cmiknmo82001cyud468rervo2	ReSound LiNX Quattro 88	ReSound LiNX Quattro 88	resound-linx-quattro-88	Сhastota diapazoni\nPremium texnologiyalar\n— Batareya 13 rux-havo\n— iSolateTM nanotexnologik qoplama\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\nImpuls shovqinni kamaytirish\nBinaural protezlar  hamda samarali turmush tarzi uchun ideal\nShovqinlik  darajasi juda yuqori bo'lgan akustik vaziyatlar uchun mos keladi.\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\nStandart texnologik uskunalar\n— Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\nAsosiy ovozni  shaxsiylashtirish imkoniyatlariga ega bo’lgan ReSound Smart 3D™ ilovasi\n17 ta kanal\nKengaytirilgan audio moslashtirish opsiyalariga ega ReSound Smart 3D™ ilovasi\n- Telekoil va DAI (to'g'ridan-to'g'ri audio kiritish) mavjud\n— Kuchli, eshitish qobiliyati III darajadagilar uchun mos\nBraunal yo’naltirib kenglikdagi tovushni kuchaytiradi	<div class="icon-block">\r\n<div class="icon-block">\r\n\r\n<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignnone wp-image-4278 " src="https://a.acoustic.uz/uploads/products/resound-linx-quattro-88-linx_quattro88.webp" alt="" width="341" height="364" /></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 13 цинк-воздушная\r\n— Мощный, подходит для III степени снижения слуха\r\n— IP 68\r\n— Покрытие iSolateTM nanotech\r\n— Имеет индукционную катушку и DAI (Прямой аудиовход)\r\n— Прямой аудиостриминг с устройств Apple и Android\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 96.8107%; height: 542px;">\r\n<tbody>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208"><strong>ReSound LiNX Quattro 988</strong></td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208"><strong>ReSound LiNX Quattro 588</strong></td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Идеальны для продуктивного образа жизни и бинаурального протезирования</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Подходят для самых сложных акустических ситуаций с высоким уровнем шума</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Подходят для умеренного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Стандартная технологическая комплектация</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">17 каналов</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">12 каналов</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Пространственное восприятие с Бинауральной направленностью III</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50.1147%;" width="208">Приложение ReSound Smart 3D™ с широкими возможностями персонализации звука</td>\r\n<td style="border: 1px solid #000000; width: 49.7706%;" width="208">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>\r\n<div class="icon-block" data-wp-editing="1">\r\n<div class="icon-block__text">\r\n<p style="text-align: left;"></p>\r\n\r\n</div>\r\n</div>\r\n</div>\r\n</div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo80001ayud445bt0alo}	archived	2025-11-29 18:58:24.674	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-linx-quattro-88-linx_quattro88.webp}	<div class="icon-block">	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo80001ayud445bt0alo
cmiknmo77000oyud4ysi9w6io	ReSound Enzo Q 998	ReSound Enzo Q 998	resound-enzo-q-998	Сhastota diapazoni\nImpuls shovqinni kamaytirish\nShovqinlik  darajasi juda yuqori bo'lgan akustik vaziyatlar uchun mos keladi.\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\n17 ta kanal\nKengaytirilgan audio moslashtirish opsiyalariga ega ReSound Smart 3D™ ilovasi\nPremium texnologiyalar\n- iSolateTM nanotexnologik qoplama\n- Tinnitus tovush generatori\nBraunal yo’naltirib kenglikdagi tovushni kuchaytiradi\n- 675 sinkli havo batareyasi\n- Quvvati kuchli , IV bosqich eshitish qobiliyatini yo'qotganlar uchun mos keladi\n- Telekoil va DAI (to'g'ridan-to'g'ri audio kiritish) mavjud\n- Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n- ReSound simsiz aksessuarlar qatoriga mos keladi\n- Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz sozlash\nFaol  turmush tarzi va binaural protezlar uchun ideal yechim	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">- Премиальные технологии\r\n- Батарейка 675 цинк-воздушная\r\n- Сверхмощный, подходит для IV степени снижения слуха\r\n- IP 58\r\n- Покрытие iSolateTM nanotech\r\n- Имеет индукционную катушку и DAI (Прямой аудиовход)\r\n- Прямой аудиостриминг с устройств Apple и Android\r\n- Совместимы с линейкой беспроводных аксессуаров ReSound\r\n- Звуковой Генератор Тиннитуса\r\n- Бимодальное решение с Cochlear\r\n- Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 318px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208"><strong>ReSound Enzo Q 998</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px; width: 50%;" width="208">Идеальны для проактивного образа жизни и бинаурального протезирования</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 59px; width: 50%;" width="208">Подходят для самых сложных акустических ситуаций с высоким уровнем шума</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">17 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 48px; width: 50%;" width="208">Пространственное восприятие с Бинауральной направленностью III</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; width: 50%; height: 30px;">Приложение ReSound Smart 3D™ с широкими возможностями персонализации звука</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo75000myud4g887c4xb}	archived	2025-11-29 18:58:24.643	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-enzo-q-998-enzo_q98.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo75000myud4g887c4xb
cmiknmo7h000xyud46d6gbbx5	ReSound Key 77	ReSound Key 77	resound-key-77	Сhastota diapazoni\nPremium texnologiyalar\n— Batareya 13 rux-havo\n- Quvvati O'rtacha, eshitishi I - III darajadagi\nInsonlarga   mos keladi\n- Kattalar va  bolalar uchun birdek mos keladi\n— iSolateTM nanotexnologik qoplama\n- induksion katushkaga ega\n— Simsiz aksessuarlarning Resound liniyasiga mos keladi\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nFaol turmush tarzi va binaural protezlar uchun ideal\nOdatiy  turmush tarzi uchun mos keladi\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\n8 ta kanal\n6 ta kanal\n4 ta kanal\nAsosiy segmentdagi maksimal texnologik uskunalar\nAsosiy segmentdagi ilg'or texnologik uskunalar\nAsosiy segmentdagi standart texnologik uskunalar\nAsosiy segmentdagi asosiy texnologik uskunalar\nTabiiy yo'nalish II\nImpuls shovqinni kamaytirish\nReSound Smart 3DT™ ilovasi\nApple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 13 цинк-воздушная\r\n— Средняя мощность, подходит на І — III степень снижения\r\nслуха\r\n— Подходит и взрослым, и детям\r\n— IP 68\r\n— Покрытие iSolateTM nanotech\r\n— имеет индукционную катушку\r\n— Совместимы с линейкой беспроводных аксессуаров Resound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 477</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 377</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 277</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 177</strong></td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Идеальны для активного образа жизни и бинаурального протезирования</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходит для умеренного образа жизни</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для спокойного образа жизни</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">12 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">8 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">6 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">4 канала</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Максимальная технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Продвинутая технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Стандартная технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Базовая технологическая комплектация в базовом сегменте</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Естественная направленность II</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7g000vyud4dyvupx4p}	archived	2025-11-29 18:58:24.654	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-key-77-key_77.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7g000vyud4dyvupx4p
cmiknmo8a001iyud492ip2v6f	ReSound OMNIA 61	ReSound OMNIA 61	resound-omnia-61	Сhastota diapazoni\nPremium texnologiyalar\n- Tinnitus tovush generatori\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\nImpuls shovqinni kamaytirish\nBinaural yo’nalish\n— Batareya 312 sink-havo\nShovqinlik  darajasi juda yuqori bo'lgan akustik vaziyatlar uchun mos keladi.\nStandart texnologik uskunalar\n— Har qanday quvvat turi uchun almashtiriladigan qabul qiluvchi (LP, MP, HP, UP, MM\n— Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\nQabul qiluvchining quvvatini avtomatik aniqlash\nAsosiy ovozni  shaxsiylashtirish imkoniyatlariga ega bo’lgan ReSound Smart 3D™ ilovasi\n— iSolat TM nanotexnologik qoplama\n— Cochlear Nucleus 7 va Kanso 2 bilan bimodal yechim\nAsosiy texnologik jihozlar\n17 ta kanal\nAtrof-muhitni optimallashtiruvchi II\nAtrof-muhitni optimallashtiruvchi\nUshbu Texnologiya bilan Atrofni 360 gradusda fazoviy idrok etish.\nBinaural yo'nalish bilan fazoviy idrok etish III\nFront Focus (Old fokus)\nKo'p darajali impuls shovqinini berish\nReSound Smart 3D™ ilovasida  yuqori  darajada ovozni shaxsiylashtirish imkoniyatlari mavjud bo’lib, jumladan ”Sifatli Ovoz” opsiyasiga ega\nZamonaviy samarali turmush tarzi va binaural protezlar uchun ideal\nInnovatsion qabul qiluvchi turi - M&amp;RIE (MM) (Mikrofon va Quloqqa qabul qiluvchi) mukammal lokalizatsiya uchun	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found -->\r\n\r\n<hr />\r\n\r\n<!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 312 цинк-воздушная\r\n— IP68\r\n— Покрытие iSolate TM nanotech\r\n— Сменный ресивер на любой тип мощности (LP, MP, HP, UP, MM)\r\n— Прямой аудиостриминг с устройств Apple и Android\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear Nucleus 7 и Kanso 2\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 444px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 961</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 561</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 461</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Идеальны для современного продуктивного образа жизни и бинаурального протезирования</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для умеренного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Подходят для самых сложных акустических ситуаций с высоким уровнем шума</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Стандартная технологическая комплектация</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Базовая технологическая комплектация</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">17 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения ІІ</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">-</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с технологией Все вокруг на 360</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с Бинауральной Haправленностью III</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Бинауральная направленность</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;">Front Focus (Фокус спереди)</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Многоуровневое подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с широкими возможностями персонализации звука, включая опцию «Качество Звука»</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Автоматическое определение мощности ресивера</td>\r\n<td style="border: 1px solid #000000;">Автоматическое определение мощности ресивера</td>\r\n<td style="border: 1px solid #000000;">Автоматическое определение мощности ресивера</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Инновационный тип ресивера — M&amp;RIE (ММ) (Микрофон и ресивер в ухе) для идеальной локализации</td>\r\n<td style="border: 1px solid #000000;">Инновационный тип ресивера — M&amp;RIE (ММ) (Микрофон и ресивер в ухе) для идеальной локализации</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo88001gyud4jw2nn9x3}	archived	2025-11-29 18:58:24.682	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-omnia-61-omnia61.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo88001gyud4jw2nn9x3
cmiknmo8w0020yud4pevk6pbi	Premium Charger for Key / LiNX Quattro	Premium Charger for Key / LiNX Quattro	premium-charger-for-key-linx-quattro	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo8v001yyud4re40wfzd}	archived	2025-11-29 18:58:24.705	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/premium-charger-for-key-linx-quattro-key_quattro_premium_charger.webp}	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound Key / LiNX Quattro	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8v001yyud4re40wfzd
cmiknmo7l0010yud4tgav5ot2	ReSound Key 88	ReSound Key 88	resound-key-88	Сhastota diapazoni\nPremium texnologiyalar\n— Batareya 13 rux-havo\n- Kattalar va  bolalar uchun birdek mos keladi\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\n8 ta kanal\n6 ta kanal\n4 ta kanal\nAsosiy segmentdagi maksimal texnologik uskunalar\nAsosiy segmentdagi ilg'or texnologik uskunalar\nAsosiy segmentdagi standart texnologik uskunalar\nAsosiy segmentdagi asosiy texnologik uskunalar\nTabiiy yo'nalish II\nImpuls shovqinni kamaytirish\nReSound Smart 3DT™ ilovasi\nApple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\n- I-III darajali eshitish qobiliyatiga mos keladi. Quvvati O'rtacha\n- Ko’proq  kuchaytirish uchun metalli shox\n— iSolateT™ nanotexnologik qoplama\n- Induksion katushkasi bor\nShovqin darajasi yuqori bo'lgan qiyin akustik vaziyatlar uchun mos keladi\nSinxronlashtirilgan ovoz balandligini boshqarish	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignnone wp-image-4285 size-medium" src="https://a.acoustic.uz/uploads/products/resound-enya-288-enya88.webp" alt="" width="285" height="300" /></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Батарейка 13 цинк-воздушная\r\n— Средняя мощность, подходит на I-III степень снижения слуха\r\n— Подходит и взрослым, и детям\r\n— Металлический рожок для большего усиления\r\n— IP 68\r\n— Покрытие iSolateT™ nanotech\r\n— Имеет индукционную катушку\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block">\r\n<table style="border: 1px solid #000;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 488</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 388</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 288</strong></td>\r\n<td style="width: 25%; border: 1px solid #000000;"><strong>ReSound Key 188</strong></td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для сложных акустических ситуаций с высоким уровнем шума</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для умеренного образа жизни</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для спокойного образа жизни</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">12 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">8 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">6 каналов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">4 канала</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Максимальная технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Продвинутая технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Стандартная технологическая комплектация в базовом сегменте</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Базовая технологическая комплектация в базовом сегменте</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Синхронизированный регулятор громкости</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Синхронизированный регулятор громкости</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Естественная направленность II</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Приложение ReSound Smart 3DT™</td>\r\n</tr>\r\n<tr>\r\n<td style="width: 25%; border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="width: 25%; border: 1px solid #000000;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n<td style="width: 25%; border: 1px solid #000000;">-</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n</div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7j000yyud4nij2mszc}	archived	2025-11-29 18:58:24.658	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-key-88-key88.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7j000yyud4nij2mszc
cmiknmo7u0016yud4u6pj524t	ReSound Match MA3T90	ReSound Match MA3T90	resound-match-ma3t90	Ovoz balandligini boshqarish.	<div class="col-md-12 col-sm-12">\r\n<div class="bx_item_description">\r\n\r\nСлуховые аппараты  ReSound Match™ - это цифровое качество звука и легкость настройки по привлекательной цене.\r\n<ul>\r\n \t<li>Надежный в эксплуатации корпус.</li>\r\n \t<li>2 канала широкополосной компрессии WDRC.</li>\r\n \t<li>Менеджер подавления обратной связи.</li>\r\n \t<li>Система шумоподавления.</li>\r\n \t<li>Мощное линейное усиление.</li>\r\n \t<li>Триммеры:\r\n<ul>\r\n \t<li>МРО триммер;</li>\r\n \t<li>триммер низких частот;</li>\r\n \t<li>триммер высоких частот.</li>\r\n</ul>\r\n</li>\r\n \t<li>Аналоговый регулятор громкости с уровнями от 1 до 4.</li>\r\n \t<li>Технология энергосберегающего чипа.</li>\r\n \t<li>Прямой аудио-вход.</li>\r\n \t<li>Телефонная катушка.</li>\r\n \t<li>Кнопка переключения программ для 4 программами прослушивания.</li>\r\n \t<li>Регулятор громкости.</li>\r\n \t<li>Индикатор разряда батарейки.</li>\r\n \t<li>Акустический индикатор выбора программ.</li>\r\n \t<li>Оповещение об отложенной активации.</li>\r\n</ul>\r\n</div>\r\n</div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7s0014yud4v1han5q8}	archived	2025-11-29 18:58:24.666	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-match-ma3t90-ma3t90.webp}	<div class="col-md-12 col-sm-12">	Ovoz balandligini boshqarish	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7s0014yud4v1han5q8
cmiknmo8e001lyud4nkoq89xg	ReSound OMNIA 88 DWC	ReSound OMNIA 88 DWC	resound-omnia-88-dwc	Сhastota diapazoni\nPremium texnologiyalar\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\nImpuls shovqinni kamaytirish\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\nStandart texnologik uskunalar\n— Apple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Simsiz aksessuarlarning ReSound liniyasi bilan mos keladi\nOdatdagi turmush tarzi uchun mos keladi\nAsosiy ovozni  shaxsiylashtirish imkoniyatlariga ega bo’lgan ReSound Smart 3D™ ilovasi\n— iSolat TM nanotexnologik qoplama\nZamonaviy turmush tarzi uchun samarali  yechim.\nAsosiy texnologik jihozlar\n17 ta kanal\nAtrof-muhitni optimallashtiruvchi II\nAtrof-muhitni optimallashtiruvchi\nUshbu Texnologiya bilan Atrofni 360 gradusda fazoviy idrok etish.\nBinaural yo'nalish bilan fazoviy idrok etish III\nFront Focus (Old fokus)\nKo'p darajali impuls shovqinini berish\n- Induksion katushkasi bor\n— Zaryadlanuvchi model - 1 zaryaddan 24 soatgacha, 50% oqimda 16 soat\n- Ish stoli uchun zaryadlovchi\nUltra fokus\nReSound Smart 3D™ ilovasida  yuqori  darajada ovozni shaxsiylashtirish imkoniyatlari mavjud bo’lib, jumladan ”Sifatli Ovoz” opsiyasiga ega\nYangi,  xavfsiz yoqish/o'chirish moslamasi\nMetall shoxli konfiguratsiya mavjud (alohida sotiladi)	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignnone wp-image-4271 size-medium" src="https://a.acoustic.uz/uploads/products/resound-enya-288-enya88.webp" alt="" width="300" height="297" /></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Перезаряжаемая модель- до 24 ч от 1 заряда, 16 ч при 50% стриминга\r\n— Настольное зарядное устройство\r\n— IP68\r\n— Покрытие iSolate TM nanotech\r\n— Имеет индукционную катушку\r\n— Прямой аудиостриминг с устройств Apple и Android\r\n— Совместимы с линейкой беспроводных аксессуаров ReSound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 444px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 988 DWC</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 588 DWC</strong></td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208"><strong>ReSound OMNIA 488 DWC</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для современного продуктивного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для умеренного образа жизни</td>\r\n<td style="border: 1px solid #000000; height: 61px;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Стандартная технологическая комплектация</td>\r\n<td style="border: 1px solid #000000; height: 152px;" width="208">Базовая технологическая комплектация</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">17 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">12 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения ІІ</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">Оптимизатор Окружения</td>\r\n<td style="border: 1px solid #000000; height: 30px;" width="208">-</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с технологией Все вокруг на 360</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">Пространственное восприятие с Бинауральной Haправленностью III</td>\r\n<td style="border: 1px solid #000000; height: 111px;" width="208">-</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px;">Front Focus (Фокус спереди)</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n<td style="border: 1px solid #000000; height: 30px;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Ультра Фокус</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n<td style="border: 1px solid #000000;">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Многоуровневое подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n<td style="border: 1px solid #000000;">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с широкими возможностями персонализации звука, включая опцию «Качество Звука»</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n<td style="border: 1px solid #000000;">Приложение ReSound Smart 3D™ с базовыми возможностями персонализации звука</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Новое надежное крепление «click-on/off» для рожков</td>\r\n<td style="border: 1px solid #000000;">Новое надежное крепление «click-on/off» для рожков</td>\r\n<td style="border: 1px solid #000000;">Новое надежное крепление «click-on/off» для рожков</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;">Доступна конфигурация с металлическим рожком (приобретается отдельно)</td>\r\n<td style="border: 1px solid #000000;">Доступна конфигурация с металлическим рожком (приобретается отдельно)</td>\r\n<td style="border: 1px solid #000000;">Доступна конфигурация с металлическим рожком (приобретается отдельно)</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo8c001jyud47xlt546e}	archived	2025-11-29 18:58:24.686	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-omnia-88-dwc-omnia88.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8c001jyud47xlt546e
cmiknmo8m001ryud4r5q1xrua	Premium Charger for OMNIA	Premium Charger for OMNIA	premium-charger-for-omnia	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo8k001pyud40bg5pgbp}	archived	2025-11-29 18:58:24.694	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/premium-charger-for-omnia-omnia_premium_charger.webp}	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8k001pyud40bg5pgbp
cmiknmo7d000uyud4rhahgzau	ReSound Key 461 DRWC	ReSound Key 461 DRWC	resound-key-461-drwc	Сhastota diapazoni\nPremium texnologiyalar\n— Simsiz aksessuarlarning Resound liniyasiga mos keladi\n- Tinnitus tovush generatori\n— Cochlear bilan bimodal yechim\n- Noahlink Wireless bilan simsiz ulanishni sozlash\nFaol turmush tarzi va binaural protezlar uchun ideal\n12 ta kanal\nAsosiy segmentdagi maksimal texnologik uskunalar\nImpuls shovqinni kamaytirish\nApple va Android qurilmalaridan to'g'ridan-to'g'ri audio oqim\n— Har qanday almashtiriladigan  quvvat turini qabul qiladi\niSolateTM nanotexnologik qoplama\nShovqin darajasi yuqori bo'lgan qiyin akustik vaziyatlar uchun mos keladi\nTabiiy diqqat\n- Zaryadlanuvchi model - 1 martalik zaryad 30 soatgacha yetadi, 50% oqimda 25 soat\nReSound Smart 3D ilovasi	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><!-- Image removed: file not found -->\r\n\r\n<hr />\r\n\r\n<!-- Image removed: file not found --></td>\r\n<td style="width: 50%;">— Премиальные технологии\r\n— Перезаряжаемая модель – до 30 ч от 1 заряда, 25 ч при 50% стриминга\r\n— Сменный ресивер на любой тип мощности\r\n— IP 68\r\nПокрытие iSolateTM nanotech\r\n— Совместимы с линейкой беспроводных аксессуаров Resound\r\n— Звуковой Генератор Тиннитуса\r\n— Бимодальное решение с Cochlear\r\n— Беспроводная настройка с Noahlink Wireless</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000000; width: 100%; height: 318px;">\r\n<tbody>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208"><strong>ReSound Key 461 DRWC</strong></td>\r\n</tr>\r\n<tr style="height: 61px;">\r\n<td style="border: 1px solid #000000; height: 61px; width: 50%;" width="208">Идеальны для активного образа жизни и бинаурального протезирования</td>\r\n</tr>\r\n<tr style="height: 152px;">\r\n<td style="border: 1px solid #000000; height: 59px; width: 50%;" width="208">Подходят для сложных акустических ситуаций с высоким уровнем шума</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">12 каналов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;" width="208">Максимальная технологическая комплектация в базовом сегменте</td>\r\n</tr>\r\n<tr style="height: 111px;">\r\n<td style="border: 1px solid #000000; height: 48px; width: 50%;" width="208">Естественная направленность</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; height: 30px; width: 50%;">Подавление импульсных шумов</td>\r\n</tr>\r\n<tr style="height: 30px;">\r\n<td style="border: 1px solid #000000; width: 50%; height: 30px;">Приложение ReSound Smart 3D</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000; width: 50%;">Прямой аудиостриминг с устройств Apple и Android</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo7c000syud4a1fhnqy5}	archived	2025-11-29 18:58:24.65	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-key-461-drwc-key_61_DRWC.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo7c000syud4a1fhnqy5
cmiknmo8h001oyud44m8t7y00	ReSound OMNIA CIC	ReSound OMNIA CIC	resound-omnia-cic	Сhastota diapazoni\nTinch holatdagi  turmush tarzi uchun mos keladi\n12 ta kanal\nMoslashuvchan sozlamalarga ega maksimal texnologik uskunalar\nStandart texnologik uskunalar\nOdatdagi turmush tarzi uchun mos keladi\nZamonaviy turmush tarzi uchun samarali  yechim.\nAsosiy texnologik jihozlar\n17 ta kanal\nAtrof-muhitni optimallashtiruvchi II\nAtrof-muhitni optimallashtiruvchi\nPremium texnologiyalar\n- 10A sink-havo batareyasi\n- Tanlash uchun uchta quvvat darajasi: LP, MP, HP\n- Kengaytirilgan chastota diapazoni\n- iSolateTM nanotexnologik qoplama\n- Tinnitus tovush generatori\n- Faqat simli sozlash (CS53/CS63 adapteri bilan)\nReSound portfelidagi eng oqilona yechim\nImpuls shovqinni kamaytirish (3 daraja)\nImpuls shovqinni bostirish (yoqish / o'chirish)\nNoise Tracker II shovqinni kamaytirish tizimi (5 daraja)\nNoise Tracker II shovqinni kamaytirish tizimi (2 daraja)	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>\r\n<table style="border-collapse: collapse; width: 100%;">\r\n<tbody>\r\n<tr>\r\n<td style="width: 50%;"><img class="alignnone size-medium wp-image-4269" src="https://a.acoustic.uz/uploads/products/resound-enya-288-enya88.webp" alt="" width="265" height="300" /></td>\r\n<td style="width: 50%;">- Премиальные технологии\r\n- Батарейка 10А цинк-воздушная\r\n- З уровня мощности на выбор: LP, MP, НР\r\n- Расширенный частотный диапазон\r\n- IP 68\r\n- Покрытие iSolateTM nanotech\r\n- Звуковой Генератор Тиннитуса\r\n- Только проводная настройка (с CS53-адаптером/ CS63)</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table style="border: 1px solid #000;">\r\n<tbody>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208"><strong>ReSound OMNIA 9 CIC</strong></td>\r\n<td style="border: 1px solid #000000;" width="208"><strong>ReSound OMNIA 5 CIC</strong></td>\r\n<td style="border: 1px solid #000000;" width="208"><strong>ReSound OMNIA 4 CIC</strong></td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Самое незаметное решение в портфолио ReSound</td>\r\n<td style="border: 1px solid #000000;" width="208">Самое незаметное решение в портфолио ReSound</td>\r\n<td style="border: 1px solid #000000;" width="208">Самое незаметное решение в портфолио ReSound</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Подходят для современного продуктивного образа жизни</td>\r\n<td style="border: 1px solid #000000;" width="208">Подходят для умеренного образа жизни</td>\r\n<td style="border: 1px solid #000000;" width="208">Подходят для спокойного образа жизни</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Максимальная технологическая комплектация с возможностью гибкой настройки</td>\r\n<td style="border: 1px solid #000000;" width="208">Стандартная технологическая комплектация</td>\r\n<td style="border: 1px solid #000000;" width="208">Базовая технологическая комплектация</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">17 каналов</td>\r\n<td style="border: 1px solid #000000;" width="208">12 каналов</td>\r\n<td style="border: 1px solid #000000;" width="208">12 каналов</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Подавление импульсных шумов (3 уровня)</td>\r\n<td style="border: 1px solid #000000;" width="208">Подавление импульсных шумов (вкл./выкл.)</td>\r\n<td style="border: 1px solid #000000;" width="208">Подавление импульсных шумов (вкл./выкл.)</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Оптимизатор Окружения ІІ</td>\r\n<td style="border: 1px solid #000000;" width="208">Оптимизатор Окружения</td>\r\n<td style="border: 1px solid #000000;" width="208">-</td>\r\n</tr>\r\n<tr>\r\n<td style="border: 1px solid #000000;" width="208">Система шумоподавления Noise Tracker ІІ (5 уровней)</td>\r\n<td style="border: 1px solid #000000;" width="208">Система шумоподавления Noise Tracker  (2 уровня)</td>\r\n<td style="border: 1px solid #000000;" width="208">Система шумоподавления Noise Tracker (вкл./выкл.)</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<div class="icon-block"></div>\r\n<div class="icon-block" data-wp-editing="1">\r\n<div class="icon-block__text">\r\n<p style="text-align: left;"></p>\r\n\r\n</div>\r\n</div>	\N	\N	cmih32wqq000iab1nr31vye89	cmiknllm1000076v7fc5qgmts	{cmiknmo8g001myud4y3ltco4a}	archived	2025-11-29 18:58:24.69	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{CIC}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	t	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/resound-omnia-cic-omnia_cic.webp}	<strong><span style="font-size: 18pt;">Частотный диапазон</span></strong>	Сhastota diapazoni	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8g001myud4y3ltco4a
cmiknmo8p001uyud4u9gujxbg	Desktop Charger for OMNIA	Desktop Charger for OMNIA	desktop-charger-for-omnia	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA. Зарядное устройство бывает индуктивным или беспроводным, способным быстро заряжаться в пути до трех дней.\r\n\r\nПоместите слуховые аппараты в зарядное устройство перед сном и наслаждайтесь полностью заряженными слуховыми аппаратами на следующий день. Зарядное устройство водонепроницаемо, компактно и имеет элегантный дизайн.	\N	\N	cmih32wqq000iab1nr31vye89	\N	{cmiknmo8o001syud4fg16m2m9}	archived	2025-11-29 18:58:24.698	2026-01-24 14:42:04.711	{adults,elderly}	in-stock	{}	{I,II,III}	{cash,installment}	powerful	digital	{iphone,android}	<table><tr><td>Chastota diapazoni / Частотный диапазон</td><td>125–8000 Hz</td></tr><tr><td>Signal ishlov berish / Обработка сигнала</td><td>Raqamli / Цифровая</td></tr></table>	f	{"Улучшенное понимание речи в повседневных условиях.","Более комфортное общение в шумной обстановке.","Снижение утомляемости за счёт естественного звучания."}	{"Kundalik hayotda nutqni yaxshiroq eshitish.","Shovqinli joylarda ham muloqot qilishni yengillashtiradi.","Tabiiyroq eshitish tufayli kamroq charchash."}	{"Цифровая обработка звука для лучшей разборчивости речи.","Автоматическая адаптация к окружающему шуму.","Комфортное ношение в течение всего дня."}	{"Nutqni yaxshiroq tushunish uchun raqamli tovush ishlovi.","Atrof-muhit shovqiniga avtomatik moslashish.","Kun bo‘yi qulay taqish uchun mo‘ljallangan."}	Подходит для лёгкой и умеренной степени снижения слуха (в зависимости от настройки).	Yengil va o‘rtacha darajadagi eshitish pasayishi uchun mos (sozlamalarga qarab).	{/uploads/products/desktop-charger-for-omnia-desktop_charger.webp}	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA	Зарядное устройство ReSound Premium подходит для перезаряжаемых слуховых аппаратов ReSound OMNIA	\N	\N	{}	Цифровая платформа обработки звука с акцентом на разборчивость речи.	Nutqni aniq eshitishga yordam beradigan raqamli tovush ishlov berish platformasi.	{}	hearing-aids	cmiknmo8o001syud4fg16m2m9
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."ProductCategory" (id, name_uz, name_ru, slug, icon, "parentId", description_ru, description_uz, "imageId", "order") FROM stdin;
cmih32wqr000jab1nslninwfl	BTE (Quloq orqasida)	BTE (За ухом)	category-bte	\N	\N	\N	\N	\N	0
cmih32wqr000kab1nxlwiwfxm	ITE (Quloq ichida)	ITE (В ухе)	category-ite	\N	\N	\N	\N	\N	0
cmih32wqr000lab1nncv2upg1	RIC (Kanal ichida)	RIC (В канале)	category-ric	\N	\N	\N	\N	\N	0
cmih32wqr000mab1nm1djt2ln	CIC (Chuqur kanal)	CIC (Глубокий канал)	category-cic	\N	\N	\N	\N	\N	0
cmih32wqr000nab1nvtyhz7v3	Power BTE	Power BTE	category-power-bte	\N	\N	\N	\N	\N	0
cmih32wqr000oab1n91ycil5w	Mini BTE	Mini BTE	category-mini-bte	\N	\N	\N	\N	\N	0
cmih32wqr000pab1nnmksuxhz	RITE	RITE	category-rite	\N	\N	\N	\N	\N	0
cmih32wqr000qab1n7opx5fx9	IIC (Chuqur)	IIC (Глубокий)	category-iic	\N	\N	\N	\N	\N	0
cmih32wqr000rab1nphxehmep	Boshqa	Другое	category-other	\N	\N	\N	\N	\N	0
cmiknllm1000076v7fc5qgmts	CIC	CIC	cic	\N	\N	\N	\N	\N	0
cmiknllmf000176v7ycw8spzb	ITC	ITC	itc	\N	\N	\N	\N	\N	0
cmiknllmh000276v7uondxppo	ITE	ITE	ite	\N	\N	\N	\N	\N	0
cmiknllmj000376v7lcbvog6c	miniRITE	miniRITE	miniRITE	\N	\N	\N	\N	\N	0
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Role" (id, name, permissions) FROM stdin;
cmih32wp40000ab1nfz3dshnf	superadmin	{*}
cmih32wp60001ab1nbbkwvmnq	admin	{users.read,users.write,content.*,settings.read,settings.write,media.*,leads.read,audit.read}
cmih32wp70002ab1nucu3oko7	editor	{content.*,media.*,leads.read}
cmih32wp70003ab1nicb186xg	viewer	{content.read,media.read,leads.read}
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Service" (id, title_uz, title_ru, excerpt_uz, excerpt_ru, body_uz, body_ru, slug, "coverId", "order", status, "createdAt", "updatedAt", "categoryId") FROM stdin;
cmir1q4gv000beo0rmzr47lsp	KSVP	КСВП	KSVP — tizzalarga keltirilgan tovush signallariga miyaning elektr javoblarini yozuvchi diagnostika usuli. Bu test miyabog‘lanish va eshitish yo‘llarining birinchi bosqichlarini baholaydi.	КСВП — метод, фиксирующий электрические ответы мозга на звуковые стимулы. Позволяет оценить работу слуховых путей на уровне ствола мозга.	<p>KSVP — tizzalarga keltirilgan tovush signallariga miyaning elektr javoblarini yozuvchi diagnostika usuli. Bu test miyabog‘lanish va eshitish yo‘llarining birinchi bosqichlarini baholaydi.</p><p><strong>Kimga kerak?</strong><br>Yangi tug‘ilgan chaqaloqlar, bolalar (hamkorlik qilish qiyin bo‘lsa), shuningdek, neyroloji yoki eshitish pasayishi shubhali bemorlarga.</p><p><strong>Qanday o‘tkaziladi?</strong><br>Bosh terisiga kichik elektrodlar qo‘yiladi, quloqqa eshitish stimullari yuboriladi va javoblar yozib olinadi. Agar kerak bo‘lsa, bolani uxlatib yoki tinchlantirib bajariladi.</p><p><strong>Tayyorgarlik:</strong><br>Oddiy — testdan oldin bolaga ovqat berib, tinch holatda bo‘lishini ta’minlash yaxshi. Maxsus tayyorgarlik talab etilmaydi.</p><p><strong>Natija nima deydi?</strong><br>Testsiz, eshitish yo‘llarining boshqa segmentlari va eshitish darajasi haqida ma’lumot beradi; koxlear implant muhokamasi uchun muhim.</p><p><strong>Davomiyligi:</strong><br>Taxminan 30–60 daqiqa (bola holatiga qarab).</p>	<p>КСВП — метод, фиксирующий электрические ответы мозга на звуковые стимулы. Позволяет оценить работу слуховых путей на уровне ствола мозга.</p><p><strong>Кому показано?</strong><br>Новорождённые, дети, которые не могут сотрудничать, а также пациенты с подозрением на снижение слуха или неврологические нарушения.</p><p><strong>Как проводится?</strong><br>На кожу головы крепятся маленькие электроды, в уши подаются звуковые стимулы, а ответы регистрируются. У детей процедура может проводиться во сне.</p><p><strong>Результат:</strong><br>Показывает функционирование слуховых путей и помогает в оценке показаний к кохлеарному импланту и дальнейшего лечения.</p><p><strong>Длительность:</strong><br>Около 30–60 минут.</p>	ksvp	cmir4fwwa000qeo0r5ysvq7vb	0	published	2025-12-04 06:19:37.375	2025-12-04 07:35:43.234	cmir236wk000feo0rq93ittcu
cmir4pmuj000ueo0rj2a0ua98	OAE (Otoakustik Emissiya)	OAE (Отоакустическая эмиссия)	OAE — kokleadagi (ichki quloq) tukchali hujayralarning ovozga javob berishini o‘lchovchi shovqinsiz, og‘riqsiz va tez test.	OAE — быстрый, безболезненный тест, оценивающий работу наружных волосковых клеток во внутреннем ухе (улитке).	<p><strong>Nima?</strong><br>OAE — kokleadagi (ichki quloq) tukchali hujayralarning ovozga javob berishini o‘lchovchi shovqinsiz, og‘riqsiz va tez test.</p><p><strong>Kimga kerak?</strong><br>Yangi tug‘ilgan chaqaloqlar skriningi, pediatrik diagnostika va tezkor tekshiruvlarda.</p><p><strong>Qanday o‘tkaziladi?</strong><br>Kichik probe quloq kanaliga joylashtiriladi, stimullar yuboriladi va koklea javobi yozib olinadi.</p><p><strong>Tayyorgarlik:</strong><br>Hech qanday maxsus tayyorgarlik yo‘q; bolalar uchun tinch holatda bo‘lishi ma’qul.</p><p><strong>Natija nima deydi?</strong><br>Agar OAE mavjud bo‘lsa, ichki quloq yaxshi ishlayotgani anglanadi; mavjud bo‘lmasa, qo‘shimcha tekshiruvlar (KSVP/ASSR) zarur bo‘ladi.</p><p><strong>Davomiyligi:</strong><br>Bir necha daqiqa — odatda 5–15 daqiqa.</p>	<p>OAE — быстрый, безболезненный тест, оценивающий работу наружных волосковых клеток во внутреннем ухе (улитке).</p><p><strong>Кому показано?</strong><br>Скрининг новорождённых, педиатрическая диагностика, быстрые проверки функции улитки.</p><p><strong>Как проводится?</strong><br>В слуховой проход вставляется зонд, подаётся стимул и регистрируется отклик улитки.</p><p><strong>Подготовка:</strong><br>Нет специальной подготовки. Для детей — обеспечить спокойное состояние.</p><p><strong>Результат:</strong><br>Наличие эмиссии говорит о нормальной функции улитки; отсутствие — требует дополнительных исследований (КСВП, ASSR).</p><p><strong>Длительность:</strong><br>Несколько минут (обычно 5–15 минут).</p>	oae-otoakustik-emissiya	cmir4pk6w000seo0rqaf6ktix	0	published	2025-12-04 07:43:13.387	2025-12-04 07:46:35.81	cmir236wk000feo0rq93ittcu
cmir98kg80011eo0rxcbsw4a7	ASSR	ASSR	ASSR — eshitishning minimal darajasini aniqlaydigan, kompyuter yordamida tahlil qilinadigan usul. Turli chastotalarda aniq ko‘rsatkich beradi.	ASSR — объективный метод определения порогов слуха с компьютерной обработкой ответа на разные частоты.	<p>ASSR — eshitishning minimal darajasini aniqlaydigan, kompyuter yordamida tahlil qilinadigan usul. Turli chastotalarda aniq ko‘rsatkich beradi.</p><p><strong>Kimga kerak?</strong><br>Kichik bolalar, hamkorlik qilolmaydigan bemorlar va og‘ir eshitish pasayishini aniqlash kerak bo‘lgan holatlar.</p><p><strong>Qanday o‘tkaziladi?</strong><br>Boshga elektrodlar qo‘yilib, quloqlarga test signallari yuboriladi va kompyuter avtomatik aniqlaydi.</p><p><strong>Tayyorgarlik:</strong><br>Sessiya davomida tinchlik zarur — bolalar uchun uxlatish tavsiya etiladi.</p><p><strong>Natija nima deydi?</strong><br>Eshitish darajalarini chastotaga bo‘lingan holda aniq ko‘rsatadi; koxlear implant yoki maxsus davolash zaruriyatini baholashda yordam beradi.</p><p><strong>Davomiyligi:</strong><br>Odatda 30–90 daqiqa.</p>	<p>ASSR — объективный метод определения порогов слуха с компьютерной обработкой ответа на разные частоты.</p><p><strong>Кому показано?</strong><br>Малышам, неконтактным пациентам и при подозрении на тяжёлую степень потери слуха.</p><p><strong>Как проводится?</strong><br>Через электроды регистрируются ответы на стимулы, аппарат автоматически анализирует данные.</p><p><strong>Подготовка:</strong><br>Требуется тишина; у детей лучше проводить во время сна.</p><p><strong>Результат:</strong><br>Даёт точные пороги слуха по частотам, помогает в выборе слуховых аппаратов или решений по имплантации.</p><p><strong>Длительность:</strong><br>Обычно 30–90 минут.</p>	assr	cmir98dpm000zeo0rhafuwnah	0	published	2025-12-04 09:49:55.209	2025-12-04 09:50:06.952	cmir236wk000feo0rq93ittcu
cmir2l6uo000oeo0rnr9s073n	Audiometriya	Аудиометрия	Audiometriya — bu tovushlarni eshitish qobiliyatini turli chastota va balandliklarda tekshiruvchi asosiy diagnostika usuli. U eshitish darajasini aniqlash, qaysi tovushlar zaif eshitilishini belgilash va eshitish pasayishining turini aniqlashda juda muhimdir.	Аудиометрия — основной метод диагностики слуха, позволяющий определить, какие звуки слышны хуже, на каких частотах есть снижение и какой тип потери слуха наблюдается. Это важнейший этап при любом обследовании слуха.	<p>Audiometriya — bu tovushlarni eshitish qobiliyatini turli chastota va balandliklarda tekshiruvchi asosiy diagnostika usuli. U eshitish darajasini aniqlash, qaysi tovushlar zaif eshitilishini belgilash va eshitish pasayishining turini aniqlashda juda muhimdir.</p><p><strong>Kimga kerak?</strong><br>Eshitishida o‘zgarish sezgan bolalar va kattalar, shovqin (tinnitus) bilan qiynalayotgan bemorlar, shuningdek, eshitish moslamasi tanlanayotgan mijozlarga tavsiya etiladi.</p><p><strong>Qanday o‘tkaziladi?</strong><br>Bemor maxsus tovush o‘tkazmaydigan kabinada o‘tiradi. Quloqqa qo‘yilgan naushniklar orqali turli balandlikdagi tovushlar beriladi. Bemor eshitgan tovushini tugma bosish yoki qo‘l ko‘tarish orqali bildiradi. Shuningdek, suyak o‘tkazuvchanligi audiometriyasi ham o‘tkaziladi.</p><p><strong>Tayyorgarlik:</strong><br>Maxsus tayyorgarlik talab qilinmaydi. Tekshiruvdan oldin quloqda mum bo‘lmasligi yaxshi.</p><p><strong>Natija nima deydi?</strong><br>Audiogramma orqali:</p><ul><li><p>Eshitish darajasi</p></li><li><p>Eshitish pasayishining turi (o‘rta quloq, ichki quloq yoki aralash)</p></li><li><p>Qanchalik darajada eshitish moslamasi kerakligi aniqlanadi.</p></li></ul><p><strong>Davomiyligi:</strong><br>O‘rtacha 10–20 daqiqa.</p>	<p>Аудиометрия — основной метод диагностики слуха, позволяющий определить, какие звуки слышны хуже, на каких частотах есть снижение и какой тип потери слуха наблюдается. Это важнейший этап при любом обследовании слуха.</p><p><strong>Кому показано?</strong><br>Детям и взрослым, которые заметили ухудшение слуха, пациентам с шумом в ушах (тиннитус), а также людям, которым подбирают слуховой аппарат.</p><p><strong>Как проводится?</strong><br>Пациент находится в специальной шумоизолированной кабине. Через наушники подаются звуки разной частоты и громкости. Пациент сигнализирует о том, что услышал звук, нажатием кнопки или поднятием руки. При необходимости проводится костная аудиометрия.</p><p><strong>Подготовка:</strong><br>Специальной подготовки нет. Важно, чтобы слуховой проход был чистым (без большого количества серы).</p><p><strong>Результат:</strong><br>Аудиограмма позволяет определить:</p><ul><li><p>Уровень слуха</p></li><li><p>Тип снижения (проводящее, нейросенсорное или смешанное)</p></li><li><p>Необходимость и qulaylik darajasidagi слуховых аппаратов tanlash.</p></li></ul><p><strong>Длительность:</strong><br>Обычно 10–20 минут.</p>	audiometriya	cmir4gj8k000reo0rjh3ohqwj	0	published	2025-12-04 06:43:46.8	2025-12-04 10:38:58.728	cmir99xin0012eo0rdc5poy7l
cmir520u0000veo0rf71ehamz	Timpanometriya	Тимпанометрия	Timpanometriya — o‘rta quloqdagi bosim, quloq pardasining (timpan) harakati va quloq kanal hajmini o‘lchovchi test. Odatda otit (o‘tkir yoki surunkali), suyuqlik yoki quloq yopilishlarini aniqlashda yordam beradi.	Тимпанометрия измеряет давление в среднем ухе, подвижность барабанной перепонки и объём слухового прохода. Помогает выявить средний отит, наличие жидкости или нарушения евстахиевой трубы.	<p>Timpanometriya — o‘rta quloqdagi bosim, quloq pardasining (timpan) harakati va quloq kanal hajmini o‘lchovchi test. Odatda otit (o‘tkir yoki surunkali), suyuqlik yoki quloq yopilishlarini aniqlashda yordam beradi.</p><p><strong>Kimga kerak?</strong><br>Quyidagi belgilar bo‘lgan bemorlarga: quloq tiqilib qolishi, og‘riq, balandlik sezilarli o‘zgarishi, yoki bolalarda takroriy quloq infeksiyalari.</p><p><strong>Qanday o‘tkaziladi?</strong><br>Quloq kanaliga kichik probe qo‘yiladi va ichkariga havo bosimi qo‘llanadi; qurilma quloq pardasining harakatini va bosimni o‘lchaydi.</p><p><strong>Tayyorgarlik:</strong><br>Maxsus tayyorgarlik talab etilmaydi. Quloqda katta mum bo‘lsa, avval tozalash kerak bo‘lishi mumkin.</p><p><strong>Natija nima deydi?</strong></p><ul><li><p>Normal — o‘rta quloqda muammo yo‘qligini ko‘rsatadi.</p></li><li><p>Past bosim yoki tekis profil — o‘rta quloqda suyuqlik borligi yoki Eustakhiy naychasining disfunktsiyasi.</p></li><li><p>Katta quloq kanal hajmi — teshik yoki truba muammosi mumkinligini bildirish mumkin.</p></li></ul><p><strong>Davomiyligi:</strong><br>Taxminan 5–10 daqiqa.</p>	<p>Тимпанометрия измеряет давление в среднем ухе, подвижность барабанной перепонки и объём слухового прохода. Помогает выявить средний отит, наличие жидкости или нарушения евстахиевой трубы.</p><p><strong>Кому показано?</strong><br>Пациентам с ощущением заложенности уха, болями, нарушением слуха, а также детям с повторяющимися отитами.</p><p><strong>Как проводится?</strong><br>В слуховой проход вводится небольшой зонд, создаётся изменение давления, и фиксируется движение барабанной перепонки.</p><p><strong>Подготовка:</strong><br>Специальной подготовки не требуется. При наличии большого количества серы в ухе рекомендуется предварительная чистка.</p><p><strong>Результат:</strong></p><ul><li><p>Нормальная кривая — среднее ухо в порядке.</p></li><li><p>Снижение подвижности или плоская кривая — наличие жидкости или серозный отит.</p></li><li><p>Увеличенный объём — возможен перфорация перепонки или проблема с трубой.</p></li></ul><p><strong>Длительность:</strong><br>Около 5–10 минут.</p>	timpanometriya	cmir52a2b000weo0rz5319tp3	0	published	2025-12-04 07:52:51.384	2025-12-04 11:22:25.339	cmir236wk000feo0rq93ittcu
\.


--
-- Data for Name: ServiceCategory; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."ServiceCategory" (id, name_uz, name_ru, slug, description_uz, description_ru, icon, "imageId", "parentId", "order", status, "createdAt", "updatedAt") FROM stdin;
cmir99xin0012eo0rdc5poy7l	Kattalarda eshitishni diagnostika qilish	Диагностика слуха у взрослых	kattalarda-eshitishni-diagnostika-qilish	Eshitishdagi o‘zgarishlarni aniqlash va eshitish darajasini tezkor baholash.	Быстрая оценка слуха и выявление возможных изменений.	\N	cmireo7ux001geo0rrvob3sv0	\N	0	published	2025-12-04 09:50:58.799	2025-12-04 12:22:05.61
cmir236wk000feo0rq93ittcu	Bolalarda eshitishni diagnostika qilish	Диагностика слуха у детей	kids-test	Bolalarda eshitish muammolarini erta aniqlash ularning rivojlanishi uchun muhim.	Ранняя проверка слуха важна для развития ребёнка.	\N	cmireo2m5001feo0rldlhxu37	\N	0	published	2025-12-04 06:29:47.06	2025-12-14 10:13:37.54
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Setting" (id, "phonePrimary", "phoneSecondary", email, "telegramBotToken", "telegramChatId", "brandPrimary", "brandAccent", "featureFlags", "socialLinks", "updatedAt", "catalogHeroImageId", "logoId", "sidebarConfigs", "sidebarSections", "sidebarBrandIds", "telegramButtonBotToken", "telegramButtonBotUsername", "telegramButtonMessage_uz", "telegramButtonMessage_ru", "faviconId", "googleAnalyticsId", "yandexMetrikaId") FROM stdin;
singleton	1385	1385	info@acoustic.uz	6821262065:AAEE2asYqBn2_JxdhU_HLUBn0tV80pYRYQQ	@acousticuz_bot	#F07E22	#3F3091	{"home": {"faq": true, "hero": true, "branches": true, "services": true, "strongCta": true, "freshPosts": true, "cochlearGrid": true, "pathToBetterHearing": true, "hearingAidCategories": true, "interacousticsCarousel": true}, "integrations": {"sentry": false, "telegram": true, "analytics": true, "smtpFallback": false}}	{"youtube": "https://youtube.com/@acousticuz", "facebook": "https://facebook.com/acousticuz", "telegram": "https://t.me/acousticuz", "instagram": "https://instagram.com/acoustic.uz"}	2025-12-13 23:26:13.712	\N	cmih4zyn0000b11vijys2w1de	{"posts": {"brandIds": ["cmih32wqq000fab1nimu18r3b", "cmih32wqq000iab1nr31vye89", "cmiknllmo000476v71d73sn03"], "sections": [{"id": "accessories", "icon": "📱", "link": "/catalog/accessories", "order": 0, "imageId": null, "title_ru": "Аксессуары", "title_uz": "Aksessuarlar"}, {"id": "earmolds", "icon": "👂", "link": "/catalog/earmolds", "order": 1, "imageId": null, "title_ru": "Ушные вкладыши", "title_uz": "Quloq qo'shimchalari"}, {"id": "batteries", "icon": "🔋", "link": "/catalog/batteries", "order": 2, "imageId": null, "title_ru": "Батарейки", "title_uz": "Batareyalar"}, {"id": "care", "icon": "🧴", "link": "/catalog/care", "order": 3, "imageId": null, "title_ru": "Средства ухода", "title_uz": "Parvarish vositalari"}]}, "catalog": {"brandIds": ["cmih32wqq000fab1nimu18r3b", "cmih32wqq000iab1nr31vye89", "cmiknllmo000476v71d73sn03"], "sections": [{"id": "accessories", "icon": "📱", "link": "/catalog/accessories", "order": 0, "imageId": null, "title_ru": "Аксессуары", "title_uz": "Aksessuarlar"}, {"id": "earmolds", "icon": "👂", "link": "/catalog/earmolds", "order": 1, "imageId": null, "title_ru": "Ушные вкладыши", "title_uz": "Quloq qo'shimchalari"}, {"id": "batteries", "icon": "🔋", "link": "/catalog/batteries", "order": 2, "imageId": null, "title_ru": "Батарейки", "title_uz": "Batareyalar"}, {"id": "care", "icon": "🧴", "link": "/catalog/care", "order": 3, "imageId": null, "title_ru": "Средства ухода", "title_uz": "Parvarish vositalari"}]}, "products": {"brandIds": ["cmih32wqq000fab1nimu18r3b", "cmih32wqq000iab1nr31vye89", "cmiknllmo000476v71d73sn03"], "sections": [{"id": "accessories", "icon": "📱", "link": "/catalog/accessories", "order": 0, "imageId": null, "title_ru": "Аксессуары", "title_uz": "Aksessuarlar"}, {"id": "earmolds", "icon": "👂", "link": "/catalog/earmolds", "order": 1, "imageId": null, "title_ru": "Ушные вкладыши", "title_uz": "Quloq qo'shimchalari"}, {"id": "batteries", "icon": "🔋", "link": "/catalog/batteries", "order": 2, "imageId": null, "title_ru": "Батарейки", "title_uz": "Batareyalar"}, {"id": "care", "icon": "🧴", "link": "/catalog/care", "order": 3, "imageId": null, "title_ru": "Средства ухода", "title_uz": "Parvarish vositalari"}]}, "services": {"brandIds": ["cmih32wqq000fab1nimu18r3b", "cmih32wqq000iab1nr31vye89", "cmiknllmo000476v71d73sn03"], "sections": [{"id": "accessories", "icon": "📱", "link": "/catalog/accessories", "order": 0, "imageId": null, "title_ru": "Аксессуары", "title_uz": "Aksessuarlar"}, {"id": "earmolds", "icon": "👂", "link": "/catalog/earmolds", "order": 1, "imageId": null, "title_ru": "Ушные вкладыши", "title_uz": "Quloq qo'shimchalari"}, {"id": "batteries", "icon": "🔋", "link": "/catalog/batteries", "order": 2, "imageId": null, "title_ru": "Батарейки", "title_uz": "Batareyalar"}, {"id": "care", "icon": "🧴", "link": "/catalog/care", "order": 3, "imageId": null, "title_ru": "Средства ухода", "title_uz": "Parvarish vositalari"}]}}	\N	{}	6821262065:AAEE2asYqBn2_JxdhU_HLUBn0tV80pYRYQQ	@acousticuz_bot	Assalomu alaykum!\nSavolingiz bormi?	Здравствуйте!\nУ вас есть вопрос?	cmit8gr8c0000h6qikpcjldvv	G-DCWBCNJRW5	101239576
\.


--
-- Data for Name: Showcase; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."Showcase" (id, type, "productIds", "updatedAt", "productMetadata") FROM stdin;
cmih32wr20018ab1nuq98fb93	cochlear	{cmih32wqx0012ab1nhi0wpc92,cmih32wqx0014ab1njhxz47ep,cmih32wqx0016ab1n6txirkwl}	2025-11-27 06:59:51.759	\N
cmih32wr20017ab1nd841xl2m	interacoustics	{cmiknmoae002xyud4nws3ffqz,cmiknmoan0033yud4111ce9ed,cmiknmoaj0030yud4hin0ld5k,cmiknmoar0036yud4s61drqvz,cmih32wqx0011ab1n4elkd53w,cmih32wqx0013ab1npf5sudsb,cmih32wqx0015ab1ni45p50wg}	2025-12-14 14:53:03.968	{"cmiknmoae002xyud4nws3ffqz": {"imageId": "cmiknmoac002vyud4oaidmnbt"}, "cmiknmoaj0030yud4hin0ld5k": {"imageId": "cmiknmoah002yyud471qhzggs"}, "cmiknmoan0033yud4111ce9ed": {"imageId": "cmiknmoal0031yud49cjgxlbs"}, "cmiknmoar0036yud4s61drqvz": {"imageId": "cmiknmoap0034yud49fr61lg3"}}
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."User" (id, email, password, "fullName", "roleId", "createdAt", "updatedAt", "isActive", "mustChangePassword") FROM stdin;
cmih32wqk0005ab1n4xwgt693	admin@acoustic.uz	$2b$10$UKh1SyqTHlYlZPdRlEqcTu0rjvd4mDKZGnB.HKmOdZdacUjwFZuie	Super Admin	cmih32wp40000ab1nfz3dshnf	2025-11-27 06:59:51.741	2025-11-27 07:00:07.37	t	f
\.


--
-- Data for Name: _ProductToCatalog; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public."_ProductToCatalog" ("A", "B") FROM stdin;
cmih32wqt000xab1nzdpsqajj	cmkfegfbv000g10rp64rk45r8
cmih32wqt000tab1n67ct8yee	cmkfegfbv000g10rp64rk45r8
cmih32wqt000zab1ngmdbo9q3	cmkfegfbv000g10rp64rk45r8
cmih32wqt0010ab1n9d78ea6b	cmkfegfbv000g10rp64rk45r8
cmih32wqt000xab1nzdpsqajj	cmkfe94rt000f10rphyffflw2
cmih32wqt000tab1n67ct8yee	cmkfe94rt000f10rphyffflw2
cmih32wqt000zab1ngmdbo9q3	cmkfe94rt000f10rphyffflw2
cmih32wqt0010ab1n9d78ea6b	cmkfe94rt000f10rphyffflw2
cmih32wqt000sab1ncjk3uz3p	cmkfdy8gs000d10rpk1uxus2f
cmih32wqt000tab1n67ct8yee	cmkfdy8gs000d10rpk1uxus2f
cmih32wqt000zab1ngmdbo9q3	cmkfdy8gs000d10rpk1uxus2f
cmih32wqt000vab1nal2oe2dz	cmkfdy8gs000d10rpk1uxus2f
cmih32wqt000vab1nal2oe2dz	cmkfdsi5s000c10rpi7bbagdw
cmih32wqt000uab1n55ax9jnb	cmkfdsi5s000c10rpi7bbagdw
cmih32wqt000vab1nal2oe2dz	cmkfdnqt5000b10rpx31w6zg9
cmih32wqt000uab1n55ax9jnb	cmkfdnqt5000b10rpx31w6zg9
cmih32wqt000xab1nzdpsqajj	cmkfbsdtc000410rpongtm2pt
cmih32wqt000yab1n4y706ku5	cmkfbsdtc000410rpongtm2pt
cmih32wqt000tab1n67ct8yee	cmkfbsdtc000410rpongtm2pt
cmih32wqt000zab1ngmdbo9q3	cmkfbsdtc000410rpongtm2pt
cmih32wqt000vab1nal2oe2dz	cmkfdbg42000910rp0s56r1c2
cmih32wqt000uab1n55ax9jnb	cmkfdbg42000910rp0s56r1c2
cmih32wqt000zab1ngmdbo9q3	cmkfd7315000810rpxom3gqdr
cmih32wqt000vab1nal2oe2dz	cmkfd7315000810rpxom3gqdr
cmih32wqt000uab1n55ax9jnb	cmkfd7315000810rpxom3gqdr
cmih32wqt000vab1nal2oe2dz	cmkfb6ob1000110rpphnezs35
cmih32wqt000uab1n55ax9jnb	cmkfb6ob1000110rpphnezs35
cmih32wqt000xab1nzdpsqajj	cmkghzp08001h10rpsr33691a
cmih32wqt000tab1n67ct8yee	cmkghzp08001h10rpsr33691a
cmih32wqt000zab1ngmdbo9q3	cmkghzp08001h10rpsr33691a
cmih32wqt000wab1ny7wywsq3	cmkf3bmac000r6kzklcjp2dm2
cmih32wqt000vab1nal2oe2dz	cmkf3bmac000r6kzklcjp2dm2
cmih32wqt000uab1n55ax9jnb	cmkf3bmac000r6kzklcjp2dm2
cmih32wqt000wab1ny7wywsq3	cmkf2gvhe000q6kzkhpww399s
cmih32wqt000vab1nal2oe2dz	cmkf2gvhe000q6kzkhpww399s
cmih32wqt000uab1n55ax9jnb	cmkf2gvhe000q6kzkhpww399s
cmih32wqt000wab1ny7wywsq3	cmiknmo9s002lyud4gen1pc9x
cmih32wqt000vab1nal2oe2dz	cmiknmo9s002lyud4gen1pc9x
cmih32wqt000uab1n55ax9jnb	cmiknmo9s002lyud4gen1pc9x
cmih32wqt000wab1ny7wywsq3	cmiknmo9n002iyud4whzousuy
cmih32wqt000vab1nal2oe2dz	cmiknmo9n002iyud4whzousuy
cmih32wqt000uab1n55ax9jnb	cmiknmo9n002iyud4whzousuy
cmih32wqt000wab1ny7wywsq3	cmiknmo9i002fyud4si8uz4xr
cmih32wqt000vab1nal2oe2dz	cmiknmo9i002fyud4si8uz4xr
cmih32wqt000uab1n55ax9jnb	cmiknmo9i002fyud4si8uz4xr
cmih32wqt000xab1nzdpsqajj	cmkghhlrb001b10rprkqchk29
cmih32wqt000tab1n67ct8yee	cmkghhlrb001b10rprkqchk29
cmih32wqt000zab1ngmdbo9q3	cmkghhlrb001b10rprkqchk29
cmih32wqt0010ab1n9d78ea6b	cmkghhlrb001b10rprkqchk29
cmih32wqt000xab1nzdpsqajj	cmkghr7kd001d10rpq9m79fax
cmih32wqt000tab1n67ct8yee	cmkghr7kd001d10rpq9m79fax
cmih32wqt000zab1ngmdbo9q3	cmkghr7kd001d10rpq9m79fax
cmih32wqt000xab1nzdpsqajj	cmkgoni0e002310rp92cc63as
cmih32wqt000tab1n67ct8yee	cmkgoni0e002310rp92cc63as
cmih32wqt000zab1ngmdbo9q3	cmkgoni0e002310rp92cc63as
cmih32wqt000xab1nzdpsqajj	cmkgor95q002410rpcsw69a2t
cmih32wqt000tab1n67ct8yee	cmkgor95q002410rpcsw69a2t
cmih32wqt000zab1ngmdbo9q3	cmkgor95q002410rpcsw69a2t
cmih32wqt000xab1nzdpsqajj	cmkgoyu4l002610rpynnggfp0
cmih32wqt000tab1n67ct8yee	cmkgoyu4l002610rpynnggfp0
cmih32wqt000zab1ngmdbo9q3	cmkgoyu4l002610rpynnggfp0
cmih32wqt000xab1nzdpsqajj	cmkgp1a60002710rpofajaejp
cmih32wqt000tab1n67ct8yee	cmkgp1a60002710rpofajaejp
cmih32wqt000zab1ngmdbo9q3	cmkgp1a60002710rpofajaejp
cmih32wqt000vab1nal2oe2dz	cmkgpdrw6002910rp9mj2710n
cmih32wqt000uab1n55ax9jnb	cmkgpdrw6002910rp9mj2710n
cmih32wqt000xab1nzdpsqajj	cmkgpmu54002b10rpoiiac2pe
cmih32wqt000zab1ngmdbo9q3	cmkgpmu54002b10rpoiiac2pe
cmih32wqt000uab1n55ax9jnb	cmkgpmu54002b10rpoiiac2pe
cmih32wqt000xab1nzdpsqajj	cmkghmf5j001c10rpozyggfoh
cmih32wqt000tab1n67ct8yee	cmkghmf5j001c10rpozyggfoh
cmih32wqt000zab1ngmdbo9q3	cmkghmf5j001c10rpozyggfoh
cmih32wqt0010ab1n9d78ea6b	cmkghmf5j001c10rpozyggfoh
cmih32wqt000xab1nzdpsqajj	cmkgp4y6n002810rp4dbwaxby
cmih32wqt000tab1n67ct8yee	cmkgp4y6n002810rp4dbwaxby
cmih32wqt000zab1ngmdbo9q3	cmkgp4y6n002810rp4dbwaxby
cmih32wqt000sab1ncjk3uz3p	cmkfbymho000510rpv1szwv58
cmih32wqt000yab1n4y706ku5	cmkfbymho000510rpv1szwv58
cmih32wqt000tab1n67ct8yee	cmkfbymho000510rpv1szwv58
cmih32wqt000zab1ngmdbo9q3	cmkfbymho000510rpv1szwv58
cmih32wqt000vab1nal2oe2dz	cmkfbymho000510rpv1szwv58
cmih32wqt000wab1ny7wywsq3	cmki061xd000xt6rvdek65912
cmih32wqt000yab1n4y706ku5	cmki061xd000xt6rvdek65912
cmih32wqt000tab1n67ct8yee	cmki061xd000xt6rvdek65912
cmih32wqt000zab1ngmdbo9q3	cmki061xd000xt6rvdek65912
cmih32wqt000sab1ncjk3uz3p	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000wab1ny7wywsq3	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000yab1n4y706ku5	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000tab1n67ct8yee	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000zab1ngmdbo9q3	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000vab1nal2oe2dz	cmki0btwv000zt6rvh7ok7tul
cmih32wqt000sab1ncjk3uz3p	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000wab1ny7wywsq3	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000yab1n4y706ku5	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000tab1n67ct8yee	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000zab1ngmdbo9q3	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000vab1nal2oe2dz	cmki0gujv0010t6rvpj4kvh2s
cmih32wqt000wab1ny7wywsq3	cmki0lj5t0012t6rv4lqtymxi
cmih32wqt000xab1nzdpsqajj	cmki0lj5t0012t6rv4lqtymxi
cmih32wqt000yab1n4y706ku5	cmki0lj5t0012t6rv4lqtymxi
cmih32wqt000tab1n67ct8yee	cmki0lj5t0012t6rv4lqtymxi
cmih32wqt000zab1ngmdbo9q3	cmki0lj5t0012t6rv4lqtymxi
cmih32wqt000xab1nzdpsqajj	cmkfdi1qm000a10rpmj7xf8il
cmih32wqt000yab1n4y706ku5	cmkfdi1qm000a10rpmj7xf8il
cmih32wqt000tab1n67ct8yee	cmkfdi1qm000a10rpmj7xf8il
cmih32wqt000zab1ngmdbo9q3	cmkfdi1qm000a10rpmj7xf8il
cmih32wqt000vab1nal2oe2dz	cmkfbhq6k000310rpg4k56tkf
cmih32wqt000uab1n55ax9jnb	cmkfbhq6k000310rpg4k56tkf
cmih32wqt000wab1ny7wywsq3	cmkf3r0b2000s6kzkl9adii2j
cmih32wqt000vab1nal2oe2dz	cmkf3r0b2000s6kzkl9adii2j
cmih32wqt000uab1n55ax9jnb	cmkf3r0b2000s6kzkl9adii2j
cmih32wqt000xab1nzdpsqajj	cmkgottiv002510rphb8s573f
cmih32wqt000tab1n67ct8yee	cmkgottiv002510rphb8s573f
cmih32wqt000zab1ngmdbo9q3	cmkgottiv002510rphb8s573f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: acoustic_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b2a9b6dd-4273-41c0-b859-4174e8006332	aa5340b37ce33b87f380552182bf44a9055978f5cfa1a1340d67379251f59d4f	2025-11-26 23:39:47.023853+05	20251126103435_add_site_settings	\N	\N	2025-11-26 23:39:47.022881+05	1
bd6b5be7-66c3-488d-9a6d-535c32a49471	eafd1e09d658bfb8f0b135ab7a12bce8e6bad67e79b02042de21273f621a6197	2025-11-26 23:39:46.90405+05	20250127000000_add_homepage_content_models	\N	\N	2025-11-26 23:39:46.881076+05	1
dffb2197-168b-472d-82d8-a1effd520df9	ed2a4e8c367e7dd43c368444b5e4e94df187fcec15fedcf5eaa19a722bdcdbb6	2025-11-26 23:39:47.007346+05	20251119111605_add_branch_coordinates	\N	\N	2025-11-26 23:39:47.006573+05	1
a5b86739-b63e-4075-b024-4c1e4c6f2aad	b7a8e02dfecc8e363619cc1b5cd95fbd1f3f61b775b343121044cdc828c5f120	2025-11-26 23:39:46.946111+05	20251108062318_acoustic_new	\N	\N	2025-11-26 23:39:46.904745+05	1
d25c9537-3739-4dc3-bfe5-38b1c487cc5f	e4efbf4b6b2e56924cca1756bfbf9d1f531da0a6e5248c1d8e570cf5daa1c155	2025-11-26 23:39:46.955347+05	20251109172433_yangi	\N	\N	2025-11-26 23:39:46.946506+05	1
9329f923-7780-411f-a47e-12c333406d02	e9ed435659487128d868d4a41392b6a1e7794c92925cfbbca52915d29698f48c	2025-11-26 23:39:46.957652+05	20251110093011_web	\N	\N	2025-11-26 23:39:46.955713+05	1
8967487e-b07d-4638-a0de-08fd55ded259	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-11-26 23:39:47.008357+05	20251120091949_add_latitude_longitude	\N	\N	2025-11-26 23:39:47.007621+05	1
305e010b-2901-4fc7-9662-2efeb394cdc5	ecae9d7a6cd461099e0c39df622923e4f3e7895bdc3caad00f59c82faccc4d43	2025-11-26 23:39:46.960289+05	20251110103156_yangi_qism	\N	\N	2025-11-26 23:39:46.958078+05	1
96667abf-0f21-41ff-b6e8-54f9973d6408	36d28dd5356a7676504f7b0204d23f7c915a399580e1f78945db8b6142490417	2025-11-26 23:39:46.964055+05	20251112155512_add_category_description_image_order	\N	\N	2025-11-26 23:39:46.960683+05	1
957e8f28-a479-4ded-a5e9-8a274cb47c41	2bd83452bbb768e9ce6e26ae492fc8e5d64a85e8aef20ec2ab98d69ae84c65ea	2025-11-26 23:39:46.973039+05	20251113143834_add_homepage_service	\N	\N	2025-11-26 23:39:46.964471+05	1
39d37cb0-4594-4907-813b-0df4cd85be6b	d05a026ad1f063df9b24a18e72d93af2e50ca2d40d6ed3bf32a478110cfcb9e3	2025-11-26 23:39:47.010028+05	20251120092000_add_branch_slug	\N	\N	2025-11-26 23:39:47.008672+05	1
aa59acba-f7f9-4ae7-b1da-0e4c8b3b7943	7c9f458581dcf91aeae51e2659b3d3c4cd64642844aff296c0d54a573d5fe289	2025-11-26 23:39:46.986731+05	20251116110445_add_service_categories	\N	\N	2025-11-26 23:39:46.973429+05	1
23a73c12-c785-41da-a6c8-045fef30724d	498c8855b9d9fff9fb0c77a3a28885c586283a8ae9b74ae5e6cc358980ed863a	2025-11-26 23:39:46.99431+05	20251117044951_add_catalog_model	\N	\N	2025-11-26 23:39:46.987136+05	1
a9b86ff3-4285-4abe-995f-ce94e998eda7	99eca2e5d37eef3a8dc05d096c77aa936222c3a76a4bb0e87ea9d4006914a584	2025-11-26 23:39:47.025163+05	20251126130303_add_banner_phone_fields	\N	\N	2025-11-26 23:39:47.024216+05	1
c35c555e-8635-4c87-8490-ba6a646857f9	5c994b608273798eb0bc6b4437eb451ec3ab70eae6b5a365ea7c66bdc835fb4f	2025-11-26 23:39:46.998779+05	20251117064747_add_many_to_many_product_catalog	\N	\N	2025-11-26 23:39:46.994784+05	1
5f53ed41-72db-4fe4-ac74-533217604978	43591d8b538e07afb7b07a3f5c9551a8bc765baaeb6df4dfee1e7a66561b53ec	2025-11-26 23:39:47.011587+05	20251120132000_add_branch_tour3d_iframe	\N	\N	2025-11-26 23:39:47.010344+05	1
e5c66dca-7b45-4d84-a2e9-e74f7caf1db4	8f0ef3cd7286a89bf4acdd2b1976574437f283f88d19845233dc64e9832da049	2025-11-26 23:39:47.000356+05	20251117113744_add_show_on_homepage_to_catalog	\N	\N	2025-11-26 23:39:46.999123+05	1
018ef656-5e36-41f9-8c0f-0f744b461088	3d8470387a630c9f462fb43c59a5cd1ef92666814112d7b93804d27b4804537c	2025-11-26 23:39:47.001977+05	20251117130709_add_product_type	\N	\N	2025-11-26 23:39:47.000628+05	1
ad343329-a7bc-4aa1-96e0-c03eb2792d95	a7dfae16680649ba12186c72b15121a9c29acce44977856b041ff41135022d49	2025-11-26 23:39:47.006301+05	20251119103733_add_doctor_model	\N	\N	2025-11-26 23:39:47.002282+05	1
783d6b41-0306-4733-8444-0c582413ce97	a21976b233df22b7edb70996e0cbb7572704b23b91d7ca6f9d2b9368f1590252	2025-11-26 23:39:47.012869+05	20251121092024_add_page_gallery_and_video	\N	\N	2025-11-26 23:39:47.011894+05	1
7fc4662f-8ecf-40ee-b870-850c6f38f542	904e059c2419980c4655303edfd95947bfa2d39fe6f7084b6b561060356d5f84	2025-11-26 23:39:47.016541+05	20251121184520_add_post_author	\N	\N	2025-11-26 23:39:47.013186+05	1
58b60612-1821-4ad3-b7e4-51e86cfde48e	78de9393d226a909fcf86b19696460565ea9e6f243449ddc7cfd92745aa20db0	2025-11-26 23:39:47.956089+05	20251126183947_add_tour3d_config_to_branch	\N	\N	2025-11-26 23:39:47.948909+05	1
a82f6bb0-254d-470b-ba8d-bd3c20e24f43	87189f0cf1536c6eb760fa56a8409e4440f6f314f239143d27952ce0fc65b3f9	2025-11-26 23:39:47.020819+05	20251125000000_add_missing_fields	\N	\N	2025-11-26 23:39:47.016887+05	1
b3c4d7d5-3c5a-4da9-ae64-4293cc71eff4	b1bef6124bed0e9760cfed3c68646ffc518d7a8157f0619e8f440babc2b62654	2025-11-26 23:39:47.022228+05	20251125000001_add_product_thumbnail	\N	\N	2025-11-26 23:39:47.021163+05	1
c5141e70-19cf-4e9e-9e63-c208cf698242	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-11-26 23:53:44.63331+05	20251126185330_add_tour3d_config_to_branch	\N	\N	2025-11-26 23:53:44.630671+05	1
188dd35f-4a35-43c5-bb8e-fb5cc4487cb4	964efe7fc3928495ecf7ec324938a524353dafd2bbf26dd56be7cda83d078508	\N	20251121171319_add_post_category	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251121171319_add_post_category\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "category" of relation "Post" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"category\\" of relation \\"Post\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7086), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251121171319_add_post_category"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20251121171319_add_post_category"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2025-11-27 00:00:50.32596+05	2025-11-27 00:00:31.335727+05	0
fc5923e4-aa5e-4d1d-b54c-50e9f210c35b	964efe7fc3928495ecf7ec324938a524353dafd2bbf26dd56be7cda83d078508	2025-11-27 00:00:50.327752+05	20251121171319_add_post_category		\N	2025-11-27 00:00:50.327752+05	0
2e1a24ff-b3cc-4429-ad21-440f6d2dfa8c	0f6d7e65d2826fd2f12281ee4433eb2bb61d0d76e36f30c9254fe00374c290da	2025-11-27 00:01:00.358773+05	20251121173201_add_post_type_and_category	\N	\N	2025-11-27 00:01:00.316094+05	1
951540b4-750c-4af8-827b-4c0129192c14	a26574ed4c58fd33c0ca9061a82786dc5ab6485ca1f9f426553e0749edf15f1d	2025-11-27 00:51:29.835895+05	20251127005123_add_tour3d_config_to_branch	\N	\N	2025-11-27 00:51:29.832478+05	1
cea6483d-cf7e-400f-9e4b-ddb79e2a5569	9e28d1fd3f04dd4818ab878e0866f49cfaccf4ec76285f1aaa961450ee3c53a1	2025-11-27 11:38:34.550241+05	20251127113649_add_homepage_content_models		\N	2025-11-27 11:38:34.550241+05	0
044ef0e0-3c9b-40be-a4c1-eb620dacf856	2e8bcf3d2b462e65c4b728e3ba9b64b86968b1b1a1d0ef822774faa0ead39273	2025-12-03 12:42:19.690674+05	20251203123212_add_amocrm_token_expires_at	\N	\N	2025-12-03 12:42:19.686767+05	1
23815cf9-4b81-4949-a2c5-77c66c5ce188	2dfd498abe838ab4b6a4c8658c576b83c4c9e82a4ffcf2c838886f4c0380493b	2025-12-03 15:49:55.94325+05	20251203120000_add_telegram_button_bot_settings	\N	\N	2025-12-03 15:49:55.939621+05	1
9f550fcd-c391-4812-8161-6b52d046beda	c0221a05b582d0da586dd9a1dddf97a1e1df43e0fa2439f5f154fa66b10116c9	2025-12-03 16:02:50.899872+05	20251203160224_add_telegram_button_message_fields	\N	\N	2025-12-03 16:02:50.895642+05	1
86caa32f-cf75-411c-995d-8bb6a5d56d4a	899158bb0522f82fb27411f9f7b5e36f9f289f3b13d8ad4bdb2e4884c7e0336d	2025-12-03 19:26:08.060562+05	20251203160000_remove_amocrm_fields	\N	\N	2025-12-03 19:26:08.055071+05	1
dcb4bc5c-7b04-4329-b853-caf2442265bc	7392a1be4a473ab2a80388abc28b2809f11767d3670af9e58052cc8b776bbff1	2025-12-03 23:53:36.798813+05	20251203193000_add_hearing_test	\N	\N	2025-12-03 23:53:36.78302+05	1
ae3d2f93-8b2a-4ace-be4e-8d93e175bdcf	aff17e00827e89e6eb0a8fa6e4d48b7c594e3c6448761541ffef3e4e509e9131	2025-12-05 19:48:29.598569+05	20251205185249_add_favicon_to_settings	\N	\N	2025-12-05 19:48:29.584291+05	1
75191bec-1781-4f81-b01a-0e52ac44cb25	bc58a730d3dfa0d74d31182c95bddb2f2c3d1b12738a640740477216537d0925	2025-12-17 01:45:50.260409+05	20251217013537_add_page_url_and_referer_to_leads	\N	\N	2025-12-17 01:45:50.252618+05	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: AvailabilityStatus AvailabilityStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."AvailabilityStatus"
    ADD CONSTRAINT "AvailabilityStatus_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: CatalogPageConfig CatalogPageConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."CatalogPageConfig"
    ADD CONSTRAINT "CatalogPageConfig_pkey" PRIMARY KEY (id);


--
-- Name: Catalog Catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Catalog"
    ADD CONSTRAINT "Catalog_pkey" PRIMARY KEY (id);


--
-- Name: CommonText CommonText_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."CommonText"
    ADD CONSTRAINT "CommonText_pkey" PRIMARY KEY (id);


--
-- Name: Doctor Doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY (id);


--
-- Name: Faq Faq_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Faq"
    ADD CONSTRAINT "Faq_pkey" PRIMARY KEY (id);


--
-- Name: HearingTest HearingTest_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HearingTest"
    ADD CONSTRAINT "HearingTest_pkey" PRIMARY KEY (id);


--
-- Name: HomepageEmptyState HomepageEmptyState_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageEmptyState"
    ADD CONSTRAINT "HomepageEmptyState_pkey" PRIMARY KEY (id);


--
-- Name: HomepageHearingAid HomepageHearingAid_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageHearingAid"
    ADD CONSTRAINT "HomepageHearingAid_pkey" PRIMARY KEY (id);


--
-- Name: HomepageJourneyStep HomepageJourneyStep_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageJourneyStep"
    ADD CONSTRAINT "HomepageJourneyStep_pkey" PRIMARY KEY (id);


--
-- Name: HomepageLink HomepageLink_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageLink"
    ADD CONSTRAINT "HomepageLink_pkey" PRIMARY KEY (id);


--
-- Name: HomepageNewsItem HomepageNewsItem_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageNewsItem"
    ADD CONSTRAINT "HomepageNewsItem_pkey" PRIMARY KEY (id);


--
-- Name: HomepagePlaceholder HomepagePlaceholder_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepagePlaceholder"
    ADD CONSTRAINT "HomepagePlaceholder_pkey" PRIMARY KEY (id);


--
-- Name: HomepageSection HomepageSection_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageSection"
    ADD CONSTRAINT "HomepageSection_pkey" PRIMARY KEY (id);


--
-- Name: HomepageService HomepageService_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageService"
    ADD CONSTRAINT "HomepageService_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Menu Menu_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_pkey" PRIMARY KEY (id);


--
-- Name: Page Page_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_pkey" PRIMARY KEY (id);


--
-- Name: PostCategory PostCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."PostCategory"
    ADD CONSTRAINT "PostCategory_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: ServiceCategory ServiceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ServiceCategory"
    ADD CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_catalogHeroImageId_key; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_catalogHeroImageId_key" UNIQUE ("catalogHeroImageId");


--
-- Name: Setting Setting_logoId_key; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_logoId_key" UNIQUE ("logoId");


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: Showcase Showcase_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Showcase"
    ADD CONSTRAINT "Showcase_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: AvailabilityStatus_key_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "AvailabilityStatus_key_idx" ON public."AvailabilityStatus" USING btree (key);


--
-- Name: AvailabilityStatus_key_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "AvailabilityStatus_key_key" ON public."AvailabilityStatus" USING btree (key);


--
-- Name: AvailabilityStatus_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "AvailabilityStatus_order_idx" ON public."AvailabilityStatus" USING btree ("order");


--
-- Name: Banner_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Banner_status_order_idx" ON public."Banner" USING btree (status, "order");


--
-- Name: Branch_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Branch_order_idx" ON public."Branch" USING btree ("order");


--
-- Name: Branch_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Branch_slug_idx" ON public."Branch" USING btree (slug);


--
-- Name: Branch_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Branch_slug_key" ON public."Branch" USING btree (slug);


--
-- Name: Brand_name_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Brand_name_key" ON public."Brand" USING btree (name);


--
-- Name: Brand_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Brand_slug_idx" ON public."Brand" USING btree (slug);


--
-- Name: Brand_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Brand_slug_key" ON public."Brand" USING btree (slug);


--
-- Name: Catalog_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Catalog_order_idx" ON public."Catalog" USING btree ("order");


--
-- Name: Catalog_showOnHomepage_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Catalog_showOnHomepage_idx" ON public."Catalog" USING btree ("showOnHomepage");


--
-- Name: Catalog_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Catalog_slug_idx" ON public."Catalog" USING btree (slug);


--
-- Name: Catalog_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Catalog_slug_key" ON public."Catalog" USING btree (slug);


--
-- Name: Catalog_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Catalog_status_idx" ON public."Catalog" USING btree (status);


--
-- Name: CommonText_category_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "CommonText_category_idx" ON public."CommonText" USING btree (category);


--
-- Name: CommonText_key_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "CommonText_key_idx" ON public."CommonText" USING btree (key);


--
-- Name: CommonText_key_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "CommonText_key_key" ON public."CommonText" USING btree (key);


--
-- Name: Doctor_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Doctor_slug_idx" ON public."Doctor" USING btree (slug);


--
-- Name: Doctor_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Doctor_slug_key" ON public."Doctor" USING btree (slug);


--
-- Name: Doctor_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Doctor_status_order_idx" ON public."Doctor" USING btree (status, "order");


--
-- Name: Faq_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Faq_status_order_idx" ON public."Faq" USING btree (status, "order");


--
-- Name: HearingTest_source_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HearingTest_source_idx" ON public."HearingTest" USING btree (source);


--
-- Name: HearingTest_status_createdAt_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HearingTest_status_createdAt_idx" ON public."HearingTest" USING btree (status, "createdAt");


--
-- Name: HomepageEmptyState_sectionKey_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageEmptyState_sectionKey_idx" ON public."HomepageEmptyState" USING btree ("sectionKey");


--
-- Name: HomepageEmptyState_sectionKey_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "HomepageEmptyState_sectionKey_key" ON public."HomepageEmptyState" USING btree ("sectionKey");


--
-- Name: HomepageHearingAid_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageHearingAid_status_order_idx" ON public."HomepageHearingAid" USING btree (status, "order");


--
-- Name: HomepageJourneyStep_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageJourneyStep_status_order_idx" ON public."HomepageJourneyStep" USING btree (status, "order");


--
-- Name: HomepageLink_position_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageLink_position_order_idx" ON public."HomepageLink" USING btree ("position", "order");


--
-- Name: HomepageLink_sectionKey_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageLink_sectionKey_idx" ON public."HomepageLink" USING btree ("sectionKey");


--
-- Name: HomepageLink_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageLink_status_idx" ON public."HomepageLink" USING btree (status);


--
-- Name: HomepageNewsItem_postId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageNewsItem_postId_idx" ON public."HomepageNewsItem" USING btree ("postId");


--
-- Name: HomepageNewsItem_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageNewsItem_status_order_idx" ON public."HomepageNewsItem" USING btree (status, "order");


--
-- Name: HomepagePlaceholder_sectionKey_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepagePlaceholder_sectionKey_idx" ON public."HomepagePlaceholder" USING btree ("sectionKey");


--
-- Name: HomepagePlaceholder_sectionKey_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "HomepagePlaceholder_sectionKey_key" ON public."HomepagePlaceholder" USING btree ("sectionKey");


--
-- Name: HomepageSection_key_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageSection_key_idx" ON public."HomepageSection" USING btree (key);


--
-- Name: HomepageSection_key_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "HomepageSection_key_key" ON public."HomepageSection" USING btree (key);


--
-- Name: HomepageSection_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageSection_status_order_idx" ON public."HomepageSection" USING btree (status, "order");


--
-- Name: HomepageService_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "HomepageService_status_order_idx" ON public."HomepageService" USING btree (status, "order");


--
-- Name: Lead_createdAt_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Lead_createdAt_idx" ON public."Lead" USING btree ("createdAt");


--
-- Name: Lead_pageUrl_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Lead_pageUrl_idx" ON public."Lead" USING btree ("pageUrl");


--
-- Name: Lead_source_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Lead_source_idx" ON public."Lead" USING btree (source);


--
-- Name: Lead_status_createdAt_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Lead_status_createdAt_idx" ON public."Lead" USING btree (status, "createdAt");


--
-- Name: Media_url_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Media_url_idx" ON public."Media" USING btree (url);


--
-- Name: Menu_name_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Menu_name_key" ON public."Menu" USING btree (name);


--
-- Name: Page_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Page_slug_idx" ON public."Page" USING btree (slug);


--
-- Name: Page_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Page_slug_key" ON public."Page" USING btree (slug);


--
-- Name: Page_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Page_status_idx" ON public."Page" USING btree (status);


--
-- Name: PostCategory_imageId_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "PostCategory_imageId_key" ON public."PostCategory" USING btree ("imageId");


--
-- Name: PostCategory_section_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "PostCategory_section_idx" ON public."PostCategory" USING btree (section);


--
-- Name: PostCategory_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "PostCategory_slug_idx" ON public."PostCategory" USING btree (slug);


--
-- Name: PostCategory_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "PostCategory_slug_key" ON public."PostCategory" USING btree (slug);


--
-- Name: PostCategory_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "PostCategory_status_order_idx" ON public."PostCategory" USING btree (status, "order");


--
-- Name: Post_authorId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_authorId_idx" ON public."Post" USING btree ("authorId");


--
-- Name: Post_categoryId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_categoryId_idx" ON public."Post" USING btree ("categoryId");


--
-- Name: Post_categoryId_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_categoryId_status_idx" ON public."Post" USING btree ("categoryId", status);


--
-- Name: Post_postType_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_postType_idx" ON public."Post" USING btree ("postType");


--
-- Name: Post_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_slug_idx" ON public."Post" USING btree (slug);


--
-- Name: Post_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Post_slug_key" ON public."Post" USING btree (slug);


--
-- Name: Post_status_publishAt_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_status_publishAt_idx" ON public."Post" USING btree (status, "publishAt");


--
-- Name: Post_tags_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Post_tags_idx" ON public."Post" USING btree (tags);


--
-- Name: ProductCategory_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ProductCategory_order_idx" ON public."ProductCategory" USING btree ("order");


--
-- Name: ProductCategory_parentId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ProductCategory_parentId_idx" ON public."ProductCategory" USING btree ("parentId");


--
-- Name: ProductCategory_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ProductCategory_slug_idx" ON public."ProductCategory" USING btree (slug);


--
-- Name: ProductCategory_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON public."ProductCategory" USING btree (slug);


--
-- Name: Product_brandId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Product_brandId_idx" ON public."Product" USING btree ("brandId");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_productType_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Product_productType_idx" ON public."Product" USING btree ("productType");


--
-- Name: Product_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Product_slug_idx" ON public."Product" USING btree (slug);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Product_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Product_status_idx" ON public."Product" USING btree (status);


--
-- Name: Role_name_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Role_name_idx" ON public."Role" USING btree (name);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: ServiceCategory_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ServiceCategory_order_idx" ON public."ServiceCategory" USING btree ("order");


--
-- Name: ServiceCategory_parentId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ServiceCategory_parentId_idx" ON public."ServiceCategory" USING btree ("parentId");


--
-- Name: ServiceCategory_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ServiceCategory_slug_idx" ON public."ServiceCategory" USING btree (slug);


--
-- Name: ServiceCategory_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON public."ServiceCategory" USING btree (slug);


--
-- Name: ServiceCategory_status_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "ServiceCategory_status_idx" ON public."ServiceCategory" USING btree (status);


--
-- Name: Service_categoryId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Service_categoryId_idx" ON public."Service" USING btree ("categoryId");


--
-- Name: Service_slug_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Service_slug_idx" ON public."Service" USING btree (slug);


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: Service_status_order_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "Service_status_order_idx" ON public."Service" USING btree (status, "order");


--
-- Name: Setting_faviconId_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Setting_faviconId_key" ON public."Setting" USING btree ("faviconId");


--
-- Name: Showcase_type_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "Showcase_type_key" ON public."Showcase" USING btree (type);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: _ProductToCatalog_AB_unique; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE UNIQUE INDEX "_ProductToCatalog_AB_unique" ON public."_ProductToCatalog" USING btree ("A", "B");


--
-- Name: _ProductToCatalog_B_index; Type: INDEX; Schema: public; Owner: acoustic_user
--

CREATE INDEX "_ProductToCatalog_B_index" ON public."_ProductToCatalog" USING btree ("B");


--
-- Name: Banner Banner_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Branch Branch_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Brand Brand_logoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Catalog Catalog_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Catalog"
    ADD CONSTRAINT "Catalog_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Doctor Doctor_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HomepageHearingAid HomepageHearingAid_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageHearingAid"
    ADD CONSTRAINT "HomepageHearingAid_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HomepageNewsItem HomepageNewsItem_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageNewsItem"
    ADD CONSTRAINT "HomepageNewsItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HomepagePlaceholder HomepagePlaceholder_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepagePlaceholder"
    ADD CONSTRAINT "HomepagePlaceholder_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HomepageService HomepageService_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."HomepageService"
    ADD CONSTRAINT "HomepageService_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."PostCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Post Post_coverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductCategory ProductCategory_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductCategory ProductCategory_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceCategory ServiceCategory_imageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ServiceCategory"
    ADD CONSTRAINT "ServiceCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceCategory ServiceCategory_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."ServiceCategory"
    ADD CONSTRAINT "ServiceCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Service Service_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Service Service_coverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Setting Setting_catalogHeroImageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_catalogHeroImageId_fkey" FOREIGN KEY ("catalogHeroImageId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Setting Setting_faviconId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_faviconId_fkey" FOREIGN KEY ("faviconId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Setting Setting_logoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _ProductToCatalog _ProductToCatalog_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."_ProductToCatalog"
    ADD CONSTRAINT "_ProductToCatalog_A_fkey" FOREIGN KEY ("A") REFERENCES public."Catalog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToCatalog _ProductToCatalog_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acoustic_user
--

ALTER TABLE ONLY public."_ProductToCatalog"
    ADD CONSTRAINT "_ProductToCatalog_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict mw0Qr8zAe9JA5gx6gZ0x0jejD0J3deGstgvxuqhbpmsMasBbwpKy9eR5cxjQFBo

