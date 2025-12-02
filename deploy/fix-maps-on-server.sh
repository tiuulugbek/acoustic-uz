#!/bin/bash

# Serverda map fayllarini to'g'rilash scripti
# Bu script serverda ishga tushirilishi kerak

set -e

echo "🗺️ Map fayllarini to'g'rilash..."
echo ""

# Frontend papkasi
FRONTEND_DIR="/var/www/news.acoustic.uz/apps/frontend"
PUBLIC_DIR="$FRONTEND_DIR/public"
MAPS_DIR="$PUBLIC_DIR/maps"

# 1. Git pull qilish
echo "📥 Git pull qilish..."
cd /var/www/news.acoustic.uz
git pull origin main || {
    echo "⚠️ Git pull xatosi, davom etilmoqda..."
}

# 2. Public papkasini yaratish
echo ""
echo "📁 Public papkasini yaratish..."
mkdir -p "$PUBLIC_DIR"
mkdir -p "$MAPS_DIR"

# 3. Map fayllarini ko'chirish
echo ""
echo "📤 Map fayllarini ko'chirish..."
if [ -d "$FRONTEND_DIR/public/maps" ]; then
    echo "✅ Map fayllari topildi: $FRONTEND_DIR/public/maps"
    
    # Fayllarni ko'rsatish
    FILE_COUNT=$(find "$FRONTEND_DIR/public/maps" -type f | wc -l | tr -d ' ')
    echo "📋 Topilgan fayllar soni: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "✅ Map fayllari mavjud!"
    else
        echo "⚠️ Map fayllari bo'sh!"
    fi
else
    echo "❌ Map fayllari topilmadi: $FRONTEND_DIR/public/maps"
    echo "   Git repoda map fayllari mavjudligini tekshiring"
fi

# 4. Standalone build'da ham map fayllarini ko'chirish
echo ""
echo "📤 Standalone build'ga map fayllarini ko'chirish..."
STANDALONE_PUBLIC="$FRONTEND_DIR/.next/standalone/apps/frontend/public"
STANDALONE_MAPS="$STANDALONE_PUBLIC/maps"

if [ -d "$FRONTEND_DIR/.next/standalone" ]; then
    mkdir -p "$STANDALONE_MAPS"
    
    if [ -d "$MAPS_DIR" ] && [ "$(ls -A $MAPS_DIR 2>/dev/null)" ]; then
        cp -r "$MAPS_DIR"/* "$STANDALONE_MAPS/" 2>/dev/null || true
        echo "✅ Standalone build'ga map fayllari ko'chirildi!"
    else
        echo "⚠️ Map fayllari topilmadi, ko'chirilmadi"
    fi
else
    echo "⚠️ Standalone build topilmadi, ehtimol build qilinmagan"
fi

# 5. Permissions'ni o'rnatish
echo ""
echo "🔧 Permissions'ni o'rnatish..."
chown -R deploy:deploy "$PUBLIC_DIR" 2>/dev/null || true
chmod -R 755 "$PUBLIC_DIR" 2>/dev/null || true

if [ -d "$STANDALONE_PUBLIC" ]; then
    chown -R deploy:deploy "$STANDALONE_PUBLIC" 2>/dev/null || true
    chmod -R 755 "$STANDALONE_PUBLIC" 2>/dev/null || true
fi

# 6. Fayllarni tekshirish
echo ""
echo "🧪 Fayllarni tekshirish..."
if [ -f "$MAPS_DIR/countrymap.js" ]; then
    echo "✅ countrymap.js topildi: $MAPS_DIR/countrymap.js"
    ls -lh "$MAPS_DIR/countrymap.js"
else
    echo "❌ countrymap.js topilmadi: $MAPS_DIR/countrymap.js"
fi

if [ -f "$MAPS_DIR/mapdata.js" ]; then
    echo "✅ mapdata.js topildi: $MAPS_DIR/mapdata.js"
    ls -lh "$MAPS_DIR/mapdata.js"
else
    echo "❌ mapdata.js topilmadi: $MAPS_DIR/mapdata.js"
fi

# 7. HTTP test
echo ""
echo "🌐 HTTP test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://news.acoustic.uz/maps/countrymap.js || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 - countrymap.js muvaffaqiyatli yuklanmoqda!"
else
    echo "⚠️ HTTP $HTTP_CODE - countrymap.js yuklanmayapti"
    echo "   Nginx'ni reload qilish kerak bo'lishi mumkin"
fi

echo ""
echo "✅ Yakunlandi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. Agar map fayllari hali ham topilmasa, frontend'ni rebuild qiling:"
echo "      cd /var/www/news.acoustic.uz"
echo "      export NODE_ENV=production"
echo "      pnpm --filter @acoustic/frontend build"
echo ""
echo "   2. PM2'ni restart qiling:"
echo "      pm2 restart acoustic-frontend"
echo ""
echo "   3. Nginx'ni reload qiling:"
echo "      sudo systemctl reload nginx"

