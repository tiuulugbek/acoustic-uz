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

# Build admin
echo "🏗️  Building admin..."
cd "$PROJECT_DIR"

# Clean admin build directory to ensure fresh build
echo "🧹 Cleaning admin build directory..."
rm -rf apps/admin/dist
rm -rf apps/admin/.vite
rm -rf apps/admin/node_modules/.vite

# Export environment variables for admin build
export VITE_API_URL=${VITE_API_URL:-https://api.acoustic.uz/api}
export NODE_ENV=production
echo "📋 Admin environment variables:"
echo "  VITE_API_URL=$VITE_API_URL"
echo "  NODE_ENV=$NODE_ENV"

# Build admin (this will generate new version with current timestamp)
pnpm --filter @acoustic/admin build

# Check if admin build succeeded
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin build successful!"
    # Show version file if it exists
    if [ -f "apps/admin/src/version.json" ]; then
        echo "📋 Admin version info:"
        cat apps/admin/src/version.json
    fi
    
    # Copy admin build to Nginx root directory if needed
    ADMIN_NGINX_ROOT="/var/www/admins.acoustic.uz/dist"
    if [ -d "$ADMIN_NGINX_ROOT" ] && [ "$ADMIN_NGINX_ROOT" != "$PROJECT_DIR/apps/admin/dist" ]; then
        echo "📋 Copying admin build to Nginx root..."
        rm -rf "$ADMIN_NGINX_ROOT"/*
        cp -r apps/admin/dist/* "$ADMIN_NGINX_ROOT/"
        chown -R deploy:deploy "$ADMIN_NGINX_ROOT" || true
        echo "✅ Admin build copied to Nginx root"
    fi
else
    echo "⚠️  Admin build directory not found, but continuing..."
fi

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Frontend and Admin rebuild complete!"
echo ""
echo "📋 PM2 status:"
pm2 list | grep acoustic-frontend

