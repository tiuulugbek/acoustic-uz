#!/bin/bash

# Static fayllarni tekshirish

set -e

echo "🔍 Static fayllarni tekshirish..."
echo ""

cd /var/www/news.acoustic.uz

# 1. Static fayllar mavjudligini tekshirish
echo "📋 Static fayllar mavjudligini tekshirish..."
STATIC_PATH="apps/frontend/.next/standalone/apps/frontend/.next/static"

if [ -d "$STATIC_PATH" ]; then
    echo "✅ Static papkasi mavjud: $STATIC_PATH"
    echo ""
    echo "📋 Static papkasidagi fayllar:"
    ls -la "$STATIC_PATH" | head -20
    
    # Chunks papkasini tekshirish
    if [ -d "$STATIC_PATH/chunks" ]; then
        echo ""
        echo "✅ Chunks papkasi mavjud"
        echo "📋 Chunks papkasidagi fayllar:"
        ls -la "$STATIC_PATH/chunks" | head -20
        
        # Test faylni qidirish
        TEST_FILE="webpack-1ffccb3fe7ca12dc.js"
        if find "$STATIC_PATH/chunks" -name "$TEST_FILE" -type f | grep -q .; then
            echo ""
            echo "✅ Test fayl topildi: $TEST_FILE"
            find "$STATIC_PATH/chunks" -name "$TEST_FILE" -type f | head -1
        else
            echo ""
            echo "❌ Test fayl topilmadi: $TEST_FILE"
            echo "📋 Mavjud webpack fayllari:"
            find "$STATIC_PATH/chunks" -name "webpack-*.js" -type f | head -5
        fi
    else
        echo "❌ Chunks papkasi topilmadi!"
    fi
    
    # CSS fayllarini tekshirish
    if [ -d "$STATIC_PATH/css" ]; then
        echo ""
        echo "✅ CSS papkasi mavjud"
        echo "📋 CSS papkasidagi fayllar:"
        ls -la "$STATIC_PATH/css" | head -10
    else
        echo "❌ CSS papkasi topilmadi!"
    fi
else
    echo "❌ Static papkasi topilmadi: $STATIC_PATH"
    echo ""
    echo "📋 .next papkasini tekshirish..."
    if [ -d "apps/frontend/.next" ]; then
        echo "✅ .next papkasi mavjud"
        ls -la apps/frontend/.next | head -10
        
        # Standalone papkasini tekshirish
        if [ -d "apps/frontend/.next/standalone" ]; then
            echo ""
            echo "✅ Standalone papkasi mavjud"
            find apps/frontend/.next/standalone -type d -name "static" | head -5
        else
            echo "❌ Standalone papkasi topilmadi!"
        fi
        
        # Static papkasini tekshirish
        if [ -d "apps/frontend/.next/static" ]; then
            echo ""
            echo "✅ Static papkasi mavjud (standalone tashqarida)"
            echo "📋 Static fayllarni standalone ga ko'chirish kerak!"
        else
            echo "❌ Static papkasi topilmadi!"
        fi
    else
        echo "❌ .next papkasi topilmadi! Frontend build qilish kerak!"
    fi
fi

# 2. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Nginx konfiguratsiyasi mavjud: $NGINX_CONFIG"
    echo ""
    echo "📋 _next/static location konfiguratsiyasi:"
    grep -A 10 "location /_next/static" "$NGINX_CONFIG" || echo "   Topilmadi!"
else
    echo "❌ Nginx konfiguratsiyasi topilmadi!"
fi

# 3. Test qilish
echo ""
echo "🧪 Test qilish..."
TEST_FILE="webpack-1ffccb3fe7ca12dc.js"

# Local'da faylni qidirish
LOCAL_FILE=$(find "$STATIC_PATH/chunks" -name "$TEST_FILE" -type f 2>/dev/null | head -1)
if [ -n "$LOCAL_FILE" ]; then
    echo "✅ Local fayl topildi: $LOCAL_FILE"
    
    # HTTP test
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://news.acoustic.uz/_next/static/chunks/$TEST_FILE" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ HTTP 200 - Fayl muvaffaqiyatli yuklanmoqda!"
    else
        echo "❌ HTTP $HTTP_CODE - Fayl yuklanmayapti!"
        echo "   Nginx konfiguratsiyasini tekshirish kerak"
    fi
else
    echo "❌ Local fayl topilmadi: $TEST_FILE"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"

