#!/bin/bash

# Backend loglarini tekshirish va muammoni hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔍 Backend loglarini tekshirish..."

# 1. Backend dist/main.js ni tekshirish
echo "📋 Backend dist/main.js ni tekshirish..."
if [ -f "apps/backend/dist/main.js" ]; then
    echo "✅ Backend dist/main.js topildi:"
    ls -lh apps/backend/dist/main.js
else
    echo "❌ Backend dist/main.js topilmadi!"
    echo "Backend build qilish kerak..."
    exit 1
fi

# 2. PM2 backend loglarini ko'rish
echo "📋 PM2 backend loglari:"
pm2 logs acoustic-backend --lines 50 --nostream

# 3. Backend error loglarini ko'rish
echo "📋 Backend error loglari:"
tail -100 /var/log/pm2/acoustic-backend-error.log 2>/dev/null || echo "Error log topilmadi"

# 4. Backend out loglarini ko'rish
echo "📋 Backend out loglari:"
tail -100 /var/log/pm2/acoustic-backend-out.log 2>/dev/null || echo "Out log topilmadi"

# 5. Backend ni to'g'ridan-to'g'ri ishga tushirish (test)
echo "🧪 Backend ni to'g'ridan-to'g'ri ishga tushirish (test)..."
cd apps/backend
node dist/main.js 2>&1 | head -20 || echo "Backend ishga tushmadi"

cd ../..

# 6. PM2 backend ni qayta ishga tushirish
echo "🔄 PM2 backend ni qayta ishga tushirish..."
pm2 restart acoustic-backend

# 7. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 8. PM2 backend loglarini real-time ko'rish
echo "📋 PM2 backend loglari (real-time, 10 soniya):"
timeout 10 pm2 logs acoustic-backend --lines 20 || true

echo "✅ Backend tekshiruvi yakunlandi!"


