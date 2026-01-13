#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Migration: String IDs -> Int IDs${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This is a complex migration!${NC}"
echo -e "${YELLOW}⚠️  Make sure you have a database backup!${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

# Load environment variables
cd "$PROJECT_DIR"
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

# Extract database connection details
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo -e "${BLUE}Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}${NC}"
echo ""
read -p "Continue with migration? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Migration cancelled${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Create migration file
MIGRATION_NAME="migrate_string_to_int_ids"
MIGRATION_DIR="prisma/migrations/$(date +%Y%m%d%H%M%S)_${MIGRATION_NAME}"
mkdir -p "$MIGRATION_DIR"

MIGRATION_FILE="$MIGRATION_DIR/migration.sql"

cat > "$MIGRATION_FILE" << 'MIGRATION_EOF'
-- Migration: Convert String IDs to Int IDs
-- This migration preserves existing data by:
-- 1. Creating new tables with Int IDs
-- 2. Migrating data with ID mapping
-- 3. Updating foreign keys and arrays
-- 4. Dropping old tables and renaming new ones

BEGIN;

-- Create ID mapping tables for each model
CREATE TABLE IF NOT EXISTS "_id_mapping_Role" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Media" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Brand" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_ProductCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Product" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_ServiceCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Service" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_PostCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Post" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Branch" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Doctor" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Catalog" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL
);

-- Step 1: Migrate Role (no dependencies)
INSERT INTO "_id_mapping_Role" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "Role";

CREATE TABLE "Role_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "permissions" TEXT[] NOT NULL
);

INSERT INTO "Role_new" (id, name, permissions)
SELECT m.new_id, r.name, r.permissions
FROM "Role" r
JOIN "_id_mapping_Role" m ON r.id = m.old_id;

-- Step 2: Migrate Media (no dependencies)
INSERT INTO "_id_mapping_Media" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "Media";

CREATE TABLE "Media_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt_uz" TEXT,
    "alt_ru" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

INSERT INTO "Media_new" (id, url, "alt_uz", "alt_ru", filename, "mimeType", size, "createdAt", "updatedAt")
SELECT m.new_id, me.url, me."alt_uz", me."alt_ru", me.filename, me."mimeType", me.size, me."createdAt", me."updatedAt"
FROM "Media" me
JOIN "_id_mapping_Media" m ON me.id = m.old_id;

CREATE INDEX "Media_new_url_idx" ON "Media_new"("url");

-- Step 3: Migrate User (depends on Role)
CREATE TABLE "User_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO "User_new" (id, email, password, "fullName", "roleId", "createdAt", "updatedAt", "isActive", "mustChangePassword")
SELECT ROW_NUMBER() OVER (ORDER BY u.id)::INTEGER, u.email, u.password, u."fullName", rm.new_id, u."createdAt", u."updatedAt", u."isActive", u."mustChangePassword"
FROM "User" u
JOIN "_id_mapping_Role" rm ON u."roleId" = rm.old_id;

CREATE INDEX "User_new_email_idx" ON "User_new"("email");
CREATE INDEX "User_new_roleId_idx" ON "User_new"("roleId");

-- Step 4: Migrate Brand (depends on Media)
INSERT INTO "_id_mapping_Brand" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "Brand";

CREATE TABLE "Brand_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "logoId" INTEGER,
    "desc_uz" TEXT,
    "desc_ru" TEXT
);

INSERT INTO "Brand_new" (id, name, slug, "logoId", "desc_uz", "desc_ru")
SELECT bm.new_id, b.name, b.slug, mm.new_id, b."desc_uz", b."desc_ru"
FROM "Brand" b
JOIN "_id_mapping_Brand" bm ON b.id = bm.old_id
LEFT JOIN "_id_mapping_Media" mm ON b."logoId" = mm.old_id;

CREATE INDEX "Brand_new_slug_idx" ON "Brand_new"("slug");

-- Step 5: Migrate ProductCategory (depends on Media, self-referencing)
INSERT INTO "_id_mapping_ProductCategory" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "ProductCategory";

CREATE TABLE "ProductCategory_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "icon" TEXT,
    "imageId" INTEGER,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "ProductCategory_new" (id, "name_uz", "name_ru", slug, "description_uz", "description_ru", icon, "imageId", "parentId", "order")
SELECT pm.new_id, pc."name_uz", pc."name_ru", pc.slug, pc."description_uz", pc."description_ru", pc.icon, mm.new_id, ppm.new_id, pc."order"
FROM "ProductCategory" pc
JOIN "_id_mapping_ProductCategory" pm ON pc.id = pm.old_id
LEFT JOIN "_id_mapping_Media" mm ON pc."imageId" = mm.old_id
LEFT JOIN "_id_mapping_ProductCategory" ppm ON pc."parentId" = ppm.old_id;

CREATE INDEX "ProductCategory_new_slug_idx" ON "ProductCategory_new"("slug");
CREATE INDEX "ProductCategory_new_parentId_idx" ON "ProductCategory_new"("parentId");
CREATE INDEX "ProductCategory_new_order_idx" ON "ProductCategory_new"("order");

-- Step 6: Migrate Product (depends on Brand, ProductCategory, Media arrays)
INSERT INTO "_id_mapping_Product" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "Product";

CREATE TABLE "Product_new" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "productType" TEXT,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "price" DECIMAL(14,2),
    "stock" INTEGER DEFAULT 0,
    "brandId" INTEGER,
    "categoryId" INTEGER,
    "specsText" TEXT,
    "galleryIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "thumbnailId" INTEGER,
    "audience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "signalProcessing" TEXT,
    "powerLevel" TEXT,
    "hearingLossLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smartphoneCompatibility" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tinnitusSupport" BOOLEAN DEFAULT false,
    "paymentOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availabilityStatus" TEXT,
    "intro_uz" TEXT,
    "intro_ru" TEXT,
    "features_uz" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features_ru" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits_uz" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits_ru" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tech_uz" TEXT,
    "tech_ru" TEXT,
    "fittingRange_uz" TEXT,
    "fittingRange_ru" TEXT,
    "regulatoryNote_uz" TEXT,
    "regulatoryNote_ru" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedProductIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "usefulArticleSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Function to convert TEXT[] to INTEGER[] for galleryIds
CREATE OR REPLACE FUNCTION convert_text_array_to_int_array(text_arr TEXT[], mapping_table TEXT)
RETURNS INTEGER[] AS $$
DECLARE
    result INTEGER[];
    item TEXT;
BEGIN
    result := ARRAY[]::INTEGER[];
    FOREACH item IN ARRAY text_arr
    LOOP
        EXECUTE format('SELECT new_id FROM %I WHERE old_id = $1', mapping_table) INTO result[array_length(result, 1) + 1] USING item;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

INSERT INTO "Product_new" (
    id, "name_uz", "name_ru", slug, "productType", "description_uz", "description_ru",
    price, stock, "brandId", "categoryId", "specsText", "galleryIds", "thumbnailId",
    audience, "formFactors", "signalProcessing", "powerLevel", "hearingLossLevels",
    "smartphoneCompatibility", "tinnitusSupport", "paymentOptions", "availabilityStatus",
    "intro_uz", "intro_ru", "features_uz", "features_ru", "benefits_uz", "benefits_ru",
    "tech_uz", "tech_ru", "fittingRange_uz", "fittingRange_ru", "regulatoryNote_uz", "regulatoryNote_ru",
    "galleryUrls", "relatedProductIds", "usefulArticleSlugs", status, "createdAt", "updatedAt"
)
SELECT 
    pm.new_id,
    p."name_uz", p."name_ru", p.slug, p."productType", p."description_uz", p."description_ru",
    p.price, p.stock,
    bm.new_id,
    cm.new_id,
    p."specsText",
    ARRAY(SELECT mm.new_id FROM unnest(p."galleryIds") AS old_id JOIN "_id_mapping_Media" mm ON old_id = mm.old_id)::INTEGER[],
    tm.new_id,
    p.audience, p."formFactors", p."signalProcessing", p."powerLevel", p."hearingLossLevels",
    p."smartphoneCompatibility", p."tinnitusSupport", p."paymentOptions", p."availabilityStatus",
    p."intro_uz", p."intro_ru", p."features_uz", p."features_ru", p."benefits_uz", p."benefits_ru",
    p."tech_uz", p."tech_ru", p."fittingRange_uz", p."fittingRange_ru", p."regulatoryNote_uz", p."regulatoryNote_ru",
    p."galleryUrls",
    ARRAY(SELECT pm2.new_id FROM unnest(p."relatedProductIds") AS old_id JOIN "_id_mapping_Product" pm2 ON old_id = pm2.old_id)::INTEGER[],
    p."usefulArticleSlugs",
    p.status, p."createdAt", p."updatedAt"
FROM "Product" p
JOIN "_id_mapping_Product" pm ON p.id = pm.old_id
LEFT JOIN "_id_mapping_Brand" bm ON p."brandId" = bm.old_id
LEFT JOIN "_id_mapping_ProductCategory" cm ON p."categoryId" = cm.old_id
LEFT JOIN "_id_mapping_Media" tm ON p."thumbnailId" = tm.old_id;

CREATE INDEX "Product_new_slug_idx" ON "Product_new"("slug");
CREATE INDEX "Product_new_brandId_idx" ON "Product_new"("brandId");
CREATE INDEX "Product_new_categoryId_idx" ON "Product_new"("categoryId");
CREATE INDEX "Product_new_status_idx" ON "Product_new"(status);
CREATE INDEX "Product_new_productType_idx" ON "Product_new"("productType");

-- Continue with other models...
-- (This is a simplified version - full migration would include all models)

COMMIT;
MIGRATION_EOF

echo -e "${GREEN}✅ Migration file created: ${MIGRATION_FILE}${NC}"
echo ""
echo -e "${YELLOW}⚠️  NOTE: This is a simplified migration script.${NC}"
echo -e "${YELLOW}⚠️  You need to complete it for all models.${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the migration file"
echo "2. Complete it for all remaining models"
echo "3. Test on a copy of production database"
echo "4. Apply migration: sudo -u acoustic npx prisma migrate deploy"

