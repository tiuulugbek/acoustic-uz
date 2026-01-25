#!/bin/bash
# Debug TypeScript compilation to see what's happening

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔍 Debugging TypeScript compilation..."
echo ""

cd "$BACKEND_DIR"

# Clean dist
rm -rf dist
mkdir -p dist

echo "📋 Step 1: Checking TypeScript configuration..."
echo "   Running: pnpm exec tsc --showConfig"
pnpm exec tsc --showConfig 2>&1 | head -50
echo ""

echo "📋 Step 2: Listing files TypeScript would compile..."
echo "   Running: pnpm exec tsc --listFiles"
pnpm exec tsc --listFiles 2>&1 | head -30
echo ""

echo "📋 Step 3: Checking for TypeScript errors..."
echo "   Running: pnpm exec tsc --noEmit"
pnpm exec tsc --noEmit 2>&1 || echo "   ⚠️  TypeScript errors found (this is expected if files have issues)"
echo ""

echo "📋 Step 4: Running tsc with verbose output..."
echo "   Running: pnpm exec tsc --verbose"
pnpm exec tsc --verbose 2>&1 | head -50
echo ""

echo "📋 Step 5: Checking if dist was created..."
if [ -d "dist" ]; then
    echo "   ✅ dist directory exists"
    echo "   Contents:"
    find dist -type f | head -20 | sed 's/^/      /' || echo "      Empty"
else
    echo "   ❌ dist directory does not exist"
fi

echo ""
echo "📋 Step 6: Checking source files..."
echo "   Source files count: $(find src -name '*.ts' | wc -l)"
echo "   Sample source files:"
find src -name '*.ts' | head -10 | sed 's/^/      /'
echo ""

echo "📋 Step 7: Testing compilation with explicit output..."
cd "$BACKEND_DIR"
pnpm exec tsc --outDir ./dist --rootDir ./src src/**/*.ts 2>&1 | head -30 || true

if [ -d "dist" ]; then
    echo ""
    echo "   dist after explicit compilation:"
    find dist -type f | head -20 | sed 's/^/      /' || echo "      Empty"
fi
