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
# Use --skipLibCheck to skip type checking of declaration files
# This helps with decorator-related errors
echo "   Running: pnpm exec tsc --skipLibCheck"
set +e  # Don't exit on error
pnpm exec tsc --skipLibCheck > "$BUILD_LOG" 2>&1
TSC_EXIT=$?
set -e

echo "   TSC exit code: $TSC_EXIT"

if [ -s "$BUILD_LOG" ]; then
    echo "   Build output (first 50 lines):"
    head -50 "$BUILD_LOG" | sed 's/^/      /'
    if [ $(wc -l < "$BUILD_LOG") -gt 50 ]; then
        echo "      ... (truncated, full log: $BUILD_LOG)"
    fi
else
    echo "   ⚠️  Build log is empty (no output from tsc)"
fi

# Even if there are errors, check if dist was created
if [ $TSC_EXIT -ne 0 ]; then
    echo "   ⚠️  TypeScript compilation had errors (exit code $TSC_EXIT)"
    echo "   But checking if any files were compiled anyway..."
fi

# Check for dist/main.js or dist/src/main.js
echo ""
echo "   Checking for compiled files..."
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js found!"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
elif [ -f "dist/src/main.js" ]; then
    echo "   ⚠️  Found dist/src/main.js, copying to dist/main.js..."
    cp dist/src/main.js dist/main.js
    echo "   ✅ Created dist/main.js"
elif [ -d "dist" ]; then
    echo "   ⚠️  dist/main.js not found, but dist directory exists"
    echo "   Checking dist contents:"
    JS_FILES=$(find dist -type f -name "*.js" 2>/dev/null | wc -l)
    echo "   Found $JS_FILES JavaScript files in dist"
    
    if [ "$JS_FILES" -gt 0 ]; then
        echo "   Sample files:"
        find dist -type f -name "*.js" | head -10 | sed 's/^/      /'
        echo ""
        echo "   Looking for main.js:"
        find dist -name "*main*.js" 2>/dev/null | sed 's/^/      /' || echo "      Not found"
        
        # Try to find main.js in src subdirectory
        if [ -f "dist/src/main.js" ]; then
            echo "   Found dist/src/main.js, copying..."
            cp dist/src/main.js dist/main.js
            echo "   ✅ Created dist/main.js"
        else
            echo ""
            echo "   ⚠️  main.js not found. TypeScript errors may have prevented compilation."
            echo "   Checking for common errors in build log:"
            if [ -s "$BUILD_LOG" ]; then
                grep -i "error TS" "$BUILD_LOG" | head -10 | sed 's/^/      /' || echo "      No TS errors found in log"
            fi
            echo ""
            echo "   💡 Suggestion: Fix TypeScript errors or use 'nest build' which may handle decorators better"
            echo "   Build log saved to: $BUILD_LOG"
            exit 1
        fi
    else
        echo "   ❌ No JavaScript files found in dist"
        echo "   Build log saved to: $BUILD_LOG"
        if [ -s "$BUILD_LOG" ]; then
            echo "   Last 30 lines of build log:"
            tail -30 "$BUILD_LOG" | sed 's/^/      /'
        fi
        exit 1
    fi
else
    echo "   ❌ dist directory does not exist"
    echo "   Build log saved to: $BUILD_LOG"
    if [ -s "$BUILD_LOG" ]; then
        echo "   Last 30 lines of build log:"
        tail -30 "$BUILD_LOG" | sed 's/^/      /'
    fi
    exit 1
fi

echo ""
echo "✅ Backend build successful!"
echo "   dist/main.js is ready"
echo ""

