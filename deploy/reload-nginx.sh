#!/bin/bash

# Serverda Nginx'ni reload qilish

set -e

# Server ma'lumotlari
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-your-server-ip}"

# SSH key path (agar mavjud bo'lsa)
SSH_KEY="${SSH_KEY:-}"
SSH_OPTS=""
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="-i $SSH_KEY"
fi

echo "🔄 Nginx'ni reload qilish..."
echo ""

# Server IP'ni so'rash (agar o'rnatilmagan bo'lsa)
if [ "$SERVER_HOST" = "your-server-ip" ]; then
    read -p "Server IP yoki hostname kiriting: " SERVER_HOST
    if [ -z "$SERVER_HOST" ]; then
        echo "❌ Server IP kiritilmadi!"
        exit 1
    fi
fi

# Nginx'ni reload qilish
echo "📋 Server: $SERVER_USER@$SERVER_HOST"
echo ""

ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "systemctl reload nginx" || {
    echo "⚠️ Nginx reload xatosi, sudo bilan urinib ko'rish..."
    ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "sudo systemctl reload nginx"
}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Nginx muvaffaqiyatli reload qilindi!"
    echo ""
    echo "🧪 Test qilish..."
    
    # Panorama faylini test qilish
    TEST_FILE="2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.acoustic.uz/uploads/$TEST_FILE" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ HTTP 200 - Fayl muvaffaqiyatli yuklanmoqda!"
        echo ""
        echo "🎉 Barcha o'zgarishlar muvaffaqiyatli amalga oshirildi!"
        echo ""
        echo "📋 Keyingi qadamlar:"
        echo "   1. Browser'da cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)"
        echo "   2. Panorama sahifasini yangilang"
        echo "   3. Rasmlar endi yuklanishi kerak!"
    else
        echo "   ⚠️ HTTP $HTTP_CODE - Nginx cache'ni tozalash kerak bo'lishi mumkin"
    fi
else
    echo ""
    echo "❌ Nginx reload qilinmadi!"
    exit 1
fi


