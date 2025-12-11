#!/bin/bash
# Fix backend 502 error by rebuilding and restarting

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing backend 502 error..."
echo ""

cd "$PROJECT_DIR"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main
echo ""

# 2. Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo ""

# 3. Build shared package
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build
echo ""

# 4. Stop backend first
echo "🛑 Stopping backend..."
pm2 stop acoustic-backend || true
echo ""

# 5. Build backend using TypeScript compiler directly
echo "🔨 Building backend with TypeScript..."
cd "$BACKEND_DIR"
rm -rf dist

# Try nest build first
if pnpm exec nest build 2>&1; then
    echo "   ✅ Nest build successful"
else
    echo "   ⚠️  Nest build failed, trying tsc directly..."
    pnpm exec tsc
    echo "   ✅ TypeScript compilation successful"
fi

# Verify build
if [ ! -f "dist/main.js" ]; then
    echo "   ❌ Build failed: dist/main.js not found"
    echo "   Checking what was built:"
    ls -la dist/ 2>/dev/null || echo "   dist directory does not exist"
    exit 1
fi

echo "   ✅ Backend build verified"
echo ""

# 6. Restart backend
echo "🔄 Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend
sleep 5

# 7. Check backend status
echo "📋 Checking backend status..."
pm2 status acoustic-backend

echo ""
echo "📋 Checking backend logs..."
pm2 logs acoustic-backend --lines 20 --nostream

echo ""
echo "🔍 Testing backend API..."
sleep 2
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
echo "   API Health Check: HTTP $API_RESPONSE"

if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "401" ]; then
    echo "   ✅ Backend is responding!"
else
    echo "   ❌ Backend still not responding"
    echo ""
    echo "   📋 Recent backend errors:"
    pm2 logs acoustic-backend --err --lines 30 --nostream
fi

echo ""
echo "✅ Backend fix complete!"

