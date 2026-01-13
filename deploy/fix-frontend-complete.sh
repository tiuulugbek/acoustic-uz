#!/bin/bash
# Complete frontend fix - rebuild and start without standalone

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔧 Complete frontend fix..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Stop frontend
echo "📋 Step 1: Stopping frontend..."
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo "   ✅ Frontend stopped"
echo ""

# Step 2: Build shared package
echo "📋 Step 2: Building shared package..."
cd "$PROJECT_DIR"
if [ ! -d "packages/shared/dist" ]; then
    echo "   Building shared package..."
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
else
    echo "   ✅ Shared package already built"
fi
echo ""

# Step 3: Clean everything
echo "📋 Step 3: Cleaning frontend..."
cd "$FRONTEND_DIR"
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Frontend cleaned"
echo ""

# Step 4: Install dependencies
echo "📋 Step 4: Installing dependencies..."
export NODE_ENV=development
pnpm install
echo "   ✅ Dependencies installed"
echo ""

# Step 5: Build frontend (standard build, standalone disabled in config)
echo "📋 Step 5: Building frontend..."
cd "$FRONTEND_DIR"

export NODE_ENV=production

BUILD_LOG="/tmp/frontend-build-$(date +%Y%m%d_%H%M%S).log"
echo "   Running: pnpm build"
echo "   Build log: $BUILD_LOG"

if pnpm build 2>&1 | tee "$BUILD_LOG"; then
    echo ""
    echo "   ✅ Frontend build completed"
else
    echo ""
    echo "   ⚠️  Frontend build had errors, checking..."
    tail -50 "$BUILD_LOG" | sed 's/^/      /' || true
    
    if [ ! -d ".next" ]; then
        echo "   ❌ Frontend build failed - .next directory not found"
        exit 1
    fi
fi
echo ""

# Step 6: Verify build
echo "📋 Step 6: Verifying build..."
if [ -d ".next" ]; then
    echo "   ✅ .next directory exists"
    
    if [ -d ".next/static" ]; then
        echo "   ✅ Static files found"
    else
        echo "   ⚠️  Static files not found"
    fi
    
    if [ -f ".next/BUILD_ID" ]; then
        echo "   ✅ BUILD_ID found"
    else
        echo "   ⚠️  BUILD_ID not found"
    fi
else
    echo "   ❌ .next directory not found"
    exit 1
fi
echo ""

# Step 7: Start frontend with next start
echo "📋 Step 7: Starting frontend with 'next start'..."
cd "$FRONTEND_DIR"

# Create a wrapper script to avoid PM2 parameter issues with npm
cat > /tmp/start-frontend.sh << 'EOF'
#!/bin/bash
cd /var/www/acoustic.uz/apps/frontend
export NODE_ENV=production
export PORT=3000
export HOSTNAME=127.0.0.1
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
exec npm start
EOF
chmod +x /tmp/start-frontend.sh

pm2 start /tmp/start-frontend.sh \
    --name acoustic-frontend \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --merge-logs \
    --max-memory-restart 500M

sleep 5
echo ""

# Step 8: Check status
echo "📋 Step 8: Checking frontend status..."
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo ""
    echo "   Recent errors:"
    pm2 logs acoustic-frontend --err --lines 20 --nostream 2>/dev/null | tail -20 | sed 's/^/      /' || true
fi
echo ""

# Step 9: Verify
echo "📋 Step 9: Verifying frontend..."
sleep 3

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding locally (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding locally (HTTP $FRONTEND_HTTP)"
    echo "   Check logs: pm2 logs acoustic-frontend --lines 30"
fi

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ Frontend fix complete!"
echo ""
pm2 status acoustic-frontend
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Local: http://127.0.0.1:3000"
echo ""
echo "📋 To check logs:"
echo "  pm2 logs acoustic-frontend --lines 50"
