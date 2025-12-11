#!/bin/bash
# Verify backend build and restart properly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔍 Verifying backend build and restarting..."
echo ""

cd "$BACKEND_DIR"

# Step 1: Check if dist/main.js exists
echo "📋 Step 1: Checking backend build..."
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js exists"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
    echo "   First few lines:"
    head -5 dist/main.js | sed 's/^/      /'
else
    echo "   ❌ dist/main.js NOT found!"
    echo "   Building backend..."
    
    # Build using tsc
    rm -rf dist
    mkdir -p dist
    
    if command -v tsc >/dev/null 2>&1; then
        tsc --skipLibCheck
    elif [ -f "node_modules/.bin/tsc" ]; then
        ./node_modules/.bin/tsc --skipLibCheck
    elif [ -f "../../node_modules/.bin/tsc" ]; then
        ../../node_modules/.bin/tsc --skipLibCheck
    else
        npx tsc --skipLibCheck
    fi
    
    if [ -f "dist/main.js" ]; then
        echo "   ✅ Build successful!"
    else
        echo "   ❌ Build failed - dist/main.js still not found"
        exit 1
    fi
fi

# Step 2: Check if app.module.js exists
if [ -f "dist/app.module.js" ]; then
    echo "   ✅ dist/app.module.js exists"
else
    echo "   ⚠️  dist/app.module.js not found"
    echo "   Checking dist contents:"
    find dist -name "*.js" | head -10 | sed 's/^/      /' || echo "      No JS files"
fi

echo ""

# Step 3: Check PM2 configuration
echo "📋 Step 2: Checking PM2 configuration..."
cd "$PROJECT_DIR"

if [ -f "deploy/ecosystem.config.js" ]; then
    echo "   Ecosystem config found:"
    grep -A 5 "acoustic-backend" deploy/ecosystem.config.js | sed 's/^/      /'
    
    # Check if script path is correct
    SCRIPT_PATH=$(grep -A 2 "acoustic-backend" deploy/ecosystem.config.js | grep "script" | cut -d"'" -f2 || echo "")
    if [ -n "$SCRIPT_PATH" ]; then
        FULL_PATH="$PROJECT_DIR/$SCRIPT_PATH"
        echo "   Script path: $FULL_PATH"
        if [ -f "$FULL_PATH" ]; then
            echo "   ✅ Script file exists"
        else
            echo "   ❌ Script file NOT found at $FULL_PATH"
            echo "   Looking for main.js:"
            find "$PROJECT_DIR" -name "main.js" -path "*/backend/dist/*" | sed 's/^/      /' || echo "      Not found"
        fi
    fi
else
    echo "   ⚠️  Ecosystem config not found"
fi

echo ""

# Step 4: Stop and restart backend
echo "📋 Step 3: Restarting backend..."
pm2 stop acoustic-backend 2>/dev/null || true
sleep 2

# Delete old process
pm2 delete acoustic-backend 2>/dev/null || true
sleep 1

# Start backend with correct path
cd "$BACKEND_DIR"
if [ -f "dist/main.js" ]; then
    echo "   Starting backend from: $(pwd)/dist/main.js"
    pm2 start dist/main.js \
        --name acoustic-backend \
        --cwd "$BACKEND_DIR" \
        --env production \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-backend-error.log \
        --output /var/log/pm2/acoustic-backend-out.log \
        --merge-logs \
        --autorestart \
        --max-memory-restart 500M
else
    echo "   ❌ dist/main.js not found, cannot start backend"
    exit 1
fi

sleep 3

# Step 5: Check status
echo ""
echo "📋 Step 4: Checking backend status..."
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
echo "   Backend status: $BACKEND_STATUS"

if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend is not online"
    echo "   Recent errors:"
    pm2 logs acoustic-backend --err --lines 10 --nostream 2>/dev/null | tail -10 | sed 's/^/      /' || true
fi

# Test API
sleep 2
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
    echo "   Checking if backend is listening on port 3001:"
    netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp 2>/dev/null | grep 3001 || echo "      Port 3001 not listening"
fi

echo ""
echo "✅ Backend verification complete!"
echo ""
pm2 status acoustic-backend

