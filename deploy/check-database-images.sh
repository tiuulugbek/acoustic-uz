#!/bin/bash
echo "🔍 Database'da rasmlar URL'larini tekshirish..."
echo ""

cd /var/www/acoustic.uz

# Database connection ma'lumotlarini olish
DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL topilmadi"
    exit 1
fi

echo "Database URL topildi"
echo ""

# PostgreSQL connection
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p' | sed 's/%23/#/g')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""

# SQL query
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, name, image_url FROM products WHERE image_url LIKE '%2025-12-04-1764833768750-blob-rbrw6k.webp%' LIMIT 10;" 2>/dev/null || echo "Database'ga ulanishda muammo"

echo ""
echo "✅ Tekshiruv yakunlandi"
