#!/bin/bash
set -e
PROD_DIR="/var/www/acoustic.uz"
echo "🚀 Production Deployment..."
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "next.*3002" 2>/dev/null || true
sleep 2
cd "$PROD_DIR"
export PM2_HOME=/root/.pm2
pm2 kill 2>/dev/null || true
sleep 2
pm2 delete all 2>/dev/null || true
sleep 1
pm2 start deploy/ecosystem.config.js
sleep 3
pm2 save
pm2 list
echo "✅ Done!"
