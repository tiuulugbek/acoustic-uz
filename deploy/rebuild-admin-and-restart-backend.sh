#!/bin/bash
# Rebuild admin panel and restart backend

set -e

echo "🔧 Rebuilding admin panel and restarting backend..."

cd /var/www/news.acoustic.uz

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 4. Build admin
echo "🏗️  Building admin..."
pnpm --filter @acoustic/admin build

# 5. Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# 6. Wait a bit for backend to start
sleep 2

# 7. Check backend status
echo "📋 Checking backend status..."
pm2 status acoustic-backend

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Or open in incognito/private mode"
echo "3. Try 'AmoCRM'ga ulanish' button again"
echo ""
echo "📋 To check backend logs in real-time:"
echo "   pm2 logs acoustic-backend --lines 0 | grep -i amocrm"

