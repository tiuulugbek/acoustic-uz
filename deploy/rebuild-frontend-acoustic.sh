#!/bin/bash
# Rebuild frontend and restart PM2 for acoustic.uz

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🚀 Rebuilding frontend for acoustic.uz..."
echo ""

# 1. Navigate to project directory
cd "$PROJECT_DIR"

# 2. Fix git ownership if needed
echo "🔧 Fixing git ownership..."
sudo -u acoustic git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true

# 3. Pull latest code
echo "📥 Pulling latest code..."
cd "$PROJECT_DIR"
sudo -u acoustic git pull origin main || {
    echo "⚠️  Git pull failed, trying as root..."
    git pull origin main || {
        echo "⚠️  Git pull failed, continuing with existing code..."
    }
}

# 4. Install dependencies
echo "📦 Installing dependencies..."
cd "$PROJECT_DIR"
sudo -u acoustic pnpm install

# 5. Build shared package first (required by frontend)
echo "🏗️  Building shared package..."
sudo -u acoustic pnpm --filter @acoustic/shared build

# 6. Clean Next.js build cache
echo "🧹 Cleaning Next.js build cache..."
cd "$FRONTEND_DIR"
sudo -u acoustic rm -rf .next

# 7. Build frontend
echo "🏗️  Building frontend..."
cd "$FRONTEND_DIR"

# Load environment variables from .env.production or .env file if they exist
if [ -f "$PROJECT_DIR/.env.production" ]; then
    echo "📋 Loading environment variables from .env.production..."
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
elif [ -f "$PROJECT_DIR/.env" ]; then
    echo "📋 Loading environment variables from .env..."
    set -a
    source "$PROJECT_DIR/.env"
    set +a
elif [ -f "$FRONTEND_DIR/.env.production" ]; then
    echo "📋 Loading environment variables from apps/frontend/.env.production..."
    set -a
    source "$FRONTEND_DIR/.env.production"
    set +a
elif [ -f "$FRONTEND_DIR/.env" ]; then
    echo "📋 Loading environment variables from apps/frontend/.env..."
    set -a
    source "$FRONTEND_DIR/.env"
    set +a
fi

# Export environment variables for build (with fallbacks)
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://a.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://acoustic.uz}
export NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED:-1}

echo "📋 Environment variables for build:"
echo "  NODE_ENV=$NODE_ENV"
echo "  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"
echo "  NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED"

# Build frontend
BUILD_OUTPUT=$(sudo -u acoustic pnpm build 2>&1)
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "$BUILD_OUTPUT"
    echo ""
    echo "❌ Build failed! Exit code: $BUILD_EXIT_CODE"
    exit 1
fi

# Show build output
echo "$BUILD_OUTPUT"

# 7. Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Build failed: .next directory not found"
    exit 1
fi

echo "✅ Build successful!"

# 8. Restart PM2
echo "🔄 Restarting frontend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-frontend || pm2 start acoustic-frontend

# Wait a moment for restart
sleep 2

# 9. Show status
echo ""
echo "✅ Frontend rebuild completed!"
echo ""
pm2 status acoustic-frontend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-frontend --lines 50"

