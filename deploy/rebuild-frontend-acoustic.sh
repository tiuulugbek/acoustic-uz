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

# 4. Fix node_modules permissions before installing
echo "🔧 Fixing node_modules permissions..."
cd "$PROJECT_DIR"
# Remove node_modules with sudo if they exist and have wrong permissions
sudo rm -rf "$PROJECT_DIR/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/frontend/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/backend/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/admin/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/packages/shared/node_modules" 2>/dev/null || true
# Fix ownership of project directory
sudo chown -R acoustic:acoustic "$PROJECT_DIR" 2>/dev/null || true

# 5. Install dependencies
echo "📦 Installing dependencies..."
cd "$PROJECT_DIR"
sudo -u acoustic pnpm install

# 6. Build shared package first (required by frontend)
echo "🏗️  Building shared package..."
sudo -u acoustic pnpm --filter @acoustic/shared build

# 7. Clean Next.js build cache
echo "🧹 Cleaning Next.js build cache..."
cd "$FRONTEND_DIR"

# Stop PM2 process first to avoid permission conflicts
echo "⏸️  Stopping PM2 process..."
pm2 stop acoustic-frontend 2>/dev/null || true

# Fix permissions first
sudo chown -R acoustic:acoustic .next 2>/dev/null || true
# Remove cache with proper permissions
sudo -u acoustic rm -rf .next/cache 2>/dev/null || true
# Remove entire .next directory if cache removal fails
if [ -d ".next" ]; then
  sudo chown -R acoustic:acoustic .next
  sudo -u acoustic rm -rf .next
fi

# 8. Build frontend
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

# 9. Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Build failed: .next directory not found"
    exit 1
fi

echo "✅ Build successful!"

# 10. Fix permissions after build
echo "🔧 Fixing permissions after build..."
cd "$FRONTEND_DIR"
chown -R acoustic:acoustic .next
chmod -R 755 .next
# Ensure trace file can be written
sudo -u acoustic touch .next/trace 2>/dev/null || true
chown acoustic:acoustic .next/trace 2>/dev/null || true
chmod 644 .next/trace 2>/dev/null || true

# 11. Restart PM2
echo "🔄 Restarting frontend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-frontend || pm2 start acoustic-frontend

# Wait a moment for restart
sleep 2

# 12. Show status
echo ""
echo "✅ Frontend rebuild completed!"
echo ""
pm2 status acoustic-frontend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-frontend --lines 50"

