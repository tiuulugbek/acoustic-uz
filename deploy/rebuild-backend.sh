#!/bin/bash

set -e

echo "🔧 Rebuilding backend..."

cd /var/www/acoustic.uz || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main || echo "⚠️ Git pull failed, continuing..."

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/backend
pnpm install

# Build backend
echo "🏗️ Building backend..."
pnpm build

# Check if build was successful
if [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed: dist/main.js not found"
    exit 1
fi

echo "✅ Build successful!"

# Restart backend with PM2
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend || pm2 start ecosystem.config.js --only acoustic-backend

# Wait a moment for backend to start
sleep 3

# Check backend status
if pm2 list | grep -q "acoustic-backend.*online"; then
    echo "✅ Backend is running!"
    pm2 logs acoustic-backend --lines 20
else
    echo "❌ Backend failed to start!"
    pm2 logs acoustic-backend --lines 50
    exit 1
fi
