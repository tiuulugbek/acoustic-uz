#!/bin/bash

# 502 Bad Gateway muammosini hal qilish

set -e

echo "🔧 502 Bad Gateway muammosini hal qilish..."
echo ""

cd /var/www/news.acoustic.uz || {
    echo "❌ /var/www/news.acoustic.uz papkasiga kirib bo'lmadi!"
    exit 1
}

# 1. PM2 status tekshirish
echo "📋 PM2 status tekshirish..."
pm2 status

# 2. Frontend process'ni tekshirish
echo ""
echo "📋 Frontend process'ni tekshirish..."
if pm2 describe acoustic-frontend > /dev/null 2>&1; then
    echo "   ✅ Frontend process mavjud"
    pm2 describe acoustic-frontend | grep -E "status|pid|uptime|restarts" || true
else
    echo "   ❌ Frontend process topilmadi!"
fi

# 3. Port 3000'ni tekshirish
echo ""
echo "📋 Port 3000'ni tekshirish..."
PORT_3000=$(lsof -i :3000 2>/dev/null | grep LISTEN || echo "")
if [ -n "$PORT_3000" ]; then
    echo "   ✅ Port 3000 ishlatilmoqda:"
    echo "$PORT_3000"
else
    echo "   ❌ Port 3000 bo'sh!"
fi

# 4. Frontend'ni to'g'ridan-to'g'ri test qilish
echo ""
echo "🧪 Frontend'ni to'g'ridan-to'g'ri test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Frontend ishlayapti! (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "   ❌ Frontend javob bermayapti!"
else
    echo "   ⚠️ Frontend javob berdi, lekin HTTP $HTTP_CODE"
fi

# 5. Frontend loglarini ko'rish
echo ""
echo "📋 Frontend error logs (oxirgi 20 qator):"
pm2 logs acoustic-frontend --err --lines 20 --nostream 2>/dev/null || echo "   ⚠️ Logs o'qib bo'lmadi"

echo ""
echo "📋 Frontend output logs (oxirgi 20 qator):"
pm2 logs acoustic-frontend --out --lines 20 --nostream 2>/dev/null || echo "   ⚠️ Logs o'qib bo'lmadi"

# 6. Frontend server.js faylini tekshirish
echo ""
echo "📋 Frontend server.js faylini tekshirish..."
SERVER_JS="apps/frontend/.next/standalone/apps/frontend/server.js"
if [ -f "$SERVER_JS" ]; then
    echo "   ✅ Server.js mavjud: $SERVER_JS"
    ls -lh "$SERVER_JS"
else
    echo "   ❌ Server.js topilmadi: $SERVER_JS"
    echo "   📋 Standalone papkasini tekshirish..."
    if [ -d "apps/frontend/.next/standalone" ]; then
        find apps/frontend/.next/standalone -name "server.js" -type f | head -5
    else
        echo "   ❌ Standalone build topilmadi!"
    fi
fi

# 7. Yechim taklif qilish
echo ""
echo "🔧 Yechim taklif qilish..."

if [ "$HTTP_CODE" = "000" ] || [ -z "$PORT_3000" ]; then
    echo "   Frontend ishlamayapti. Qayta ishga tushirish kerak:"
    echo ""
    echo "   pm2 restart acoustic-frontend"
    echo "   # Yoki"
    echo "   pm2 delete acoustic-frontend"
    echo "   pm2 start ecosystem.config.js --only acoustic-frontend"
    echo ""
    echo "   # Yoki frontend'ni qayta build qilish kerak:"
    echo "   ./deploy/fix-frontend-chunks.sh"
elif [ ! -f "$SERVER_JS" ]; then
    echo "   Server.js topilmadi. Frontend'ni qayta build qilish kerak:"
    echo ""
    echo "   ./deploy/fix-frontend-chunks.sh"
else
    echo "   Frontend ishlayapti, lekin Nginx bilan muammo bo'lishi mumkin."
    echo "   Nginx'ni reload qilish kerak:"
    echo ""
    echo "   sudo nginx -t"
    echo "   sudo systemctl reload nginx"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"

