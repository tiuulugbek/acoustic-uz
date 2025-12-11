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
BUILD_LOG="/tmp/backend-tsc-build-$(date +%Y%m%d_%H%M%S).log"

# First, check what files TypeScript would compile
echo "   Checking TypeScript configuration..."
echo "   Running: pnpm exec tsc --showConfig"
pnpm exec tsc --showConfig > /tmp/tsc-config.log 2>&1 || true
echo "   Config check complete"

# Check if source files exist
echo "   Checking source files..."
SRC_COUNT=$(find src -name '*.ts' 2>/dev/null | wc -l)
echo "   Found $SRC_COUNT TypeScript files"

if [ "$SRC_COUNT" -eq 0 ]; then
    echo "   ❌ ERROR: No TypeScript source files found!"
    echo "   Checking src directory:"
    ls -la src/ 2>/dev/null || echo "   src directory does not exist"
    exit 1
fi

# Try to list files TypeScript would compile
echo "   Running: pnpm exec tsc --listFiles (first 20 files)..."
pnpm exec tsc --listFiles 2>&1 | head -20 > /tmp/tsc-listfiles.log || true
if [ -s /tmp/tsc-listfiles.log ]; then
    echo "   Files TypeScript would compile:"
    head -10 /tmp/tsc-listfiles.log | sed 's/^/      /'
else
    echo "   ⚠️  No files listed (might indicate configuration issue)"
fi

# Now try actual compilation
echo "   Running: pnpm exec tsc"
set +e  # Don't exit on error
pnpm exec tsc > "$BUILD_LOG" 2>&1
TSC_EXIT=$?
set -e

echo "   TSC exit code: $TSC_EXIT"

if [ -s "$BUILD_LOG" ]; then
    echo "   Build output:"
    cat "$BUILD_LOG" | sed 's/^/      /'
else
    echo "   ⚠️  Build log is empty (no output from tsc)"
fi

if [ $TSC_EXIT -eq 0 ]; then
    echo "   ✅ TypeScript compilation completed (exit code 0)"
else
    echo "   ⚠️  TypeScript compilation had errors (exit code $TSC_EXIT)"
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

