#!/bin/bash

# PM2 ni root dan ishga tushirish (sodda versiya)

set -e

PROJECT_ROOT="/root/acoustic.uz"

echo "🚀 PM2 ni root dan ishga tushirish..."
echo ""

# PM2 socket muammosini hal qilish
export PM2_HOME=/root/.pm2

# PM2 daemon ni qayta ishga tushirish
echo "🔄 PM2 daemon ni qayta ishga tushirish..."
pm2 kill 2>/dev/null || true
sleep 2

# Eski processlarni o'chirish
echo "🛑 Eski processlarni o'chirish..."
pm2 delete all 2>/dev/null || true
sleep 1

# Root konfiguratsiyasi bilan ishga tushirish
echo "🚀 Root konfiguratsiyasi bilan ishga tushirish..."
cd "$PROJECT_ROOT"
pm2 start deploy/ecosystem.config.js
sleep 2
pm2 save

echo ""
echo "✅ PM2 ishga tushirildi!"
echo ""
echo "📋 Status:"
pm2 list

echo ""
echo "📝 Keyingi qadamlar:"
echo "   - Loglar: pm2 logs"
echo "   - Restart: pm2 restart all"
echo "   - Stop: pm2 stop all"
echo ""
