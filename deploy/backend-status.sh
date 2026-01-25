#!/bin/bash
# Acoustic.uz Backend - Status Script

PID_FILE="/tmp/acoustic-backend.pid"
LOG_FILE="/tmp/acoustic-backend.log"

echo "=== Backend Holati ==="
echo ""

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Process ishlamoqda (PID: $PID)"
        echo ""
        echo "📊 Process ma'lumotlari:"
        ps -p "$PID" -o pid,user,%cpu,%mem,etime,cmd | head -2
        echo ""
        if curl -s http://localhost:3001/api/settings?lang=uz > /dev/null 2>&1; then
            echo "✅✅✅ API ISHLAYAPTI!"
            curl -s http://localhost:3001/api/settings?lang=uz | head -3
        else
            echo "⚠️ API javob bermayapti"
        fi
        echo ""
        echo "📝 Oxirgi loglar (10 qator):"
        tail -10 "$LOG_FILE" 2>/dev/null || echo "Log fayl topilmadi"
    else
        echo "❌ Process ishlamayapti (PID: $PID)"
        rm -f "$PID_FILE"
    fi
else
    echo "❌ PID fayl topilmadi"
    if ps aux | grep "node.*dist/main.js" | grep -v grep > /dev/null; then
        echo "⚠️ Lekin backend process'lar topildi:"
        ps aux | grep "node.*dist/main.js" | grep -v grep
    fi
fi
