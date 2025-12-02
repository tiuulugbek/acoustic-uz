#!/bin/bash

# Serverda map fayllarini to'liq hal qilish scripti
# Bu script serverda ishga tushirilishi kerak

set -e

echo "🗺️ Map fayllarini to'liq hal qilish..."
echo ""

# Frontend papkasi
FRONTEND_DIR="/var/www/news.acoustic.uz/apps/frontend"
PUBLIC_DIR="$FRONTEND_DIR/public"
MAPS_DIR="$PUBLIC_DIR/maps"
STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"
STANDALONE_PUBLIC="$STANDALONE_DIR/public"
STANDALONE_MAPS="$STANDALONE_PUBLIC/maps"

# 1. Git pull qilish
echo "📥 Git pull qilish..."
cd /var/www/news.acoustic.uz
git pull origin main || {
    echo "⚠️ Git pull xatosi, davom etilmoqda..."
}

# 2. Public papkasini yaratish va map fayllarini tekshirish
echo ""
echo "📁 Public papkasini yaratish..."
mkdir -p "$PUBLIC_DIR"
mkdir -p "$MAPS_DIR"

# 3. Map fayllarini tekshirish
echo ""
echo "📤 Map fayllarini tekshirish..."
if [ -d "$MAPS_DIR" ] && [ "$(ls -A $MAPS_DIR 2>/dev/null)" ]; then
    echo "✅ Map fayllari topildi: $MAPS_DIR"
    ls -lh "$MAPS_DIR"
    FILE_COUNT=$(find "$MAPS_DIR" -type f | wc -l | tr -d ' ')
    echo "📋 Topilgan fayllar soni: $FILE_COUNT"
else
    echo "❌ Map fayllari topilmadi: $MAPS_DIR"
    echo "   Git repodan map fayllarini ko'chirish..."
    
    # Git repodan map fayllarini ko'chirish
    if [ -d "$FRONTEND_DIR/public/maps" ]; then
        cp -r "$FRONTEND_DIR/public/maps"/* "$MAPS_DIR/" 2>/dev/null || true
        echo "✅ Git repodan map fayllari ko'chirildi"
    else
        echo "❌ Git repoda ham map fayllari topilmadi!"
        echo "   Localdan map fayllarini ko'chirish kerak"
    fi
fi

# 4. Standalone build'ga map fayllarini ko'chirish (MUHIM!)
echo ""
echo "📤 Standalone build'ga map fayllarini ko'chirish..."
if [ -d "$FRONTEND_DIR/.next/standalone" ]; then
    mkdir -p "$STANDALONE_MAPS"
    
    if [ -d "$MAPS_DIR" ] && [ "$(ls -A $MAPS_DIR 2>/dev/null)" ]; then
        echo "   Map fayllarini ko'chirish..."
        cp -r "$MAPS_DIR"/* "$STANDALONE_MAPS/" 2>/dev/null || true
        
        # Tekshirish
        if [ -f "$STANDALONE_MAPS/countrymap.js" ]; then
            echo "✅ Standalone build'ga map fayllari ko'chirildi!"
            ls -lh "$STANDALONE_MAPS"
        else
            echo "⚠️ Standalone build'ga map fayllari ko'chirilmadi!"
        fi
    else
        echo "⚠️ Map fayllari topilmadi, ko'chirilmadi"
    fi
else
    echo "⚠️ Standalone build topilmadi, ehtimol build qilinmagan"
    echo "   Frontend'ni rebuild qilish kerak"
fi

# 5. Permissions'ni o'rnatish
echo ""
echo "🔧 Permissions'ni o'rnatish..."
chown -R deploy:deploy "$PUBLIC_DIR" 2>/dev/null || sudo chown -R deploy:deploy "$PUBLIC_DIR" || true
chmod -R 755 "$PUBLIC_DIR" 2>/dev/null || sudo chmod -R 755 "$PUBLIC_DIR" || true

if [ -d "$STANDALONE_PUBLIC" ]; then
    chown -R deploy:deploy "$STANDALONE_PUBLIC" 2>/dev/null || sudo chown -R deploy:deploy "$STANDALONE_PUBLIC" || true
    chmod -R 755 "$STANDALONE_PUBLIC" 2>/dev/null || sudo chmod -R 755 "$STANDALONE_PUBLIC" || true
fi

# 6. Fayllarni tekshirish
echo ""
echo "🧪 Fayllarni tekshirish..."
echo ""

# Public maps
if [ -f "$MAPS_DIR/countrymap.js" ]; then
    echo "✅ Public maps/countrymap.js topildi"
    ls -lh "$MAPS_DIR/countrymap.js"
else
    echo "❌ Public maps/countrymap.js topilmadi"
fi

# Standalone maps
if [ -f "$STANDALONE_MAPS/countrymap.js" ]; then
    echo "✅ Standalone maps/countrymap.js topildi"
    ls -lh "$STANDALONE_MAPS/countrymap.js"
else
    echo "❌ Standalone maps/countrymap.js topilmadi"
fi

# 7. HTTP test
echo ""
echo "🌐 HTTP test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://news.acoustic.uz/maps/countrymap.js 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 - countrymap.js muvaffaqiyatli yuklanmoqda!"
else
    echo "⚠️ HTTP $HTTP_CODE - countrymap.js yuklanmayapti"
    echo ""
    echo "   Muammo: Next.js standalone build'da public fayllar avtomatik ko'chirilmaydi"
    echo "   Yechim: Frontend'ni rebuild qilish va map fayllarini manual ko'chirish kerak"
fi

# 8. Nginx konfiguratsiyasini tekshirish
echo ""
echo "🔍 Nginx konfiguratsiyasini tekshirish..."
if [ -f "/etc/nginx/sites-available/news.acoustic.uz" ]; then
    echo "✅ Nginx config topildi"
    # Static fayllar uchun location tekshirish
    if grep -q "location /maps" /etc/nginx/sites-available/news.acoustic.uz 2>/dev/null; then
        echo "✅ /maps location mavjud"
    else
        echo "⚠️ /maps location topilmadi"
        echo "   Nginx config'ga /maps location qo'shish kerak bo'lishi mumkin"
    fi
else
    echo "⚠️ Nginx config topilmadi"
fi

echo ""
echo "✅ Yakunlandi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo ""
echo "1. Agar map fayllari hali ham topilmasa:"
echo "   cd /var/www/news.acoustic.uz"
echo "   git pull origin main"
echo "   # Map fayllarini tekshirish"
echo "   ls -la apps/frontend/public/maps/"
echo ""
echo "2. Frontend'ni rebuild qilish:"
echo "   cd /var/www/news.acoustic.uz"
echo "   export NODE_ENV=production"
echo "   export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api"
echo "   export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz"
echo "   pnpm --filter @acoustic/shared build"
echo "   pm2 stop acoustic-frontend"
echo "   rm -rf apps/frontend/.next"
echo "   pnpm --filter @acoustic/frontend build"
echo "   mkdir -p apps/frontend/.next/standalone/apps/frontend/public/maps"
echo "   cp -r apps/frontend/public/maps/* apps/frontend/.next/standalone/apps/frontend/public/maps/"
echo "   sudo chown -R deploy:deploy apps/frontend/.next"
echo "   sudo chmod -R 755 apps/frontend/.next"
echo "   pm2 restart acoustic-frontend"
echo ""
echo "3. Nginx'ni reload qilish:"
echo "   sudo systemctl reload nginx"

