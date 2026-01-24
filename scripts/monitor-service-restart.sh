#!/bin/bash

# Service restart monitoring va backup yuborish
# Bu script systemd service o'chib yonishini kuzatadi va backup yuboradi

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
LOG_FILE="/var/log/acoustic-service-monitor.log"
STATE_FILE="/var/lib/acoustic-service-state.txt"
SERVICE_NAME="pm2-acoustic"

# Log funksiyasi
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# .env faylini yuklash
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(grep -v '^#' "$BACKEND_DIR/.env" | grep -E '^(DATABASE_URL|TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)=' | xargs)
else
    log "❌ .env fayl topilmadi: $BACKEND_DIR/.env"
    exit 1
fi

# Telegram chat ID'larni ajratish
if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    log "❌ TELEGRAM_CHAT_ID topilmadi"
    exit 1
fi

# Service status'ni tekshirish
check_service_status() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "active"
    else
        echo "inactive"
    fi
}

# Avvalgi status'ni o'qish
previous_status="unknown"
if [ -f "$STATE_FILE" ]; then
    previous_status=$(cat "$STATE_FILE" 2>/dev/null || echo "unknown")
fi

# Hozirgi status
current_status=$(check_service_status)

# Service o'chib qolganida xabar yuborish
if [ "$current_status" != "active" ]; then
    # Faqat birinchi marta yoki status o'zgarganda xabar yuborish
    if [ "$previous_status" == "active" ] || [ "$previous_status" == "unknown" ]; then
        log "⚠️  Service o'chib qoldi: $SERVICE_NAME"
        
        # Telegram'ga xabar yuborish
        MESSAGE="⚠️ <b>Service o'chib qoldi!</b>

🔴 <b>Service ishlamayapti</b>
📅 Vaqt: $(date '+%Y-%m-%d %H:%M:%S')
🔧 Service: $SERVICE_NAME
📊 Status: $current_status

⚠️ Service avtomatik qayta yonishi kerak (10 soniyadan keyin)"

        # Chat ID'larni ajratish va har biriga yuborish
        IFS=',' read -ra CHAT_IDS <<< "$TELEGRAM_CHAT_ID"
        for chat_id in "${CHAT_IDS[@]}"; do
            chat_id=$(echo "$chat_id" | xargs) # Trim whitespace
            
            curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
                -d "chat_id=$chat_id" \
                -d "text=$(echo "$MESSAGE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')" \
                -d "parse_mode=HTML" > /dev/null 2>&1 || true
            
            log "✅ Xabar yuborildi (service o'chib qoldi): chat_id=$chat_id"
        done
    fi
fi

# Status o'zgardi va service yonib qoldi
if [ "$previous_status" != "active" ] && [ "$current_status" == "active" ]; then
    log "🔄 Service yonib qoldi: $SERVICE_NAME"
    
    # Telegram'ga service yonib qolgani haqida xabar yuborish
    MESSAGE="✅ <b>Service qayta yonib qoldi</b>

🟢 <b>Service ishlayapti</b>
📅 Vaqt: $(date '+%Y-%m-%d %H:%M:%S')
🔧 Service: $SERVICE_NAME
📊 Status: $current_status"

    # Chat ID'larni ajratish va har biriga yuborish
    IFS=',' read -ra CHAT_IDS <<< "$TELEGRAM_CHAT_ID"
    for chat_id in "${CHAT_IDS[@]}"; do
        chat_id=$(echo "$chat_id" | xargs) # Trim whitespace
        
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$chat_id" \
            -d "text=$(echo "$MESSAGE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')" \
            -d "parse_mode=HTML" > /dev/null 2>&1 || true
        
        log "✅ Xabar yuborildi (service yonib qoldi): chat_id=$chat_id"
    done
    
    # Backup yaratish va yuborish
    log "📦 Backup yaratilmoqda..."
    
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    BACKUP_FILE="$BACKUP_DIR/restart-backup-$TIMESTAMP.sql.gz"
    
    # Database backup
    if pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE" 2>/dev/null; then
        BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
        
        if [ "$BACKUP_SIZE" -gt 200 ]; then
            log "✅ Backup yaratildi: $BACKUP_FILE ($(numfmt --to=iec-i --suffix=B $BACKUP_SIZE 2>/dev/null || echo "$BACKUP_SIZE bytes"))"
            
            # Telegram'ga backup xabari yuborish
            MESSAGE="📦 <b>Backup yaratildi</b>

✅ Service qayta yonib qoldi va backup yaratildi
📅 Vaqt: $(date '+%Y-%m-%d %H:%M:%S')
💾 Fayl: restart-backup-$TIMESTAMP.sql.gz
📊 Hajm: $(numfmt --to=iec-i --suffix=B $BACKUP_SIZE 2>/dev/null || echo "$BACKUP_SIZE bytes")
🔧 Service: $SERVICE_NAME"

            # Chat ID'larni ajratish va har biriga yuborish
            IFS=',' read -ra CHAT_IDS <<< "$TELEGRAM_CHAT_ID"
            for chat_id in "${CHAT_IDS[@]}"; do
                chat_id=$(echo "$chat_id" | xargs) # Trim whitespace
                
                # Xabar yuborish
                curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
                    -d "chat_id=$chat_id" \
                    -d "text=$(echo "$MESSAGE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')" \
                    -d "parse_mode=HTML" > /dev/null 2>&1 || true
                
                # Fayl yuborish (agar 50MB dan kichik bo'lsa)
                if [ "$BACKUP_SIZE" -lt 52428800 ]; then
                    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" \
                        -F "chat_id=$chat_id" \
                        -F "document=@$BACKUP_FILE" \
                        -F "caption=🔄 Service restart backup" > /dev/null 2>&1 || true
                else
                    # Katta fayl bo'lsa, chunk'larga bo'lish
                    log "📦 Katta fayl, chunk'larga bo'linmoqda..."
                    CHUNK_DIR="$BACKUP_DIR/chunks-$TIMESTAMP"
                    mkdir -p "$CHUNK_DIR"
                    
                    split -b 45M "$BACKUP_FILE" "$CHUNK_DIR/chunk_"
                    CHUNK_COUNT=$(ls -1 "$CHUNK_DIR" | wc -l)
                    
                    for chunk in "$CHUNK_DIR"/chunk_*; do
                        chunk_num=$(basename "$chunk" | sed 's/chunk_//')
                        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" \
                            -F "chat_id=$chat_id" \
                            -F "document=@$chunk" \
                            -F "caption=📦 Chunk $chunk_num/$CHUNK_COUNT" > /dev/null 2>&1 || true
                        sleep 1
                    done
                    
                    # Reassembly ko'rsatmasi
                    REASSEMBLY_MSG="📦 <b>Fayl chunk'larga bo'lingan</b>

🔧 <b>Qayta yig'ish:</b>
cat chunk_* > backup.sql.gz

📊 Chunk'lar soni: $CHUNK_COUNT"
                    
                    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
                        -d "chat_id=$chat_id" \
                        -d "text=$(echo "$REASSEMBLY_MSG" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')" \
                        -d "parse_mode=HTML" > /dev/null 2>&1 || true
                    
                    # Chunk'lar papkasini o'chirish
                    rm -rf "$CHUNK_DIR"
                fi
                
                log "✅ Backup yuborildi: chat_id=$chat_id"
            done
            
            # Eski backup'larni o'chirish (7 kundan eski)
            find "$BACKUP_DIR" -name "restart-backup-*.sql.gz" -mtime +7 -delete 2>/dev/null || true
        else
            log "❌ Backup hajmi juda kichik: $BACKUP_SIZE bytes"
        fi
    else
        log "❌ Backup yaratishda xatolik"
    fi
fi

# Status'ni saqlash
echo "$current_status" > "$STATE_FILE"
