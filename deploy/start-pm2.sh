#!/bin/bash

# PM2 ni ishga tushirish scripti

set -e

cd /var/www/news.acoustic.uz

echo "🚀 PM2 ni ishga tushirish..."

# 1. Backend dist/main.js ni tekshirish
if [ ! -f "apps/backend/dist/main.js" ]; then
    echo "❌ apps/backend/dist/main.js topilmadi!"
    echo "Backend build qilish kerak..."
    exit 1
fi

echo "✅ Backend dist/main.js topildi:"
ls -lh apps/backend/dist/main.js

# 2. Frontend server.js ni tekshirish
if [ ! -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
    echo "⚠️ Frontend server.js topilmadi, lekin davom etilmoqda..."
fi

# 3. PM2 ni to'xtatish
echo "🛑 PM2 ni to'xtatish..."
pm2 delete all 2>/dev/null || true

# 4. PM2 ni ishga tushirish
echo "🚀 PM2 ni ishga tushirish..."
pm2 start deploy/ecosystem.config.js

# 5. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 6. PM2 loglarni ko'rsatish
echo "📋 PM2 loglar (oxirgi 20 qator):"
pm2 logs --lines 20 --nostream

echo "✅ PM2 muvaffaqiyatli ishga tushirildi!"

