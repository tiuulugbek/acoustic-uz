#!/bin/bash

# Admin panel Nginx konfiguratsiyasini to'g'rilash

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Admin panel Nginx konfiguratsiyasini to'g'rilash..."

# 1. maxhub.conf ni ko'rish (agar mavjud bo'lsa)
echo "📋 maxhub.conf ni tekshirish..."
if [ -f "/etc/nginx/sites-available/maxhub.conf" ]; then
    echo "⚠️ maxhub.conf topildi. Uni ko'rish:"
    cat /etc/nginx/sites-available/maxhub.conf | head -30
    echo ""
    echo "❓ maxhub.conf ni o'chirishni xohlaysizmi? (y/n)"
    read -t 10 -n 1 REMOVE_MAXHUB || REMOVE_MAXHUB="y"
    if [ "$REMOVE_MAXHUB" = "y" ] || [ "$REMOVE_MAXHUB" = "Y" ]; then
        echo ""
        echo "🗑️ maxhub.conf ni o'chirish..."
        sudo rm -f /etc/nginx/sites-enabled/maxhub.conf
        sudo rm -f /etc/nginx/sites-available/maxhub.conf
        echo "✅ maxhub.conf o'chirildi!"
    fi
fi

# 2. acoustic-uz.conf ni tekshirish
echo ""
echo "📋 acoustic-uz.conf ni tekshirish..."
NGINX_CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
if [ ! -f "$NGINX_CONFIG_FILE" ]; then
    echo "⚠️ acoustic-uz.conf topilmadi! Yaratilmoqda..."
    sudo cp deploy/production-nginx.conf "$NGINX_CONFIG_FILE"
    echo "✅ acoustic-uz.conf yaratildi!"
else
    echo "✅ acoustic-uz.conf mavjud!"
fi

# 3. Admin panel konfiguratsiyasini tekshirish
echo ""
echo "📋 Admin panel konfiguratsiyasini tekshirish..."
if grep -q "admins.acoustic.uz" "$NGINX_CONFIG_FILE"; then
    echo "✅ Admin panel konfiguratsiyasi mavjud!"
else
    echo "⚠️ Admin panel konfiguratsiyasi topilmadi! Qo'shilmoqda..."
    # Konfiguratsiyani qayta nusxalash
    sudo cp deploy/production-nginx.conf "$NGINX_CONFIG_FILE"
    echo "✅ Admin panel konfiguratsiyasi qo'shildi!"
fi

# 4. Nginx site ni enable qilish
echo ""
echo "📋 Nginx site ni enable qilish..."
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "🔗 Nginx site ni enable qilish..."
    sudo ln -sf "$NGINX_CONFIG_FILE" "/etc/nginx/sites-enabled/acoustic-uz.conf"
    echo "✅ Nginx site enable qilindi!"
else
    echo "✅ Nginx site allaqachon enable qilingan!"
fi

# 5. Boshqa konfiguratsiyalarni tekshirish
echo ""
echo "📋 Boshqa konfiguratsiyalarni tekshirish..."
OTHER_CONFIGS=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "acoustic-uz.conf" || echo "")
if [ -n "$OTHER_CONFIGS" ]; then
    echo "📋 Boshqa enabled konfiguratsiyalar:"
    echo "$OTHER_CONFIGS"
fi

# 6. Nginx konfiguratsiyasini test qilish
echo ""
echo "🔄 Nginx konfiguratsiyasini test qilish..."
sudo nginx -t || {
    echo "❌ Nginx konfiguratsiyasi xatosi!"
    exit 1
}

# 7. Nginx ni qayta yuklash
echo ""
echo "🔄 Nginx ni qayta yuklash..."
sudo systemctl reload nginx

# 8. Admin panel ni test qilish
echo ""
echo "🧪 Admin panel ni test qilish..."
sleep 2
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://admins.acoustic.uz || echo "000")
ADMIN_LOCATION=$(curl -s -I http://admins.acoustic.uz 2>/dev/null | grep -i "location:" | head -1 || echo "")

if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin panel ishlayapti! (HTTP $ADMIN_STATUS)"
elif [ "$ADMIN_STATUS" = "301" ] || [ "$ADMIN_STATUS" = "302" ]; then
    echo "⚠️ Admin panel hali ham redirect qilmoqda (HTTP $ADMIN_STATUS)"
    if [ -n "$ADMIN_LOCATION" ]; then
        echo "   Location: $ADMIN_LOCATION"
    fi
    echo ""
    echo "💡 Qo'shimcha tekshirish kerak:"
    echo "   sudo grep -r 'admins.acoustic.uz' /etc/nginx/"
else
    echo "⚠️ Admin panel javob bermayapti (HTTP $ADMIN_STATUS)"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"


