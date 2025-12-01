#!/bin/bash

# Barcha servislarni tekshirish va tasdiqlash

set -e

cd /var/www/news.acoustic.uz

echo "🔍 Barcha servislarni tekshirish..."

# 1. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 2. Backend loglarini ko'rish
echo ""
echo "📋 Backend loglari (oxirgi 10 qator):"
pm2 logs acoustic-backend --lines 10 --nostream

# 3. Frontend loglarini ko'rish
echo ""
echo "📋 Frontend loglari (oxirgi 10 qator):"
pm2 logs acoustic-frontend --lines 10 --nostream

# 4. Backend ni test qilish
echo ""
echo "🧪 Backend ni test qilish..."
curl -s http://localhost:3001/api/health 2>&1 | head -5 || echo "Health endpoint topilmadi"
curl -s http://localhost:3001/api/docs 2>&1 | head -5 || echo "Swagger endpoint topilmadi"

# 5. Frontend ni test qilish
echo ""
echo "🧪 Frontend ni test qilish..."
curl -s http://localhost:3000 2>&1 | head -5 || echo "Frontend endpoint topilmadi"

# 6. Nginx statusini tekshirish
echo ""
echo "📋 Nginx status:"
systemctl status nginx --no-pager | head -10 || echo "Nginx status tekshirilmadi"

echo ""
echo "✅ Barcha servislar tekshirildi!"

