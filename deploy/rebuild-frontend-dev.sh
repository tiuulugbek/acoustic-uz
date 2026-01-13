#!/bin/bash
# Rebuild frontend in development mode to see detailed errors

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🚀 Rebuilding frontend in DEVELOPMENT mode for acoustic.uz..."
echo ""

# 1. Navigate to project directory
cd "$PROJECT_DIR"

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 4. Build shared package first (required by frontend)
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build

# 5. Clean Next.js build cache
echo "🧹 Cleaning Next.js build cache..."
cd "$FRONTEND_DIR"
rm -rf .next

# 6. Load environment variables
echo "📋 Loading environment variables..."
if [ -f "$PROJECT_DIR/.env.production" ]; then
    echo "  Loading $PROJECT_DIR/.env.production"
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
elif [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Loading $PROJECT_DIR/.env"
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

if [ -f "$FRONTEND_DIR/.env.production" ]; then
    echo "  Loading $FRONTEND_DIR/.env.production"
    set -a
    source "$FRONTEND_DIR/.env.production"
    set +a
elif [ -f "$FRONTEND_DIR/.env" ]; then
    echo "  Loading $FRONTEND_DIR/.env"
    set -a
    source "$FRONTEND_DIR/.env"
    set +a
fi

# Export environment variables for build (DEVELOPMENT MODE)
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://a.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://acoustic.uz}

echo "📋 Environment variables for build:"
echo "  NODE_ENV=$NODE_ENV"
echo "  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"

# Build frontend in development mode
echo "🏗️  Building frontend in DEVELOPMENT mode..."
cd "$FRONTEND_DIR"
BUILD_OUTPUT=$(NODE_ENV=development pnpm build 2>&1)
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
echo "✅ Frontend rebuild completed (DEVELOPMENT MODE)!"
echo ""
pm2 status acoustic-frontend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-frontend --lines 50"
echo "⚠️  NOTE: This is a DEVELOPMENT build - errors will be more detailed!"

