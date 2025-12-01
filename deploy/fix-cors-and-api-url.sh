#!/bin/bash

# CORS va API URL muammolarini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 CORS va API URL muammolarini hal qilish..."

# 1. .env faylini tekshirish
echo "📋 .env faylini tekshirish..."
if [ ! -f ".env" ]; then
    echo "❌ .env fayli topilmadi!"
    exit 1
fi

# 2. CORS_ORIGIN ni tekshirish va yangilash
echo ""
echo "📋 CORS_ORIGIN ni tekshirish..."
if grep -q "^CORS_ORIGIN=" .env; then
    echo "✅ CORS_ORIGIN mavjud!"
    CURRENT_CORS=$(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2-)
    echo "   Joriy qiymat: $CURRENT_CORS"
    
    # Yangi qiymatni qo'shish
    if [[ ! "$CURRENT_CORS" =~ "https://news.acoustic.uz" ]]; then
        echo "🔄 CORS_ORIGIN ni yangilash..."
        sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz|' .env
        echo "✅ CORS_ORIGIN yangilandi!"
    else
        echo "✅ CORS_ORIGIN to'g'ri sozlangan!"
    fi
else
    echo "⚠️ CORS_ORIGIN topilmadi! Qo'shilmoqda..."
    echo "CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz" >> .env
    echo "✅ CORS_ORIGIN qo'shildi!"
fi

# 3. Frontend build uchun environment variable'ni tekshirish
echo ""
echo "📋 Frontend build environment variable'larini tekshirish..."
if grep -q "^NEXT_PUBLIC_API_URL=" .env; then
    CURRENT_API_URL=$(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d '=' -f2-)
    echo "   Joriy NEXT_PUBLIC_API_URL: $CURRENT_API_URL"
    
    if [[ "$CURRENT_API_URL" != "https://api.acoustic.uz/api" ]]; then
        echo "🔄 NEXT_PUBLIC_API_URL ni yangilash..."
        sed -i 's|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api|' .env
        echo "✅ NEXT_PUBLIC_API_URL yangilandi!"
    else
        echo "✅ NEXT_PUBLIC_API_URL to'g'ri sozlangan!"
    fi
else
    echo "⚠️ NEXT_PUBLIC_API_URL topilmadi! Qo'shilmoqda..."
    echo "NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api" >> .env
    echo "✅ NEXT_PUBLIC_API_URL qo'shildi!"
fi

# 4. Frontend ni qayta build qilish (environment variable bilan)
echo ""
echo "🔄 Frontend ni qayta build qilish..."
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
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
cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/ || {
    echo "⚠️ Static fayllarni nusxalash xatosi!"
}

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
CORS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://news.acoustic.uz" -H "Access-Control-Request-Method: GET" -X OPTIONS http://localhost:3001/api/settings 2>/dev/null || echo "000")
if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "204" ]; then
    echo "✅ Backend CORS ishlayapti! (HTTP $CORS_TEST)"
else
    echo "⚠️ Backend CORS javob bermayapti (HTTP $CORS_TEST)"
fi

# Frontend ni test qilish
echo ""
echo "📋 Frontend ni test qilish..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_TEST)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_TEST)"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"
echo ""
echo "📋 Xulosa:"
echo "- CORS_ORIGIN: $(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2-)"
echo "- NEXT_PUBLIC_API_URL: $(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d '=' -f2-)"
echo ""
echo "💡 Frontend endi https://api.acoustic.uz/api ga so'rov yuboradi!"

