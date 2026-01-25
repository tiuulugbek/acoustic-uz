#!/bin/bash
# Acoustic.uz Frontend - Background Start Script

PROJECT_DIR="/root/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
LOG_FILE="/tmp/acoustic-frontend.log"
PID_FILE="/tmp/acoustic-frontend.pid"

cd "$FRONTEND_DIR"

# Environment variables
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

pkill -f "node server.js" 2>/dev/null
pkill -f "npm start" 2>/dev/null
sleep 2

# Frontend'ni fonda ishga tushirish
echo "Frontend fonda ishga tushirilmoqda... (Port 3000)"
nohup npm start > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 8

# Tekshirish
if ps -p "$NEW_PID" > /dev/null 2>&1; then
    if curl -s -I http://127.0.0.1:3000 2>&1 | head -1 | grep -q "200\|301\|302"; then
        echo "✅ Frontend muvaffaqiyatli fonda ishga tushdi!"
        echo "📝 PID: $NEW_PID"
        echo "📝 Log: $LOG_FILE"
        echo "🌐 URL: http://127.0.0.1:3000"
        echo ""
        echo "🔄 To'xtatish: kill $NEW_PID"
        echo "📊 Holatni ko'rish: tail -f $LOG_FILE"
        exit 0
    else
        echo "⚠️ Process ishlamoqda lekin HTTP javob bermayapti"
        tail -20 "$LOG_FILE"
        exit 1
    fi
else
    echo "❌ Frontend ishga tushmadi. Loglarni tekshiring: $LOG_FILE"
    tail -20 "$LOG_FILE"
    exit 1
fi
