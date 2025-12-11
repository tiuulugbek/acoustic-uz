#!/bin/bash
# Final verification of all services

set -e

echo "🔍 Final verification of all services..."
echo ""

# Step 1: Check backend
echo "📋 Step 1: Backend verification..."
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
echo "   PM2 Status: $BACKEND_STATUS"

if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
    
    # Test Swagger docs
    SWAGGER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/docs 2>/dev/null || echo "000")
    if [ "$SWAGGER_HTTP" = "200" ]; then
        echo "   ✅ Swagger docs accessible (HTTP $SWAGGER_HTTP)"
    else
        echo "   ⚠️  Swagger docs not accessible (HTTP $SWAGGER_HTTP)"
    fi
    
    # Test API
    API_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api 2>/dev/null || echo "000")
    echo "   API endpoint: HTTP $API_HTTP"
else
    echo "   ❌ Backend is not online"
fi
echo ""

# Step 2: Check frontend
echo "📋 Step 2: Frontend verification..."
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
echo "   PM2 Status: $FRONTEND_STATUS"

if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
    
    FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
    if [ "$FRONTEND_HTTP" = "200" ]; then
        echo "   ✅ Frontend responding (HTTP $FRONTEND_HTTP)"
    else
        echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_HTTP)"
    fi
else
    echo "   ❌ Frontend is not online"
fi
echo ""

# Step 3: Check via Nginx
echo "📋 Step 3: Nginx verification..."
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
    echo "   Checking Nginx error logs..."
    sudo tail -10 /var/log/nginx/acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || echo "      Cannot read logs"
fi

API_NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api/docs 2>/dev/null || echo "000")
if [ "$API_NGINX_HTTP" = "200" ]; then
    echo "   ✅ API accessible via Nginx (HTTP $API_NGINX_HTTP)"
else
    echo "   ⚠️  API not accessible via Nginx (HTTP $API_NGINX_HTTP)"
fi
echo ""

# Step 4: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
echo ""
echo "🌐 URLs:"
echo "  - Frontend (local): http://127.0.0.1:3000"
echo "  - Backend (local): http://127.0.0.1:3001"
echo "  - Swagger (local): http://127.0.0.1:3001/api/docs"
echo "  - Frontend (public): https://acoustic.uz"
echo "  - Admin (public): https://admin.acoustic.uz"
echo "  - API (public): https://a.acoustic.uz/api"
echo ""
