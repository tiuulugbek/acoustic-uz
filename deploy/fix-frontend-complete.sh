#!/bin/bash

# Complete fix for frontend 404 error
# Usage: ./fix-frontend-complete.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Complete frontend fix..."
echo ""

cd "$PROJECT_DIR"

# 1. Stop PM2
echo "🛑 Step 1: Stopping PM2..."
pm2 stop acoustic-frontend 2>/dev/null || true

# 2. Clean everything
echo "🧹 Step 2: Cleaning old builds..."
cd apps/frontend
rm -rf .next
cd "$PROJECT_DIR"

# 3. Rebuild frontend with proper environment
echo "📦 Step 3: Rebuilding frontend..."
cd apps/frontend

export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
export NEXT_TELEMETRY_DISABLED=1

echo "  Environment:"
echo "    NODE_ENV=$NODE_ENV"
echo "    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"

pnpm build

# 4. Verify standalone build
echo "📋 Step 4: Verifying standalone build..."
STANDALONE_SERVER=".next/standalone/apps/frontend/server.js"
if [ ! -f "$STANDALONE_SERVER" ]; then
    echo "  ❌ Standalone server.js NOT found!"
    echo "  Checking .next structure:"
    find .next -name "server.js" 2>/dev/null | head -5
    echo "  Listing .next/standalone:"
    ls -la .next/standalone/ 2>/dev/null || echo "    standalone directory not found"
    exit 1
fi
echo "  ✅ Standalone server.js exists"

# 5. Copy static files
echo "📋 Step 5: Copying static files..."
if [ -d ".next/static" ]; then
    mkdir -p .next/standalone/apps/frontend/.next
    cp -r .next/static .next/standalone/apps/frontend/.next/
    echo "  ✅ Static files copied"
else
    echo "  ⚠️  .next/static not found"
fi

# 6. Copy public files
echo "📋 Step 6: Copying public files..."
if [ -d "public" ]; then
    cp -r public .next/standalone/apps/frontend/ 2>/dev/null || {
        echo "  ⚠️  Public files copy failed (may already exist)"
    }
    echo "  ✅ Public files copied"
else
    echo "  ⚠️  public directory not found"
fi

# 7. Verify final structure
echo "📋 Step 7: Verifying final structure..."
cd "$PROJECT_DIR"
FINAL_SERVER="apps/frontend/.next/standalone/apps/frontend/server.js"
if [ -f "$FINAL_SERVER" ]; then
    echo "  ✅ Final server.js path exists: $FINAL_SERVER"
    ls -lh "$FINAL_SERVER"
else
    echo "  ❌ Final server.js NOT found!"
    exit 1
fi

# 8. Update PM2 config
echo "📋 Step 8: Updating PM2 config..."
cp deploy/ecosystem.config.js ecosystem.config.js

# Verify PM2 config
if grep -q "apps/frontend/.next/standalone/apps/frontend/server.js" ecosystem.config.js; then
    echo "  ✅ PM2 config is correct"
else
    echo "  ❌ PM2 config path is incorrect!"
    exit 1
fi

# 9. Start PM2
echo "🚀 Step 9: Starting PM2..."
pm2 delete acoustic-frontend 2>/dev/null || true
pm2 start ecosystem.config.js --only acoustic-frontend
pm2 save

# Wait for startup
echo "  Waiting for startup..."
sleep 5

# 10. Check PM2 status
echo "📋 Step 10: Checking PM2 status..."
pm2 list | grep acoustic-frontend

# 11. Check port
echo "📋 Step 11: Checking port 3000..."
if netstat -tulpn | grep -q ":3000"; then
    echo "  ✅ Port 3000 is listening"
else
    echo "  ❌ Port 3000 is NOT listening"
fi

# 12. Test local connection
echo "📋 Step 12: Testing local connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo "  ✅ Local connection successful (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "  ❌ Still getting 404. Checking logs..."
    pm2 logs acoustic-frontend --lines 20 --nostream
else
    echo "  ⚠️  HTTP $HTTP_CODE - Checking logs..."
    pm2 logs acoustic-frontend --lines 20 --nostream
fi

# 13. Show recent logs
echo ""
echo "📋 Step 13: Recent logs (last 15 lines):"
pm2 logs acoustic-frontend --lines 15 --nostream 2>/dev/null || echo "  No logs yet"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check PM2: pm2 list"
echo "  2. Check logs: pm2 logs acoustic-frontend"
echo "  3. Test local: curl http://localhost:3000"
echo "  4. Test via Nginx: curl https://acoustic.uz"

