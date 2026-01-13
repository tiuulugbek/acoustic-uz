#!/bin/bash

# TypeScript config muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 TypeScript config muammosini hal qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build

# 2. Backend dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf apps/backend/dist

# 3. Backend dependencies ni tekshirish
echo "📦 Backend dependencies ni tekshirish..."
cd apps/backend

# TypeScript versiyasini tekshirish
echo "📋 TypeScript versiyasi:"
npx tsc --version

# 4. TypeScript konfiguratsiyasini tekshirish
echo "📋 TypeScript konfiguratsiyasi:"
cat tsconfig.json | grep -E "(outDir|rootDir|include|exclude)"

# 5. Dist papkasini yaratish
echo "📁 Dist papkasini yaratish..."
mkdir -p dist

# 6. TypeScript kompilyatsiya qilish (noEmit false)
echo "🔨 TypeScript kompilyatsiya qilish..."
npx tsc --project tsconfig.json --noEmit false 2>&1 | tee /tmp/tsc-build.log

# 7. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
    echo "📊 Dist papkasi tarkibi (birinchi 20 ta fayl):"
    ls -la dist/ | head -20
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "TypeScript build log:"
    cat /tmp/tsc-build.log | tail -50
    
    # Xatolarni ko'rish
    echo ""
    echo "🔍 Xatolarni qidirish..."
    grep -i "error" /tmp/tsc-build.log | head -20 || echo "Xatolar topilmadi"
    
    # Dist papkasini tekshirish
    echo ""
    echo "📋 Dist papkasi tarkibi:"
    ls -la dist/ 2>/dev/null || echo "Dist papkasi mavjud emas!"
    
    # Alternativ: To'g'ridan-to'g'ri kompilyatsiya qilish
    echo ""
    echo "🔄 To'g'ridan-to'g'ri kompilyatsiya qilish..."
    npx tsc src/main.ts --outDir dist --module commonjs --target ES2022 --moduleResolution node --esModuleInterop --skipLibCheck --emitDecoratorMetadata --experimentalDecorators 2>&1 | tee /tmp/tsc-direct.log
    
    if [ -f "dist/main.js" ]; then
        echo "✅ To'g'ridan-to'g'ri kompilyatsiya muvaffaqiyatli!"
        ls -lh dist/main.js
    else
        echo "❌ To'g'ridan-to'g'ri kompilyatsiya ham ishlamadi!"
        cat /tmp/tsc-direct.log | tail -20
        exit 1
    fi
fi

cd ../..

# 8. PM2 backend ni qayta ishga tushirish
echo "🚀 PM2 backend ni qayta ishga tushirish..."
pm2 delete acoustic-backend 2>/dev/null || true
sleep 2
pm2 start deploy/ecosystem.config.js --only acoustic-backend

# 9. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 10. PM2 backend loglarini ko'rish (10 soniya)
echo "📋 PM2 backend loglari (10 soniya):"
timeout 10 pm2 logs acoustic-backend --lines 30 || true

echo "✅ TypeScript config muammosi hal qilindi!"


