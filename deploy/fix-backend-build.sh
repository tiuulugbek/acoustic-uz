#!/bin/bash

# Backend build muammosini hal qilish scripti

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Backend build muammosini hal qilish..."

# 1. Shared package build
echo "📦 Shared package build qilish..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build xatosi!"
    exit 1
}

# 2. Backend dist papkasini o'chirish
echo "🧹 Eski dist papkasini o'chirish..."
rm -rf apps/backend/dist

# 3. Backend build qilish (verbose)
echo "🔨 Backend build qilish..."
cd apps/backend
pnpm build 2>&1 | tee /tmp/backend-build.log

# 4. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -f "dist/main.js" ]; then
    echo "✅ Backend build muvaffaqiyatli! dist/main.js topildi"
    ls -lh dist/main.js
else
    echo "❌ Backend build xatosi! dist/main.js topilmadi"
    echo "Build log:"
    tail -50 /tmp/backend-build.log
    echo ""
    echo "Dist papkasi tarkibi:"
    ls -la dist/ 2>/dev/null || echo "Dist papkasi mavjud emas!"
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
