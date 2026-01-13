#!/bin/bash
# Rebuild both frontend and admin

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"

echo "🔨 Rebuilding frontend and admin..."

cd "$PROJECT_DIR"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Export environment variables for frontend build
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
pnpm --filter @acoustic/shared build

# Build frontend
echo "🏗️  Building frontend..."
cd "$PROJECT_DIR/apps/frontend"
pnpm build

# Check if standalone directory exists
STANDALONE_DIR="$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend"
if [ -d "$STANDALONE_DIR" ]; then
    echo "✅ Standalone build found"
    
    # Copy static files to standalone
    echo "📋 Copying static files..."
    if [ -d "$PROJECT_DIR/apps/frontend/public" ]; then
        cp -r "$PROJECT_DIR/apps/frontend/public" "$STANDALONE_DIR/" || true
    fi
    
    # Copy .next/static to standalone
    if [ -d "$PROJECT_DIR/apps/frontend/.next/static" ]; then
        mkdir -p "$STANDALONE_DIR/.next/static"
        cp -r "$PROJECT_DIR/apps/frontend/.next/static"/* "$STANDALONE_DIR/.next/static/" || true
    fi
    
    # Set permissions
    echo "🔐 Setting permissions..."
    chown -R deploy:deploy "$STANDALONE_DIR" || true
    find "$STANDALONE_DIR" -type f -exec chmod 644 {} \;
    find "$STANDALONE_DIR" -type d -exec chmod 755 {} \;
fi

# Restart frontend
echo "🔄 Restarting frontend..."
pm2 restart acoustic-frontend || pm2 start acoustic-frontend

# Build admin
echo "🏗️  Building admin..."
cd "$PROJECT_DIR"
pnpm --filter @acoustic/admin build

# Check if build succeeded
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin build successful!"
else
    echo "❌ Admin build failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Rebuild complete!"
echo ""
echo "📋 PM2 status:"
pm2 list | grep -E "acoustic-frontend|acoustic-backend"

