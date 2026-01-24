#!/bin/bash
echo "🔍 2026-01-17 sanali yo'qolgan rasmlarni qidirish..."
echo ""

cd /var/www/acoustic.uz

# Database'dan 2026-01-17 sanali URL'larni olish
PGPASSWORD='Acoustic##4114' psql -h localhost -p 5432 -U acoustic_user -d acousticwebdb -t -c 'SELECT url FROM "Media" WHERE url LIKE '\''%2026-01-17%'\'' ORDER BY url;' 2>/dev/null | while read url; do
    if [ -n "$url" ]; then
        filename=$(echo "$url" | sed 's|/uploads/||')
        echo "Qidirilmoqda: $filename"
        
        # Barcha joylarda qidirish
        found=false
        for dir in \
            "/var/www/acoustic.uz/apps/backend/uploads" \
            "/var/www/acoustic.uz/apps/backend/apps/backend/uploads" \
            "/root/acoustic.uz/apps/backend/uploads" \
            "/root/acoustic.uz/apps/backend/apps/backend/uploads" \
            "/var/www/acoustic.uz/uploads" \
            "/root/acoustic.uz/uploads"; do
            if [ -f "$dir/$filename" ]; then
                echo "   ✅ Topildi: $dir/$filename"
                found=true
                break
            fi
        done
        
        if [ "$found" = false ]; then
            echo "   ❌ Yo'qolgan: $filename"
        fi
    fi
done

echo ""
echo "✅ Qidiruv yakunlandi"
