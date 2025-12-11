#!/bin/bash
# Rebuild frontend with fixed image URL normalization

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔧 Rebuilding frontend with fixed image URLs..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Pull latest code
echo "📋 Step 1: Pulling latest code..."
git pull origin main
echo "   ✅ Code updated"
echo ""

# Step 2: Stop frontend
echo "📋 Step 2: Stopping frontend..."
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo "   ✅ Frontend stopped"
echo ""

# Step 3: Build shared package
echo "📋 Step 3: Building shared package..."
if [ ! -d "packages/shared/dist" ]; then
    echo "   Building shared package..."
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
else
    echo "   ✅ Shared package already built"
fi
echo ""

# Step 4: Clean frontend build
echo "📋 Step 4: Cleaning frontend build..."
cd "$FRONTEND_DIR"
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Frontend build cleaned"
echo ""

# Step 5: Build frontend with correct environment variables
echo "📋 Step 5: Building frontend..."
cd "$FRONTEND_DIR"

export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz

BUILD_LOG="/tmp/frontend-build-$(date +%Y%m%d_%H%M%S).log"
echo "   Running: pnpm build"
echo "   Environment variables:"
echo "     - NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "     - NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"
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

# Step 6: Create wrapper script
echo "📋 Step 6: Creating wrapper script..."
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
echo "   ✅ Wrapper script created"
echo ""

# Step 7: Start frontend
echo "📋 Step 7: Starting frontend..."
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
fi

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ Frontend rebuild complete with fixed image URLs!"
echo ""
pm2 status acoustic-frontend
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - API: https://a.acoustic.uz/api"
echo ""
echo "📋 Image URL fixes:"
echo "  - All image URLs now normalize to https://a.acoustic.uz/uploads/"
echo "  - Handles localhost, acoustic.uz, api.acoustic.uz domains"
echo "  - Properly encodes filenames with spaces"
echo ""
echo "📋 To check logs:"
echo "  pm2 logs acoustic-frontend --lines 50"

