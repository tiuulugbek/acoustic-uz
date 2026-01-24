#!/bin/bash
echo "🔍 Yo'qolgan rasmlarni qidirish..."
echo ""

MISSING_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
TIMESTAMP="1764833768750"

echo "1. Timestamp bo'yicha qidirish: $TIMESTAMP"
find /root/acoustic.uz -name "*${TIMESTAMP}*" 2>/dev/null
find /var/www/acoustic.uz -name "*${TIMESTAMP}*" 2>/dev/null
echo ""

echo "2. Blob nomi bo'yicha qidirish: blob-rbrw6k"
find /root/acoustic.uz -name "*blob-rbrw6k*" 2>/dev/null
find /var/www/acoustic.uz -name "*blob-rbrw6k*" 2>/dev/null
echo ""

echo "3. Barcha 2025-12-04 sanali fayllar:"
find /root/acoustic.uz -name "*2025-12-04*" 2>/dev/null
find /var/www/acoustic.uz -name "*2025-12-04*" 2>/dev/null
echo ""

echo "4. Database'da URL tekshirish (agar mavjud bo'lsa):"
echo "   SQL: SELECT * FROM products WHERE image_url LIKE '%${MISSING_FILE}%';"
echo ""

echo "✅ Qidiruv yakunlandi"
