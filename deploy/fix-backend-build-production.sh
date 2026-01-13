#!/bin/bash

# Fix backend build in production (when devDependencies are not installed)
# Usage: ./fix-backend-build-production.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing backend build for production..."
echo ""

cd "$PROJECT_DIR"

# 1. Stop PM2
echo "🛑 Stopping PM2..."
pm2 stop acoustic-backend 2>/dev/null || true

# 2. Install devDependencies temporarily (needed for build)
echo "📦 Installing devDependencies for build..."
NODE_ENV=development pnpm install --frozen-lockfile

# 3. Build shared package first
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build

# 4. Build backend
echo "🏗️  Building backend..."
pnpm --filter @acoustic/backend build

# 5. Check if build succeeded
if [ ! -f "apps/backend/dist/main.js" ]; then
    echo "❌ Backend build failed!"
    echo "  Check the build output above for errors"
    exit 1
fi

# 6. Optional: Remove devDependencies to save space (keep node_modules for runtime)
echo "🧹 Build complete. Keeping node_modules for runtime dependencies."

# 7. Restart PM2
echo "🚀 Restarting PM2..."
pm2 restart acoustic-backend || pm2 start ecosystem.config.js --only acoustic-backend
pm2 save

# Wait a bit
sleep 3

# 8. Check status
echo "📋 PM2 Status:"
pm2 list

# 9. Check logs
echo "📝 Backend logs (last 10 lines):"
pm2 logs acoustic-backend --lines 10 --nostream || echo "  No logs yet"

echo ""
echo "✅ Backend build fix complete!"

