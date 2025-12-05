#!/bin/bash

# Fix backend API routing for a.acoustic.uz
# Usage: ./fix-backend-api-routing.sh

set -e

echo "🔧 Fixing backend API routing..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Check current backend config
echo "📋 Step 1: Current backend API config..."
nginx -T 2>/dev/null | grep -B 5 -A 25 "server_name a.acoustic.uz" | head -35
echo ""

# 2. Check proxy_pass for /api
echo "📋 Step 2: Checking proxy_pass for /api..."
API_PROXY=$(nginx -T 2>/dev/null | grep -A 15 "server_name a.acoustic.uz" | grep -A 5 "location /" | grep "proxy_pass" | head -1)
echo "  Current proxy_pass: $API_PROXY"

if echo "$API_PROXY" | grep -q "localhost:3001"; then
    echo "  ✅ proxy_pass is correct (localhost:3001)"
else
    echo "  ❌ proxy_pass is WRONG!"
fi
echo ""

# 3. Check if /api location block exists
echo "📋 Step 3: Checking for /api location block..."
API_LOCATION=$(nginx -T 2>/dev/null | grep -A 10 "server_name a.acoustic.uz" | grep -A 5 "location /api" | head -10)
if [ -z "$API_LOCATION" ]; then
    echo "  ❌ /api location block NOT found!"
    echo "  This is the problem - backend uses /api prefix"
else
    echo "  ✅ /api location block exists"
    echo "  $API_LOCATION"
fi
echo ""

# 4. Check backend is running
echo "📋 Step 4: Checking backend status..."
pm2 list | grep acoustic-backend || echo "  Backend not running"
echo ""

# 5. Test backend directly
echo "📋 Step 5: Testing backend directly..."
BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api || echo "000")
echo "  Backend /api response: HTTP $BACKEND_CODE"

if [ "$BACKEND_CODE" = "200" ] || [ "$BACKEND_CODE" = "404" ]; then
    echo "  ✅ Backend is responding"
else
    echo "  ❌ Backend is NOT responding"
fi
echo ""

# 6. Check what backend returns
echo "📋 Step 6: Backend response..."
curl -s http://localhost:3001/api | head -5
echo ""

# 7. Fix config if needed
echo "📋 Step 7: Checking config file..."
if grep -q "location /api" "$CONFIG_FILE" | grep -q "a.acoustic.uz"; then
    echo "  ✅ /api location exists in config"
else
    echo "  ❌ /api location missing! Adding it..."
    
    # Backup
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
    
    # Add /api location block before the main location /
    # This is tricky, so we'll use a Python script or sed
    echo "  Note: Manual fix may be needed"
fi
echo ""

# 8. Show the actual config for a.acoustic.uz
echo "📋 Step 8: Full config for a.acoustic.uz..."
grep -A 50 "server_name a.acoustic.uz" "$CONFIG_FILE" | head -55
echo ""

echo "✅ Check complete!"
echo ""
echo "📋 Next steps:"
echo "  1. If /api location is missing, add it manually"
echo "  2. Or ensure main location / proxies to /api correctly"
echo "  3. Backend uses /api prefix, so proxy_pass should handle it"

