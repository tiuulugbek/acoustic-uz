#!/bin/bash

# Backend build ni qo'lda qilish scripti

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Backend build qilish..."

# 1. Git ownership muammosini hal qilish
git config --global --add safe.directory /var/www/news.acoustic.uz || true

# 2. Repository ni yangilash
echo "📥 Repository ni yangilash..."
git pull origin main || echo "⚠️ Git pull xatosi, davom etilmoqda..."

# 3. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# 4. Backend build
echo "🔨 Backend build qilish..."
cd apps/backend

# Dependencies ni tekshirish
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies ni o'rnatish..."
    pnpm install
fi

# Eski dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf dist

# TypeScript kompilyatsiya qilish
echo "🔨 TypeScript kompilyatsiya qilish..."
npx tsc --project tsconfig.json 2>&1 | tee /tmp/tsc-build.log

# Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
    echo "📊 Dist papkasi tarkibi (birinchi 20 ta fayl):"
    ls -la dist/ | head -20
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "TypeScript build log:"
    cat /tmp/tsc-build.log
    echo ""
    echo "Dist papkasi tarkibi:"
    ls -la dist/ 2>/dev/null || echo "Dist papkasi mavjud emas!"
    
    # Xatolarni ko'rsatish
    echo ""
    echo "🔍 Xatolarni tekshirish..."
    grep -i "error" /tmp/tsc-build.log || echo "Xatolar topilmadi"
    exit 1
fi

cd ../..

# 5. PM2 ni ishga tushirish
echo "🚀 PM2 ni ishga tushirish..."
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.js

# 6. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

echo "✅ Backend build va PM2 setup muvaffaqiyatli!"


