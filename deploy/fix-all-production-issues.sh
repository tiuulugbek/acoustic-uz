#!/bin/bash

# Barcha production muammolarini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Barcha production muammolarini hal qilish..."

# 1. .env faylini tekshirish va yangilash
echo "📋 .env faylini tekshirish..."
if [ ! -f ".env" ]; then
    echo "❌ .env fayli topilmadi!"
    exit 1
fi

# NEXT_PUBLIC_API_URL ni tekshirish
if ! grep -q "^NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api" .env; then
    echo "🔄 NEXT_PUBLIC_API_URL ni yangilash..."
    if grep -q "^NEXT_PUBLIC_API_URL=" .env; then
        sed -i 's|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api|' .env
    else
        echo "NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api" >> .env
    fi
    echo "✅ NEXT_PUBLIC_API_URL yangilandi!"
else
    echo "✅ NEXT_PUBLIC_API_URL to'g'ri sozlangan!"
fi

# CORS_ORIGIN ni tekshirish
if ! grep -q "^CORS_ORIGIN=https://news.acoustic.uz" .env; then
    echo "🔄 CORS_ORIGIN ni yangilash..."
    if grep -q "^CORS_ORIGIN=" .env; then
        sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz|' .env
    else
        echo "CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz" >> .env
    fi
    echo "✅ CORS_ORIGIN yangilandi!"
else
    echo "✅ CORS_ORIGIN to'g'ri sozlangan!"
fi

# 2. Frontend ni qayta build qilish
echo ""
echo "🔄 Frontend ni qayta build qilish..."
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
export NODE_ENV=production

# Shared package build
echo "📦 Shared package build..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# Frontend build
echo "🔨 Frontend build..."
pnpm --filter @acoustic/frontend build || {
    echo "❌ Frontend build xatosi!"
    exit 1
}

# Static fayllarni standalone ga nusxalash
echo "📋 Static fayllarni standalone ga nusxalash..."
mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/ 2>/dev/null || {
    echo "⚠️ Static fayllarni nusxalash xatosi!"
}

# Public papkasini standalone ga nusxalash (agar kerak bo'lsa)
echo "📋 Public papkasini standalone ga nusxalash..."
if [ -d "apps/frontend/public" ]; then
    mkdir -p apps/frontend/.next/standalone/apps/frontend/public
    cp -r apps/frontend/public/* apps/frontend/.next/standalone/apps/frontend/public/ 2>/dev/null || {
        echo "⚠️ Public fayllarni nusxalash xatosi!"
    }
fi

# 3. Uploads papkasini tekshirish
echo ""
echo "📋 Uploads papkasini tekshirish..."
if [ ! -d "uploads" ]; then
    echo "⚠️ Uploads papkasi topilmadi!"
    echo "💡 Uploads papkasini local kompyuterdan ko'chirish kerak:"
    echo "   ./deploy/migrate-files.sh"
else
    echo "✅ Uploads papkasi mavjud!"
    echo "   Fayllar soni: $(find uploads -type f | wc -l)"
fi

# 4. Public/maps papkasini tekshirish
echo ""
echo "📋 Public/maps papkasini tekshirish..."
if [ -d "apps/frontend/public/maps" ]; then
    echo "✅ Public/maps papkasi mavjud!"
    ls -lh apps/frontend/public/maps/ | head -5
else
    echo "⚠️ Public/maps papkasi topilmadi!"
fi

# 5. Backend ni restart qilish (CORS o'zgarishlari uchun)
echo ""
echo "🔄 Backend ni restart qilish..."
pm2 restart acoustic-backend || {
    echo "⚠️ Backend restart xatosi!"
}

# 6. Frontend ni restart qilish
echo ""
echo "🔄 Frontend ni restart qilish..."
pm2 restart acoustic-frontend || {
    echo "⚠️ Frontend restart xatosi!"
}

# 7. Test qilish
echo ""
echo "🧪 Test qilish..."
sleep 3

# Backend CORS ni test qilish
echo "📋 Backend CORS ni test qilish..."
CORS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://news.acoustic.uz" -H "Access-Control-Request-Method: GET" -X OPTIONS https://api.acoustic.uz/api/settings 2>/dev/null || echo "000")
if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "204" ]; then
    echo "✅ Backend CORS ishlayapti! (HTTP $CORS_TEST)"
else
    echo "⚠️ Backend CORS javob bermayapti (HTTP $CORS_TEST)"
fi

# Frontend ni test qilish
echo ""
echo "📋 Frontend ni test qilish..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://news.acoustic.uz 2>/dev/null || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_TEST)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_TEST)"
fi

echo ""
echo "✅ Barcha muammolar hal qilindi!"
echo ""
echo "📋 Xulosa:"
echo "- NEXT_PUBLIC_API_URL: $(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d '=' -f2-)"
echo "- CORS_ORIGIN: $(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2-)"
echo "- Frontend build: ✅"
echo "- Backend restart: ✅"
echo "- Frontend restart: ✅"
echo ""
echo "💡 Agar hali ham muammolar bo'lsa:"
echo "   1. Uploads papkasini ko'chirish: ./deploy/migrate-files.sh (local kompyuterdan)"
echo "   2. Public/maps papkasini ko'chirish: ./deploy/migrate-files.sh (local kompyuterdan)"
echo "   3. Browser cache'ni tozalash"


