#!/bin/bash

# Verify Nginx configuration for acoustic.uz
# Usage: ./verify-nginx-config.sh

set -e

echo "🔍 Verifying Nginx configuration..."
echo ""

# 1. Check enabled configs
echo "📋 Step 1: Enabled Nginx configs:"
ls -la /etc/nginx/sites-enabled/ | grep -v "^d" | tail -n +2
echo ""

# 2. Check acoustic.uz config
echo "📋 Step 2: Checking acoustic.uz config..."
if [ -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    echo "  ✅ Config file exists"
    echo "  Server blocks for acoustic.uz:"
    grep -A 10 "server_name acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf | head -15
else
    echo "  ❌ Config file NOT found!"
fi
echo ""

# 3. Test Nginx config
echo "📋 Step 3: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Nginx config is valid"
else
    echo "  ❌ Nginx config has errors!"
    exit 1
fi
echo ""

# 4. Check active server blocks
echo "📋 Step 4: Active server blocks:"
nginx -T 2>/dev/null | grep -E "server_name|listen" | grep -E "acoustic.uz|a.acoustic.uz|admin.acoustic.uz" | head -20
echo ""

# 5. Check proxy_pass configuration
echo "📋 Step 5: Proxy configuration for acoustic.uz:"
nginx -T 2>/dev/null | grep -A 5 "server_name acoustic.uz" | grep -E "proxy_pass|location" | head -10
echo ""

# 6. Check if port 3000 is accessible
echo "📋 Step 6: Testing backend connection..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -qE "200|301|302|304"; then
    echo "  ✅ Port 3000 is responding"
else
    echo "  ❌ Port 3000 is NOT responding correctly"
    echo "  Response:"
    curl -s http://localhost:3000 | head -5
fi
echo ""

echo "✅ Verification complete!"

