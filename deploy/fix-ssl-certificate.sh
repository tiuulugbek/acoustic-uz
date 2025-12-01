#!/bin/bash

# SSL sertifikatini to'g'rilash va yangilash

set -e

echo "🔒 SSL sertifikatini tekshirish va to'g'rilash..."

# 1. Certbot'ni o'rnatish (agar yo'q bo'lsa)
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot'ni o'rnatish..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# 2. Mavjud sertifikatlarni tekshirish
echo ""
echo "📋 Mavjud sertifikatlarni tekshirish..."
sudo certbot certificates

# 3. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
if [ ! -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    echo "⚠️ Nginx konfiguratsiyasi topilmadi. Avval konfiguratsiyani o'rnatish kerak."
    exit 1
fi

# 4. SSL sertifikatlarini yangilash yoki olish
echo ""
echo "🔐 SSL sertifikatlarini yangilash/o'rnatish..."
echo "   Domenlar: news.acoustic.uz, api.acoustic.uz, admins.acoustic.uz"

# Certbot bilan sertifikat olish/yangilash
sudo certbot --nginx \
    -d news.acoustic.uz \
    -d api.acoustic.uz \
    -d admins.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect

# 5. Nginx'ni test qilish va reload qilish
echo ""
echo "🧪 Nginx konfiguratsiyasini test qilish..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx konfiguratsiyasi to'g'ri!"
    echo "🔄 Nginx'ni reload qilish..."
    sudo systemctl reload nginx
    echo "✅ Nginx reload qilindi!"
else
    echo "❌ Nginx konfiguratsiyasida xatolar bor!"
    exit 1
fi

# 6. Sertifikatlarni tekshirish
echo ""
echo "📋 Yangilangan sertifikatlarni tekshirish..."
sudo certbot certificates

# 7. Auto-renewal'ni tekshirish
echo ""
echo "🔄 Auto-renewal'ni tekshirish..."
if sudo systemctl is-active --quiet certbot.timer; then
    echo "✅ Certbot auto-renewal timer ishlayapti!"
else
    echo "⚠️ Certbot auto-renewal timer ishlamayapti. Yoqish kerak."
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
fi

echo ""
echo "✅ SSL sertifikat muammosi hal qilindi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "1. Browser'da hard refresh qiling (Ctrl+Shift+R)"
echo "2. Agar hali ham muammo bo'lsa, browser cache'ni tozalang"
echo "3. Sertifikat 90 kun davomida amal qiladi va avtomatik yangilanadi"

