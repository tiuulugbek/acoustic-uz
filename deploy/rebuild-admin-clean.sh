#!/bin/bash
# Clean rebuild of admin panel with cache clearing

set -e

echo "🔧 Clean rebuilding admin panel..."

cd /var/www/news.acoustic.uz

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# 3. Clean all build artifacts and caches
echo "🧹 Cleaning build artifacts..."
rm -rf apps/admin/dist
rm -rf apps/admin/node_modules/.vite
rm -rf node_modules/.cache
rm -rf .turbo

# 4. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 5. Build admin with clean cache
echo "🏗️  Building admin (clean build)..."
pnpm --filter @acoustic/admin build

# 6. Check if build succeeded
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin build successful!"
    echo "📁 Build files:"
    ls -la apps/admin/dist/ | head -10
    
    # Check build timestamp
    echo ""
    echo "📅 Build timestamp:"
    stat -c "%y" apps/admin/dist/index.html 2>/dev/null || stat -f "%Sm" apps/admin/dist/index.html 2>/dev/null || echo "Cannot get timestamp"
else
    echo "❌ Admin build failed!"
    exit 1
fi

# 7. Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# 8. Wait a bit for backend to start
sleep 2

# 9. Check backend status
echo "📋 Checking backend status..."
pm2 status acoustic-backend

echo ""
echo "✅ Clean rebuild complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clear browser cache COMPLETELY:"
echo "   - Chrome: Settings → Privacy → Clear browsing data → 'Cached images and files'"
echo "   - Or use Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)"
echo "2. Or open in incognito/private mode"
echo "3. Try 'AmoCRM'ga ulanish' button again"
echo ""
echo "📋 To check backend logs in real-time:"
echo "   pm2 logs acoustic-backend --lines 0 | grep -i amocrm"

