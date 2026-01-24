#!/bin/bash
echo "🔍 Barcha rasmlarni to'liq qidirish..."
echo ""

echo "1. Production uploads papkalari:"
find /var/www/acoustic.uz -type d -name "uploads" 2>/dev/null | while read dir; do
    count=$(find "$dir" -type f -name "*.webp" 2>/dev/null | wc -l)
    echo "   $dir: $count ta webp"
done
echo ""

echo "2. Development uploads papkalari:"
find /root/acoustic.uz -type d -name "uploads" 2>/dev/null | while read dir; do
    count=$(find "$dir" -type f -name "*.webp" 2>/dev/null | wc -l)
    echo "   $dir: $count ta webp"
done
echo ""

echo "3. Database'dagi 2026-01 sanali URL'lar:"
cd /var/www/acoustic.uz
PGPASSWORD='Acoustic##4114' psql -h localhost -p 5432 -U acoustic_user -d acousticwebdb -t -c 'SELECT url FROM "Media" WHERE url LIKE '\''%2026-01%'\'' ORDER BY "createdAt" DESC LIMIT 10;' 2>/dev/null | while read url; do
    if [ -n "$url" ]; then
        filename=$(echo "$url" | sed 's|/uploads/||')
        if [ -f "/var/www/acoustic.uz/apps/backend/uploads/$filename" ]; then
            echo "   ✅ $filename"
        else
            echo "   ❌ $filename (yo'qolgan)"
        fi
    fi
done
echo ""

echo "✅ Qidiruv yakunlandi"
