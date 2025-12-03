#!/bin/bash
# Check AmoCRM backend logs in real-time

echo "📋 Checking AmoCRM backend logs..."
echo "Press Ctrl+C to stop"
echo ""

pm2 logs acoustic-backend --lines 0 | grep --line-buffered -i "amocrm\|oauth\|authorize\|redirect" || {
    echo "No AmoCRM logs found. Showing recent logs:"
    pm2 logs acoustic-backend --lines 50 --nostream | tail -20
}

