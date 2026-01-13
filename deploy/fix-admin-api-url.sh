#!/bin/bash

# Admin panel API URL muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Admin panel API URL muammosini hal qilish..."

# 1. .env faylini tekshirish va yangilash
echo "📋 .env faylini tekshirish..."
if [ ! -f ".env" ]; then
    echo "❌ .env fayli topilmadi!"
    exit 1
fi

# VITE_API_URL ni tekshirish va yangilash
if ! grep -q "^VITE_API_URL=https://api.acoustic.uz/api" .env; then
    echo "🔄 VITE_API_URL ni yangilash..."
    if grep -q "^VITE_API_URL=" .env; then
        sed -i 's|^VITE_API_URL=.*|VITE_API_URL=https://api.acoustic.uz/api|' .env
    else
        echo "VITE_API_URL=https://api.acoustic.uz/api" >> .env
    fi
    echo "✅ VITE_API_URL yangilandi!"
else
    echo "✅ VITE_API_URL to'g'ri sozlangan!"
fi

# 2. Admin panel ni qayta build qilish
echo ""
echo "🔄 Admin panel ni qayta build qilish..."

# Environment variable ni export qilish
export VITE_API_URL=https://api.acoustic.uz/api
export NODE_ENV=production

# Shared package build
echo "📦 Shared package build..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# Admin panel build
echo "🔨 Admin panel build..."
pnpm --filter @acoustic/admin build || {
    echo "❌ Admin panel build xatosi!"
    exit 1
}

# 3. Admin panel build'ni nginx papkasiga ko'chirish
echo ""
echo "📋 Admin panel build'ni nginx papkasiga ko'chirish..."
if [ -d "apps/admin/dist" ]; then
    sudo rm -rf /var/www/admins.acoustic.uz/dist
    sudo cp -r apps/admin/dist /var/www/admins.acoustic.uz/
    sudo chown -R www-data:www-data /var/www/admins.acoustic.uz/dist
    sudo chmod -R 755 /var/www/admins.acoustic.uz/dist
    echo "✅ Admin panel build ko'chirildi!"
else
    echo "❌ Admin panel build papkasi topilmadi!"
    exit 1
fi

# 4. Nginx ni reload qilish
echo ""
echo "🔄 Nginx ni reload qilish..."
sudo nginx -t && sudo systemctl reload nginx || {
    echo "❌ Nginx reload xatosi!"
    exit 1
}

# 5. Test qilish
echo ""
echo "🧪 Test qilish..."
sleep 2

# Admin panel ni test qilish
echo "📋 Admin panel ni test qilish..."
ADMIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://admins.acoustic.uz 2>/dev/null || echo "000")
if [ "$ADMIN_TEST" = "200" ]; then
    echo "✅ Admin panel ishlayapti! (HTTP $ADMIN_TEST)"
else
    echo "⚠️ Admin panel javob bermayapti (HTTP $ADMIN_TEST)"
fi

echo ""
echo "✅ Admin panel API URL muammosi hal qilindi!"
echo ""
echo "📋 Xulosa:"
echo "- VITE_API_URL: $(grep "^VITE_API_URL=" .env | cut -d '=' -f2-)"
echo "- Admin panel build: ✅"
echo "- Admin panel deploy: ✅"
echo "- Nginx reload: ✅"
echo ""
echo "💡 Endi admin panelda login qilishni sinab ko'ring!"


