#!/bin/bash

# Uploads papkasini tekshirish va Nginx config'ni to'g'rilash

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Uploads papkasini tekshirish va Nginx config'ni to'g'rilash..."

# 1. Uploads papkasini tekshirish
echo "📋 Uploads papkasini tekshirish..."
if [ ! -d "uploads" ]; then
    echo "❌ Uploads papkasi topilmadi!"
    echo "💡 Uploads papkasini local kompyuterdan ko'chirish kerak:"
    echo "   ./deploy/migrate-files.sh"
    exit 1
else
    echo "✅ Uploads papkasi mavjud!"
    UPLOADS_COUNT=$(find uploads -type f | wc -l)
    echo "   Fayllar soni: $UPLOADS_COUNT"
    
    # Bir nechta faylni ko'rsatish
    echo "   Namuna fayllar:"
    find uploads -type f | head -5
fi

# 2. Uploads papkasiga ruxsatlarni tekshirish
echo ""
echo "📋 Uploads papkasiga ruxsatlarni tekshirish..."
ls -ld uploads
if [ -d "uploads" ]; then
    sudo chown -R deploy:deploy uploads || {
        echo "⚠️ Chown xatosi!"
    }
    sudo chmod -R 755 uploads || {
        echo "⚠️ Chmod xatosi!"
    }
    echo "✅ Ruxsatlar yangilandi!"
fi

# 3. Nginx config'ni tekshirish
echo ""
echo "📋 Nginx config'ni tekshirish..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "⚠️ Nginx config topilmadi: $NGINX_CONFIG"
    echo "💡 Production config'ni ko'chirish kerak:"
    echo "   sudo cp deploy/production-nginx.conf /etc/nginx/sites-available/acoustic-uz.conf"
    echo "   sudo ln -sf /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/"
    echo "   sudo nginx -t && sudo systemctl reload nginx"
else
    echo "✅ Nginx config mavjud: $NGINX_CONFIG"
    
    # Uploads location'ni tekshirish
    if grep -q "location /uploads" "$NGINX_CONFIG"; then
        echo "✅ /uploads location mavjud!"
        grep -A 5 "location /uploads" "$NGINX_CONFIG"
    else
        echo "❌ /uploads location topilmadi!"
        echo "💡 Nginx config'ni yangilash kerak!"
    fi
fi

# 4. Test qilish
echo ""
echo "🧪 Test qilish..."

# Uploads papkasidagi bir faylni topish va test qilish
TEST_FILE=$(find uploads -type f | head -1)
if [ -n "$TEST_FILE" ]; then
    RELATIVE_PATH="/${TEST_FILE}"
    echo "📋 Test fayl: $RELATIVE_PATH"
    
    # API domenidan test qilish
    echo "   API domenidan test:"
    API_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://api.acoustic.uz${RELATIVE_PATH}" 2>/dev/null || echo "000")
    if [ "$API_TEST" = "200" ]; then
        echo "   ✅ API domenidan ishlayapti! (HTTP $API_TEST)"
    else
        echo "   ❌ API domenidan ishlamayapti (HTTP $API_TEST)"
    fi
    
    # Admin domenidan test qilish (agar proxy bo'lsa)
    echo "   Admin domenidan test:"
    ADMIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://admins.acoustic.uz/api${RELATIVE_PATH}" 2>/dev/null || echo "000")
    if [ "$ADMIN_TEST" = "200" ]; then
        echo "   ✅ Admin domenidan ishlayapti! (HTTP $ADMIN_TEST)"
    else
        echo "   ⚠️ Admin domenidan ishlamayapti (HTTP $ADMIN_TEST) - bu normal, chunki admin domeni API ga proxy qiladi"
    fi
else
    echo "⚠️ Test qilish uchun fayl topilmadi!"
fi

# 5. Nginx ni reload qilish (agar config o'zgardi bo'lsa)
echo ""
echo "🔄 Nginx ni reload qilish..."
sudo nginx -t && sudo systemctl reload nginx || {
    echo "❌ Nginx reload xatosi!"
    exit 1
}

echo ""
echo "✅ Barcha tekshiruvlar yakunlandi!"
echo ""
echo "📋 Xulosa:"
echo "- Uploads papkasi: $([ -d "uploads" ] && echo "✅ Mavjud ($UPLOADS_COUNT fayl)" || echo "❌ Topilmadi")"
echo "- Nginx config: $([ -f "$NGINX_CONFIG" ] && echo "✅ Mavjud" || echo "❌ Topilmadi")"
echo "- Nginx reload: ✅"
echo ""
echo "💡 Agar hali ham muammolar bo'lsa:"
echo "   1. Uploads papkasini ko'chirish: ./deploy/migrate-files.sh (local kompyuterdan)"
echo "   2. Nginx config'ni yangilash: sudo cp deploy/production-nginx.conf /etc/nginx/sites-available/acoustic-uz.conf"
echo "   3. Browser cache'ni tozalash"


