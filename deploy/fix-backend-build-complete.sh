#!/bin/bash

# Backend build muammosini to'liq hal qilish scripti

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Backend build muammosini hal qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# 2. Backend dependencies ni tekshirish va o'rnatish
echo "📦 Backend dependencies ni tekshirish..."
cd apps/backend
if [ ! -d "node_modules/@nestjs/cli" ]; then
    echo "📦 Dependencies ni o'rnatish..."
    pnpm install
fi

# 3. Node.js va NestJS versiyalarini tekshirish
echo "📋 Versiyalar:"
node --version
npx nest --version || echo "⚠️ NestJS CLI topilmadi"
npx tsc --version || echo "⚠️ TypeScript topilmadi"

# 4. Eski dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf dist

# 5. TypeScript kompilyatsiya qilish (to'g'ridan-to'g'ri)
echo "🔨 TypeScript kompilyatsiya qilish..."
npx tsc --project tsconfig.json 2>&1 | tee /tmp/tsc-build.log

# 6. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
    echo "📊 Dist papkasi tarkibi:"
    ls -la dist/ | head -20
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "TypeScript build log:"
    cat /tmp/tsc-build.log
    echo ""
    echo "Dist papkasi tarkibi:"
    ls -la dist/ 2>/dev/null || echo "Dist papkasi mavjud emas!"
    
    # Alternativ: NestJS build ni qayta urinib ko'rish
    echo "🔄 NestJS build ni qayta urinib ko'rish..."
    npx nest build --verbose 2>&1 | tee /tmp/nest-build.log
    if [ -f "dist/main.js" ]; then
        echo "✅ NestJS build muvaffaqiyatli!"
        ls -lh dist/main.js
    else
        echo "❌ NestJS build ham ishlamadi"
        cat /tmp/nest-build.log
        exit 1
    fi
fi

cd ../..

# 7. PM2 ni ishga tushirish
echo "🚀 PM2 ni ishga tushirish..."
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.js

# 8. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

echo "✅ Backend build va PM2 setup muvaffaqiyatli!"

