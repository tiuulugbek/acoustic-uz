#!/bin/bash
# Rebuild frontend only

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔄 Rebuilding frontend..."
echo ""

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# 2. Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install

# 3. Build shared package
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared build failed"
    exit 1
}

# 4. Build frontend
echo "🏗️  Building frontend..."
cd apps/frontend
pnpm build || {
    echo "❌ Frontend build failed"
    exit 1
}
cd "$PROJECT_DIR"

# 5. Restart PM2
echo "🔄 Restarting frontend..."
pm2 restart acoustic-frontend || {
    echo "⚠️  PM2 restart failed, trying start..."
    pm2 start ecosystem.config.js --only acoustic-frontend
}

# 6. Wait a bit for startup
sleep 3

# 7. Check status
echo ""
echo "📋 Frontend status:"
pm2 list | grep acoustic-frontend || echo "   ⚠️  Frontend not found in PM2"

echo ""
echo "✅ Frontend rebuild complete!"
echo ""
echo "🔍 Check logs: pm2 logs acoustic-frontend --lines 20"
