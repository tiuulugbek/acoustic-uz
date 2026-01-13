#!/bin/bash
# Complete fix for AmoCRM 405 error

set -e

echo "🔧 Fixing AmoCRM 405 error..."

cd /var/www/news.acoustic.uz

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# 3. Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# 4. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 5. Build admin
echo "🏗️  Building admin..."
pnpm --filter @acoustic/admin build

# 6. Check if build succeeded
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin build successful!"
    echo "📁 Build files:"
    ls -la apps/admin/dist/ | head -10
else
    echo "❌ Admin build failed!"
    exit 1
fi

# 7. Check backend logs
echo "📋 Checking backend logs..."
pm2 logs acoustic-backend --lines 20 --nostream | grep -i "amocrm\|redirect" || echo "No AmoCRM logs found"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Or open in incognito/private mode"
echo "3. Try 'AmoCRM'ga ulanish' button again"
echo ""
echo "📋 To check backend logs in real-time:"
echo "   pm2 logs acoustic-backend --lines 0 | grep -i amocrm"

