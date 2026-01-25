#!/bin/bash
# Acoustic.uz Backend - Stop Script

PID_FILE="/tmp/acoustic-backend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Backend to'xtatilmoqda (PID: $PID)..."
        kill "$PID" 2>/dev/null
        sleep 2
        kill -9 "$PID" 2>/dev/null
        rm -f "$PID_FILE"
        echo "✅ Backend to'xtatildi"
    else
        echo "⚠️ Process topilmadi (PID: $PID)"
        rm -f "$PID_FILE"
    fi
else
    echo "⚠️ PID fayl topilmadi"
fi

pkill -f "node.*dist/main.js" 2>/dev/null
echo "✅ Barcha backend process'lar to'xtatildi"
