#!/bin/bash

# Port 3000 muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Port 3000 muammosini hal qilish..."

# 1. Port 3000 ni ishlatayotgan processlarni topish
echo "📋 Port 3000 ni ishlatayotgan processlar:"
lsof -ti:3000 2>/dev/null || echo "Port 3000 bo'sh"

# 2. Port 3000 ni ishlatayotgan processlarni to'xtatish
echo "🛑 Port 3000 ni ishlatayotgan processlarni to'xtatish..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Hech qanday process topilmadi"

# 3. PM2 frontend ni to'xtatish
echo "🛑 PM2 frontend ni to'xtatish..."
pm2 delete acoustic-frontend 2>/dev/null || true

# 4. Boshqa frontend processlarni to'xtatish
echo "🛑 Boshqa frontend processlarni to'xtatish..."
pkill -f "frontend.*server.js" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

# 5. Kichik kutish
echo "⏳ 3 soniya kutish..."
sleep 3

# 6. Port 3000 ni qayta tekshirish
echo "📋 Port 3000 ni qayta tekshirish..."
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️ Port 3000 hali ham ishlatilmoqda!"
    lsof -i:3000
    echo "Qo'lda to'xtatish kerak: kill -9 \$(lsof -ti:3000)"
    exit 1
else
    echo "✅ Port 3000 bo'sh!"
fi

# 7. PM2 frontend ni qayta ishga tushirish
echo "🚀 PM2 frontend ni qayta ishga tushirish..."
pm2 start deploy/ecosystem.config.js --only acoustic-frontend

# 8. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 9. PM2 frontend loglarini ko'rish (10 soniya)
echo "📋 PM2 frontend loglari (10 soniya):"
timeout 10 pm2 logs acoustic-frontend --lines 30 || true

echo "✅ Port 3000 muammosi hal qilindi!"

