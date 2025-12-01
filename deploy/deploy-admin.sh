#!/bin/bash

# Admin panel ni deploy qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Admin panel ni deploy qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# 2. Admin panel build qilish
echo "🔨 Admin panel build qilish..."
# VITE_API_URL ni o'rnatish
export VITE_API_URL=https://api.acoustic.uz/api
export NODE_ENV=production
pnpm --filter @acoustic/admin build || {
    echo "❌ Admin panel build xatosi!"
    exit 1
}

# 3. Admin build natijasini tekshirish
echo "📋 Admin build natijasini tekshirish..."
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin panel build muvaffaqiyatli!"
    ls -la apps/admin/dist | head -10
else
    echo "❌ Admin panel dist papkasi topilmadi!"
    exit 1
fi

# 4. Admin build ni nusxalash
echo "📋 Admin build ni nusxalash..."
sudo mkdir -p /var/www/admins.acoustic.uz
sudo rm -rf /var/www/admins.acoustic.uz/dist
sudo cp -r apps/admin/dist /var/www/admins.acoustic.uz/dist
sudo chown -R deploy:deploy /var/www/admins.acoustic.uz

# 5. Nginx ni qayta yuklash
echo "🔄 Nginx ni qayta yuklash..."
sudo nginx -t && sudo systemctl reload nginx || {
    echo "⚠️ Nginx reload xatosi!"
    exit 1
}

# 6. Admin panel ni test qilish
echo "🧪 Admin panel ni test qilish..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/admins.acoustic.uz || echo "000")
if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "301" ] || [ "$ADMIN_STATUS" = "302" ]; then
    echo "✅ Admin panel ishlayapti! (HTTP $ADMIN_STATUS)"
else
    echo "⚠️ Admin panel javob bermayapti (HTTP $ADMIN_STATUS)"
fi

echo ""
echo "✅ Admin panel deploy yakunlandi!"
echo "📋 Admin panel: http://admins.acoustic.uz"

