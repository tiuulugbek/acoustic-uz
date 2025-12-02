#!/bin/bash

# Panorama faylini topish va Nginx konfiguratsiyasini tekshirish

set -e

echo "🔍 Panorama faylini qidirish..."

UPLOADS_DIR="/var/www/news.acoustic.uz/uploads"
FILENAME="img_20251129_192205_430"

# 1. Faylni qidirish
echo "📋 Faylni qidirish: *$FILENAME*"
FOUND_FILES=$(find "$UPLOADS_DIR" -name "*$FILENAME*" -type f 2>/dev/null)

if [ -z "$FOUND_FILES" ]; then
    echo "❌ Fayl topilmadi!"
    echo ""
    echo "📋 Uploads papkasidagi barcha fayllar:"
    ls -lh "$UPLOADS_DIR" | head -30
    echo ""
    echo "📋 Panorama papkasidagi fayllar (agar mavjud bo'lsa):"
    if [ -d "$UPLOADS_DIR/panorama" ]; then
        ls -lh "$UPLOADS_DIR/panorama" | head -20
    else
        echo "   Panorama papkasi mavjud emas"
    fi
else
    echo "✅ Fayl(lar) topildi:"
    echo "$FOUND_FILES" | while read file; do
        echo "   - $file"
        ls -lh "$file"
    done
fi

# 2. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Nginx konfiguratsiyasi mavjud: $NGINX_CONFIG"
    echo ""
    echo "📋 /uploads location konfiguratsiyasi:"
    grep -A 20 "location /uploads" "$NGINX_CONFIG" || echo "   Topilmadi!"
else
    echo "❌ Nginx konfiguratsiyasi topilmadi: $NGINX_CONFIG"
fi

# 3. SSL konfiguratsiyasini tekshirish
echo ""
echo "📋 SSL konfiguratsiyasini tekshirish..."
SSL_CONFIG="/etc/nginx/sites-available/acoustic-uz-le-ssl.conf"

if [ -f "$SSL_CONFIG" ]; then
    echo "✅ SSL konfiguratsiyasi mavjud: $SSL_CONFIG"
    echo ""
    echo "📋 SSL konfiguratsiyasida /uploads location:"
    grep -A 20 "location /uploads" "$SSL_CONFIG" || echo "   Topilmadi!"
else
    echo "⚠️ SSL konfiguratsiyasi topilmadi (ehtimol Certbot yaratmagan)"
fi

# 4. Test qilish
echo ""
echo "🧪 Test qilish..."
TEST_FILE="2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"

# Faylni to'g'ri path bilan test qilish
if [ -n "$FOUND_FILES" ]; then
    FIRST_FILE=$(echo "$FOUND_FILES" | head -1)
    RELATIVE_PATH=$(echo "$FIRST_FILE" | sed "s|$UPLOADS_DIR||")
    echo "   Fayl path: $FIRST_FILE"
    echo "   Relative path: $RELATIVE_PATH"
    echo "   Test URL: https://api.acoustic.uz$RELATIVE_PATH"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.acoustic.uz$RELATIVE_PATH" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ URL muvaffaqiyatli yuklandi (HTTP $HTTP_CODE)"
    else
        echo "   ❌ URL yuklanmadi (HTTP $HTTP_CODE)"
    fi
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"


