#!/bin/bash
echo "🔍 Database'dan yo'qolgan fayllarni topish..."
echo ""

cd /var/www/acoustic.uz

# Database'dan barcha 2025-12 sanali URL'larni olish
PGPASSWORD='Acoustic##4114' psql -h localhost -p 5432 -U acoustic_user -d acousticwebdb -t -c 'SELECT url FROM "Media" WHERE url LIKE '\''%2025-12%'\'';' 2>/dev/null | while read url; do
    if [ -n "$url" ]; then
        # URL'dan fayl nomini olish
        filename=$(echo "$url" | sed 's|/uploads/||')
        # Fayl mavjudligini tekshirish
        if [ ! -f "/var/www/acoustic.uz/apps/backend/uploads/$filename" ]; then
            echo "❌ Yo'qolgan: $filename"
        fi
    fi
done

echo ""
echo "✅ Tekshiruv yakunlandi"
