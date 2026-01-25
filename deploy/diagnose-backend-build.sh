#!/bin/bash
# Diagnose backend build issues

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔍 Diagnosing backend build issues..."
echo ""

cd "$PROJECT_DIR"

# 1. Check if we're in the right directory
echo "📋 Step 1: Checking project structure..."
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi
echo "   ✅ Backend directory exists"

# 2. Check if pnpm is installed
echo ""
echo "📋 Step 2: Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    exit 1
fi
echo "   ✅ pnpm version: $(pnpm --version)"

# 3. Check if nest CLI is available
echo ""
echo "📋 Step 3: Checking NestJS CLI..."
cd "$BACKEND_DIR"
if ! pnpm exec nest --version 2>/dev/null; then
    echo "   ⚠️  NestJS CLI not found, installing..."
    pnpm add -D @nestjs/cli
fi
NEST_VERSION=$(pnpm exec nest --version 2>/dev/null || echo "not found")
echo "   NestJS CLI version: $NEST_VERSION"

# 4. Check TypeScript compilation directly
echo ""
echo "📋 Step 4: Checking TypeScript compilation..."
cd "$BACKEND_DIR"
if pnpm exec tsc --noEmit 2>&1 | head -50; then
    echo "   ✅ TypeScript compilation check passed"
else
    echo "   ❌ TypeScript compilation errors found (see above)"
fi

# 5. Check if shared package is built
echo ""
echo "📋 Step 5: Checking shared package..."
SHARED_DIST="$PROJECT_DIR/packages/shared/dist"
if [ ! -d "$SHARED_DIST" ]; then
    echo "   ⚠️  Shared package dist not found, building..."
    cd "$PROJECT_DIR"
    pnpm --filter @acoustic/shared build
else
    echo "   ✅ Shared package dist exists"
fi

# 6. Try building with verbose output
echo ""
echo "📋 Step 6: Attempting build with full output..."
cd "$BACKEND_DIR"
rm -rf dist
echo "   Running: pnpm exec nest build"
echo "   --- Build Output Start ---"
set +e  # Don't exit on error so we can capture output
BUILD_OUTPUT=$(pnpm exec nest build 2>&1)
BUILD_EXIT_CODE=$?
echo "$BUILD_OUTPUT" | tee /tmp/backend-build.log
set -e  # Re-enable exit on error
echo "   --- Build Output End ---"

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo ""
    echo "📋 Full build output saved to: /tmp/backend-build.log"
    echo ""
    echo "📋 Checking for common errors:"
    grep -i "error\|failed\|cannot\|not found\|missing\|undefined" /tmp/backend-build.log | head -30 || echo "   No obvious error patterns found"
    echo ""
    echo "📋 Last 100 lines of build output:"
    tail -100 /tmp/backend-build.log
    exit 1
fi

# 7. Verify build output
echo ""
echo "📋 Step 7: Verifying build output..."
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js exists"
    ls -lh dist/main.js
else
    echo "   ❌ dist/main.js not found"
    echo "   📋 Dist directory contents:"
    ls -la dist/ 2>/dev/null || echo "   dist directory does not exist"
    exit 1
fi

if [ -f "dist/app.module.js" ]; then
    echo "   ✅ dist/app.module.js exists"
else
    echo "   ⚠️  dist/app.module.js not found (may be normal)"
fi

echo ""
echo "✅ Build diagnostic complete!"
echo "📋 Build output saved to: /tmp/backend-build.log"

