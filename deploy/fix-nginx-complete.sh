#!/bin/bash
# Complete Nginx fix: clear cache and restart

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Complete Nginx fix..."
echo ""

# Step 1: Check current configuration
echo "📋 Step 1: Checking current configuration..."
if grep -q "proxy_pass.*127.0.0.1:3000" "$NGINX_CONFIG"; then
    echo "   ✅ Configuration already uses 127.0.0.1:3000"
else
    echo "   ⚠️  Configuration needs update"
    # Fix it
    sudo sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://127.0.0.1:3000|g' "$NGINX_CONFIG"
    sudo sed -i 's|proxy_pass http://\[::1\]:3000|proxy_pass http://127.0.0.1:3000|g' "$NGINX_CONFIG"
    echo "   ✅ Configuration updated"
fi
echo ""

# Step 2: Test configuration
echo "📋 Step 2: Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Configuration is valid"
else
    echo "   ❌ Configuration test failed"
    exit 1
fi
echo ""

# Step 3: Clear Nginx cache
echo "📋 Step 3: Clearing Nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    sudo rm -rf /var/cache/nginx/*
    echo "   ✅ Cache cleared"
else
    echo "   ℹ️  No cache directory found"
fi
echo ""

# Step 4: Restart Nginx (not just reload)
echo "📋 Step 4: Restarting Nginx..."
if sudo systemctl restart nginx; then
    echo "   ✅ Nginx restarted"
else
    echo "   ❌ Failed to restart Nginx"
    exit 1
fi
echo ""

# Step 5: Wait a moment
sleep 2

# Step 6: Verify
echo "📋 Step 5: Verifying..."
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
echo "   Frontend local: HTTP $FRONTEND_HTTP"

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
echo "   Frontend via Nginx: HTTP $NGINX_HTTP"

if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Frontend is accessible via Nginx!"
else
    echo "   ⚠️  Frontend still not accessible (HTTP $NGINX_HTTP)"
    echo "   Checking recent errors..."
    sudo tail -5 /var/log/nginx/acoustic.uz.error.log | sed 's/^/      /' || true
fi

echo ""
echo "✅ Nginx fix complete!"

