#!/bin/bash
# Restart all services properly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔄 Restarting all services..."
echo ""

# Step 1: Restart backend
echo "📋 Step 1: Restarting backend..."
cd "$PROJECT_DIR"

# Check if backend dist exists
if [ ! -f "$BACKEND_DIR/dist/main.js" ]; then
    echo "   ⚠️  Backend dist/main.js not found, building..."
    bash deploy/fix-backend-build-nest.sh
fi

pm2 stop acoustic-backend 2>/dev/null || true
sleep 2

if [ -f "deploy/ecosystem.config.js" ]; then
    pm2 start deploy/ecosystem.config.js --only acoustic-backend || pm2 restart acoustic-backend
else
    cd "$BACKEND_DIR"
    pm2 start dist/main.js --name acoustic-backend --cwd "$BACKEND_DIR" --update-env || pm2 restart acoustic-backend
    cd "$PROJECT_DIR"
fi

sleep 3

BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
fi
echo ""

# Step 2: Restart frontend
echo "📋 Step 2: Restarting frontend..."
FRONTEND_STANDALONE="$FRONTEND_DIR/.next/standalone/apps/frontend"

if [ -f "$FRONTEND_STANDALONE/server.js" ]; then
    echo "   Found standalone build"
    pm2 stop acoustic-frontend 2>/dev/null || true
    sleep 2
    
    if [ -f "deploy/ecosystem.config.js" ]; then
        pm2 start deploy/ecosystem.config.js --only acoustic-frontend || pm2 restart acoustic-frontend || pm2 restart acoustic-frontend
    else
        cd "$FRONTEND_STANDALONE"
        pm2 start server.js --name acoustic-frontend --cwd "$FRONTEND_STANDALONE" --update-env || pm2 restart acoustic-frontend
        cd "$PROJECT_DIR"
    fi
else
    echo "   ⚠️  Standalone build not found, trying standard start..."
    cd "$FRONTEND_DIR"
    pm2 stop acoustic-frontend 2>/dev/null || true
    sleep 2
    pm2 start npm --name acoustic-frontend -- start || pm2 restart acoustic-frontend
    cd "$PROJECT_DIR"
fi

sleep 3

FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
fi
echo ""

# Step 3: Verify services
echo "📋 Step 3: Verifying services..."
sleep 2

BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
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
echo "✅ All services restarted!"
echo ""
pm2 status

