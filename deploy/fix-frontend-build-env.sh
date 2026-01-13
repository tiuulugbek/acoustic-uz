#!/bin/bash

# Frontend build vaqtida environment variable'larni to'g'ri o'rnatish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Frontend build vaqtida environment variable'larni to'g'ri o'rnatish..."

# 1. .env faylini tekshirish
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

# NEXT_PUBLIC_SITE_URL ni tekshirish
if ! grep -q "^NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz" .env; then
    echo "🔄 NEXT_PUBLIC_SITE_URL ni yangilash..."
    if grep -q "^NEXT_PUBLIC_SITE_URL=" .env; then
        sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz|' .env
    else
        echo "NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz" >> .env
    fi
    echo "✅ NEXT_PUBLIC_SITE_URL yangilandi!"
else
    echo "✅ NEXT_PUBLIC_SITE_URL to'g'ri sozlangan!"
fi

# 2. Frontend ni qayta build qilish
echo ""
echo "🔄 Frontend ni qayta build qilish..."

# Environment variable'larni export qilish (build vaqtida ishlatiladi)
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

# 3. Static fayllarni standalone ga nusxalash
echo ""
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

# 4. Frontend ni restart qilish
echo ""
echo "🔄 Frontend ni restart qilish..."
pm2 restart acoustic-frontend || {
    echo "❌ Frontend restart xatosi!"
    exit 1
}

# 5. Test qilish
echo ""
echo "🧪 Test qilish..."
sleep 3

# Frontend ni test qilish
echo "📋 Frontend ni test qilish..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://news.acoustic.uz 2>/dev/null || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_TEST)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_TEST)"
fi

# Build'dagi environment variable'larni tekshirish
echo ""
echo "📋 Build'dagi environment variable'larni tekshirish..."
if [ -f "apps/frontend/.next/BUILD_ID" ]; then
    echo "✅ Frontend build muvaffaqiyatli!"
    echo "   NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
    echo "   NEXT_PUBLIC_SITE_URL: $NEXT_PUBLIC_SITE_URL"
else
    echo "⚠️ Frontend build ID topilmadi!"
fi

echo ""
echo "✅ Frontend build va environment variable'lar to'g'rilandi!"
echo ""
echo "📋 Xulosa:"
echo "- NEXT_PUBLIC_API_URL: $(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d '=' -f2-)"
echo "- NEXT_PUBLIC_SITE_URL: $(grep "^NEXT_PUBLIC_SITE_URL=" .env | cut -d '=' -f2-)"
echo "- Frontend build: ✅"
echo "- Frontend restart: ✅"
echo ""
echo "💡 Endi frontend'da rasmlar to'g'ri URL'lar bilan yuklanishi kerak!"


