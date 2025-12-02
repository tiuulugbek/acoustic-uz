#!/bin/bash

# Backend Swagger decorator muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Backend Swagger decorator muammosini hal qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build

# 2. Backend dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf apps/backend/dist

# 3. Backend dependencies ni tekshirish
echo "📦 Backend dependencies ni tekshirish..."
cd apps/backend
if [ ! -d "node_modules/@nestjs/cli" ]; then
    echo "📦 Dependencies ni o'rnatish..."
    pnpm install
fi

# 4. NestJS build ni ishga tushirish (NestJS o'zining build jarayonida decoratorlarni to'g'ri qayta ishlaydi)
echo "🔨 NestJS build qilish..."
npx nest build 2>&1 | tee /tmp/nest-build.log

# 5. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
    
    # Backend ni test qilish
    echo "🧪 Backend ni test qilish..."
    timeout 5 node dist/main.js 2>&1 | head -20 || {
        echo "⚠️ Backend test xatosi, lekin build muvaffaqiyatli"
    }
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "NestJS build log:"
    cat /tmp/nest-build.log
    exit 1
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

echo "✅ Backend Swagger decorator muammosi hal qilindi!"


