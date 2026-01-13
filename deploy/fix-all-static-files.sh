#!/bin/bash

# Barcha static fayllarni to'liq hal qilish (chunks, CSS, maps)

set -e

echo "🔧 Barcha static fayllarni to'liq hal qilish..."
echo ""

cd /var/www/news.acoustic.uz || {
    echo "❌ /var/www/news.acoustic.uz papkasiga kirib bo'lmadi!"
    exit 1
}

# 1. Git pull
echo "📥 Git pull qilish..."
git pull origin main || {
    echo "⚠️ Git pull xatosi, davom etilmoqda..."
}

# 2. Environment variables
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# 3. Shared build
echo ""
echo "📦 Shared build qilish..."
pnpm --filter @acoustic/shared build || {
    echo "⚠️ Shared build xatosi!"
    exit 1
}

# 4. Frontend'ni to'liq rebuild qilish
echo ""
echo "📦 Frontend'ni rebuild qilish..."
pm2 stop acoustic-frontend || true

echo "   Eski .next papkasini o'chirish..."
rm -rf apps/frontend/.next

echo "   Frontend build qilish..."
pnpm --filter @acoustic/frontend build || {
    echo "❌ Frontend build xatosi!"
    exit 1
}

# 5. Static fayllarni ko'chirish
echo ""
echo "📋 Static fayllarni ko'chirish..."
STATIC_SOURCE="apps/frontend/.next/static"
STATIC_TARGET="apps/frontend/.next/standalone/apps/frontend/.next/static"

if [ ! -d "$STATIC_SOURCE" ]; then
    echo "❌ Static source papkasi topilmadi: $STATIC_SOURCE"
    exit 1
fi

echo "   ✅ Static source papkasi mavjud: $STATIC_SOURCE"

mkdir -p "$STATIC_TARGET"

# Eski fayllarni o'chirish
if [ -d "$STATIC_TARGET" ] && [ "$(ls -A $STATIC_TARGET 2>/dev/null)" ]; then
    echo "   Eski static fayllarni o'chirish..."
    rm -rf "$STATIC_TARGET"/*
fi

# Static fayllarni ko'chirish
echo "   📦 Static fayllarni ko'chirish..."
cp -r "$STATIC_SOURCE"/* "$STATIC_TARGET"/ || {
    echo "   ⚠️ cp xatosi, rsync ishlatilmoqda..."
    rsync -av "$STATIC_SOURCE/" "$STATIC_TARGET"/ || {
        echo "   ❌ Static fayllar ko'chirilmadi!"
        exit 1
    }
}

# 6. Map fayllarini ko'chirish
echo ""
echo "📋 Map fayllarini ko'chirish..."
MAPS_SOURCE="apps/frontend/public/maps"
MAPS_TARGET="apps/frontend/.next/standalone/apps/frontend/public/maps"

if [ -d "$MAPS_SOURCE" ] && [ "$(ls -A $MAPS_SOURCE 2>/dev/null)" ]; then
    echo "   ✅ Map fayllari topildi: $MAPS_SOURCE"
    mkdir -p "$MAPS_TARGET"
    cp -r "$MAPS_SOURCE"/* "$MAPS_TARGET"/ || {
        echo "   ⚠️ Map fayllari ko'chirilmadi!"
    }
    echo "   ✅ Map fayllari ko'chirildi"
else
    echo "   ⚠️ Map fayllari topilmadi: $MAPS_SOURCE"
fi

# 7. Permissions'ni o'rnatish
echo ""
echo "📋 Permissions'ni o'rnatish..."
chown -R deploy:deploy apps/frontend/.next 2>/dev/null || {
    sudo chown -R deploy:deploy apps/frontend/.next || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
chmod -R 755 apps/frontend/.next 2>/dev/null || {
    sudo chmod -R 755 apps/frontend/.next || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
echo "   ✅ Permissions o'rnatildi"

# 8. Tekshirish
echo ""
echo "🧪 Tekshirish..."

# Chunks tekshirish
if [ -d "$STATIC_TARGET/chunks" ]; then
    CHUNKS_COUNT=$(find "$STATIC_TARGET/chunks" -type f | wc -l)
    echo "   ✅ Chunks papkasi mavjud: $CHUNKS_COUNT fayl"
    
    # Test faylni qidirish
    TEST_FILE="webpack-*.js"
    if find "$STATIC_TARGET/chunks" -name "$TEST_FILE" -type f | head -1 | grep -q .; then
        echo "   ✅ Webpack fayl topildi"
    else
        echo "   ⚠️ Webpack fayl topilmadi, mavjud fayllar:"
        find "$STATIC_TARGET/chunks" -name "*.js" -type f | head -5
    fi
else
    echo "   ❌ Chunks papkasi topilmadi!"
    exit 1
fi

# CSS tekshirish
if [ -d "$STATIC_TARGET/css" ]; then
    CSS_COUNT=$(find "$STATIC_TARGET/css" -type f | wc -l)
    echo "   ✅ CSS papkasi mavjud: $CSS_COUNT fayl"
else
    echo "   ⚠️ CSS papkasi topilmadi!"
fi

# Map fayllarini tekshirish
if [ -f "$MAPS_TARGET/countrymap.js" ]; then
    echo "   ✅ Map fayli topildi: countrymap.js"
else
    echo "   ⚠️ Map fayli topilmadi: countrymap.js"
fi

# 9. PM2'ni restart qilish
echo ""
echo "📋 PM2'ni restart qilish..."
pm2 restart acoustic-frontend || {
    echo "   ⚠️ Restart xatosi, start qilish..."
    pm2 start acoustic-frontend || {
        echo "   ❌ Frontend ishga tushmadi!"
        exit 1
    }
}

# 10. Tekshirish
echo ""
echo "🧪 HTTP test qilish..."
sleep 3

# Local test
echo "📋 Local test..."
LOCAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [ "$LOCAL_CODE" = "200" ]; then
    echo "   ✅ Local test muvaffaqiyatli! (HTTP $LOCAL_CODE)"
else
    echo "   ⚠️ Local test: HTTP $LOCAL_CODE"
fi

# HTTPS test
echo "📋 HTTPS test..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "   ✅ HTTPS test muvaffaqiyatli! (HTTP $HTTPS_CODE)"
else
    echo "   ⚠️ HTTPS test: HTTP $HTTPS_CODE"
    echo "   Nginx'ni reload qilish kerak bo'lishi mumkin"
fi

# Map test
echo "📋 Map test..."
MAP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz/maps/countrymap.js" 2>/dev/null || echo "000")
if [ "$MAP_CODE" = "200" ]; then
    echo "   ✅ Map test muvaffaqiyatli! (HTTP $MAP_CODE)"
else
    echo "   ⚠️ Map test: HTTP $MAP_CODE"
fi

# 11. Nginx'ni reload qilish
echo ""
echo "📋 Nginx'ni reload qilish..."
sudo systemctl reload nginx || {
    echo "   ⚠️ Reload xatosi!"
}

# 12. Final test
echo ""
echo "🧪 Final test..."
sleep 2
FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [ "$FINAL_CODE" = "200" ]; then
    echo "   ✅ Final test muvaffaqiyatli! (HTTP $FINAL_CODE)"
    echo ""
    echo "🎉 Barcha static fayllar muvaffaqiyatli ko'chirildi va ishlayapti!"
else
    echo "   ⚠️ Final test: HTTP $FINAL_CODE"
    echo "   Browser'da cache'ni tozalash kerak bo'lishi mumkin"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. Browser'da cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)"
echo "   2. Hard Reload qiling (Ctrl+Shift+Delete)"
echo "   3. Sahifani yangilang"

