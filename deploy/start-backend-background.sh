#!/bin/bash
# Acoustic.uz Backend - Background Start Script

PROJECT_DIR="/root/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
LOG_FILE="/tmp/acoustic-backend.log"
PID_FILE="/tmp/acoustic-backend.pid"

cd "$BACKEND_DIR"

# Environment variables - .env fayldan o'qish
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Qo'shimcha environment variables
export NODE_ENV=production
export PORT=3001
export UPLOADS_DIR="/root/acoustic.uz/apps/backend/uploads"

echo "Backend ishga tushirilmoqda..."
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

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

pkill -f "node.*dist/main.js" 2>/dev/null
sleep 2

# Backend'ni fonda ishga tushirish
echo "Backend fonda ishga tushirilmoqda... (Port 3001)"
nohup node dist/main.js > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 15

# Tekshirish
if ps -p "$NEW_PID" > /dev/null 2>&1; then
    sleep 5
    if curl -s http://localhost:3001/api/settings?lang=uz > /dev/null 2>&1; then
        echo "✅ Backend muvaffaqiyatli fonda ishga tushdi!"
        echo "📝 PID: $NEW_PID"
        echo "📝 Log: $LOG_FILE"
        echo "🌐 URL: http://localhost:3001/api"
        echo ""
        echo "🔄 To'xtatish: ./deploy/stop-backend.sh"
        echo "📊 Holatni ko'rish: ./deploy/backend-status.sh"
        echo "📝 Loglarni ko'rish: tail -f $LOG_FILE"
        exit 0
    else
        echo "⚠️ Process ishlamoqda lekin API javob bermayapti"
        echo "📝 Loglarni tekshiring: $LOG_FILE"
        tail -40 "$LOG_FILE" | grep -E "listening|started|Nest|Application|error|Error|P1001|P1013" | tail -10
        exit 1
    fi
else
    echo "❌ Backend ishga tushmadi. Loglarni tekshiring: $LOG_FILE"
    tail -40 "$LOG_FILE" | grep -E "error|Error|Cannot find|P1001|P1013" | tail -10
    exit 1
fi
