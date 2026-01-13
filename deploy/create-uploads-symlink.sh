#!/bin/bash

# Backend uploads papkasini topish va symlink yaratish

set -e

echo "🔍 Backend uploads papkasini topish..."

# 1. PM2'dan backend'ning cwd'sini olish
BACKEND_CWD=$(pm2 describe acoustic-backend 2>/dev/null | grep "cwd" | awk '{print $4}' || echo "")

if [ -z "$BACKEND_CWD" ]; then
    # Fallback: default path
    BACKEND_CWD="/var/www/news.acoustic.uz/apps/backend"
    echo "⚠️ PM2'dan CWD topilmadi, default path ishlatilmoqda: $BACKEND_CWD"
else
    echo "✅ Backend CWD: $BACKEND_CWD"
fi

# 2. Backend uploads papkasini aniqlash
BACKEND_UPLOADS="$BACKEND_CWD/uploads"
NGINX_UPLOADS="/var/www/news.acoustic.uz/uploads"

echo ""
echo "📋 Backend uploads path: $BACKEND_UPLOADS"
echo "📋 Nginx uploads path: $NGINX_UPLOADS"

# 3. Backend uploads papkasini yaratish (agar mavjud bo'lmasa)
if [ ! -d "$BACKEND_UPLOADS" ]; then
    echo ""
    echo "📦 Backend uploads papkasini yaratish..."
    mkdir -p "$BACKEND_UPLOADS"
    chown -R deploy:deploy "$BACKEND_UPLOADS"
    echo "✅ Backend uploads papkasi yaratildi: $BACKEND_UPLOADS"
fi

# 4. Backend uploads papkasidagi fayllarni ko'rish
echo ""
echo "📋 Backend uploads papkasidagi fayllar:"
if [ -d "$BACKEND_UPLOADS" ]; then
    ls -lh "$BACKEND_UPLOADS" | head -20
    
    # Panorama faylini qidirish
    echo ""
    echo "🔍 Panorama faylini qidirish..."
    find "$BACKEND_UPLOADS" -name "*img_20251129_192205_430*" -type f 2>/dev/null | head -5
    find "$BACKEND_UPLOADS" -name "*2025-11-29-1764426305776*" -type f 2>/dev/null | head -5
else
    echo "❌ Backend uploads papkasi mavjud emas!"
fi

# 5. Nginx uploads papkasini tekshirish va symlink yaratish
echo ""
echo "📋 Nginx uploads papkasini tekshirish..."

if [ -L "$NGINX_UPLOADS" ]; then
    echo "✅ Symlink mavjud: $NGINX_UPLOADS"
    CURRENT_TARGET=$(readlink -f "$NGINX_UPLOADS")
    echo "   Current target: $CURRENT_TARGET"
    
    if [ "$CURRENT_TARGET" != "$BACKEND_UPLOADS" ]; then
        echo "⚠️ Symlink noto'g'ri papkaga yo'naltirilgan!"
        echo "   Symlinkni yangilash..."
        sudo rm -f "$NGINX_UPLOADS"
        sudo ln -s "$BACKEND_UPLOADS" "$NGINX_UPLOADS"
        sudo chown -h deploy:deploy "$NGINX_UPLOADS" 2>/dev/null || true
        echo "✅ Symlink yangilandi!"
    else
        echo "✅ Symlink to'g'ri!"
    fi
elif [ -d "$NGINX_UPLOADS" ]; then
    echo "⚠️ Nginx uploads papkasi mavjud (symlink emas)!"
    echo ""
    echo "📋 Nginx uploads papkasidagi fayllar:"
    ls -lh "$NGINX_UPLOADS" | head -20
    
    # Symlink yaratishni taklif qilish
    echo ""
    echo "Symlink yaratish uchun eski papkani o'chirish kerak."
    echo "Eski papkadagi fayllar backend uploads papkasiga ko'chiriladi."
    read -p "Davom etasizmi? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Fayllarni ko'chirish..."
        # Agar backend uploads bo'sh bo'lsa, nginx uploads'dan ko'chirish
        if [ -z "$(ls -A "$BACKEND_UPLOADS" 2>/dev/null)" ] && [ -n "$(ls -A "$NGINX_UPLOADS" 2>/dev/null)" ]; then
            echo "   Backend uploads bo'sh, fayllarni ko'chirish..."
            cp -r "$NGINX_UPLOADS"/* "$BACKEND_UPLOADS"/ 2>/dev/null || true
            chown -R deploy:deploy "$BACKEND_UPLOADS"
        fi
        
        echo "   Eski papkani o'chirish va symlink yaratish..."
        sudo rm -rf "$NGINX_UPLOADS"
        sudo ln -s "$BACKEND_UPLOADS" "$NGINX_UPLOADS"
        sudo chown -h deploy:deploy "$NGINX_UPLOADS" 2>/dev/null || true
        echo "✅ Symlink yaratildi!"
    fi
else
    echo "📦 Symlink yaratish..."
    sudo ln -s "$BACKEND_UPLOADS" "$NGINX_UPLOADS"
    sudo chown -h deploy:deploy "$NGINX_UPLOADS" 2>/dev/null || true
    echo "✅ Symlink yaratildi!"
fi

# 6. Permissions'ni tekshirish
echo ""
echo "📋 Permissions'ni tekshirish..."
ls -ld "$BACKEND_UPLOADS" 2>/dev/null || echo "❌ Backend uploads papkasi topilmadi"
ls -ld "$NGINX_UPLOADS" 2>/dev/null || echo "❌ Nginx uploads papkasi topilmadi"

# 7. Test qilish
echo ""
echo "🧪 Test qilish..."
TEST_FILE="2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"

if [ -f "$BACKEND_UPLOADS/$TEST_FILE" ]; then
    echo "✅ Test fayl topildi: $BACKEND_UPLOADS/$TEST_FILE"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.acoustic.uz/uploads/$TEST_FILE" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ URL muvaffaqiyatli yuklandi (HTTP $HTTP_CODE)"
    else
        echo "❌ URL yuklanmadi (HTTP $HTTP_CODE)"
        echo "   Nginx'ni reload qilish kerak bo'lishi mumkin"
    fi
else
    echo "⚠️ Test fayl topilmadi: $TEST_FILE"
    echo "   Bu fayl hali yuklanmagan bo'lishi mumkin"
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"


