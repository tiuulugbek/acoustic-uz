#!/bin/bash

# apps/backend/uploads papkasidagi barcha fayllarni serverga ko'chirish

set -e

# Server ma'lumotlari
SERVER_USER="${SERVER_USER:-deploy}"
SERVER_HOST="${SERVER_HOST:-your-server-ip}"
SERVER_PATH="/var/www/news.acoustic.uz/apps/backend/uploads"

# Local uploads papkasi
LOCAL_UPLOADS="./apps/backend/uploads"

echo "📦 Barcha uploads fayllarini serverga ko'chirish..."
echo ""

# Uploads papkasini tekshirish
if [ ! -d "$LOCAL_UPLOADS" ]; then
    echo "❌ Uploads papkasi topilmadi: $LOCAL_UPLOADS"
    exit 1
fi

echo "✅ Uploads papkasi topildi: $LOCAL_UPLOADS"
echo ""

# Fayllarni ko'rsatish
FILE_COUNT=$(find "$LOCAL_UPLOADS" -type f | wc -l | tr -d ' ')
echo "📋 Topilgan fayllar soni: $FILE_COUNT"
echo ""
echo "📋 Fayllar ro'yxati:"
ls -lh "$LOCAL_UPLOADS" | tail -n +2 | head -20
if [ "$FILE_COUNT" -gt 20 ]; then
    echo "   ... va yana $((FILE_COUNT - 20)) ta fayl"
fi

# Server IP'ni so'rash (agar o'rnatilmagan bo'lsa)
if [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo ""
    read -p "Server IP yoki hostname kiriting: " SERVER_HOST
    if [ -z "$SERVER_HOST" ]; then
        echo "❌ Server IP kiritilmadi!"
        exit 1
    fi
fi

# Serverda uploads papkasini yaratish
echo ""
echo "📁 Serverda uploads papkasini yaratish..."
ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH && chmod 755 $SERVER_PATH" || {
    echo "⚠️ Serverda papka yaratishda muammo bo'ldi (ehtimol mavjud)"
}

# Fayllarni ko'chirish
echo ""
echo "📤 Fayllarni ko'chirish..."
echo "   Bu biroz vaqt olishi mumkin..."

# rsync ishlatish (agar mavjud bo'lsa) - tezroq va samaraliroq
if command -v rsync &> /dev/null; then
    echo "   rsync ishlatilmoqda..."
    rsync -avz --progress "$LOCAL_UPLOADS/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/" || {
        echo "❌ rsync xatosi, scp ishlatilmoqda..."
        # rsync ishlamasa, scp ishlatish
        scp -r "$LOCAL_UPLOADS"/* "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    }
else
    echo "   scp ishlatilmoqda..."
    scp -r "$LOCAL_UPLOADS"/* "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Barcha fayllar muvaffaqiyatli ko'chirildi!"
    
    # Serverda permissions'ni o'rnatish
    echo ""
    echo "🔧 Serverda permissions'ni o'rnatish..."
    ssh "$SERVER_USER@$SERVER_HOST" "chown -R deploy:deploy $SERVER_PATH && chmod -R 755 $SERVER_PATH" || {
        echo "⚠️ Permissions o'rnatishda muammo bo'ldi (sudo kerak bo'lishi mumkin)"
    }
    
    # Serverda fayllarni tekshirish
    echo ""
    echo "🧪 Serverda fayllarni tekshirish..."
    SERVER_FILE_COUNT=$(ssh "$SERVER_USER@$SERVER_HOST" "find $SERVER_PATH -type f | wc -l" | tr -d ' ')
    echo "   Serverda fayllar soni: $SERVER_FILE_COUNT"
    
    if [ "$SERVER_FILE_COUNT" -eq "$FILE_COUNT" ]; then
        echo "   ✅ Barcha fayllar ko'chirildi!"
    else
        echo "   ⚠️ Fayllar soni mos kelmayapti (local: $FILE_COUNT, server: $SERVER_FILE_COUNT)"
    fi
    
    # Panorama faylini test qilish
    echo ""
    echo "🧪 Panorama faylini test qilish..."
    TEST_FILE="2025-11-29-1764426305776-img_20251129_192205_430-atdibi.jpg"
    if ssh "$SERVER_USER@$SERVER_HOST" "test -f $SERVER_PATH/$TEST_FILE"; then
        echo "   ✅ Panorama fayl topildi: $TEST_FILE"
        
        # HTTP test
        echo ""
        echo "🌐 HTTP test qilish..."
        HTTP_CODE=$(ssh "$SERVER_USER@$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' https://api.acoustic.uz/uploads/$TEST_FILE" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ HTTP 200 - Fayl muvaffaqiyatli yuklanmoqda!"
        else
            echo "   ⚠️ HTTP $HTTP_CODE - Nginx'ni reload qilish kerak bo'lishi mumkin"
        fi
    else
        echo "   ❌ Panorama fayl topilmadi: $TEST_FILE"
    fi
    
    echo ""
    echo "✅ Ko'chirish yakunlandi!"
    echo ""
    echo "📋 Keyingi qadamlar:"
    echo "   1. Serverda Nginx'ni reload qiling: sudo systemctl reload nginx"
    echo "   2. Browser'da cache'ni tozalang va sahifani yangilang"
    echo "   3. Panorama sahifasini tekshiring"
else
    echo ""
    echo "❌ Fayllar ko'chirilmadi!"
    exit 1
fi

