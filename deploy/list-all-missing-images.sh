#!/bin/bash
echo "📋 Database'dagi barcha yo'qolgan rasmlar ro'yxati:"
echo ""

cd /var/www/acoustic.uz

# Database'dan barcha 2025-12 sanali URL'larni olish va tekshirish
PGPASSWORD='Acoustic##4114' psql -h localhost -p 5432 -U acoustic_user -d acousticwebdb -t -c 'SELECT url FROM "Media" WHERE url LIKE '\''%2025-12%'\'' ORDER BY url;' 2>/dev/null | while read url; do
    if [ -n "$url" ]; then
        filename=$(echo "$url" | sed 's|/uploads/||')
        if [ ! -f "/var/www/acoustic.uz/apps/backend/uploads/$filename" ]; then
            echo "$filename"
        fi
    fi
done | wc -l

echo "ta fayl yo'qolgan"
echo ""
echo "✅ Ro'yxat tayyor"
