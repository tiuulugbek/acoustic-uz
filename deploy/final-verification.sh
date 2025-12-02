#!/bin/bash

# Final deployment verification

set -e

cd /var/www/news.acoustic.uz

echo "🎉 Final deployment verification..."

# 1. PM2 statusini ko'rsatish
echo "📊 PM2 status:"
pm2 status

# 2. Backend ni test qilish
echo ""
echo "🧪 Backend ni test qilish..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs || echo "000")
if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "301" ] || [ "$BACKEND_STATUS" = "302" ]; then
    echo "✅ Backend ishlayapti! (HTTP $BACKEND_STATUS)"
else
    echo "⚠️ Backend javob bermayapti (HTTP $BACKEND_STATUS)"
fi

# 3. Frontend ni test qilish
echo ""
echo "🧪 Frontend ni test qilish..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "301" ] || [ "$FRONTEND_STATUS" = "302" ]; then
    echo "✅ Frontend ishlayapti! (HTTP $FRONTEND_STATUS)"
else
    echo "⚠️ Frontend javob bermayapti (HTTP $FRONTEND_STATUS)"
fi

# 4. Nginx ni test qilish
echo ""
echo "🧪 Nginx ni test qilish..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx ishlayapti!"
else
    echo "⚠️ Nginx ishlamayapti!"
fi

# 5. Portlarni tekshirish
echo ""
echo "📋 Portlarni tekshirish..."
if lsof -i:3000 >/dev/null 2>&1; then
    echo "✅ Port 3000 (Frontend) ishlatilmoqda"
else
    echo "⚠️ Port 3000 (Frontend) bo'sh"
fi

if lsof -i:3001 >/dev/null 2>&1; then
    echo "✅ Port 3001 (Backend) ishlatilmoqda"
else
    echo "⚠️ Port 3001 (Backend) bo'sh"
fi

# 6. PM2 loglarini ko'rsatish (oxirgi 5 qator)
echo ""
echo "📋 PM2 loglar (oxirgi 5 qator):"
echo "Backend:"
pm2 logs acoustic-backend --lines 5 --nostream || true
echo ""
echo "Frontend:"
pm2 logs acoustic-frontend --lines 5 --nostream || true

echo ""
echo "✅ Final verification yakunlandi!"
echo ""
echo "📋 Xulosa:"
echo "- Backend: http://localhost:3001/api/docs"
echo "- Frontend: http://localhost:3000"
echo "- PM2: pm2 status"
echo "- Logs: pm2 logs"


