#!/bin/bash

# Branch tour3d_config'dan panorama URL'larini extract qilish

set -e

echo "🔍 Branch tour3d_config'dan panorama URL'larini extract qilish..."

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

# Branch tour3d_config'dan panorama URL'larini olish
echo "📋 Branch tour3d_config'dan panorama URL'larini olish..."
BRANCH_CONFIGS=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -A -c "
SELECT id, name_uz, \"tour3d_config\"::text 
FROM \"Branch\" 
WHERE \"tour3d_config\" IS NOT NULL;
" 2>/dev/null || echo "")

if [ -z "$BRANCH_CONFIGS" ]; then
    echo "❌ Branch tour3d_config topilmadi!"
    unset PGPASSWORD
    exit 1
fi

echo "✅ Topilgan Branch'lar:"
echo "$BRANCH_CONFIGS" | while IFS='|' read -r branch_id branch_name config; do
    if [ -n "$config" ]; then
        echo ""
        echo "📍 Branch: $branch_name (ID: $branch_id)"
        
        # JSON'dan panorama URL'larini extract qilish
        # Scenes'dan panorama URL'larini topish
        panorama_urls=$(echo "$config" | grep -o '"panorama"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"panorama"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
        
        if [ -n "$panorama_urls" ]; then
            echo "$panorama_urls" | while read url; do
                if [ -n "$url" ]; then
                    echo "   📸 Panorama: $url"
                    
                    # URL'dan fayl nomini ajratish
                    filename=$(basename "$url" | sed 's|.*/||')
                    echo "      Filename: $filename"
                    
                    # Serverda faylni qidirish
                    found=$(find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | head -1)
                    if [ -n "$found" ]; then
                        echo "      ✅ Serverda topildi: $found"
                    else
                        echo "      ❌ Serverda topilmadi!"
                    fi
                fi
            done
        else
            echo "   ⚠️ Panorama URL'lar topilmadi"
        fi
    fi
done

# Barcha panorama URL'larini birga ko'rsatish
echo ""
echo "📋 Barcha panorama URL'lar:"
ALL_PANORAMA_URLS=$(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -A -c "
SELECT \"tour3d_config\"::text 
FROM \"Branch\" 
WHERE \"tour3d_config\" IS NOT NULL;
" 2>/dev/null | grep -o '"panorama"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"panorama"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | sort -u || echo "")

if [ -n "$ALL_PANORAMA_URLS" ]; then
    echo "$ALL_PANORAMA_URLS" | while read url; do
        if [ -n "$url" ]; then
            filename=$(basename "$url" | sed 's|.*/||')
            echo "   - $filename"
            
            # Serverda faylni qidirish
            if ! find /var/www/news.acoustic.uz -name "$filename" -type f 2>/dev/null | grep -q .; then
                echo "     ❌ Yo'qolgan!"
            fi
        fi
    done
else
    echo "   ⚠️ Panorama URL'lar topilmadi"
fi

unset PGPASSWORD

echo ""
echo "✅ Tekshiruv yakunlandi!"

