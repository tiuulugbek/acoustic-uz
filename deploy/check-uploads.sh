#!/bin/bash

# Uploads papkasini va rasmlarni tekshirish

set -e

echo "🔍 Uploads papkasini tekshirish..."

UPLOADS_DIR="/var/www/news.acoustic.uz/uploads"

# 1. Uploads papkasini tekshirish
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "❌ Uploads papkasi topilmadi: $UPLOADS_DIR"
    echo "📁 Papkani yaratish..."
    sudo mkdir -p "$UPLOADS_DIR"
    sudo chown -R www-data:www-data "$UPLOADS_DIR"
    sudo chmod -R 755 "$UPLOADS_DIR"
else
    echo "✅ Uploads papkasi mavjud: $UPLOADS_DIR"
fi

# 2. Panorama rasmlarini tekshirish
echo ""
echo "📸 Panorama rasmlarini tekshirish..."
PANORAMA_FILE="2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"

# Faylni qidirish
FOUND_FILE=$(find "$UPLOADS_DIR" -name "*img_20251129_192205_430*" -type f 2>/dev/null | head -1)

if [ -n "$FOUND_FILE" ]; then
    echo "✅ Fayl topildi: $FOUND_FILE"
    ls -lh "$FOUND_FILE"
else
    echo "⚠️ Fayl topilmadi: $PANORAMA_FILE"
    echo "📋 Uploads papkasidagi fayllar:"
    ls -lh "$UPLOADS_DIR" | head -20
fi

# 3. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
if grep -q "location /uploads" /etc/nginx/sites-available/acoustic-uz.conf; then
    echo "✅ Nginx konfiguratsiyasida /uploads location mavjud"
    grep -A 5 "location /uploads" /etc/nginx/sites-available/acoustic-uz.conf
else
    echo "❌ Nginx konfiguratsiyasida /uploads location topilmadi!"
fi

# 4. Test URL'ni tekshirish
echo ""
echo "🧪 Test URL'ni tekshirish..."
TEST_URL="https://api.acoustic.uz/uploads/$PANORAMA_FILE"
echo "Test URL: $TEST_URL"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ URL muvaffaqiyatli yuklandi (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ URL topilmadi (HTTP $HTTP_CODE)"
    echo "💡 Muammo: Fayl serverda mavjud emas yoki path noto'g'ri"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "⚠️ URL'ga ulanishda xatolik"
else
    echo "⚠️ HTTP $HTTP_CODE"
fi

# 5. Uploads papkasidagi barcha fayllarni sanash
echo ""
echo "📊 Uploads papkasidagi fayllar:"
TOTAL_FILES=$(find "$UPLOADS_DIR" -type f 2>/dev/null | wc -l)
echo "   Jami fayllar: $TOTAL_FILES"

if [ "$TOTAL_FILES" -gt 0 ]; then
    echo "   Birinchi 10 ta fayl:"
    find "$UPLOADS_DIR" -type f 2>/dev/null | head -10 | while read file; do
        echo "   - $(basename "$file")"
    done
fi

# 6. Permissions tekshirish
echo ""
echo "📋 Permissions tekshirish..."
ls -ld "$UPLOADS_DIR"
if [ -d "$UPLOADS_DIR" ]; then
    echo "   Owner: $(stat -c '%U:%G' "$UPLOADS_DIR")"
    echo "   Permissions: $(stat -c '%a' "$UPLOADS_DIR")"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"

