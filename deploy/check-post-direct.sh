#!/bin/bash

set -e

PROJECT_DIR="/var/www/acoustic.uz"

cd "$PROJECT_DIR"
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "❌ Error: .env file not found"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    exit 1
fi

# Remove query parameters from DATABASE_URL
CLEAN_DB_URL="${DATABASE_URL%%\?*}"

echo "Checking post: inson-eshitish-organi-qanday-tuzilgan"
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
echo "Checking all categories for 'patients' section:"
psql "$CLEAN_DB_URL" << SQL
SELECT id, "name_uz", slug, section
FROM "PostCategory"
WHERE section = 'patients';
SQL

echo ""
echo "Checking all categories for 'children' section:"
psql "$CLEAN_DB_URL" << SQL
SELECT id, "name_uz", slug, section
FROM "PostCategory"
WHERE section = 'children';
SQL
