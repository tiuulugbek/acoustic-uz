#!/bin/bash

# Frontend start muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Frontend start muammosini hal qilish..."

# 1. Frontend server.js ni tekshirish
echo "📋 Frontend server.js ni tekshirish..."
if [ -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
    echo "✅ Frontend server.js topildi:"
    ls -lh apps/frontend/.next/standalone/apps/frontend/server.js
    
    # Server.js ni to'g'ridan-to'g'ri test qilish
    echo "🧪 Frontend server.js ni test qilish..."
    cd apps/frontend/.next/standalone/apps/frontend
    timeout 5 node server.js 2>&1 | head -30 || {
        echo "⚠️ Frontend server test xatosi"
    }
    cd /var/www/news.acoustic.uz
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

# 2. Frontend .next/static papkasini tekshirish
echo "📋 Frontend static papkasini tekshirish..."
if [ ! -d "apps/frontend/.next/static" ]; then
    echo "⚠️ Frontend static papkasi topilmadi!"
    echo "Frontend build qilish kerak..."
    pnpm --filter @acoustic/frontend build
fi

# 3. Frontend public papkasini tekshirish
echo "📋 Frontend public papkasini tekshirish..."
if [ ! -d "apps/frontend/public" ]; then
    echo "⚠️ Frontend public papkasi topilmadi!"
fi

# 4. PM2 frontend ni qayta ishga tushirish
echo "🚀 PM2 frontend ni qayta ishga tushirish..."
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
pm2 start deploy/ecosystem.config.js --only acoustic-frontend

# 5. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 6. PM2 frontend loglarini ko'rish (10 soniya)
echo "📋 PM2 frontend loglari (10 soniya):"
timeout 10 pm2 logs acoustic-frontend --lines 30 || true

echo "✅ Frontend start muammosi hal qilindi!"

