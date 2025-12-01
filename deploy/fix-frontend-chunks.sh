#!/bin/bash

# Frontend chunk muammosini hal qilish

set -e

echo "🔧 Frontend chunk muammosini hal qilish..."
echo ""

cd /var/www/news.acoustic.uz

# 1. Frontend'ni to'xtatish
echo "📋 Frontend'ni to'xtatish..."
pm2 stop acoustic-frontend || true

# 2. Eski build'ni o'chirish
echo "📋 Eski build'ni o'chirish..."
rm -rf apps/frontend/.next

# 3. Environment variables'ni export qilish
echo "📋 Environment variables'ni export qilish..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# 4. Shared package'ni build qilish
echo "📋 Shared package'ni build qilish..."
pnpm --filter @acoustic/shared build

# 5. Frontend'ni build qilish
echo "📋 Frontend'ni build qilish..."
pnpm --filter @acoustic/frontend build

# 6. Static fayllarni ko'chirish
echo "📋 Static fayllarni ko'chirish..."
if [ -d "apps/frontend/.next/standalone/apps/frontend/.next/static" ]; then
    # Standalone build mavjud
    echo "   Standalone build topildi"
    
    # Static fayllarni ko'chirish
    if [ -d "apps/frontend/.next/static" ]; then
        cp -r apps/frontend/.next/static apps/frontend/.next/standalone/apps/frontend/.next/static
        echo "   ✅ Static fayllar ko'chirildi"
    else
        echo "   ⚠️ Static fayllar topilmadi"
    fi
else
    echo "   ⚠️ Standalone build topilmadi"
fi

# 7. Permissions'ni o'rnatish
echo "📋 Permissions'ni o'rnatish..."
chown -R deploy:deploy apps/frontend/.next
chmod -R 755 apps/frontend/.next

# 8. Frontend'ni qayta ishga tushirish
echo "📋 Frontend'ni qayta ishga tushirish..."
pm2 restart acoustic-frontend

# 9. Tekshirish
echo ""
echo "🧪 Tekshirish..."
sleep 3

# PM2 status
pm2 status acoustic-frontend

# Logs
echo ""
echo "📋 Frontend logs (oxirgi 10 qator):"
pm2 logs acoustic-frontend --lines 10 --nostream

echo ""
echo "✅ Frontend chunk muammosi hal qilindi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. Browser'da cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)"
echo "   2. Sahifani yangilang"
echo "   3. Agar muammo davom etsa, browser'da Hard Reload qiling (Ctrl+Shift+Delete)"

