#!/bin/bash

# Frontend cache'ni tozalash va qayta build qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Frontend cache'ni tozalash va qayta build qilish..."

# 1. Frontend ni to'xtatish
echo "🛑 Frontend ni to'xtatish..."
pm2 stop acoustic-frontend || {
    echo "⚠️ Frontend to'xtatilmadi (ehtimol allaqachon to'xtatilgan)"
}

# 2. Next.js build cache'ni tozalash
echo ""
echo "🧹 Next.js build cache'ni tozalash..."
rm -rf apps/frontend/.next
echo "✅ .next papkasi o'chirildi!"

# 3. Node modules cache'ni tozalash (agar kerak bo'lsa)
echo ""
echo "🧹 Node modules cache'ni tozalash..."
# rm -rf apps/frontend/node_modules/.cache 2>/dev/null || true

# 4. .env faylini tekshirish va yangilash
echo ""
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

# 5. Frontend ni qayta build qilish
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

# Frontend build (to'liq qayta build)
echo "🔨 Frontend build (to'liq qayta build)..."
cd apps/frontend
pnpm build || {
    echo "❌ Frontend build xatosi!"
    exit 1
}
cd ../..

# 6. Static fayllarni standalone ga nusxalash
echo ""
echo "📋 Static fayllarni standalone ga nusxalash..."
mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/ 2>/dev/null || {
    echo "⚠️ Static fayllarni nusxalash xatosi!"
}

# Public papkasini standalone ga nusxalash
echo "📋 Public papkasini standalone ga nusxalash..."
if [ -d "apps/frontend/public" ]; then
    mkdir -p apps/frontend/.next/standalone/apps/frontend/public
    cp -r apps/frontend/public/* apps/frontend/.next/standalone/apps/frontend/public/ 2>/dev/null || {
        echo "⚠️ Public fayllarni nusxalash xatosi!"
    }
fi

# 7. Build'dagi environment variable'larni tekshirish
echo ""
echo "📋 Build'dagi environment variable'larni tekshirish..."
if [ -f "apps/frontend/.next/BUILD_ID" ]; then
    echo "✅ Frontend build muvaffaqiyatli!"
    echo "   NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
    echo "   NEXT_PUBLIC_SITE_URL: $NEXT_PUBLIC_SITE_URL"
    
    # Build'dagi kodni tekshirish (grep bilan)
    echo ""
    echo "📋 Build'dagi kodda localhost tekshiruvi..."
    LOCALHOST_COUNT=$(grep -r "localhost:3001" apps/frontend/.next/standalone/apps/frontend 2>/dev/null | wc -l || echo "0")
    if [ "$LOCALHOST_COUNT" -gt 0 ]; then
        echo "⚠️ Build'da hali ham localhost:3001 topildi ($LOCALHOST_COUNT marta)"
        echo "   Bu shuni anglatadiki, ba'zi kodlar build vaqtida environment variable'larni o'qimayapti"
    else
        echo "✅ Build'da localhost:3001 topilmadi!"
    fi
else
    echo "❌ Frontend build ID topilmadi!"
fi

# 8. Frontend ni qayta ishga tushirish
echo ""
echo "🔄 Frontend ni qayta ishga tushirish..."
pm2 delete acoustic-frontend 2>/dev/null || true
pm2 start deploy/ecosystem.config.js --only acoustic-frontend || {
    echo "❌ Frontend start xatosi!"
    exit 1
}
pm2 save || {
    echo "⚠️ PM2 save xatosi!"
}

# 9. Test qilish
echo ""
echo "🧪 Test qilish..."
sleep 5

# Frontend ni test qilish
echo "📋 Frontend ni test qilish..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://news.acoustic.uz 2>/dev/null || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_TEST)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_TEST)"
fi

# PM2 status
echo ""
echo "📋 PM2 status:"
pm2 status

echo ""
echo "✅ Frontend cache tozalandi va qayta build qilindi!"
echo ""
echo "📋 Xulosa:"
echo "- NEXT_PUBLIC_API_URL: $(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d '=' -f2-)"
echo "- NEXT_PUBLIC_SITE_URL: $(grep "^NEXT_PUBLIC_SITE_URL=" .env | cut -d '=' -f2-)"
echo "- Frontend build cache: ✅ Tozalandi"
echo "- Frontend build: ✅"
echo "- Frontend restart: ✅"
echo ""
echo "💡 Endi browser'da hard refresh qiling (Ctrl+Shift+R yoki Cmd+Shift+R)"
echo "   Agar hali ham muammo bo'lsa, browser cache'ni tozalang!"

