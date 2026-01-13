#!/bin/bash
# Check full AmoCRM backend logs

echo "📋 Checking full AmoCRM backend logs..."
echo ""

echo "=== Recent AmoCRM logs ==="
pm2 logs acoustic-backend --lines 100 --nostream | grep -i "amocrm\|oauth\|authorize" | tail -30

echo ""
echo "=== Recent errors ==="
pm2 logs acoustic-backend --lines 100 --nostream | grep -i "error\|failed\|405" | tail -20

echo ""
echo "=== Authorization endpoint logs ==="
pm2 logs acoustic-backend --lines 200 --nostream | grep -A 5 -B 5 "amocrm/authorize" | tail -30

