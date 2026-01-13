#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Telegram Button Bot sozlash skripti"
echo "========================================"

# 1. Git pull
echo ""
echo "📥 1. Git pull qilish..."
cd /var/www/news.acoustic.uz
git pull origin main

# 2. Migration qo'llash
echo ""
echo "🗄️  2. Migration qo'llash..."
npx prisma migrate deploy

# 3. Backend'ni qayta ishga tushirish
echo ""
echo "🔄 3. Backend'ni qayta ishga tushirish..."
pm2 restart acoustic-backend

# 4. Status tekshirish
echo ""
echo "✅ 4. Status tekshirish..."
pm2 status acoustic-backend

echo ""
echo "========================================"
echo "✅ Barcha qadamlarni bajarildi!"
echo ""
echo "Keyingi qadamlar:"
echo "1. Admin panelga kiring: https://admins.acoustic.uz"
echo "2. Settings > Umumiy sozlamalar bo'limiga o'ting"
echo "3. Telegram Button Bot Token va Username'ni kiriting"
echo "4. Telegram webhook'ni sozlang (qo'llanmaga qarang)"
echo ""

