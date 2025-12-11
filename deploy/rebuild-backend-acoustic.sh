#!/bin/bash
# Rebuild backend and restart PM2 for acoustic.uz

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🚀 Rebuilding backend for acoustic.uz..."
echo ""

# 1. Navigate to project directory
cd "$PROJECT_DIR"

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Install dependencies (including shared)
echo "📦 Installing dependencies..."
pnpm install

# 4. Build shared package first (required by backend)
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build

# 5. Build backend
echo "🏗️  Building backend..."
cd apps/backend
pnpm build

# 6. Check if build was successful
if [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed: dist/main.js not found"
    exit 1
fi

if [ ! -f "dist/app.module.js" ]; then
    echo "❌ Build failed: dist/app.module.js not found"
    exit 1
fi

echo "✅ Build successful!"

# 7. Restart PM2
echo "🔄 Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend

# Wait a moment for restart
sleep 2

# 8. Show status
echo ""
echo "✅ Backend rebuild completed!"
echo ""
pm2 status acoustic-backend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-backend --lines 50"

