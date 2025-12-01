#!/bin/bash

# Admin panel redirect muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Admin panel redirect muammosini hal qilish..."

# 1. Nginx konfiguratsiyasini tekshirish
echo "📋 Nginx konfiguratsiyasini tekshirish..."
if [ -f "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "✅ Nginx config fayli mavjud"
    echo ""
    echo "Admin panel qismi:"
    grep -A 20 "admins.acoustic.uz" /etc/nginx/sites-enabled/acoustic-uz.conf || echo "⚠️ Admin panel konfiguratsiyasi topilmadi"
else
    echo "⚠️ Nginx config fayli topilmadi!"
fi

# 2. Barcha Nginx konfiguratsiyalarini tekshirish
echo ""
echo "📋 Barcha Nginx konfiguratsiyalarini tekshirish..."
echo "admins.acoustic.uz qidirilmoqda..."
grep -r "admins.acoustic.uz" /etc/nginx/ 2>/dev/null || echo "⚠️ admins.acoustic.uz topilmadi"

# 3. maxhub.acoustic.uz redirectini qidirish
echo ""
echo "📋 maxhub.acoustic.uz redirectini qidirish..."
grep -r "maxhub.acoustic.uz" /etc/nginx/ 2>/dev/null || echo "✅ maxhub.acoustic.uz redirect topilmadi"

# 4. Nginx konfiguratsiyasini qayta yuklash
echo ""
echo "🔄 Nginx konfiguratsiyasini test qilish..."
sudo nginx -t

# 5. Nginx ni qayta yuklash
echo ""
echo "🔄 Nginx ni qayta yuklash..."
sudo systemctl reload nginx

# 6. Admin panel ni test qilish
echo ""
echo "🧪 Admin panel ni test qilish..."
sleep 2
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://admins.acoustic.uz || echo "000")
ADMIN_LOCATION=$(curl -s -I http://admins.acoustic.uz | grep -i "location:" || echo "")

if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin panel ishlayapti! (HTTP $ADMIN_STATUS)"
elif [ "$ADMIN_STATUS" = "301" ] || [ "$ADMIN_STATUS" = "302" ]; then
    echo "⚠️ Admin panel redirect qilmoqda (HTTP $ADMIN_STATUS)"
    echo "   Location: $ADMIN_LOCATION"
else
    echo "⚠️ Admin panel javob bermayapti (HTTP $ADMIN_STATUS)"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"

