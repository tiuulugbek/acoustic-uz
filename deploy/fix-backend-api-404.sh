#!/bin/bash

# Fix backend API 404 error
# Usage: ./fix-backend-api-404.sh

set -e

echo "🔧 Fixing backend API 404 error..."
echo ""

# 1. Check backend status
echo "📋 Step 1: Checking backend status..."
pm2 list | grep acoustic-backend || echo "  Backend not running"
echo ""

# 2. Test backend directly
echo "📋 Step 2: Testing backend directly..."
BACKEND_RESPONSE=$(curl -s http://localhost:3001/api || echo "FAILED")
echo "  Response: $BACKEND_RESPONSE" | head -5

BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api || echo "000")
echo "  HTTP Status: $BACKEND_CODE"
echo ""

# 3. Check backend logs
echo "📋 Step 3: Recent backend logs..."
pm2 logs acoustic-backend --lines 10 --nostream 2>/dev/null || echo "  No logs"
echo ""

# 4. Check Nginx config for a.acoustic.uz
echo "📋 Step 4: Checking Nginx config for a.acoustic.uz..."
nginx -T 2>/dev/null | grep -A 30 "server_name a.acoustic.uz" | grep -E "location|proxy_pass" | head -10
echo ""

# 5. Check if /api location exists
echo "📋 Step 5: Checking /api location block..."
API_LOCATION=$(nginx -T 2>/dev/null | grep -A 10 "server_name a.acoustic.uz" | grep -A 5 "location /api" | head -10)
if [ -z "$API_LOCATION" ]; then
    echo "  ❌ /api location block NOT found!"
    echo "  This is the problem!"
else
    echo "  ✅ /api location block exists:"
    echo "$API_LOCATION"
fi
echo ""

# 6. Check what Nginx is actually serving
echo "📋 Step 6: Testing via Nginx..."
NGINX_RESPONSE=$(curl -s https://a.acoustic.uz/api || echo "FAILED")
echo "  Response: $NGINX_RESPONSE" | head -5

NGINX_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api || echo "000")
echo "  HTTP Status: $NGINX_CODE"
echo ""

# 7. Check Nginx error logs
echo "📋 Step 7: Recent Nginx error logs..."
if [ -f "/var/log/nginx/a.acoustic.uz.error.log" ]; then
    tail -10 /var/log/nginx/a.acoustic.uz.error.log || echo "    No errors"
else
    echo "  Error log not found"
fi
echo ""

# 8. Check Nginx access logs
echo "📋 Step 8: Recent Nginx access logs..."
if [ -f "/var/log/nginx/a.acoustic.uz.access.log" ]; then
    tail -5 /var/log/nginx/a.acoustic.uz.access.log || echo "    No access"
else
    echo "  Access log not found"
fi
echo ""

# 9. Show the actual config file
echo "📋 Step 9: Actual config file (a.acoustic.uz section)..."
grep -A 50 "server_name a.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf | head -55
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "📋 Next steps:"
if [ "$BACKEND_CODE" != "200" ] && [ "$BACKEND_CODE" != "404" ]; then
    echo "  1. Backend is not responding correctly"
    echo "  2. Check: pm2 logs acoustic-backend"
    echo "  3. Restart: pm2 restart acoustic-backend"
elif [ -z "$API_LOCATION" ]; then
    echo "  1. /api location block is missing in Nginx config"
    echo "  2. Need to add location /api block"
    echo "  3. Or fix the config manually"
else
    echo "  1. Backend is responding: HTTP $BACKEND_CODE"
    echo "  2. Nginx config has /api location"
    echo "  3. May need to check proxy_pass configuration"
fi

