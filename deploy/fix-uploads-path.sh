#!/bin/bash

# Backend uploads papkasini topish va Nginx'ni to'g'rilash

set -e

echo "🔍 Backend uploads papkasini qidirish..."

# 1. Backend process'ning working directory'sini topish
BACKEND_PID=$(pm2 pid acoustic-backend 2>/dev/null || echo "")

if [ -z "$BACKEND_PID" ]; then
    echo "❌ Backend process topilmadi!"
    exit 1
fi

echo "✅ Backend PID: $BACKEND_PID"

# 2. Backend'ning working directory'sini topish
BACKEND_CWD=$(sudo readlink -f /proc/$BACKEND_PID/cwd 2>/dev/null || echo "")
if [ -z "$BACKEND_CWD" ]; then
    # Alternative: PM2'dan olish
    BACKEND_CWD=$(pm2 describe acoustic-backend | grep "cwd" | awk '{print $4}' || echo "")
fi

if [ -z "$BACKEND_CWD" ]; then
    echo "⚠️ Backend CWD topilmadi, default path ishlatilmoqda..."
    BACKEND_CWD="/var/www/news.acoustic.uz/apps/backend"
fi

echo "📋 Backend CWD: $BACKEND_CWD"

# 3. Backend uploads papkasini topish
BACKEND_UPLOADS="$BACKEND_CWD/uploads"
NGINX_UPLOADS="/var/www/news.acoustic.uz/uploads"

echo ""
echo "📋 Backend uploads path: $BACKEND_UPLOADS"
echo "📋 Nginx uploads path: $NGINX_UPLOADS"

# 4. Backend uploads papkasini tekshirish
if [ -d "$BACKEND_UPLOADS" ]; then
    echo "✅ Backend uploads papkasi mavjud: $BACKEND_UPLOADS"
    echo ""
    echo "📋 Backend uploads papkasidagi fayllar:"
    ls -lh "$BACKEND_UPLOADS" | head -20
    
    # Panorama faylini qidirish
    echo ""
    echo "🔍 Panorama faylini qidirish..."
    find "$BACKEND_UPLOADS" -name "*img_20251129_192205_430*" -type f 2>/dev/null | head -5
else
    echo "❌ Backend uploads papkasi topilmadi: $BACKEND_UPLOADS"
fi

# 5. Nginx uploads papkasini tekshirish
if [ -d "$NGINX_UPLOADS" ]; then
    echo ""
    echo "✅ Nginx uploads papkasi mavjud: $NGINX_UPLOADS"
    echo ""
    echo "📋 Nginx uploads papkasidagi fayllar:"
    ls -lh "$NGINX_UPLOADS" | head -20
else
    echo ""
    echo "❌ Nginx uploads papkasi topilmadi: $NGINX_UPLOADS"
fi

# 6. Agar backend uploads boshqa joyda bo'lsa, symlink yoki copy qilish
if [ -d "$BACKEND_UPLOADS" ] && [ "$BACKEND_UPLOADS" != "$NGINX_UPLOADS" ]; then
    echo ""
    echo "⚠️ Backend va Nginx uploads papkalari boshqacha!"
    echo ""
    echo "Yechim variantlari:"
    echo "1. Symlink yaratish (tavsiya etiladi):"
    echo "   sudo rm -rf $NGINX_UPLOADS"
    echo "   sudo ln -s $BACKEND_UPLOADS $NGINX_UPLOADS"
    echo ""
    echo "2. Nginx konfiguratsiyasini o'zgartirish:"
    echo "   Nginx'da location /uploads ni $BACKEND_UPLOADS ga yo'naltirish"
    echo ""
    echo "3. Backend'ni Nginx uploads papkasiga yuklash uchun sozlash:"
    echo "   .env faylida UPLOAD_DIR ni o'rnatish"
    
    # Symlink yaratishni taklif qilish
    read -p "Symlink yaratishni xohlaysizmi? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Symlink yaratilmoqda..."
        sudo rm -rf "$NGINX_UPLOADS"
        sudo ln -s "$BACKEND_UPLOADS" "$NGINX_UPLOADS"
        sudo chown -h deploy:deploy "$NGINX_UPLOADS" 2>/dev/null || true
        echo "✅ Symlink yaratildi!"
    fi
fi

# 7. Nginx konfiguratsiyasini tekshirish
echo ""
echo "📋 Nginx konfiguratsiyasini tekshirish..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

if [ -f "$NGINX_CONFIG" ]; then
    CURRENT_ALIAS=$(grep -A 1 "location /uploads" "$NGINX_CONFIG" | grep "alias" | awk '{print $2}' | tr -d ';' || echo "")
    echo "   Current alias: $CURRENT_ALIAS"
    
    if [ -n "$CURRENT_ALIAS" ] && [ "$CURRENT_ALIAS" != "$NGINX_UPLOADS" ]; then
        echo "   ⚠️ Nginx alias boshqacha: $CURRENT_ALIAS"
    fi
fi

echo ""
echo "✅ Tekshiruv yakunlandi!"


