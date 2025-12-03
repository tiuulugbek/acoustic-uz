#!/bin/bash

# Script to rebuild frontend and fix chunk loading errors

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔧 Rebuilding frontend..."

cd "$PROJECT_DIR"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop frontend
echo "🛑 Stopping frontend..."
pm2 stop acoustic-frontend || true

# Clean build directory
echo "🧹 Cleaning build directory..."
rm -rf "$FRONTEND_DIR/.next"

# Export environment variables for build
echo "🔧 Setting environment variables..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://news.acoustic.uz}

echo "📋 Environment variables:"
echo "  NODE_ENV=$NODE_ENV"
echo "  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"

# Build shared package first
echo "📦 Building shared package..."
cd "$PROJECT_DIR"
pnpm --filter @acoustic/shared build

# Build frontend
echo "🏗️  Building frontend..."
cd "$FRONTEND_DIR"
pnpm build

# Check if standalone directory exists
STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"
if [ -d "$STANDALONE_DIR" ]; then
    echo "✅ Standalone build found"
    
    # Copy static files to standalone
    echo "📋 Copying static files..."
    if [ -d "$FRONTEND_DIR/public" ]; then
        cp -r "$FRONTEND_DIR/public" "$STANDALONE_DIR/" || true
    fi
    
    # Copy .next/static to standalone
    if [ -d "$FRONTEND_DIR/.next/static" ]; then
        mkdir -p "$STANDALONE_DIR/.next/static"
        cp -r "$FRONTEND_DIR/.next/static"/* "$STANDALONE_DIR/.next/static/" || true
    fi
    
    # Set permissions
    echo "🔐 Setting permissions..."
    chown -R deploy:deploy "$STANDALONE_DIR" || true
    find "$STANDALONE_DIR" -type f -exec chmod 644 {} \;
    find "$STANDALONE_DIR" -type d -exec chmod 755 {} \;
else
    echo "⚠️  Standalone build not found, using regular build"
fi

# Start frontend
echo "▶️  Starting frontend..."
pm2 start acoustic-frontend

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Frontend rebuild complete!"
echo ""
echo "📋 PM2 status:"
pm2 list | grep acoustic-frontend

