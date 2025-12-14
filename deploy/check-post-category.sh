#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Check Post Category${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"

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

# Extract database connection details, removing any query parameters
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Construct a clean DATABASE_URL without query parameters for psql
CLEAN_DB_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

echo -e "${BLUE}Checking post: inson-eshitish-organi-qanday-tuzilgan${NC}"
echo ""

psql "$CLEAN_DB_URL" << SQL
SELECT 
    p.id,
    p."title_uz",
    p."postType",
    p.status,
    p."categoryId",
    pc."name_uz" as category_name,
    pc.section as category_section,
    p."publishAt"
FROM "Post" p
LEFT JOIN "PostCategory" pc ON p."categoryId" = pc.id
WHERE p.slug = 'inson-eshitish-organi-qanday-tuzilgan';
SQL

echo ""
echo -e "${BLUE}Checking all categories for 'patients' section:${NC}"
psql "$CLEAN_DB_URL" << SQL
SELECT id, "name_uz", slug, section
FROM "PostCategory"
WHERE section = 'patients';
SQL

echo ""
echo -e "${BLUE}Checking all categories for 'children' section:${NC}"
psql "$CLEAN_DB_URL" << SQL
SELECT id, "name_uz", slug, section
FROM "PostCategory"
WHERE section = 'children';
SQL
