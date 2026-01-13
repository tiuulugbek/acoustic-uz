#!/bin/bash

# Fix backend dependencies issue
# Usage: ./fix-backend-dependencies.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing backend dependencies..."
echo ""

cd "$PROJECT_DIR"

# 1. Stop PM2
echo "🛑 Stopping PM2..."
pm2 stop acoustic-backend 2>/dev/null || true

# 2. Clean node_modules
echo "🧹 Cleaning node_modules..."
cd "$PROJECT_DIR"
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# 3. Clean build directories
echo "🧹 Cleaning build directories..."
rm -rf apps/backend/dist apps/frontend/.next apps/admin/dist

# 4. Reinstall dependencies
echo "📦 Reinstalling dependencies..."
pnpm install --frozen-lockfile

# 5. Build shared package first
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build

# 6. Build backend
echo "🏗️  Building backend..."
pnpm --filter @acoustic/backend build

# 7. Check if build succeeded
if [ ! -f "apps/backend/dist/main.js" ]; then
    echo "❌ Backend build failed!"
    echo "  Check the build output above for errors"
    exit 1
fi

# 8. Restart PM2
echo "🚀 Restarting PM2..."
pm2 restart acoustic-backend || pm2 start ecosystem.config.js --only acoustic-backend
pm2 save

# Wait a bit
sleep 3

# 9. Check status
echo "📋 PM2 Status:"
pm2 list

# 10. Check logs
echo "📝 Backend logs (last 10 lines):"
pm2 logs acoustic-backend --lines 10 --nostream || echo "  No logs yet"

echo ""
echo "✅ Backend fix complete!"

