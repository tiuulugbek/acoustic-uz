#!/bin/bash

# NestJS build muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 NestJS build muammosini hal qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build

# 2. Backend dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf apps/backend/dist

# 3. Backend dependencies ni tekshirish
echo "📦 Backend dependencies ni tekshirish..."
cd apps/backend

# NestJS CLI ni tekshirish
echo "📋 NestJS CLI versiyasi:"
npx nest --version || echo "⚠️ NestJS CLI topilmadi"

# TypeScript versiyasini tekshirish
echo "📋 TypeScript versiyasi:"
npx tsc --version || echo "⚠️ TypeScript topilmadi"

# 4. NestJS build ni verbose mode da ishga tushirish
echo "🔨 NestJS build qilish (verbose)..."
npx nest build --verbose 2>&1 | tee /tmp/nest-build-verbose.log

# 5. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "NestJS build log:"
    cat /tmp/nest-build-verbose.log
    
    # Agar NestJS build ishlamasa, TypeScript kompilyatsiya qilish
    echo ""
    echo "🔄 TypeScript kompilyatsiya qilish (alternativ)..."
    npx tsc --project tsconfig.json 2>&1 | tee /tmp/tsc-build.log
    
    if [ -f "dist/main.js" ]; then
        echo "✅ TypeScript kompilyatsiya muvaffaqiyatli!"
        ls -lh dist/main.js
    else
        echo "❌ TypeScript kompilyatsiya ham ishlamadi!"
        cat /tmp/tsc-build.log
        exit 1
    fi
fi

cd ../..

# 6. PM2 backend ni qayta ishga tushirish
echo "🚀 PM2 backend ni qayta ishga tushirish..."
pm2 delete acoustic-backend 2>/dev/null || true
sleep 2
pm2 start deploy/ecosystem.config.js --only acoustic-backend

# 7. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 8. PM2 backend loglarini ko'rish (10 soniya)
echo "📋 PM2 backend loglari (10 soniya):"
timeout 10 pm2 logs acoustic-backend --lines 30 || true

echo "✅ NestJS build muammosi hal qilindi!"

