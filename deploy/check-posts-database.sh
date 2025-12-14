#!/bin/bash
# Script to check posts in database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Checking Posts in Database          ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Load database credentials from .env
if [ -f "/var/www/acoustic.uz/.env" ]; then
    source /var/www/acoustic.uz/.env
elif [ -f "/var/www/acoustic.uz/apps/backend/.env" ]; then
    source /var/www/acoustic.uz/apps/backend/.env
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not found in .env${NC}"
    exit 1
fi

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo ""
echo -e "${BLUE}1️⃣ Database Connection Info:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

echo ""
echo -e "${BLUE}2️⃣ Total Posts Count:${NC}"
TOTAL_POSTS=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Post\";")
echo "  Total posts: $TOTAL_POSTS"

echo ""
echo -e "${BLUE}3️⃣ Posts by Status:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT status, COUNT(*) as count FROM \"Post\" GROUP BY status ORDER BY count DESC;"

echo ""
echo -e "${BLUE}4️⃣ Posts by Type:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT \"postType\", COUNT(*) as count FROM \"Post\" GROUP BY \"postType\" ORDER BY count DESC;"

echo ""
echo -e "${BLUE}5️⃣ Posts with Categories:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as posts_with_category FROM \"Post\" WHERE \"categoryId\" IS NOT NULL;"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as posts_without_category FROM \"Post\" WHERE \"categoryId\" IS NULL;"

echo ""
echo -e "${BLUE}6️⃣ Posts by Category (Top 10):${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section,
    COUNT(p.id) as post_count
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published'
GROUP BY pc.id, pc.\"name_uz\", pc.\"section\"
ORDER BY post_count DESC
LIMIT 10;
"

echo ""
echo -e "${BLUE}7️⃣ Recent Published Posts (Last 10):${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    p.\"categoryId\",
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section,
    p.\"publishAt\"
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published'
ORDER BY p.\"publishAt\" DESC
LIMIT 10;
"

echo ""
echo -e "${BLUE}8️⃣ Posts for 'patients' section:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published' 
  AND (pc.\"section\" = 'patients' OR p.\"categoryId\" IS NULL)
ORDER BY p.\"publishAt\" DESC;
"

echo ""
echo -e "${BLUE}9️⃣ Posts for 'children' section:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    p.id,
    p.\"title_uz\",
    p.\"postType\",
    p.status,
    pc.\"name_uz\" as category_name,
    pc.\"section\" as section
FROM \"Post\" p
LEFT JOIN \"PostCategory\" pc ON p.\"categoryId\" = pc.id
WHERE p.status = 'published' 
  AND (pc.\"section\" = 'children' OR p.\"categoryId\" IS NULL)
ORDER BY p.\"publishAt\" DESC;
"

echo ""
echo -e "${BLUE}🔟 Post Categories:${NC}"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    id,
    \"name_uz\",
    \"name_ru\",
    \"section\",
    status,
    COUNT(p.id) as post_count
FROM \"PostCategory\" pc
LEFT JOIN \"Post\" p ON p.\"categoryId\" = pc.id AND p.status = 'published'
GROUP BY pc.id, pc.\"name_uz\", pc.\"name_ru\", pc.\"section\", pc.status
ORDER BY pc.\"section\", pc.\"name_uz\";
"

echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}✅ Database Check Complete!          ${NC}"
echo -e "${GREEN}=======================================${NC}"

