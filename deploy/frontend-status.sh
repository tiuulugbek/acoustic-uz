#!/bin/bash
# Acoustic.uz Frontend - Status Script

PID_FILE="/tmp/acoustic-frontend.pid"
LOG_FILE="/tmp/acoustic-frontend.log"

echo "=== Frontend Holati ==="
echo ""

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Process ishlamoqda (PID: $PID)"
        echo ""
        echo "📊 Process ma'lumotlari:"
        ps -p "$PID" -o pid,user,%cpu,%mem,etime,cmd | head -2
        echo ""
        if curl -s -I http://127.0.0.1:3000 2>&1 | head -1 | grep -q "200\|301\|302"; then
            echo "✅✅✅ HTTP ISHLAYAPTI!"
            curl -s -I http://127.0.0.1:3000 2>&1 | head -3
        else
            echo "⚠️ HTTP javob bermayapti"
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
    if ps aux | grep -E "node server.js|npm start" | grep -v grep > /dev/null; then
        echo "⚠️ Lekin frontend process'lar topildi:"
        ps aux | grep -E "node server.js|npm start" | grep -v grep
    fi
fi
