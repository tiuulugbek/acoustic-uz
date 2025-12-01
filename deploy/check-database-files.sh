#!/bin/bash

# Database'dan fayl URL'larini tekshirish va local'da qidirish

set -e

echo "🔍 Database'dan panorama fayl URL'larini tekshirish..."

# .env faylidan DATABASE_URL ni olish
if [ ! -f .env ]; then
    echo "❌ .env fayli topilmadi!"
    exit 1
fi

DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL topilmadi!"
    exit 1
fi

# PostgreSQL connection parametrlarini parse qilish
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([^/]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "📋 Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# Panorama fayllarni qidirish (Media jadvalidan)
echo "📋 Panorama fayllarni qidirish (Media jadvalidan)..."
export PGPASSWORD="$DB_PASS"

PANORAMA_FILES=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT url FROM \"Media\" 
WHERE url LIKE '%panorama%' OR url LIKE '%img_20251129_192205_430%' OR url LIKE '%2025-11-29-1764426305776%'
LIMIT 10;
" 2>/dev/null | tr -d ' ' | grep -v '^$' || echo "")

if [ -z "$PANORAMA_FILES" ]; then
    echo "⚠️ Panorama fayllar topilmadi, barcha fayllarni ko'rish..."
    PANORAMA_FILES=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT url FROM \"Media\" 
    WHERE url LIKE '%uploads%' 
    ORDER BY \"createdAt\" DESC 
    LIMIT 20;
    " 2>/dev/null | tr -d ' ' | grep -v '^$' || echo "")
fi

if [ -n "$PANORAMA_FILES" ]; then
    echo "✅ Topilgan fayllar:"
    echo "$PANORAMA_FILES" | while read url; do
        if [ -n "$url" ]; then
            echo "   - $url"
            # Fayl nomini ajratish
            filename=$(basename "$url")
            echo "     Filename: $filename"
            
            # Serverda faylni qidirish
            if find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | grep -q .; then
                echo "     ✅ Serverda topildi"
            else
                echo "     ❌ Serverda topilmadi"
            fi
        fi
    done
else
    echo "❌ Database'da fayllar topilmadi!"
fi

# Branch tour3d_config'dan panorama URL'larini qidirish
echo ""
echo "📋 Branch tour3d_config'dan panorama URL'larini qidirish..."
BRANCH_PANORAMAS=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT \"tour3d_config\"::text FROM \"Branch\" 
WHERE \"tour3d_config\" IS NOT NULL 
LIMIT 5;
" 2>/dev/null | grep -o 'uploads/[^"]*' | head -10 || echo "")

if [ -n "$BRANCH_PANORAMAS" ]; then
    echo "✅ Branch panorama URL'lari:"
    echo "$BRANCH_PANORAMAS" | while read url; do
        if [ -n "$url" ]; then
            echo "   - $url"
            filename=$(basename "$url")
            echo "     Filename: $filename"
            
            # Serverda faylni qidirish
            if find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | grep -q .; then
                echo "     ✅ Serverda topildi"
            else
                echo "     ❌ Serverda topilmadi"
            fi
        fi
    done
else
    echo "⚠️ Branch panorama URL'lari topilmadi"
fi

unset PGPASSWORD

echo ""
echo "✅ Tekshiruv yakunlandi!"

