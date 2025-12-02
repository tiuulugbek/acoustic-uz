#!/bin/bash

# Panorama faylini local'dan serverga ko'chirish

set -e

# Server ma'lumotlari
SERVER_USER="${SERVER_USER:-deploy}"
SERVER_HOST="${SERVER_HOST:-your-server-ip}"
SERVER_PATH="/var/www/news.acoustic.uz/apps/backend/uploads"

# Local fayl path
LOCAL_FILE="./apps/backend/uploads/2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"

echo "📦 Panorama faylini serverga ko'chirish..."
echo ""
echo "📋 Local file: $LOCAL_FILE"
echo "📋 Server: $SERVER_USER@$SERVER_HOST:$SERVER_PATH"
echo ""

# Faylni tekshirish
if [ ! -f "$LOCAL_FILE" ]; then
    echo "❌ Local fayl topilmadi: $LOCAL_FILE"
    exit 1
fi

echo "✅ Local fayl topildi: $LOCAL_FILE"
ls -lh "$LOCAL_FILE"

# Server IP'ni so'rash (agar o'rnatilmagan bo'lsa)
if [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo ""
    read -p "Server IP yoki hostname kiriting: " SERVER_HOST
    if [ -z "$SERVER_HOST" ]; then
        echo "❌ Server IP kiritilmadi!"
        exit 1
    fi
fi

# Faylni ko'chirish
echo ""
echo "📤 Faylni ko'chirish..."
scp "$LOCAL_FILE" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Fayl muvaffaqiyatli ko'chirildi!"
    echo ""
    echo "🧪 Serverda faylni tekshirish..."
    ssh "$SERVER_USER@$SERVER_HOST" "ls -lh $SERVER_PATH/2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"
    
    echo ""
    echo "✅ Tekshiruv yakunlandi!"
    echo ""
    echo "📋 Keyingi qadamlar:"
    echo "   1. Serverda Nginx'ni reload qiling: sudo systemctl reload nginx"
    echo "   2. Browser'da cache'ni tozalang va sahifani yangilang"
else
    echo "❌ Fayl ko'chirilmadi!"
    exit 1
fi


