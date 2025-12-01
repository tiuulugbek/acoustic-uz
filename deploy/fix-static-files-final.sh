#!/bin/bash

# Static fayllarni to'liq hal qilish

set -e

echo "🔧 Static fayllarni to'liq hal qilish..."
echo ""

cd /var/www/news.acoustic.uz || {
    echo "❌ /var/www/news.acoustic.uz papkasiga kirib bo'lmadi!"
    exit 1
}

# 1. Static fayllar mavjudligini tekshirish
echo "📋 Static fayllar mavjudligini tekshirish..."
STATIC_SOURCE="apps/frontend/.next/static"
STATIC_TARGET="apps/frontend/.next/standalone/apps/frontend/.next/static"

if [ ! -d "$STATIC_SOURCE" ]; then
    echo "❌ Static source papkasi topilmadi: $STATIC_SOURCE"
    echo "   Frontend'ni qayta build qilish kerak!"
    exit 1
fi

echo "   ✅ Static source papkasi mavjud: $STATIC_SOURCE"

# 2. Static fayllarni ko'chirish
echo ""
echo "📋 Static fayllarni ko'chirish..."
mkdir -p "$STATIC_TARGET"

# Eski fayllarni o'chirish (agar mavjud bo'lsa)
if [ -d "$STATIC_TARGET" ] && [ "$(ls -A $STATIC_TARGET 2>/dev/null)" ]; then
    echo "   Eski static fayllarni o'chirish..."
    rm -rf "$STATIC_TARGET"/*
fi

# Static fayllarni ko'chirish
echo "   📦 Static fayllarni ko'chirish..."
cp -r "$STATIC_SOURCE"/* "$STATIC_TARGET"/ 2>&1 | head -20 || {
    echo "   ⚠️ cp xatosi, rsync ishlatilmoqda..."
    rsync -av "$STATIC_SOURCE/" "$STATIC_TARGET"/ 2>&1 | head -20 || {
        echo "   ❌ Static fayllar ko'chirilmadi!"
        exit 1
    }
}

# 3. Tekshirish
echo ""
echo "📋 Static fayllarni tekshirish..."

# Chunks tekshirish
if [ -d "$STATIC_TARGET/chunks" ]; then
    CHUNKS_COUNT=$(find "$STATIC_TARGET/chunks" -type f | wc -l)
    echo "   ✅ Chunks papkasi mavjud: $CHUNKS_COUNT fayl"
    
    # Test faylni qidirish
    TEST_FILE="webpack-1ffccb3fe7ca12dc.js"
    if find "$STATIC_TARGET/chunks" -name "$TEST_FILE" -type f | grep -q .; then
        echo "   ✅ Test fayl topildi: $TEST_FILE"
    else
        echo "   ⚠️ Test fayl topilmadi, mavjud webpack fayllari:"
        find "$STATIC_TARGET/chunks" -name "webpack-*.js" -type f | head -3
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

# 4. Permissions'ni o'rnatish
echo ""
echo "📋 Permissions'ni o'rnatish..."
chown -R deploy:deploy "$STATIC_TARGET" 2>/dev/null || {
    sudo chown -R deploy:deploy "$STATIC_TARGET" || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
chmod -R 755 "$STATIC_TARGET" 2>/dev/null || {
    sudo chmod -R 755 "$STATIC_TARGET" || {
        echo "   ❌ Permissions o'rnatilmadi!"
        exit 1
    }
}
echo "   ✅ Permissions o'rnatildi"

# 5. Frontend'ni restart qilish
echo ""
echo "📋 Frontend'ni restart qilish..."
pm2 restart acoustic-frontend || {
    echo "   ⚠️ Restart xatosi, start qilish..."
    pm2 start acoustic-frontend || {
        echo "   ❌ Frontend ishga tushmadi!"
        exit 1
    }
}

# 6. Tekshirish
echo ""
echo "🧪 Tekshirish..."
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

# 7. Nginx'ni reload qilish
echo ""
echo "📋 Nginx'ni reload qilish..."
sudo systemctl reload nginx || {
    echo "   ⚠️ Reload xatosi!"
}

# 8. Final test
echo ""
echo "🧪 Final test..."
sleep 2
FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz/_next/static/chunks/webpack.js" 2>/dev/null || echo "000")
if [ "$FINAL_CODE" = "200" ]; then
    echo "   ✅ Final test muvaffaqiyatli! (HTTP $FINAL_CODE)"
    echo ""
    echo "🎉 Static fayllar muvaffaqiyatli ko'chirildi va ishlayapti!"
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

