#!/bin/bash

# Backend muammosini to'liq diagnostika qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔍 Backend muammosini diagnostika qilish..."

# 1. Backend dist/main.js ni tekshirish
echo "📋 Backend dist/main.js ni tekshirish..."
if [ -f "apps/backend/dist/main.js" ]; then
    echo "✅ Backend dist/main.js topildi:"
    ls -lh apps/backend/dist/main.js
    echo "Fayl tarkibini ko'rish (birinchi 20 qator):"
    head -20 apps/backend/dist/main.js
else
    echo "❌ Backend dist/main.js topilmadi!"
    exit 1
fi

# 2. Backend error loglarini ko'rish
echo ""
echo "📋 Backend error loglari (oxirgi 50 qator):"
tail -50 /var/log/pm2/acoustic-backend-error.log 2>/dev/null || echo "Error log topilmadi"

# 3. Backend out loglarini ko'rish
echo ""
echo "📋 Backend out loglari (oxirgi 50 qator):"
tail -50 /var/log/pm2/acoustic-backend-out.log 2>/dev/null || echo "Out log topilmadi"

# 4. Backend ni to'g'ridan-to'g'ri ishga tushirish (test)
echo ""
echo "🧪 Backend ni to'g'ridan-to'g'ri ishga tushirish (test)..."
cd apps/backend

# Environment variables ni tekshirish
echo "📋 Environment variables:"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "PORT: ${PORT:-not set}"

# Backend ni ishga tushirish
echo ""
echo "🚀 Backend ni ishga tushirish..."
timeout 5 node dist/main.js 2>&1 || {
    echo ""
    echo "❌ Backend ishga tushmadi!"
    echo "Xatolarni ko'rish uchun quyidagi buyruqni bajaring:"
    echo "cd /var/www/news.acoustic.uz/apps/backend && node dist/main.js"
}

cd ../..

# 5. PM2 backend ni to'xtatish va qayta ishga tushirish
echo ""
echo "🔄 PM2 backend ni to'xtatish va qayta ishga tushirish..."
pm2 delete acoustic-backend 2>/dev/null || true
sleep 2
pm2 start deploy/ecosystem.config.js --only acoustic-backend

# 6. PM2 statusini ko'rsatish
echo ""
echo "📊 PM2 status:"
pm2 status

# 7. PM2 backend loglarini real-time ko'rish (5 soniya)
echo ""
echo "📋 PM2 backend loglari (real-time, 5 soniya):"
timeout 5 pm2 logs acoustic-backend --lines 30 || true

echo ""
echo "✅ Backend diagnostika yakunlandi!"


