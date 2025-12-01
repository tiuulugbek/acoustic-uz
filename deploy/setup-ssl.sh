#!/bin/bash

# SSL sertifikatlarini Certbot bilan o'rnatish

set -e

cd /var/www/news.acoustic.uz

echo "🔒 SSL sertifikatlarini o'rnatish..."

# 1. Certbot ni tekshirish
echo "📋 Certbot ni tekshirish..."
if ! command -v certbot &> /dev/null; then
    echo "⚠️ Certbot topilmadi! O'rnatilmoqda..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot mavjud!"
fi

# 2. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
NGINX_CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
if [ ! -f "$NGINX_CONFIG_FILE" ]; then
    echo "⚠️ Nginx konfiguratsiyasi topilmadi! Yaratilmoqda..."
    sudo cp deploy/production-nginx.conf "$NGINX_CONFIG_FILE"
    sudo ln -sf "$NGINX_CONFIG_FILE" "/etc/nginx/sites-enabled/acoustic-uz.conf"
fi

# 3. Nginx ni test qilish va reload qilish
echo ""
echo "🔄 Nginx ni test qilish..."
sudo nginx -t || {
    echo "❌ Nginx konfiguratsiyasi xatosi!"
    exit 1
}
sudo systemctl reload nginx

# 4. SSL sertifikatlarini o'rnatish
echo ""
echo "🔒 SSL sertifikatlarini o'rnatish..."

# news.acoustic.uz
echo ""
echo "📋 news.acoustic.uz uchun sertifikat..."
sudo certbot --nginx -d news.acoustic.uz --non-interactive --agree-tos --email admin@acoustic.uz --redirect || {
    echo "⚠️ news.acoustic.uz sertifikati xatosi!"
}

# api.acoustic.uz
echo ""
echo "📋 api.acoustic.uz uchun sertifikat..."
sudo certbot --nginx -d api.acoustic.uz --non-interactive --agree-tos --email admin@acoustic.uz --redirect || {
    echo "⚠️ api.acoustic.uz sertifikati xatosi!"
}

# admins.acoustic.uz
echo ""
echo "📋 admins.acoustic.uz uchun sertifikat..."
sudo certbot --nginx -d admins.acoustic.uz --non-interactive --agree-tos --email admin@acoustic.uz --redirect || {
    echo "⚠️ admins.acoustic.uz sertifikati xatosi!"
}

# 5. Certbot auto-renewal ni tekshirish
echo ""
echo "📋 Certbot auto-renewal ni tekshirish..."
if sudo systemctl is-active --quiet certbot.timer; then
    echo "✅ Certbot auto-renewal ishlayapti!"
else
    echo "⚠️ Certbot auto-renewal ishlamayapti! Yoqilmoqda..."
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
fi

# 6. SSL sertifikatlarini test qilish
echo ""
echo "🧪 SSL sertifikatlarini test qilish..."
sleep 2

echo ""
echo "📋 news.acoustic.uz:"
curl -I https://news.acoustic.uz 2>&1 | head -5 || echo "⚠️ Test xatosi"

echo ""
echo "📋 api.acoustic.uz:"
curl -I https://api.acoustic.uz 2>&1 | head -5 || echo "⚠️ Test xatosi"

echo ""
echo "📋 admins.acoustic.uz:"
curl -I https://admins.acoustic.uz 2>&1 | head -5 || echo "⚠️ Test xatosi"

echo ""
echo "✅ SSL sertifikatlari o'rnatildi!"
echo ""
echo "📋 Xulosa:"
echo "- news.acoustic.uz: https://news.acoustic.uz"
echo "- api.acoustic.uz: https://api.acoustic.uz"
echo "- admins.acoustic.uz: https://admins.acoustic.uz"
echo ""
echo "💡 Certbot auto-renewal: sudo systemctl status certbot.timer"

