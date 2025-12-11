#!/bin/bash
# Complete server fix and start script
# Pulls latest code, fixes backend, fixes frontend, restarts services

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🚀 Starting server fix and restart process..."
echo ""

# 1. Pull latest code
echo "📥 Step 1: Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main
echo "   ✅ Code updated"
echo ""

# 2. Install dependencies
echo "📦 Step 2: Installing dependencies..."
pnpm install
echo "   ✅ Dependencies installed"
echo ""

# 3. Build shared package
echo "🏗️  Step 3: Building shared package..."
pnpm --filter @acoustic/shared build
echo "   ✅ Shared package built"
echo ""

# 4. Fix backend build
echo "🔧 Step 4: Building backend..."
cd "$BACKEND_DIR"
rm -rf dist

# Try building with verbose output
echo "   Running: pnpm exec nest build"
BUILD_OUTPUT=$(pnpm exec nest build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
    echo "   ❌ Backend build failed!"
    echo ""
    echo "   Build output:"
    echo "$BUILD_OUTPUT"
    echo ""
    echo "   Trying alternative build method..."
    # Try with tsc directly
    pnpm exec tsc
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ✅ Backend build successful"
fi

# Verify build
if [ ! -f "dist/main.js" ]; then
    echo "   ❌ dist/main.js still not found after build"
    echo "   Checking dist directory:"
    ls -la dist/ 2>/dev/null || echo "   dist directory does not exist"
    exit 1
fi

echo "   ✅ Backend build verified"
echo ""

# 5. Fix Nginx IPv6 issue
echo "🌐 Step 5: Fixing Nginx configuration..."
if grep -q "proxy_pass http://localhost:3000" /etc/nginx/sites-available/acoustic-uz.conf; then
    echo "   Fixing IPv6 issue..."
    sudo sed -i 's|http://localhost:3000|http://127.0.0.1:3000|g' /etc/nginx/sites-available/acoustic-uz.conf
    echo "   ✅ Nginx config updated"
else
    echo "   ✅ Nginx config already correct"
fi

# Test Nginx config
if sudo nginx -t; then
    echo "   ✅ Nginx config is valid"
    sudo systemctl reload nginx
    echo "   ✅ Nginx reloaded"
else
    echo "   ⚠️  Nginx config test failed, but continuing..."
fi
echo ""

# 6. Restart backend
echo "🔄 Step 6: Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend
sleep 3
pm2 status acoustic-backend
echo ""

# 7. Restart frontend
echo "🔄 Step 7: Restarting frontend..."
pm2 restart acoustic-frontend
sleep 2
pm2 status acoustic-frontend
echo ""

# 8. Verify services
echo "✅ Step 8: Verifying services..."
echo ""

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "401" ]; then
    echo "   ✅ Backend responding (HTTP $BACKEND_STATUS)"
else
    echo "   ⚠️  Backend not responding (HTTP $BACKEND_STATUS)"
    echo "   Check logs: pm2 logs acoustic-backend --lines 20"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend responding (HTTP $FRONTEND_STATUS)"
else
    echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_STATUS)"
    echo "   Check logs: pm2 logs acoustic-frontend --lines 20"
fi

# Check via Nginx
NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_STATUS" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_STATUS)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_STATUS)"
fi

echo ""
echo "✅ Server fix and restart complete!"
echo ""
echo "📋 Useful commands:"
echo "  - Backend logs: pm2 logs acoustic-backend --lines 50"
echo "  - Frontend logs: pm2 logs acoustic-frontend --lines 50"
echo "  - PM2 status: pm2 status"
echo "  - Nginx logs: tail -f /var/log/nginx/acoustic.uz.error.log"

