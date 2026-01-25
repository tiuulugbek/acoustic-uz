#!/bin/bash
# Acoustic.uz Frontend - Stop Script

PID_FILE="/tmp/acoustic-frontend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Frontend to'xtatilmoqda (PID: $PID)..."
        kill "$PID" 2>/dev/null
        sleep 2
        kill -9 "$PID" 2>/dev/null
        rm -f "$PID_FILE"
        echo "✅ Frontend to'xtatildi"
    else
        echo "⚠️ Process topilmadi (PID: $PID)"
        rm -f "$PID_FILE"
    fi
else
    echo "⚠️ PID fayl topilmadi"
fi

pkill -f "node server.js" 2>/dev/null
pkill -f "npm start" 2>/dev/null
echo "✅ Barcha frontend process'lar to'xtatildi"
