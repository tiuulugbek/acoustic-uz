#!/bin/bash
# Update backend code and restart

set -e

echo "🔄 Updating backend..."

cd /var/www/news.acoustic.uz

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# 3. Wait a bit for backend to start
sleep 2

# 4. Check backend status
echo "📋 Checking backend status..."
pm2 status acoustic-backend

# 5. Check backend logs
echo ""
echo "📋 Recent backend logs (last 20 lines):"
pm2 logs acoustic-backend --lines 20 --nostream | tail -20

echo ""
echo "✅ Backend updated and restarted!"
echo ""
echo "📋 To check backend logs in real-time:"
echo "   pm2 logs acoustic-backend --lines 0 | grep -i amocrm"

