#!/bin/bash
# Build and start frontend

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🚀 Building and starting frontend..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Ensure shared package is built
echo "📋 Step 1: Building shared package..."
if [ ! -d "packages/shared/dist" ]; then
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
else
    echo "   ✅ Shared package already built"
fi
echo ""

# Step 2: Build frontend
echo "📋 Step 2: Building frontend..."
cd "$FRONTEND_DIR"

# Ensure devDependencies are installed for tailwindcss
export NODE_ENV=development
if ! command -v tailwindcss >/dev/null 2>&1 && [ ! -f "node_modules/.bin/tailwindcss" ]; then
    echo "   Installing devDependencies for tailwindcss..."
    pnpm install
fi

# Build frontend
export NODE_ENV=production
echo "   Running: pnpm build"
BUILD_LOG="/tmp/frontend-build-$(date +%Y%m%d_%H%M%S).log"

if pnpm build > "$BUILD_LOG" 2>&1; then
    echo "   ✅ Frontend build completed"
else
    echo "   ⚠️  Frontend build had warnings/errors, checking..."
    tail -30 "$BUILD_LOG" | sed 's/^/      /' || true
    # Continue anyway if .next directory exists
    if [ ! -d ".next" ]; then
        echo "   ❌ Frontend build failed - .next directory not found"
        exit 1
    fi
fi

# Check if standalone build exists
FRONTEND_STANDALONE="$FRONTEND_DIR/.next/standalone/apps/frontend"
if [ -f "$FRONTEND_STANDALONE/server.js" ]; then
    echo "   ✅ Standalone build found"
else
    echo "   ⚠️  Standalone build not found, but .next directory exists"
fi
echo ""

# Step 3: Restart frontend service
echo "📋 Step 3: Restarting frontend service..."
cd "$PROJECT_DIR"

# Stop frontend if running
pm2 stop acoustic-frontend 2>/dev/null || true
sleep 2

# Start frontend using ecosystem config or direct command
if [ -f "deploy/ecosystem.config.js" ]; then
    echo "   Using ecosystem config..."
    pm2 start deploy/ecosystem.config.js --only acoustic-frontend || pm2 restart acoustic-frontend
else
    echo "   Using direct start..."
    if [ -f "$FRONTEND_STANDALONE/server.js" ]; then
        cd "$FRONTEND_STANDALONE"
        pm2 start server.js --name acoustic-frontend --update-env || pm2 restart acoustic-frontend
    else
        cd "$FRONTEND_DIR"
        pm2 start npm --name acoustic-frontend -- start || pm2 restart acoustic-frontend
    fi
fi

sleep 3

# Check frontend status
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-frontend --err --lines 10 --nostream 2>/dev/null || true
fi
echo ""

# Step 4: Verify frontend
echo "📋 Step 4: Verifying frontend..."
sleep 2
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_HTTP)"
    echo "   Check logs: pm2 logs acoustic-frontend --lines 20"
fi

# Check via Nginx
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ Frontend build and start complete!"
echo ""
echo "📋 Service status:"
pm2 status acoustic-frontend
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Local: http://127.0.0.1:3000"

