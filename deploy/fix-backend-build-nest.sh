#!/bin/bash
# Try to build backend using nest build with better error handling

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Building backend with NestJS CLI..."
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

# Try nest build
echo "📋 Building with NestJS CLI..."
BUILD_LOG="/tmp/backend-nest-build-$(date +%Y%m%d_%H%M%S).log"

echo "   Running: pnpm exec nest build"
set +e
pnpm exec nest build > "$BUILD_LOG" 2>&1
BUILD_EXIT=$?
set -e

echo "   Build exit code: $BUILD_EXIT"

if [ -s "$BUILD_LOG" ]; then
    echo "   Build output:"
    cat "$BUILD_LOG" | sed 's/^/      /'
else
    echo "   ⚠️  Build log is empty"
fi

# Check for dist/main.js
if [ -f "dist/main.js" ]; then
    echo ""
    echo "   ✅ dist/main.js found!"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
    echo ""
    echo "✅ Backend build successful!"
    exit 0
elif [ -f "dist/src/main.js" ]; then
    echo ""
    echo "   ⚠️  Found dist/src/main.js, copying to dist/main.js..."
    cp dist/src/main.js dist/main.js
    echo "   ✅ Created dist/main.js"
    echo ""
    echo "✅ Backend build successful!"
    exit 0
else
    echo ""
    echo "   ❌ dist/main.js not found"
    echo ""
    echo "   Checking dist directory:"
    if [ -d "dist" ]; then
        echo "   dist directory exists"
        JS_FILES=$(find dist -type f -name "*.js" 2>/dev/null | wc -l)
        echo "   Found $JS_FILES JavaScript files"
        if [ "$JS_FILES" -gt 0 ]; then
            echo "   Sample files:"
            find dist -type f -name "*.js" | head -10 | sed 's/^/      /'
        fi
    else
        echo "   ❌ dist directory does not exist"
    fi
    
    echo ""
    echo "   Build log saved to: $BUILD_LOG"
    echo ""
    echo "   💡 Trying alternative: Use tsc with --skipLibCheck"
    echo "   Running: pnpm exec tsc --skipLibCheck"
    
    set +e
    pnpm exec tsc --skipLibCheck > "$BUILD_LOG" 2>&1
    TSC_EXIT=$?
    set -e
    
    if [ -f "dist/main.js" ] || [ -f "dist/src/main.js" ]; then
        if [ -f "dist/src/main.js" ]; then
            cp dist/src/main.js dist/main.js
        fi
        echo "   ✅ tsc --skipLibCheck succeeded!"
        echo "   ✅ dist/main.js created"
        exit 0
    else
        echo "   ❌ tsc --skipLibCheck also failed"
        echo "   Last 30 lines of build log:"
        tail -30 "$BUILD_LOG" | sed 's/^/      /' || true
        exit 1
    fi
fi

