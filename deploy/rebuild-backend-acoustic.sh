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

# Clean dist directory first
echo "🧹 Cleaning dist directory..."
rm -rf dist

# Build with error output
echo "🔨 Running build..."
if ! pnpm build 2>&1; then
    echo ""
    echo "❌ Build failed! Check errors above."
    echo ""
    echo "📋 Common issues:"
    echo "  - Missing dependencies: pnpm install"
    echo "  - TypeScript errors: Check tsconfig.json"
    echo "  - Missing shared package: pnpm --filter @acoustic/shared build"
    exit 1
fi

# 6. Check if build was successful
if [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed: dist/main.js not found"
    echo "📋 Checking dist directory contents:"
    ls -la dist/ 2>/dev/null || echo "  dist directory does not exist"
    exit 1
fi

if [ ! -f "dist/app.module.js" ]; then
    echo "⚠️  Warning: dist/app.module.js not found"
    echo "📋 Checking dist directory contents:"
    ls -la dist/ | head -20
fi

echo "✅ Build successful!"
echo "📋 Build output:"
ls -lh dist/ | head -10

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

