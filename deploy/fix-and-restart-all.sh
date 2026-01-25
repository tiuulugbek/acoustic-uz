#!/bin/bash
# Fix and restart all services properly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔧 Fixing and restarting all services..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Clean up PM2 processes
echo "📋 Step 1: Cleaning up PM2 processes..."
pm2 delete acoustic-backend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo "   ✅ PM2 processes cleaned"
echo ""

# Step 2: Verify backend build
echo "📋 Step 2: Verifying backend build..."
if [ ! -f "$BACKEND_DIR/dist/main.js" ]; then
    echo "   ⚠️  Backend dist/main.js not found, building..."
    bash deploy/fix-backend-build-nest.sh
else
    echo "   ✅ Backend dist/main.js exists"
fi

if [ ! -f "$BACKEND_DIR/dist/app.module.js" ]; then
    echo "   ⚠️  Backend dist/app.module.js not found, rebuilding..."
    bash deploy/fix-backend-build-nest.sh
else
    echo "   ✅ Backend dist/app.module.js exists"
fi
echo ""

# Step 3: Start backend
echo "📋 Step 3: Starting backend..."
cd "$BACKEND_DIR"
pm2 start dist/main.js \
    --name acoustic-backend \
    --cwd "$BACKEND_DIR" \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-backend-error.log \
    --output /var/log/pm2/acoustic-backend-out.log \
    --merge-logs \
    --max-memory-restart 500M

sleep 3

BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-backend --err --lines 5 --nostream 2>/dev/null | tail -5 | sed 's/^/      /' || true
fi
echo ""

# Step 4: Verify frontend build
echo "📋 Step 4: Verifying frontend build..."
FRONTEND_STANDALONE="$FRONTEND_DIR/.next/standalone/apps/frontend"

if [ -f "$FRONTEND_STANDALONE/server.js" ]; then
    echo "   ✅ Standalone build found"
    STANDALONE_EXISTS=true
else
    echo "   ⚠️  Standalone build not found"
    STANDALONE_EXISTS=false
fi
echo ""

# Step 5: Start frontend
echo "📋 Step 5: Starting frontend..."
cd "$PROJECT_DIR"

if [ "$STANDALONE_EXISTS" = true ]; then
    echo "   Using standalone build..."
    cd "$FRONTEND_STANDALONE"
    pm2 start server.js \
        --name acoustic-frontend \
        --cwd "$FRONTEND_STANDALONE" \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-frontend-error.log \
        --output /var/log/pm2/acoustic-frontend-out.log \
        --merge-logs \
        --max-memory-restart 500M
else
    echo "   Using npm start..."
    cd "$FRONTEND_DIR"
    pm2 start npm --name acoustic-frontend -- start \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-frontend-error.log \
        --output /var/log/pm2/acoustic-frontend-out.log \
        --merge-logs \
        --max-memory-restart 500M
fi

cd "$PROJECT_DIR"
sleep 3

FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-frontend --err --lines 5 --nostream 2>/dev/null | tail -5 | sed 's/^/      /' || true
fi
echo ""

# Step 6: Verify services
echo "📋 Step 6: Verifying services..."
sleep 3

BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/docs 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ]; then
    echo "   ✅ Backend Swagger docs responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend Swagger docs not responding (HTTP $BACKEND_HTTP)"
fi

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_HTTP)"
fi

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ All services fixed and restarted!"
echo ""
pm2 status
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Admin: https://admin.acoustic.uz"
echo "  - API: https://a.acoustic.uz/api"
echo "  - Swagger: http://127.0.0.1:3001/api/docs"

