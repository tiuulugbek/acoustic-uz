#!/bin/bash
# Rebuild backend and restart PM2

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"

echo "🚀 Rebuilding backend..."

cd "$PROJECT_DIR"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/backend
pnpm install

# Build backend
echo "🏗️  Building backend..."
pnpm build

# Restart PM2
echo "🔄 Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend

# Show status
echo "✅ Backend rebuild completed!"
pm2 status acoustic-backend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-backend --lines 0"

