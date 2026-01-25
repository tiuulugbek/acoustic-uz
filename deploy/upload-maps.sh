#!/bin/bash

# Map fayllarini serverga ko'chirish

set -e

# Server ma'lumotlari
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-152.53.229.176}"
SERVER_PATH="/var/www/news.acoustic.uz/apps/frontend/public/maps"

# SSH key path (agar mavjud bo'lsa)
SSH_KEY="${SSH_KEY:-}"
SSH_OPTS=""
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="-i $SSH_KEY"
fi

# Local maps papkasi
LOCAL_MAPS="./apps/frontend/public/maps"

echo "🗺️ Map fayllarini serverga ko'chirish..."
echo ""

# Maps papkasini tekshirish
if [ ! -d "$LOCAL_MAPS" ]; then
    echo "❌ Maps papkasi topilmadi: $LOCAL_MAPS"
    exit 1
fi

echo "✅ Maps papkasi topildi: $LOCAL_MAPS"
echo ""

# Fayllarni ko'rsatish
FILE_COUNT=$(find "$LOCAL_MAPS" -type f | wc -l | tr -d ' ')
echo "📋 Topilgan fayllar soni: $FILE_COUNT"
echo ""
echo "📋 Fayllar ro'yxati:"
ls -lh "$LOCAL_MAPS" | tail -n +2

# Serverda maps papkasini yaratish
echo ""
echo "📁 Serverda maps papkasini yaratish..."
ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH && chmod 755 $SERVER_PATH" || {
    echo "⚠️ Serverda papka yaratishda muammo bo'ldi"
    echo "   SSH key yoki parol muammosi bo'lishi mumkin"
    exit 1
}

# Fayllarni ko'chirish
echo ""
echo "📤 Fayllarni ko'chirish..."
echo "   Bu biroz vaqt olishi mumkin..."

# rsync ishlatish (agar mavjud bo'lsa) - tezroq va samaraliroq
if command -v rsync &> /dev/null; then
    echo "   rsync ishlatilmoqda..."
    rsync -avz $SSH_OPTS --progress "$LOCAL_MAPS/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/" || {
        echo "❌ rsync xatosi!"
        exit 1
    }
else
    echo "   scp ishlatilmoqda..."
    scp $SSH_OPTS -r "$LOCAL_MAPS"/* "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/" || {
        echo "❌ scp xatosi!"
        exit 1
    }
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Barcha map fayllar muvaffaqiyatli ko'chirildi!"
    
    # Serverda permissions'ni o'rnatish
    echo ""
    echo "🔧 Serverda permissions'ni o'rnatish..."
    ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "chown -R deploy:deploy $SERVER_PATH && chmod -R 755 $SERVER_PATH" || {
        echo "⚠️ Permissions o'rnatishda muammo bo'ldi (sudo kerak bo'lishi mumkin)"
    }
    
    # Serverda fayllarni tekshirish
    echo ""
    echo "🧪 Serverda fayllarni tekshirish..."
    SERVER_FILE_COUNT=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "find $SERVER_PATH -type f | wc -l" | tr -d ' ')
    echo "   Serverda fayllar soni: $SERVER_FILE_COUNT"
    
    if [ "$SERVER_FILE_COUNT" -eq "$FILE_COUNT" ]; then
        echo "   ✅ Barcha fayllar ko'chirildi!"
    else
        echo "   ⚠️ Fayllar soni mos kelmayapti (local: $FILE_COUNT, server: $SERVER_FILE_COUNT)"
    fi
    
    # countrymap.js faylini test qilish
    echo ""
    echo "🧪 countrymap.js faylini test qilish..."
    if ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "test -f $SERVER_PATH/countrymap.js"; then
        echo "   ✅ countrymap.js topildi!"
        
        # HTTP test
        echo ""
        echo "🌐 HTTP test qilish..."
        HTTP_CODE=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' https://news.acoustic.uz/maps/countrymap.js" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ HTTP 200 - Fayl muvaffaqiyatli yuklanmoqda!"
        else
            echo "   ⚠️ HTTP $HTTP_CODE - Nginx'ni reload qilish kerak bo'lishi mumkin"
        fi
    else
        echo "   ❌ countrymap.js topilmadi!"
    fi
    
    echo ""
    echo "✅ Ko'chirish yakunlandi!"
else
    echo ""
    echo "❌ Fayllar ko'chirilmadi!"
    exit 1
fi

