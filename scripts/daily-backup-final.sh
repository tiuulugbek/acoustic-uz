#!/bin/bash

# Har kunlik database backup va Telegram botga yuborish skripti
# psql connection string orqali backup yaratish

# Database konfiguratsiyasi
DATABASE_URL="postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb"

# Backup papkasi
BACKUP_DIR="/root/acoustic.uz/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/acousticwebdb_${DATE}.sql.gz"

# Telegram bot konfiguratsiyasi
ENV_FILE="/root/acoustic.uz/apps/backend/.env"
TELEGRAM_BOT_TOKEN="8460957603:AAFTv7EIdgwSunJCOlAmklb07HLYO81NdUs"
TELEGRAM_CHAT_IDS="280034232"

# .env fayldan Telegram Chat ID larni o'qish (bir nechta Chat ID vergul bilan ajratilgan bo'lishi mumkin)
if [ -f "$ENV_FILE" ]; then
    ENV_CHAT_IDS=$(grep "^TELEGRAM_CHAT_ID=" "$ENV_FILE" | tail -1 | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "")
    if [ -n "$ENV_CHAT_IDS" ] && [ "$ENV_CHAT_IDS" != "" ]; then
        TELEGRAM_CHAT_IDS="$ENV_CHAT_IDS"
    fi
fi

# Chat ID larni massivga ajratish (vergul bilan ajratilgan)
IFS=',' read -ra CHAT_ID_ARRAY <<< "$TELEGRAM_CHAT_IDS"

# Backup papkasini yaratish
mkdir -p "$BACKUP_DIR"

# Eski backup'larni o'chirish (30 kundan eski)
find "$BACKUP_DIR" -name "acousticwebdb_*.sql.gz" -mtime +30 -delete 2>/dev/null || true

# Database backup yaratish
echo "=== Database backup yaratilmoqda ==="
echo "Vaqt: $(date)"
echo "Fayl: $BACKUP_FILE"

# psql connection string orqali pg_dump'ni sinab ko'ramiz
BACKUP_EXIT_CODE=0

# pg_dump connection string bilan
if pg_dump "$DATABASE_URL" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    2>/tmp/pg_dump_error.log | gzip > "$BACKUP_FILE"; then
    
    BACKUP_EXIT_CODE=0
else
    BACKUP_EXIT_CODE=1
    echo "pg_dump xatolik, xatolik logi:"
    cat /tmp/pg_dump_error.log | head -10
fi

# Backup muvaffaqiyatli bo'ldimi tekshirish
if [ $BACKUP_EXIT_CODE -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
    
    # Agar backup juda kichik bo'lsa (xatolik bo'lishi mumkin)
    if [ "$FILE_SIZE_BYTES" -lt 1000 ]; then
        echo "❌ Backup hajmi juda kichik ($FILE_SIZE_BYTES bytes), xatolik bo'lishi mumkin"
        if [ -s /tmp/pg_dump_error.log ]; then
            echo "Xatolik: $(cat /tmp/pg_dump_error.log | head -3)"
        fi
        BACKUP_EXIT_CODE=1
    else
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "✅ Backup muvaffaqiyatli yaratildi: $BACKUP_FILE"
        echo "📦 Backup hajmi: $BACKUP_SIZE"
    fi
fi

if [ $BACKUP_EXIT_CODE -eq 0 ] && [ -f "$BACKUP_FILE" ] && [ "$FILE_SIZE_BYTES" -gt 1000 ]; then
    # Telegram botga yuborish (bir nechta Chat ID'ga)
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ ${#CHAT_ID_ARRAY[@]} -gt 0 ]; then
        echo "📤 Telegram botga yuborilmoqda... (${#CHAT_ID_ARRAY[@]} ta chat ID)"
        
        # Xabar yuborish
        MESSAGE="🗄️ Database Backup
📅 Sana: $(date '+%Y-%m-%d %H:%M:%S')
📦 Fayl: acousticwebdb_${DATE}.sql.gz
💾 Hajm: $BACKUP_SIZE
✅ Status: Muvaffaqiyatli"

        # Har bir Chat ID'ga xabar yuborish
        for CHAT_ID in "${CHAT_ID_ARRAY[@]}"; do
            CHAT_ID=$(echo "$CHAT_ID" | xargs)  # Bo'shliqlarni olib tashlash
            if [ -n "$CHAT_ID" ]; then
                curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                    -d chat_id="$CHAT_ID" \
                    -d text="$MESSAGE" > /dev/null
            fi
        done
        
        # Faylni yuborish (Telegram 50MB gacha fayl qabul qiladi)
        MAX_SIZE=$((50 * 1024 * 1024)) # 50MB
        CHUNK_SIZE=$((45 * 1024 * 1024)) # 45MB (xavfsizlik uchun 5MB qoldiramiz)
        
        if [ "$FILE_SIZE_BYTES" -lt "$MAX_SIZE" ]; then
            # Backup 50MB dan kichik - to'g'ridan-to'g'ri yuborish
            for CHAT_ID in "${CHAT_ID_ARRAY[@]}"; do
                CHAT_ID=$(echo "$CHAT_ID" | xargs)  # Bo'shliqlarni olib tashlash
                if [ -n "$CHAT_ID" ]; then
                    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" \
                        -F chat_id="$CHAT_ID" \
                        -F document=@"$BACKUP_FILE" \
                        -F caption="Database backup: $(date '+%Y-%m-%d %H:%M:%S')" > /dev/null
                fi
            done
            echo "✅ Backup ${#CHAT_ID_ARRAY[@]} ta Chat ID'ga Telegram bot orqali yuborildi"
        else
            # Backup 50MB dan katta - bo'laklarga bo'lib yuborish
            echo "📦 Backup hajmi 50MB dan katta, bo'laklarga bo'lib yuborilmoqda..."
            
            # Backup'ni bo'laklarga bo'lish
            TEMP_DIR="/tmp/backup_chunks_$$"
            mkdir -p "$TEMP_DIR"
            
            # split orqali bo'laklarga bo'lish (45MB bo'laklar)
            split -b ${CHUNK_SIZE} -d "$BACKUP_FILE" "${TEMP_DIR}/backup_chunk_"
            
            CHUNK_COUNT=$(ls -1 "${TEMP_DIR}"/backup_chunk_* 2>/dev/null | wc -l)
            
            # Har bir Chat ID'ga xabar yuborish
            for CHAT_ID in "${CHAT_ID_ARRAY[@]}"; do
                CHAT_ID=$(echo "$CHAT_ID" | xargs)  # Bo'shliqlarni olib tashlash
                if [ -n "$CHAT_ID" ]; then
                    # Bo'laklar haqida xabar
                    CHUNK_MESSAGE="📦 Backup bo'laklarga bo'lingan
📅 Sana: $(date '+%Y-%m-%d %H:%M:%S')
📦 Fayl: acousticwebdb_${DATE}.sql.gz
💾 Umumiy hajm: $BACKUP_SIZE
🔢 Bo'laklar soni: $CHUNK_COUNT
📤 Bo'laklar yuborilmoqda..."

                    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                        -d chat_id="$CHAT_ID" \
                        -d text="$CHUNK_MESSAGE" > /dev/null
                    
                    # Har bir bo'lakni yuborish
                    CHUNK_NUM=0
                    for CHUNK_FILE in "${TEMP_DIR}"/backup_chunk_*; do
                        if [ -f "$CHUNK_FILE" ]; then
                            CHUNK_NUM=$((CHUNK_NUM + 1))
                            CHUNK_SIZE_H=$(du -h "$CHUNK_FILE" | cut -f1)
                            
                            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" \
                                -F chat_id="$CHAT_ID" \
                                -F document=@"$CHUNK_FILE" \
                                -F caption="Backup bo'lagi $CHUNK_NUM/$CHUNK_COUNT ($CHUNK_SIZE_H) - acousticwebdb_${DATE}.sql.gz.part$CHUNK_NUM" > /dev/null
                            
                            # Har bir bo'lakdan keyin biroz kutish (rate limit uchun)
                            sleep 1
                        fi
                    done
                    
                    # Birlashtirish ko'rsatmasi
                    MERGE_INSTRUCTION="✅ Barcha bo'laklar yuborildi!

📋 Birlashtirish uchun:
1. Barcha bo'laklarni yuklab oling
2. Terminal'da quyidagi buyruqni bajaring:

cat backup_chunk_* > acousticwebdb_${DATE}.sql.gz

Yoki Windows'da:
copy /b backup_chunk_* acousticwebdb_${DATE}.sql.gz

Keyin gunzip bilan oching:
gunzip acousticwebdb_${DATE}.sql.gz"
                    
                    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                        -d chat_id="$CHAT_ID" \
                        -d text="$MERGE_INSTRUCTION" > /dev/null
                fi
            done
            
            # Vaqtinchalik fayllarni o'chirish
            rm -rf "$TEMP_DIR"
            
            echo "✅ Backup $CHUNK_COUNT ta bo'lakka bo'lib ${#CHAT_ID_ARRAY[@]} ta Chat ID'ga yuborildi"
        fi
    else
        echo "⚠️  Telegram Chat ID topilmadi"
    fi
    
    exit 0
else
    echo "❌ Backup yaratishda xatolik!"
    
    # Xatolik haqida Telegram botga xabar (har bir Chat ID'ga)
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ ${#CHAT_ID_ARRAY[@]} -gt 0 ]; then
        ERROR_DETAILS="Noma'lum xatolik"
        if [ -s /tmp/pg_dump_error.log ]; then
            ERROR_DETAILS=$(head -3 /tmp/pg_dump_error.log | tr '\n' ' ' | head -c 200)
        fi
        
        ERROR_TEXT="❌ Database backup xatolik
📅 Sana: $(date '+%Y-%m-%d %H:%M:%S')
🔍 Xatolik: $ERROR_DETAILS
💡 Iltimos, server loglarini tekshiring"
        
        for CHAT_ID in "${CHAT_ID_ARRAY[@]}"; do
            CHAT_ID=$(echo "$CHAT_ID" | xargs)  # Bo'shliqlarni olib tashlash
            if [ -n "$CHAT_ID" ]; then
                curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                    -d chat_id="$CHAT_ID" \
                    -d text="$ERROR_TEXT" > /dev/null
            fi
        done
    fi
    
    exit 1
fi
