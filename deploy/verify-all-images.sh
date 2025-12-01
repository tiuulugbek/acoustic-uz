#!/bin/bash

# Barcha rasmlarni tekshirish

set -e

echo "🔍 Barcha rasmlarni tekshirish..."
echo ""

# Test fayllar ro'yxati
TEST_FILES=(
    "2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"
    "1763838248004-logo_web.webp"
    "1763539075122-Oticon.webp"
)

BASE_URL="https://api.acoustic.uz/uploads"

SUCCESS_COUNT=0
FAIL_COUNT=0

for file in "${TEST_FILES[@]}"; do
    echo "🧪 Test qilish: $file"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$file" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ HTTP 200 - Muvaffaqiyatli!"
        ((SUCCESS_COUNT++))
    else
        echo "   ❌ HTTP $HTTP_CODE - Xatolik!"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "📊 Xulosa:"
echo "   ✅ Muvaffaqiyatli: $SUCCESS_COUNT"
echo "   ❌ Xatolik: $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 Barcha rasmlar muvaffaqiyatli yuklanmoqda!"
    echo ""
    echo "📋 Keyingi qadamlar:"
    echo "   1. Browser'da cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)"
    echo "   2. Frontend sahifasini yangilang: https://news.acoustic.uz"
    echo "   3. Admin panelni yangilang: https://admins.acoustic.uz"
    echo "   4. Panorama sahifasini tekshiring"
else
    echo ""
    echo "⚠️ Ba'zi rasmlar yuklanmayapti. Serverda tekshiring:"
    echo "   ls -lh /var/www/news.acoustic.uz/apps/backend/uploads/"
fi

