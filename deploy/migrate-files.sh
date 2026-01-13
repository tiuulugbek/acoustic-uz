#!/bin/bash

# Local fayllarni serverga ko'chirish

set -e

echo "📁 Local fayllarni serverga ko'chirish..."

# 1. Server ma'lumotlarini so'rash
read -p "Server IP yoki hostname: " SERVER_HOST
read -p "Server user (default: root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}
read -p "Server path (default: /var/www/news.acoustic.uz): " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-/var/www/news.acoustic.uz}

# 2. Uploads papkasini ko'chirish
echo ""
echo "📤 Uploads papkasini ko'chirish..."
if [ -d "uploads" ]; then
    echo "✅ Uploads papkasi topildi!"
    echo "📦 Uploads papkasini serverga yuborish..."
    
    # Tar archive yaratish
    TAR_FILE="uploads-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$TAR_FILE" uploads/ || {
        echo "❌ Tar archive yaratish xatosi!"
        exit 1
    }
    
    echo "✅ Archive yaratildi: $TAR_FILE"
    ls -lh "$TAR_FILE"
    
    # Serverga yuborish
    echo "📤 Serverga yuborish..."
    scp "$TAR_FILE" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/" || {
        echo "❌ Serverga yuborish xatosi!"
        exit 1
    }
    
    echo "✅ Uploads papkasi serverga yuborildi!"
    echo ""
    echo "💡 Serverda quyidagi buyruqlarni bajaring:"
    echo "   cd $SERVER_PATH"
    echo "   tar -xzf $TAR_FILE"
    echo "   sudo chown -R deploy:deploy uploads"
    echo "   sudo chmod -R 755 uploads"
else
    echo "⚠️ Uploads papkasi topilmadi!"
fi

# 3. Public papkasini ko'chirish (agar kerak bo'lsa)
echo ""
echo "📤 Public papkasini ko'chirish..."
if [ -d "apps/frontend/public" ]; then
    echo "✅ Public papkasi topildi!"
    echo "📦 Public papkasini serverga yuborish..."
    
    # Tar archive yaratish
    TAR_FILE="public-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$TAR_FILE" apps/frontend/public/ || {
        echo "❌ Tar archive yaratish xatosi!"
        exit 1
    }
    
    echo "✅ Archive yaratildi: $TAR_FILE"
    ls -lh "$TAR_FILE"
    
    # Serverga yuborish
    echo "📤 Serverga yuborish..."
    scp "$TAR_FILE" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/" || {
        echo "❌ Serverga yuborish xatosi!"
        exit 1
    }
    
    echo "✅ Public papkasi serverga yuborildi!"
    echo ""
    echo "💡 Serverda quyidagi buyruqlarni bajaring:"
    echo "   cd $SERVER_PATH"
    echo "   tar -xzf $TAR_FILE"
    echo "   sudo chown -R deploy:deploy apps/frontend/public"
else
    echo "⚠️ Public papkasi topilmadi!"
fi

echo ""
echo "✅ Fayllar ko'chirish yakunlandi!"

