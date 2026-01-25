#!/bin/bash
# Acoustic.uz Frontend - Doimiy ishga tushirish
# Bu script frontend'ni doimiy ishga tushirish uchun

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/root/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
LOG_FILE="/tmp/acoustic-frontend.log"
PID_FILE="/tmp/acoustic-frontend.pid"

cd "$FRONTEND_DIR"

export NODE_ENV=production
export PORT=3000
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz

# Eski process'larni to'xtatish
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Eski process to'xtatilmoqda (PID: $OLD_PID)"
        kill "$OLD_PID" 2>/dev/null
        sleep 2
        kill -9 "$OLD_PID" 2>/dev/null
    fi
fi

pkill -f "next start" 2>/dev/null
sleep 2

# Frontend'ni ishga tushirish
echo "Frontend ishga tushirilmoqda... (Port 3000)"
nohup node_modules/.bin/next start > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 5

# Tekshirish
if ps -p "$NEW_PID" > /dev/null 2>&1; then
    echo "✅ Frontend muvaffaqiyatli ishga tushdi (PID: $NEW_PID)"
    echo "📝 Log: $LOG_FILE"
    echo "🔄 Qayta ishga tushirish: $0"
    exit 0
else
    echo "❌ Frontend ishga tushmadi. Loglarni tekshiring: $LOG_FILE"
    tail -20 "$LOG_FILE"
    exit 1
fi
