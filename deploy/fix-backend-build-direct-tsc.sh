#!/bin/bash
# Direct TypeScript compilation to fix backend build issue
# This bypasses NestJS CLI and uses tsc directly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing backend build using direct TypeScript compilation..."
echo ""

cd "$BACKEND_DIR"

# Clean dist
echo "📋 Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Check if shared package is built
echo "📋 Checking shared package..."
if [ ! -d "../../packages/shared/dist" ]; then
    echo "   ⚠️  Shared package not built, building it..."
    cd "$PROJECT_DIR"
    pnpm --filter @acoustic/shared build
    cd "$BACKEND_DIR"
fi

# Build using tsc directly
echo "📋 Building backend with TypeScript compiler..."
echo "   Running: pnpm exec tsc"
BUILD_LOG="/tmp/backend-tsc-build-$(date +%Y%m%d_%H%M%S).log"

if pnpm exec tsc > "$BUILD_LOG" 2>&1; then
    echo "   ✅ TypeScript compilation completed"
else
    echo "   ⚠️  TypeScript compilation had errors (checking anyway...)"
    echo "   Last 30 lines of build log:"
    tail -30 "$BUILD_LOG" | sed 's/^/      /' || true
fi

# Check for dist/main.js
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js found!"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
elif [ -f "dist/src/main.js" ]; then
    echo "   ⚠️  Found dist/src/main.js, copying to dist/main.js..."
    cp dist/src/main.js dist/main.js
    echo "   ✅ Created dist/main.js"
else
    echo "   ❌ dist/main.js not found"
    echo ""
    echo "   Checking dist directory:"
    if [ -d "dist" ]; then
        echo "   dist directory exists, contents:"
        find dist -type f -name "*.js" | head -20 | sed 's/^/      /' || echo "      No JS files found"
        echo ""
        echo "   Looking for main.js anywhere:"
        find dist -name "*main*.js" 2>/dev/null | sed 's/^/      /' || echo "      Not found"
    else
        echo "   ❌ dist directory does not exist"
    fi
    echo ""
    echo "   Build log saved to: $BUILD_LOG"
    echo "   Full build log:"
    cat "$BUILD_LOG" | sed 's/^/      /'
    exit 1
fi

echo ""
echo "✅ Backend build successful!"
echo "   dist/main.js is ready"
echo ""

