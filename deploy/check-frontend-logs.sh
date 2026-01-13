#!/bin/bash

# Frontend loglarini tekshirish va muammoni hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔍 Frontend loglarini tekshirish..."

# 1. Frontend server.js ni tekshirish
echo "📋 Frontend server.js ni tekshirish..."
if [ -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
    echo "✅ Frontend server.js topildi:"
    ls -lh apps/frontend/.next/standalone/apps/frontend/server.js
else
    echo "❌ Frontend server.js topilmadi!"
    echo "Frontend build qilish kerak..."
    
    # Frontend build qilish
    echo "🔨 Frontend build qilish..."
    pnpm --filter @acoustic/frontend build
    
    # Frontend server.js ni tekshirish
    if [ -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
        echo "✅ Frontend build muvaffaqiyatli!"
        ls -lh apps/frontend/.next/standalone/apps/frontend/server.js
    else
        echo "❌ Frontend build xatosi!"
        exit 1
    fi
fi

# 2. PM2 frontend loglarini ko'rish
echo "📋 PM2 frontend loglari:"
pm2 logs acoustic-frontend --lines 50 --nostream

# 3. Frontend error loglarini ko'rish
echo "📋 Frontend error loglari:"
tail -50 /var/log/pm2/acoustic-frontend-error.log 2>/dev/null || echo "Error log topilmadi"

# 4. Frontend out loglarini ko'rish
echo "📋 Frontend out loglari:"
tail -50 /var/log/pm2/acoustic-frontend-out.log 2>/dev/null || echo "Out log topilmadi"

# 5. PM2 ni qayta ishga tushirish
echo "🔄 PM2 frontend ni qayta ishga tushirish..."
pm2 restart acoustic-frontend

# 6. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

echo "✅ Frontend tekshiruvi yakunlandi!"


