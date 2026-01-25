#!/bin/bash
# Restart backend and fix Nginx configuration

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Restarting backend and fixing Nginx..."
echo ""

# Step 1: Restart backend
echo "📋 Step 1: Restarting backend..."
cd "$PROJECT_DIR"

# Check if backend dist exists
if [ ! -f "$BACKEND_DIR/dist/main.js" ]; then
    echo "   ❌ Backend dist/main.js not found, building..."
    bash deploy/fix-backend-build-nest.sh
fi

# Restart backend
pm2 stop acoustic-backend 2>/dev/null || true
sleep 2

if [ -f "deploy/ecosystem.config.js" ]; then
    pm2 start deploy/ecosystem.config.js --only acoustic-backend || pm2 restart acoustic-backend
else
    cd "$BACKEND_DIR"
    pm2 start dist/main.js --name acoustic-backend --update-env || pm2 restart acoustic-backend
    cd "$PROJECT_DIR"
fi

sleep 3

# Check backend status
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-backend --err --lines 10 --nostream 2>/dev/null || true
fi

# Test backend API
sleep 2
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
fi
echo ""

# Step 2: Fix Nginx IPv6 issue
echo "📋 Step 2: Fixing Nginx configuration..."
if grep -q "proxy_pass http://localhost:3000" "$NGINX_CONFIG"; then
    echo "   Found localhost:3000, replacing with 127.0.0.1:3000..."
    BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo "   ✅ Backup created: $BACKUP_FILE"
    
    sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://127.0.0.1:3000|g' "$NGINX_CONFIG"
    echo "   ✅ Replaced localhost:3000 with 127.0.0.1:3000"
else
    echo "   ✅ Nginx config already uses 127.0.0.1:3000"
fi

# Test Nginx config
echo "   Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    echo "   Showing error:"
    sudo nginx -t 2>&1 | tail -10 || true
    exit 1
fi
echo ""

# Step 3: Verify services
echo "📋 Step 3: Verifying services..."
sleep 2

# Check backend
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
fi

# Check frontend
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_HTTP)"
fi

# Check via Nginx
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
    echo "   Checking Nginx error logs..."
    sudo tail -20 /var/log/nginx/acoustic.uz.error.log | sed 's/^/      /' || true
fi

# Check API via Nginx
API_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api 2>/dev/null || echo "000")
if [ "$API_HTTP" = "200" ] || [ "$API_HTTP" = "401" ] || [ "$API_HTTP" = "404" ]; then
    echo "   ✅ API accessible via Nginx (HTTP $API_HTTP)"
else
    echo "   ⚠️  API not accessible via Nginx (HTTP $API_HTTP)"
fi

echo ""
echo "✅ Backend restart and Nginx fix complete!"
echo ""
echo "📋 Service status:"
pm2 status
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Admin: https://admin.acoustic.uz"
echo "  - API: https://a.acoustic.uz/api"

