#!/bin/bash

# Fix Nginx routing for acoustic.uz
# Usage: ./fix-nginx-routing.sh

set -e

echo "🔧 Fixing Nginx routing..."
echo ""

# 1. Check all enabled configs
echo "📋 Step 1: Checking enabled configs..."
ls -la /etc/nginx/sites-enabled/
echo ""

# 2. Check which server blocks are active for acoustic.uz
echo "📋 Step 2: Checking server blocks for acoustic.uz..."
nginx -T 2>/dev/null | grep -B 5 -A 15 "server_name.*acoustic.uz" | head -30
echo ""

# 3. Check if there are conflicting configs
echo "📋 Step 3: Checking for conflicts..."
CONFLICTS=$(nginx -T 2>/dev/null | grep -c "server_name.*acoustic.uz" || echo "0")
echo "  Found $CONFLICTS server blocks for acoustic.uz"

if [ "$CONFLICTS" -gt "1" ]; then
    echo "  ⚠️  Multiple server blocks found! This may cause conflicts."
    echo "  Disabling old configs..."
    
    # Disable old configs
    rm -f /etc/nginx/sites-enabled/acoustic.uz
    rm -f /etc/nginx/sites-enabled/main.acoustic.uz
    rm -f /etc/nginx/sites-enabled/backend.acoustic.uz
    
    # Ensure only acoustic-uz.conf is enabled
    if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
        ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
    fi
fi
echo ""

# 4. Check proxy_pass configuration
echo "📋 Step 4: Checking proxy_pass configuration..."
nginx -T 2>/dev/null | grep -A 10 "server_name acoustic.uz www.acoustic.uz" | grep -E "proxy_pass|location" | head -10
echo ""

# 5. Test Nginx config
echo "📋 Step 5: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Nginx config is valid"
else
    echo "  ❌ Nginx config has errors!"
    exit 1
fi
echo ""

# 6. Reload Nginx
echo "📋 Step 6: Reloading Nginx..."
systemctl reload nginx
sleep 2
echo "  ✅ Nginx reloaded"
echo ""

# 7. Test connection
echo "📋 Step 7: Testing connections..."
echo "  Testing localhost:3000..."
LOCAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
echo "    HTTP $LOCAL_CODE"

echo "  Testing via Nginx (HTTP)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://acoustic.uz || echo "000")
echo "    HTTP $HTTP_CODE"

echo "  Testing via Nginx (HTTPS)..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz || echo "000")
echo "    HTTP $HTTPS_CODE"

if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo "  ✅ HTTPS is working!"
else
    echo "  ❌ HTTPS still has issues"
    echo "  Response headers:"
    curl -I https://acoustic.uz 2>&1 | head -10
fi
echo ""

# 8. Check Nginx error logs
echo "📋 Step 8: Recent Nginx errors..."
if [ -f "/var/log/nginx/acoustic.uz.error.log" ]; then
    echo "  Last 10 lines:"
    tail -10 /var/log/nginx/acoustic.uz.error.log || echo "    No errors"
else
    echo "  Error log not found"
fi
echo ""

echo "✅ Fix complete!"

