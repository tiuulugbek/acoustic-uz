#!/bin/bash

# Git ownership muammosini hal qilish va backend build qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Git ownership muammosini hal qilish..."

# 1. Git safe directory qo'shish
git config --global --add safe.directory /var/www/news.acoustic.uz

# 2. Repository ni yangilash
echo "📥 Repository ni yangilash..."
git pull origin main || echo "⚠️ Git pull xatosi, davom etilmoqda..."

# 3. Script ni tekshirish va ishga tushirish
if [ -f "deploy/fix-backend-build-complete.sh" ]; then
    echo "✅ Script topildi, ishga tushirilmoqda..."
    chmod +x deploy/fix-backend-build-complete.sh
    ./deploy/fix-backend-build-complete.sh
else
    echo "⚠️ Script topilmadi, qo'lda build qilish..."
    
    # Shared package build
    echo "📦 Shared package build qilish..."
    pnpm --filter @acoustic/shared build
    
    # Backend build
    echo "🔨 Backend build qilish..."
    cd apps/backend
    
    # Dependencies ni tekshirish
    if [ ! -d "node_modules/@nestjs/cli" ]; then
        echo "📦 Dependencies ni o'rnatish..."
        pnpm install
    fi
    
    # Eski dist papkasini o'chirish
    rm -rf dist
    
    # TypeScript kompilyatsiya qilish
    echo "🔨 TypeScript kompilyatsiya qilish..."
    npx tsc --project tsconfig.json 2>&1 | tee /tmp/tsc-build.log
    
    # Build natijasini tekshirish
    if [ -f "dist/main.js" ]; then
        echo "✅ Backend build muvaffaqiyatli!"
        ls -lh dist/main.js
    else
        echo "❌ Build xatosi!"
        cat /tmp/tsc-build.log
        exit 1
    fi
    
    cd ../..
    
    # PM2 ni ishga tushirish
    echo "🚀 PM2 ni ishga tushirish..."
    pm2 delete all 2>/dev/null || true
    pm2 start deploy/ecosystem.config.js
    pm2 status
fi

echo "✅ Barcha jarayonlar yakunlandi!"

