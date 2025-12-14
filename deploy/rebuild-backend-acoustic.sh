#!/bin/bash
# Rebuild backend and restart PM2 for acoustic.uz

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🚀 Rebuilding backend for acoustic.uz..."
echo ""

# 1. Navigate to project directory
cd "$PROJECT_DIR"

# 2. Fix Git ownership issue
echo "🔧 Fixing Git ownership..."
sudo -u acoustic git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
# Also fix for root user if running as root
if [ "$EUID" -eq 0 ]; then
  git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
fi

# 3. Pull latest code
echo "📥 Pulling latest code..."
# Try as acoustic user first, fallback to current user
sudo -u acoustic git pull origin main 2>/dev/null || git pull origin main

# 3. Install dependencies (including shared)
echo "📦 Installing dependencies..."
pnpm install

# 4. Build shared package first (required by backend)
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build

# 5. Build backend
echo "🏗️  Building backend..."
cd apps/backend

# Clean dist directory first
echo "🧹 Cleaning dist directory..."
rm -rf dist

# Build with error output
echo "🔨 Running build..."
cd "$PROJECT_DIR/apps/backend"

# Try TypeScript compiler directly first (more reliable with TS 5.3+)
echo "Using TypeScript compiler directly..."
set +e  # Don't exit on error so we can check the result

# Check if tsc exists and works
if ! pnpm exec tsc --version > /dev/null 2>&1; then
    echo "❌ TypeScript compiler not found!"
    exit 1
fi

# Clean incremental build cache
echo "🧹 Cleaning incremental build cache..."
rm -rf .tsbuildinfo tsconfig.tsbuildinfo

# Run TypeScript compiler with verbose output
echo "📋 Running: pnpm exec tsc"
pnpm exec tsc 2>&1 | tee /tmp/backend-build.log
BUILD_EXIT_CODE=$?

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo ""
    echo "⚠️  dist directory not created, checking TypeScript configuration..."
    echo "📋 Current directory: $(pwd)"
    echo "📋 tsconfig.json exists: $([ -f tsconfig.json ] && echo 'yes' || echo 'no')"
    echo "📋 src/main.ts exists: $([ -f src/main.ts ] && echo 'yes' || echo 'no')"
    
    # Check for TypeScript errors that might prevent compilation
    echo ""
    echo "📋 Checking for TypeScript errors..."
    pnpm exec tsc --noEmit 2>&1 | head -30 || true
    
    # Try to compile with explicit output and without incremental
    echo ""
    echo "📋 Trying tsc with explicit outDir and no incremental..."
    pnpm exec tsc --outDir dist --rootDir src --incremental false 2>&1 | head -30 || true
    
    # Check again
    if [ ! -d "dist" ]; then
        echo ""
        echo "❌ dist directory still not created after explicit compilation"
        BUILD_EXIT_CODE=1
    fi
fi

set -e  # Re-enable exit on error

if [ $BUILD_EXIT_CODE -ne 0 ] || [ ! -d "dist" ]; then
    echo ""
    echo "❌ Build failed! Exit code: $BUILD_EXIT_CODE"
    echo ""
    
    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        echo "📋 dist directory does not exist"
    else
        echo "📋 dist directory exists but may be incomplete"
        ls -la dist/ | head -20
    fi
    
    echo ""
    echo "📋 Checking for TypeScript errors..."
    pnpm exec tsc --noEmit 2>&1 | head -50 || echo "TypeScript check failed or no errors found"
    
    echo ""
    echo "📋 Checking if shared package is built..."
    if [ -d "$PROJECT_DIR/packages/shared/dist" ]; then
        echo "✅ Shared package dist exists"
        ls -la "$PROJECT_DIR/packages/shared/dist" | head -10
    else
        echo "❌ Shared package dist not found - need to build it first"
        echo "   Run: pnpm --filter @acoustic/shared build"
    fi
    
    echo ""
    echo "📋 Checking node_modules..."
    if [ -d "node_modules/@acoustic/shared" ]; then
        echo "✅ @acoustic/shared found in node_modules"
    else
        echo "❌ @acoustic/shared not found in node_modules"
        echo "   Run: pnpm install"
    fi
    
    echo ""
    echo "📋 Checking NestJS CLI..."
    pnpm exec nest --version 2>&1 || echo "NestJS CLI not found!"
    
    echo ""
    echo "📋 Trying to run nest build directly with explicit path..."
    # Skip nest build if it has known compatibility issues
    echo "⚠️  Skipping nest build due to TypeScript compatibility issues"
    echo "   Using tsc directly instead"
    
    echo ""
    echo "📋 Checking current directory and files..."
    pwd
    ls -la src/main.ts 2>/dev/null || echo "src/main.ts not found!"
    ls -la tsconfig.json 2>/dev/null || echo "tsconfig.json not found!"
    ls -la nest-cli.json 2>/dev/null || echo "nest-cli.json not found!"
    
    echo ""
    echo "📋 Common issues:"
    echo "  - Missing dependencies: pnpm install"
    echo "  - TypeScript errors: Check tsconfig.json"
    echo "  - Missing shared package: pnpm --filter @acoustic/shared build"
    exit 1
fi

# 6. Check if build was successful
if [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed: dist/main.js not found"
    echo "📋 Checking dist directory contents:"
    ls -la dist/ 2>/dev/null || echo "  dist directory does not exist"
    echo "📋 Checking build log:"
    tail -50 /tmp/backend-build.log 2>/dev/null || echo "  Build log not found"
    exit 1
fi

if [ ! -f "dist/app.module.js" ]; then
    echo "❌ Build failed: dist/app.module.js not found"
    echo "📋 Checking dist directory contents:"
    ls -la dist/ | head -20
    echo "📋 Checking build log:"
    tail -50 /tmp/backend-build.log 2>/dev/null || echo "  Build log not found"
    exit 1
fi

echo "✅ Build successful!"
echo "📋 Build output:"
ls -lh dist/ | head -10

# 7. Restart PM2
echo "🔄 Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend

# Wait a moment for restart
sleep 2

# 8. Show status
echo ""
echo "✅ Backend rebuild completed!"
echo ""
pm2 status acoustic-backend

echo ""
echo "📋 Check logs with: pm2 logs acoustic-backend --lines 50"

