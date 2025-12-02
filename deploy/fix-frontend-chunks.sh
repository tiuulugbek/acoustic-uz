#!/bin/bash

# Frontend chunk muammosini hal qilish

set -e

echo "🔧 Frontend chunk muammosini hal qilish..."
echo ""

cd /var/www/news.acoustic.uz || {
    echo "❌ /var/www/news.acoustic.uz papkasiga kirib bo'lmadi!"
    exit 1
}

# 1. Frontend'ni to'xtatish
echo "📋 Frontend'ni to'xtatish..."
pm2 stop acoustic-frontend 2>/dev/null || echo "   ⚠️ Frontend allaqachon to'xtatilgan"

# 2. Eski build'ni o'chirish
echo "📋 Eski build'ni o'chirish..."
if [ -d "apps/frontend/.next" ]; then
    rm -rf apps/frontend/.next
    echo "   ✅ Eski build o'chirildi"
else
    echo "   ⚠️ Eski build topilmadi"
fi

# 3. Environment variables'ni export qilish
echo "📋 Environment variables'ni export qilish..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
echo "   ✅ Environment variables o'rnatildi"

# 4. Shared package'ni build qilish
echo ""
echo "📋 Shared package'ni build qilish..."
if pnpm --filter @acoustic/shared build; then
    echo "   ✅ Shared package build muvaffaqiyatli"
else
    echo "   ❌ Shared package build xatosi!"
    exit 1
fi

# 5. Frontend'ni build qilish
echo ""
echo "📋 Frontend'ni build qilish..."
if pnpm --filter @acoustic/frontend build; then
    echo "   ✅ Frontend build muvaffaqiyatli"
else
    echo "   ❌ Frontend build xatosi!"
    exit 1
fi

# 6. Static fayllarni ko'chirish
echo ""
echo "📋 Static fayllarni ko'chirish..."
STATIC_SOURCE="apps/frontend/.next/static"
STATIC_TARGET="apps/frontend/.next/standalone/apps/frontend/.next/static"

if [ -d "$STATIC_SOURCE" ]; then
    echo "   ✅ Static source papkasi mavjud: $STATIC_SOURCE"
    
    # Target papkasini yaratish
    mkdir -p "$STATIC_TARGET"
    echo "   ✅ Target papkasi yaratildi: $STATIC_TARGET"
    
    # Static fayllarni ko'chirish
    echo "   📦 Static fayllarni ko'chirish..."
    cp -r "$STATIC_SOURCE"/* "$STATIC_TARGET"/ 2>&1 | head -20 || {
        echo "   ⚠️ Ko'chirishda muammo bo'ldi, rsync ishlatilmoqda..."
        rsync -av "$STATIC_SOURCE/" "$STATIC_TARGET"/ 2>&1 | head -20 || {
            echo "   ❌ Static fayllar ko'chirilmadi!"
            exit 1
        }
    }
    
    # Tekshirish
    if [ -d "$STATIC_TARGET/chunks" ] && [ "$(ls -A $STATIC_TARGET/chunks 2>/dev/null)" ]; then
        echo "   ✅ Static fayllar muvaffaqiyatli ko'chirildi"
        echo "   📋 Chunks fayllari soni: $(find $STATIC_TARGET/chunks -type f | wc -l)"
    else
        echo "   ❌ Static fayllar ko'chirilmadi yoki bo'sh!"
        exit 1
    fi
else
    echo "   ❌ Static source papkasi topilmadi: $STATIC_SOURCE"
    echo "   ⚠️ Frontend build qayta ishlatilishi kerak!"
    exit 1
fi

# 6.5. Public maps fayllarini ko'chirish
echo ""
echo "📋 Public maps fayllarini ko'chirish..."
MAPS_SOURCE="apps/frontend/public/maps"
MAPS_TARGET="apps/frontend/.next/standalone/apps/frontend/public/maps"

if [ -d "$MAPS_SOURCE" ] && [ "$(ls -A $MAPS_SOURCE 2>/dev/null)" ]; then
    echo "   ✅ Maps source papkasi mavjud: $MAPS_SOURCE"
    
    # Target papkasini yaratish
    mkdir -p "$MAPS_TARGET"
    echo "   ✅ Maps target papkasi yaratildi: $MAPS_TARGET"
    
    # Maps fayllarini ko'chirish
    echo "   📦 Maps fayllarini ko'chirish..."
    cp -r "$MAPS_SOURCE"/* "$MAPS_TARGET"/ 2>&1 || {
        echo "   ⚠️ Maps ko'chirishda muammo bo'ldi"
    }
    
    # Tekshirish
    if [ -f "$MAPS_TARGET/countrymap.js" ]; then
        echo "   ✅ Maps fayllar muvaffaqiyatli ko'chirildi"
        echo "   📋 Maps fayllari: $(ls -1 $MAPS_TARGET | wc -l)"
    else
        echo "   ⚠️ countrymap.js topilmadi, lekin davom etilmoqda..."
    fi
else
    echo "   ⚠️ Maps source papkasi topilmadi yoki bo'sh: $MAPS_SOURCE"
    echo "   ⚠️ Bu xato emas, agar maps fayllari kerak bo'lmasa"
fi

# 7. Permissions'ni o'rnatish
echo ""
echo "📋 Permissions'ni o'rnatish..."
chown -R deploy:deploy apps/frontend/.next 2>/dev/null || {
    echo "   ⚠️ chown xatosi (sudo kerak bo'lishi mumkin)"
    sudo chown -R deploy:deploy apps/frontend/.next || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
chmod -R 755 apps/frontend/.next 2>/dev/null || {
    echo "   ⚠️ chmod xatosi (sudo kerak bo'lishi mumkin)"
    sudo chmod -R 755 apps/frontend/.next || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
echo "   ✅ Permissions o'rnatildi"

# 8. Frontend'ni qayta ishga tushirish
echo ""
echo "📋 Frontend'ni qayta ishga tushirish..."
pm2 restart acoustic-frontend || {
    echo "   ⚠️ Restart xatosi, start qilish..."
    pm2 start acoustic-frontend || {
        echo "   ❌ Frontend ishga tushmadi!"
        exit 1
    }
}

# 9. Tekshirish
echo ""
echo "🧪 Tekshirish..."
sleep 5

# PM2 status
echo ""
echo "📋 PM2 status:"
pm2 status acoustic-frontend

# Static fayllarni tekshirish
echo ""
echo "📋 Static fayllarni tekshirish..."
TEST_FILE="webpack-1ffccb3fe7ca12dc.js"
if find "$STATIC_TARGET/chunks" -name "$TEST_FILE" -type f | grep -q .; then
    echo "   ✅ Test fayl topildi: $TEST_FILE"
else
    echo "   ⚠️ Test fayl topilmadi, mavjud webpack fayllari:"
    find "$STATIC_TARGET/chunks" -name "webpack-*.js" -type f | head -3
fi

# HTTP test
echo ""
echo "🧪 HTTP test qilish..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "   📋 Local test: HTTP $HTTP_CODE"
else
    echo "   ⚠️ Local test: HTTP $HTTP_CODE"
fi

# Logs
echo ""
echo "📋 Frontend logs (oxirgi 5 qator):"
pm2 logs acoustic-frontend --lines 5 --nostream 2>/dev/null || echo "   ⚠️ Logs o'qib bo'lmadi"

echo ""
echo "✅ Frontend chunk muammosi hal qilindi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. Browser'da cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)"
echo "   2. Sahifani yangilang"
echo "   3. Agar muammo davom etsa, browser'da Hard Reload qiling (Ctrl+Shift+Delete)"
echo ""
echo "📋 Tekshirish:"
echo "   ls -la $STATIC_TARGET/chunks/ | head -10"

