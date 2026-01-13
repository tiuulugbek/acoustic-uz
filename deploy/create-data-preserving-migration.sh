#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Create Data-Preserving Migration${NC}"
echo -e "${BLUE}======================================${NC}"
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

cd "$BACKEND_DIR"

# Find existing migration directory or create new one
MIGRATION_DIR=$(ls -td prisma/migrations/*change_ids_to_int* 2>/dev/null | head -1)

if [ -z "$MIGRATION_DIR" ]; then
    MIGRATION_TIMESTAMP=$(date +%Y%m%d%H%M%S)
    MIGRATION_DIR="prisma/migrations/${MIGRATION_TIMESTAMP}_change_ids_to_int"
    sudo -u acoustic mkdir -p "$MIGRATION_DIR"
fi

MIGRATION_FILE="$MIGRATION_DIR/migration.sql"

echo -e "${BLUE}Migration directory: ${MIGRATION_DIR}${NC}"
echo -e "${BLUE}Migration file: ${MIGRATION_FILE}${NC}"
echo ""

echo -e "${YELLOW}⚠️  This will create a data-preserving migration.${NC}"
echo -e "${YELLOW}⚠️  It will be very long (1000+ lines).${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

# Create the data-preserving migration file
echo -e "${BLUE}Creating data-preserving migration...${NC}"

sudo -u acoustic bash << 'MIGRATION_SCRIPT'
cat > '$MIGRATION_FILE' << 'EOF'
-- Migration: Convert String IDs to Int IDs (Data-Preserving)
-- This migration preserves ALL existing data by:
-- 1. Creating ID mapping tables
-- 2. Creating new tables with Int IDs
-- 3. Migrating data with ID mapping
-- 4. Updating foreign keys and arrays
-- 5. Dropping old tables and renaming new ones

BEGIN;

-- ============================================
-- STEP 1: Create ID mapping tables
-- ============================================

CREATE TABLE IF NOT EXISTS "_id_mapping_Role" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Media" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Brand" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_ProductCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Product" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_ServiceCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Service" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_PostCategory" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Post" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Branch" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Doctor" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Catalog" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Banner" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Faq" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Page" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Lead" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HearingTest" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_AuditLog" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Menu" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageHearingAid" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageJourneyStep" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageNewsItem" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageService" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageSection" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageLink" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepagePlaceholder" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_HomepageEmptyState" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_CommonText" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_AvailabilityStatus" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_Showcase" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "_id_mapping_User" (
    old_id TEXT PRIMARY KEY,
    new_id INTEGER NOT NULL UNIQUE
);

-- ============================================
-- STEP 2: Migrate Role (no dependencies)
-- ============================================

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

CREATE INDEX "Role_new_name_idx" ON "Role_new"("name");

-- ============================================
-- STEP 3: Migrate Media (no dependencies)
-- ============================================

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

-- ============================================
-- STEP 4: Migrate User (depends on Role)
-- ============================================

INSERT INTO "_id_mapping_User" (old_id, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER
FROM "User";

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
SELECT um.new_id, u.email, u.password, u."fullName", rm.new_id, u."createdAt", u."updatedAt", u."isActive", u."mustChangePassword"
FROM "User" u
JOIN "_id_mapping_User" um ON u.id = um.old_id
JOIN "_id_mapping_Role" rm ON u."roleId" = rm.old_id;

CREATE INDEX "User_new_email_idx" ON "User_new"("email");
CREATE INDEX "User_new_roleId_idx" ON "User_new"("roleId");

-- ============================================
-- STEP 5: Migrate Brand (depends on Media)
-- ============================================

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

-- ============================================
-- STEP 6: Migrate ProductCategory (depends on Media, self-referencing)
-- ============================================

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

-- Continue with remaining models...
-- (This is a very long migration, continuing in next part)

COMMIT;
EOF

MIGRATION_SCRIPT

echo -e "${GREEN}✅ Data-preserving migration created!${NC}"
echo ""
echo -e "${YELLOW}⚠️  NOTE: This is a partial migration.${NC}"
echo -e "${YELLOW}⚠️  You need to complete it for all remaining models.${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review migration file: sudo nano $MIGRATION_FILE"
echo "2. Complete migration for remaining models"
echo "3. Test on a copy of production database"
echo "4. Apply migration: sudo -u acoustic npx prisma migrate deploy"

