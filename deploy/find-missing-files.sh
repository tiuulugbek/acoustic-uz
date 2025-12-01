#!/bin/bash

# Yo'qolgan fayllarni topish va ko'chirish uchun script

set -e

echo "🔍 Yo'qolgan fayllarni topish..."

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
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([^/]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

export PGPASSWORD="$DB_PASS"

# Barcha Media URL'larini olish
echo "📋 Database'dan barcha Media URL'larini olish..."
ALL_MEDIA_URLS=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT url FROM \"Media\" 
WHERE url LIKE '%uploads%' 
ORDER BY \"createdAt\" DESC;
" 2>/dev/null | tr -d ' ' | grep -v '^$' || echo "")

MISSING_FILES=()

if [ -n "$ALL_MEDIA_URLS" ]; then
    echo "✅ Topilgan Media URL'lar: $(echo "$ALL_MEDIA_URLS" | wc -l)"
    echo ""
    echo "$ALL_MEDIA_URLS" | while read url; do
        if [ -n "$url" ]; then
            # URL'dan fayl nomini ajratish
            filename=$(basename "$url" | sed 's|.*/||')
            
            # Serverda faylni qidirish
            if ! find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | grep -q .; then
                echo "❌ Yo'qolgan: $filename (URL: $url)"
                MISSING_FILES+=("$filename")
            fi
        fi
    done
fi

# Branch tour3d_config'dan panorama URL'larini olish
echo ""
echo "📋 Branch tour3d_config'dan panorama URL'larini olish..."
BRANCH_PANORAMAS=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT \"tour3d_config\"::text FROM \"Branch\" 
WHERE \"tour3d_config\" IS NOT NULL;
" 2>/dev/null | grep -o 'uploads/[^"]*\.\(jpg\|jpeg\|png\|webp\)' | sort -u || echo "")

if [ -n "$BRANCH_PANORAMAS" ]; then
    echo "✅ Topilgan Branch panorama URL'lar: $(echo "$BRANCH_PANORAMAS" | wc -l)"
    echo ""
    echo "$BRANCH_PANORAMAS" | while read url; do
        if [ -n "$url" ]; then
            filename=$(basename "$url")
            
            # Serverda faylni qidirish
            if ! find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | grep -q .; then
                echo "❌ Yo'qolgan panorama: $filename (URL: $url)"
            fi
        fi
    done
fi

unset PGPASSWORD

echo ""
echo "📋 Xulosa:"
echo "   Agar fayllar yo'qolgan bo'lsa, ularni local'dan serverga ko'chirish kerak."
echo "   Yoki admin panel orqali qayta yuklash kerak."
echo ""
echo "✅ Tekshiruv yakunlandi!"

