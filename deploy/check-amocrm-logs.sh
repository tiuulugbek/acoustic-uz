#!/bin/bash
# Check AmoCRM backend logs

echo "📋 Checking AmoCRM backend logs..."
pm2 logs acoustic-backend --lines 50 --nostream | grep -i "amocrm\|oauth\|authorize" || echo "No AmoCRM logs found"

echo ""
echo "📋 Checking recent backend errors..."
pm2 logs acoustic-backend --lines 100 --nostream | tail -20

