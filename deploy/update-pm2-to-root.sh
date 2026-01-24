#!/bin/bash

# Mavjud PM2 processlarni root konfiguratsiyasiga yangilash

set -e

PROJECT_ROOT="/root/acoustic.uz"

echo "🔄 PM2 processlarni root konfiguratsiyasiga yangilash..."
echo ""

# PM2 socket muammosini hal qilish
export PM2_HOME=/root/.pm2

# Mavjud processlarni to'xtatish va o'chirish
echo "🛑 Mavjud processlarni to'xtatish..."
pm2 stop acoustic-backend 2>/dev/null || true
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-backend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 1

# Root konfiguratsiyasi bilan yangi processlarni ishga tushirish
echo "🚀 Root konfiguratsiyasi bilan yangi processlarni ishga tushirish..."
cd "$PROJECT_ROOT"

# Backend ni ishga tushirish
echo "   Backend ni ishga tushirish..."
pm2 start apps/backend/dist/main.js \
    --name acoustic-backend \
    --cwd "$PROJECT_ROOT" \
    --env NODE_ENV=production \
    --env PORT=3001 \
    --error /var/log/pm2/acoustic-backend-error.log \
    --output /var/log/pm2/acoustic-backend-out.log \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --autorestart \
    --max-memory-restart 500M \
    --no-watch

sleep 1

# Frontend ni ishga tushirish
echo "   Frontend ni ishga tushirish..."
cd "$PROJECT_ROOT/apps/frontend"
pm2 start npm \
    --name acoustic-frontend \
    -- start \
    --cwd "$PROJECT_ROOT/apps/frontend" \
    --interpreter none \
    --env NODE_ENV=production \
    --env PORT=3002 \
    --env NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api \
    --env NEXT_PUBLIC_SITE_URL=https://acoustic.uz \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --autorestart \
    --max-memory-restart 500M \
    --no-watch

sleep 2

# PM2 ni saqlash
pm2 save

echo ""
echo "✅ PM2 processlar yangilandi!"
echo ""
echo "📋 Status:"
pm2 list

echo ""
echo "📝 Keyingi qadamlar:"
echo "   - Loglar: pm2 logs"
echo "   - Backend loglar: pm2 logs acoustic-backend"
echo "   - Frontend loglar: pm2 logs acoustic-frontend"
echo "   - Restart: pm2 restart all"
echo ""
