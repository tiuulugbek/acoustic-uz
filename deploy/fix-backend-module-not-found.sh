#!/bin/bash
# Fix backend module not found error by rebuilding properly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing backend module not found error..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Check current dist state
echo "📋 Step 1: Checking current dist state..."
cd "$BACKEND_DIR"

if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js exists"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
else
    echo "   ❌ dist/main.js not found"
fi

if [ -f "dist/app.module.js" ]; then
    echo "   ✅ dist/app.module.js exists"
else
    echo "   ❌ dist/app.module.js NOT found - this is the problem!"
fi

echo ""
echo "   Checking dist directory structure:"
if [ -d "dist" ]; then
    echo "   Total files in dist: $(find dist -type f -name "*.js" 2>/dev/null | wc -l)"
    echo "   Sample files:"
    find dist -type f -name "*.js" | head -10 | sed 's/^/      /' || echo "      No files"
else
    echo "   ❌ dist directory does not exist"
fi
echo ""

# Step 2: Clean and rebuild
echo "📋 Step 2: Cleaning and rebuilding backend..."
rm -rf dist
mkdir -p dist

# Ensure shared package is built
echo "   Building shared package..."
cd "$PROJECT_DIR"
pnpm --filter @acoustic/shared build
echo "   ✅ Shared package built"
echo ""

# Build backend
echo "   Building backend..."
cd "$BACKEND_DIR"
BUILD_LOG="/tmp/backend-rebuild-$(date +%Y%m%d_%H%M%S).log"

# Try different methods to run nest build
echo "   Trying nest build..."

# Method 1: npx nest
if command -v npx >/dev/null 2>&1; then
    echo "   Method 1: npx nest build"
    set +e
    npx nest build > "$BUILD_LOG" 2>&1
    BUILD_EXIT=$?
    set -e
elif [ -f "node_modules/.bin/nest" ]; then
    echo "   Method 2: node_modules/.bin/nest build"
    set +e
    ./node_modules/.bin/nest build > "$BUILD_LOG" 2>&1
    BUILD_EXIT=$?
    set -e
elif [ -f "../../node_modules/.bin/nest" ]; then
    echo "   Method 3: ../../node_modules/.bin/nest build"
    set +e
    ../../node_modules/.bin/nest build > "$BUILD_LOG" 2>&1
    BUILD_EXIT=$?
    set -e
else
    echo "   ⚠️  nest CLI not found, trying pnpm exec..."
    set +e
    pnpm exec nest build > "$BUILD_LOG" 2>&1
    BUILD_EXIT=$?
    set -e
fi

echo "   Build exit code: $BUILD_EXIT"

if [ -s "$BUILD_LOG" ]; then
    echo "   Build output:"
    cat "$BUILD_LOG" | sed 's/^/      /'
else
    echo "   ⚠️  Build log is empty"
fi

if [ $BUILD_EXIT -ne 0 ]; then
    echo "   ⚠️  Build command had errors (exit code $BUILD_EXIT)"
fi

# Try alternative: tsc directly
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    echo ""
    echo "   ⚠️  dist/main.js not found after nest build, trying tsc..."
    echo "   Running: tsc --skipLibCheck"
    set +e
    
    # Try different tsc methods
    if command -v tsc >/dev/null 2>&1; then
        tsc --skipLibCheck >> "$BUILD_LOG" 2>&1
        TSC_EXIT=$?
    elif [ -f "node_modules/.bin/tsc" ]; then
        ./node_modules/.bin/tsc --skipLibCheck >> "$BUILD_LOG" 2>&1
        TSC_EXIT=$?
    elif [ -f "../../node_modules/.bin/tsc" ]; then
        ../../node_modules/.bin/tsc --skipLibCheck >> "$BUILD_LOG" 2>&1
        TSC_EXIT=$?
    else
        pnpm exec tsc --skipLibCheck >> "$BUILD_LOG" 2>&1
        TSC_EXIT=$?
    fi
    
    set -e
    
    if [ -s "$BUILD_LOG" ] && [ $(wc -l < "$BUILD_LOG") -gt 5 ]; then
        echo "   TSC output (last 30 lines):"
        tail -30 "$BUILD_LOG" | sed 's/^/      /'
    fi
    
    if [ -f "dist/main.js" ]; then
        echo "   ✅ tsc created dist/main.js"
    fi
fi

# Verify build output
echo ""
echo "   Verifying build output..."
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js exists"
else
    echo "   ❌ dist/main.js still not found"
    echo "   Build log saved to: $BUILD_LOG"
    exit 1
fi

if [ -f "dist/app.module.js" ]; then
    echo "   ✅ dist/app.module.js exists"
else
    echo "   ❌ dist/app.module.js still not found"
    echo "   Checking what was built:"
    find dist -name "*app*.js" | sed 's/^/      /' || echo "      No app.*.js files"
    echo ""
    echo "   Build log saved to: $BUILD_LOG"
    echo "   Last 50 lines:"
    tail -50 "$BUILD_LOG" | sed 's/^/      /' || true
    exit 1
fi

echo ""
echo "   ✅ Build verification complete"
echo "   dist/main.js size: $(du -h dist/main.js | cut -f1)"
echo "   dist/app.module.js size: $(du -h dist/app.module.js | cut -f1)"
echo ""

# Step 3: Restart backend
echo "📋 Step 3: Restarting backend..."
cd "$PROJECT_DIR"

pm2 stop acoustic-backend 2>/dev/null || true
sleep 2

if [ -f "deploy/ecosystem.config.js" ]; then
    pm2 start deploy/ecosystem.config.js --only acoustic-backend || pm2 restart acoustic-backend
else
    cd "$BACKEND_DIR"
    pm2 start dist/main.js --name acoustic-backend --update-env || pm2 restart acoustic-backend
    cd "$PROJECT_DIR"
fi

sleep 3

# Check backend status
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-backend --err --lines 10 --nostream 2>/dev/null || true
fi

# Test backend API
sleep 2
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
fi

echo ""
echo "✅ Backend fix complete!"
echo ""
echo "📋 Service status:"
pm2 status acoustic-backend

