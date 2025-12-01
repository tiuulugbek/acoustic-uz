#!/bin/bash

# Nginx 502 muammosini hal qilish

set -e

echo "🔧 Nginx 502 muammosini hal qilish..."
echo ""

# 1. Nginx konfiguratsiyasini tekshirish
echo "📋 Nginx konfiguratsiyasini tekshirish..."
if sudo nginx -t; then
    echo "   ✅ Nginx konfiguratsiyasi to'g'ri"
else
    echo "   ❌ Nginx konfiguratsiyasi xatosi!"
    exit 1
fi

# 2. Nginx status
echo ""
echo "📋 Nginx status:"
sudo systemctl status nginx --no-pager | head -10 || true

# 3. Frontend'ni test qilish
echo ""
echo "🧪 Frontend'ni test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Frontend ishlayapti! (HTTP $HTTP_CODE)"
else
    echo "   ❌ Frontend javob bermayapti! (HTTP $HTTP_CODE)"
    echo "   Frontend'ni qayta ishga tushirish kerak:"
    echo "   pm2 restart acoustic-frontend"
    exit 1
fi

# 4. Nginx'ni reload qilish
echo ""
echo "📋 Nginx'ni reload qilish..."
if sudo systemctl reload nginx; then
    echo "   ✅ Nginx reload muvaffaqiyatli"
else
    echo "   ⚠️ Reload xatosi, restart qilish..."
    sudo systemctl restart nginx
fi

# 5. Nginx loglarini tekshirish
echo ""
echo "📋 Nginx error logs (oxirgi 10 qator):"
sudo tail -10 /var/log/nginx/news.acoustic.uz.error.log 2>/dev/null || echo "   ⚠️ Log fayli topilmadi"

# 6. HTTPS test qilish
echo ""
echo "🧪 HTTPS test qilish..."
sleep 2
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz" 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "   ✅ HTTPS ishlayapti! (HTTP $HTTPS_CODE)"
elif [ "$HTTPS_CODE" = "502" ]; then
    echo "   ❌ HTTPS 502 xatosi!"
    echo "   SSL konfiguratsiyasini tekshirish kerak"
else
    echo "   ⚠️ HTTPS javob berdi: HTTP $HTTPS_CODE"
fi

# 7. SSL konfiguratsiyasini tekshirish
echo ""
echo "📋 SSL konfiguratsiyasini tekshirish..."
SSL_CONFIG="/etc/nginx/sites-available/acoustic-uz-le-ssl.conf"
if [ -f "$SSL_CONFIG" ]; then
    echo "   ✅ SSL konfiguratsiyasi mavjud: $SSL_CONFIG"
    echo "   📋 Frontend proxy konfiguratsiyasi:"
    grep -A 15 "server_name news.acoustic.uz" "$SSL_CONFIG" | grep -E "proxy_pass|location" || echo "   ⚠️ Proxy konfiguratsiyasi topilmadi"
else
    echo "   ⚠️ SSL konfiguratsiyasi topilmadi"
    echo "   Certbot orqali SSL o'rnatish kerak bo'lishi mumkin"
fi

# 8. HTTP test qilish
echo ""
echo "🧪 HTTP test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://news.acoustic.uz" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ HTTP ishlayapti! (HTTP $HTTP_CODE)"
else
    echo "   ⚠️ HTTP javob berdi: HTTP $HTTP_CODE"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"
echo ""
echo "📋 Keyingi qadamlar:"
if [ "$HTTPS_CODE" = "502" ]; then
    echo "   1. SSL konfiguratsiyasini tekshirish:"
    echo "      sudo cat $SSL_CONFIG"
    echo ""
    echo "   2. Agar SSL konfiguratsiyasi noto'g'ri bo'lsa, Certbot orqali qayta o'rnatish:"
    echo "      sudo certbot --nginx -d news.acoustic.uz --non-interactive --agree-tos --email admin@acoustic.uz --redirect"
fi
echo "   3. Browser'da cache'ni tozalang va sahifani yangilang"

