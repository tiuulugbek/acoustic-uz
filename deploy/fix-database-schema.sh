#!/bin/bash
# Fix database schema if migrations are missing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${BLUE}🔍 Checking database schema...${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env file not found at: $ENV_FILE${NC}"
    exit 1
fi

# Source .env file to load variables
set -a
source "$ENV_FILE"
set +a

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    exit 1
fi

# Extract database connection info
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-acousticwebdb}"
DB_NAME="${DB_NAME:-acousticwebdb}"
DB_PASSWORD="${DB_PASSWORD}"

echo -e "${BLUE}📋 Checking PostCategory table...${NC}"

# Check if section column exists
SECTION_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PostCategory' AND column_name='section');" 2>/dev/null | tr -d ' ')

if [ "$SECTION_EXISTS" != "t" ]; then
    echo -e "${YELLOW}⚠️  section column not found, adding...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'SQL'
ALTER TABLE "PostCategory" ADD COLUMN IF NOT EXISTS "section" TEXT;
SQL
    echo -e "${GREEN}✅ section column added${NC}"
else
    echo -e "${GREEN}✅ section column exists${NC}"
fi

# Check if imageId column exists
IMAGEID_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PostCategory' AND column_name='imageId');" 2>/dev/null | tr -d ' ')

if [ "$IMAGEID_EXISTS" != "t" ]; then
    echo -e "${YELLOW}⚠️  imageId column not found, adding...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'SQL'
ALTER TABLE "PostCategory" ADD COLUMN IF NOT EXISTS "imageId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "PostCategory_imageId_key" ON "PostCategory"("imageId");
ALTER TABLE "PostCategory"
ADD CONSTRAINT IF NOT EXISTS "PostCategory_imageId_fkey" 
FOREIGN KEY ("imageId") 
REFERENCES "Media"("id") 
ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "PostCategory_section_idx" ON "PostCategory"("section");
SQL
    echo -e "${GREEN}✅ imageId column added${NC}"
else
    echo -e "${GREEN}✅ imageId column exists${NC}"
fi

echo ""
echo -e "${BLUE}📋 Checking Post table...${NC}"

# Check if postType column exists
POSTTYPE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Post' AND column_name='postType');" 2>/dev/null | tr -d ' ')

if [ "$POSTTYPE_EXISTS" != "t" ]; then
    echo -e "${YELLOW}⚠️  postType column not found, adding...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'SQL'
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "postType" TEXT DEFAULT 'article';
SQL
    echo -e "${GREEN}✅ postType column added${NC}"
else
    echo -e "${GREEN}✅ postType column exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database schema check complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Restart backend: pm2 restart acoustic-backend"
echo "  2. Check logs: pm2 logs acoustic-backend --lines 20"

