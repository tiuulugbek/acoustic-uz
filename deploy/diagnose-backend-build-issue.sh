#!/bin/bash
# Diagnostic script to understand why backend build is not creating dist/main.js

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔍 Backend Build Diagnostic Tool"
echo "================================="
echo ""

cd "$PROJECT_DIR"

echo "📋 Step 1: Checking project structure..."
echo "   Project root: $PROJECT_DIR"
echo "   Backend dir: $BACKEND_DIR"
echo "   Backend dir exists: $([ -d "$BACKEND_DIR" ] && echo "✅ Yes" || echo "❌ No")"
echo ""

echo "📋 Step 2: Checking build configuration..."
echo "   nest-cli.json exists: $([ -f "$BACKEND_DIR/nest-cli.json" ] && echo "✅ Yes" || echo "❌ No")"
if [ -f "$BACKEND_DIR/nest-cli.json" ]; then
    echo "   nest-cli.json contents:"
    cat "$BACKEND_DIR/nest-cli.json" | sed 's/^/      /'
fi
echo ""

echo "   tsconfig.json exists: $([ -f "$BACKEND_DIR/tsconfig.json" ] && echo "✅ Yes" || echo "❌ No")"
if [ -f "$BACKEND_DIR/tsconfig.json" ]; then
    echo "   tsconfig.json outDir: $(grep -A 1 '"outDir"' "$BACKEND_DIR/tsconfig.json" || echo "Not found")"
    echo "   tsconfig.json rootDir: $(grep -A 1 '"rootDir"' "$BACKEND_DIR/tsconfig.json" || echo "Not found")"
fi
echo ""

echo "📋 Step 3: Checking source files..."
echo "   src/main.ts exists: $([ -f "$BACKEND_DIR/src/main.ts" ] && echo "✅ Yes" || echo "❌ No")"
echo "   src/app.module.ts exists: $([ -f "$BACKEND_DIR/src/app.module.ts" ] && echo "✅ Yes" || echo "❌ No")"
echo ""

echo "📋 Step 4: Checking dependencies..."
echo "   @nestjs/cli installed: $(cd "$BACKEND_DIR" && pnpm list @nestjs/cli 2>/dev/null | grep -q "@nestjs/cli" && echo "✅ Yes" || echo "❌ No")"
echo "   typescript installed: $(cd "$BACKEND_DIR" && pnpm list typescript 2>/dev/null | grep -q "typescript" && echo "✅ Yes" || echo "❌ No")"
echo ""

echo "📋 Step 5: Cleaning previous builds..."
rm -rf "$BACKEND_DIR/dist"
echo "   ✅ Cleaned dist directory"
echo ""

echo "📋 Step 6: Checking NestJS CLI..."
cd "$BACKEND_DIR"
echo "   Checking if nest command exists:"
which nest || pnpm exec which nest || echo "   ❌ nest not found"
echo "   NestJS CLI version:"
pnpm exec nest --version 2>&1 || echo "   ❌ Cannot get version"
echo ""

echo "📋 Step 7: Attempting build with verbose output..."
BUILD_LOG="/tmp/backend-build-diagnostic-$(date +%Y%m%d_%H%M%S).log"

echo "   Running: pnpm exec nest build"
set +e  # Don't exit on error for this test
pnpm exec nest build > "$BUILD_LOG" 2>&1
BUILD_EXIT=$?
set -e

echo "   Build exit code: $BUILD_EXIT"
echo "   Build log size: $(wc -l < "$BUILD_LOG" 2>/dev/null || echo "0") lines"
echo ""

if [ $BUILD_EXIT -eq 0 ]; then
    echo "   ✅ Build command succeeded (exit code 0)"
else
    echo "   ❌ Build command failed (exit code $BUILD_EXIT)"
fi

# Show build log content
if [ -s "$BUILD_LOG" ]; then
    echo "   Build log content:"
    cat "$BUILD_LOG" | sed 's/^/      /'
else
    echo "   ⚠️  Build log is empty - command produced no output"
fi
echo ""

echo "📋 Step 8: Checking build output..."
echo "   dist directory exists: $([ -d "$BACKEND_DIR/dist" ] && echo "✅ Yes" || echo "❌ No")"

if [ -d "$BACKEND_DIR/dist" ]; then
    echo "   dist directory contents:"
    find "$BACKEND_DIR/dist" -type f -name "*.js" | head -20 | sed 's/^/      /' || echo "      No JS files found"
    echo ""
    echo "   Looking for main.js:"
    find "$BACKEND_DIR/dist" -name "main.js" | sed 's/^/      /' || echo "      main.js not found"
    echo ""
    echo "   Full directory structure:"
    ls -laR "$BACKEND_DIR/dist" | head -50 | sed 's/^/      /' || true
else
    echo "   ❌ dist directory was not created"
fi
echo ""

echo "📋 Step 9: Build log analysis..."
if [ -f "$BUILD_LOG" ]; then
    echo "   Build log saved to: $BUILD_LOG"
    echo "   Build log size: $(wc -l < "$BUILD_LOG") lines"
    echo ""
    echo "   Last 30 lines of build log:"
    tail -30 "$BUILD_LOG" | sed 's/^/      /'
    echo ""
    echo "   Checking for errors:"
    grep -i "error\|failed\|cannot\|not found" "$BUILD_LOG" | tail -10 | sed 's/^/      /' || echo "      No obvious errors found"
else
    echo "   ❌ Build log not found"
fi
echo ""

echo "📋 Step 10: Trying TypeScript compiler directly..."
cd "$BACKEND_DIR"
echo "   Running: pnpm exec tsc"
TSC_LOG="/tmp/backend-tsc-build-$(date +%Y%m%d_%H%M%S).log"
set +e
pnpm exec tsc > "$TSC_LOG" 2>&1
TSC_EXIT=$?
set -e

echo "   TSC exit code: $TSC_EXIT"
if [ -s "$TSC_LOG" ]; then
    echo "   TSC output (last 30 lines):"
    tail -30 "$TSC_LOG" | sed 's/^/      /'
else
    echo "   ⚠️  TSC log is empty"
fi

if [ -d "$BACKEND_DIR/dist" ]; then
    echo "   ✅ dist directory created by tsc"
    find "$BACKEND_DIR/dist" -name "main.js" | sed 's/^/      /' || echo "      main.js not found"
else
    echo "   ❌ dist directory still not created"
fi
echo ""

echo "📋 Step 11: Trying alternative build method..."
cd "$PROJECT_DIR"
echo "   Running: pnpm --filter @acoustic/backend build"
ALTERNATIVE_LOG="/tmp/backend-build-alternative-$(date +%Y%m%d_%H%M%S).log"
if pnpm --filter @acoustic/backend build > "$ALTERNATIVE_LOG" 2>&1; then
    echo "   ✅ Alternative build succeeded"
else
    echo "   ❌ Alternative build failed"
fi

if [ -d "$BACKEND_DIR/dist" ]; then
    echo "   Checking dist after alternative build:"
    find "$BACKEND_DIR/dist" -name "main.js" | sed 's/^/      /' || echo "      main.js still not found"
fi
echo ""

echo "📋 Step 12: Checking working directory during build..."
cd "$BACKEND_DIR"
echo "   Current directory: $(pwd)"
echo "   Checking if nest CLI is available:"
which nest || pnpm exec which nest || echo "   nest CLI not found in PATH"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnostic complete!"
echo ""
echo "📋 Summary:"
echo "  - Build log: $BUILD_LOG"
if [ -f "$ALTERNATIVE_LOG" ]; then
    echo "  - Alternative build log: $ALTERNATIVE_LOG"
fi
echo ""
echo "🔍 Next steps:"
echo "  1. Check the build logs above"
echo "  2. Verify dist directory structure"
echo "  3. Check if main.js exists in a different location"
echo "  4. Review nest-cli.json and tsconfig.json configuration"

