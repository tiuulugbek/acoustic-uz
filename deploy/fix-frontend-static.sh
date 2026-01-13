#!/bin/bash

# Frontend static fayllar muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Frontend static fayllar muammosini hal qilish..."

# 1. Frontend build papkasini tekshirish
echo "📋 Frontend build papkasini tekshirish..."
if [ -d "apps/frontend/.next" ]; then
    echo "✅ .next papkasi mavjud!"
    
    # Standalone papkasini tekshirish
    if [ -d "apps/frontend/.next/standalone" ]; then
        echo "✅ Standalone build mavjud!"
        ls -la apps/frontend/.next/standalone/apps/frontend/ | head -10
    else
        echo "⚠️ Standalone build topilmadi!"
    fi
    
    # Static papkasini tekshirish
    if [ -d "apps/frontend/.next/static" ]; then
        echo "✅ Static papkasi mavjud!"
        ls -la apps/frontend/.next/static | head -10
    else
        echo "⚠️ Static papkasi topilmadi!"
    fi
else
    echo "⚠️ .next papkasi topilmadi! Frontend build qilish kerak!"
fi

# 2. Standalone build ichida static fayllarni tekshirish
echo ""
echo "📋 Standalone build ichida static fayllarni tekshirish..."
STANDALONE_STATIC="apps/frontend/.next/standalone/apps/frontend/.next/static"
if [ -d "$STANDALONE_STATIC" ]; then
    echo "✅ Standalone ichida static papkasi mavjud!"
    ls -la "$STANDALONE_STATIC" | head -10
else
    echo "⚠️ Standalone ichida static papkasi topilmadi!"
    echo "📋 Static fayllarni standalone ga nusxalash..."
    
    # Static fayllarni standalone ga nusxalash
    if [ -d "apps/frontend/.next/static" ]; then
        mkdir -p "$STANDALONE_STATIC"
        cp -r apps/frontend/.next/static/* "$STANDALONE_STATIC/"
        echo "✅ Static fayllar nusxalandi!"
    else
        echo "❌ Static papkasi topilmadi! Frontend build qilish kerak!"
    fi
fi

# 3. Frontend ni qayta build qilish (agar kerak bo'lsa)
echo ""
echo "📋 Frontend build holatini tekshirish..."
if [ ! -d "apps/frontend/.next/standalone/apps/frontend/.next/static" ]; then
    echo "🔄 Frontend ni qayta build qilish..."
    
    # Shared package build
    echo "📦 Shared package build..."
    pnpm --filter @acoustic/shared build || {
        echo "❌ Shared package build xatosi!"
        exit 1
    }
    
    # Frontend build
    echo "🔨 Frontend build..."
    NODE_ENV=production pnpm --filter @acoustic/frontend build || {
        echo "❌ Frontend build xatosi!"
        exit 1
    }
    
    # Static fayllarni standalone ga nusxalash
    echo "📋 Static fayllarni standalone ga nusxalash..."
    mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
    cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/
    echo "✅ Static fayllar nusxalandi!"
fi

# 4. PM2 ni restart qilish
echo ""
echo "🔄 PM2 frontend ni restart qilish..."
pm2 restart acoustic-frontend || {
    echo "⚠️ PM2 restart xatosi!"
}

# 5. Frontend ni test qilish
echo ""
echo "🧪 Frontend ni test qilish..."
sleep 3
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_STATUS)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_STATUS)"
fi

# 6. Static fayllarni test qilish
echo ""
echo "🧪 Static fayllarni test qilish..."
STATIC_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/chunks/webpack.js 2>/dev/null || echo "000")
if [ "$STATIC_TEST" = "200" ] || [ "$STATIC_TEST" = "404" ]; then
    echo "📋 Static fayl test: HTTP $STATIC_TEST"
    if [ "$STATIC_TEST" = "404" ]; then
        echo "⚠️ Static fayllar hali ham topilmayapti!"
        echo "💡 Qo'shimcha tekshirish:"
        echo "   ls -la apps/frontend/.next/standalone/apps/frontend/.next/static/"
    fi
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"


