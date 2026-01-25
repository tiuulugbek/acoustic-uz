#!/bin/bash

# Fix frontend 404 error
# Usage: ./fix-frontend-404.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing frontend 404 error..."
echo ""

cd "$PROJECT_DIR"

# 1. Stop PM2 frontend
echo "🛑 Step 1: Stopping PM2 frontend..."
pm2 stop acoustic-frontend 2>/dev/null || true

# 2. Check if standalone build exists
echo "📋 Step 2: Checking standalone build..."
STANDALONE_PATH="apps/frontend/.next/standalone/apps/frontend/server.js"
if [ ! -f "$STANDALONE_PATH" ]; then
    echo "  ❌ Standalone build not found. Rebuilding..."
    
    # Clean and rebuild
    cd apps/frontend
    rm -rf .next
    
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
    export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
    
    echo "  Building frontend..."
    pnpm build
    
    # Verify build
    if [ ! -f ".next/standalone/apps/frontend/server.js" ]; then
        echo "  ❌ Build failed! Standalone server.js not found"
        echo "  Checking .next directory:"
        ls -la .next/ 2>/dev/null || echo "    .next directory not found"
        exit 1
    fi
    
    echo "  ✅ Standalone build created"
    cd "$PROJECT_DIR"
else
    echo "  ✅ Standalone build exists"
fi

# 3. Check if static files are copied
echo "📋 Step 3: Checking static files..."
if [ ! -d "apps/frontend/.next/standalone/apps/frontend/.next/static" ]; then
    echo "  Copying static files..."
    mkdir -p apps/frontend/.next/standalone/apps/frontend/.next
    cp -r apps/frontend/.next/static apps/frontend/.next/standalone/apps/frontend/.next/ 2>/dev/null || {
        echo "  ⚠️  Static files copy failed, but continuing..."
    }
fi

# 4. Check if public files are copied
echo "📋 Step 4: Checking public files..."
if [ -d "apps/frontend/public" ] && [ ! -d "apps/frontend/.next/standalone/apps/frontend/public" ]; then
    echo "  Copying public files..."
    cp -r apps/frontend/public apps/frontend/.next/standalone/apps/frontend/ 2>/dev/null || {
        echo "  ⚠️  Public files copy failed, but continuing..."
    }
fi

# 5. Update PM2 config
echo "📋 Step 5: Updating PM2 config..."
cp deploy/ecosystem.config.js ecosystem.config.js

# 6. Start PM2
echo "🚀 Step 6: Starting PM2..."
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --only acoustic-frontend
pm2 save

# Wait a bit
sleep 3

# 7. Check status
echo "📋 Step 7: Checking status..."
pm2 list | grep acoustic-frontend

# 8. Test local connection
echo "📋 Step 8: Testing local connection..."
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "  Connection failed"
echo ""

# 9. Check logs
echo "📋 Step 9: Recent logs (last 10 lines):"
pm2 logs acoustic-frontend --lines 10 --nostream 2>/dev/null || echo "  No logs yet"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Local: http://localhost:3000"
echo "  - Frontend: https://acoustic.uz"

