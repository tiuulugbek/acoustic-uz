#!/bin/bash

# Check main.acoustic.uz SSL certificate issue
# Usage: ./check-main-acoustic-uz.sh

set -e

echo "🔍 Checking main.acoustic.uz SSL certificate issue..."
echo ""

# 1. Check SSL certificate for main.acoustic.uz
echo "📋 Step 1: Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/main.acoustic.uz" ]; then
    echo "  ✅ SSL certificate exists for main.acoustic.uz"
    ls -la /etc/letsencrypt/live/main.acoustic.uz/ | grep -E "fullchain|privkey"
else
    echo "  ❌ SSL certificate NOT found for main.acoustic.uz"
fi
echo ""

# 2. Check what certificates exist
echo "📋 Step 2: Available SSL certificates..."
ls -la /etc/letsencrypt/live/ 2>/dev/null | grep acoustic || echo "  No acoustic certificates found"
echo ""

# 3. Check Nginx config for main.acoustic.uz
echo "📋 Step 3: Checking Nginx config for main.acoustic.uz..."
if grep -q "server_name main.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf; then
    echo "  ✅ main.acoustic.uz found in acoustic-uz.conf"
    grep -A 20 "server_name main.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf | head -25
elif grep -q "server_name main.acoustic.uz" /etc/nginx/sites-available/main.acoustic.uz; then
    echo "  ✅ main.acoustic.uz found in separate config file"
    grep -A 20 "server_name main.acoustic.uz" /etc/nginx/sites-available/main.acoustic.uz | head -25
else
    echo "  ⚠️  main.acoustic.uz config not found"
fi
echo ""

# 4. Check enabled configs
echo "📋 Step 4: Enabled Nginx configs..."
ls -la /etc/nginx/sites-enabled/ | grep main || echo "  No main.acoustic.uz config enabled"
echo ""

# 5. Check what SSL certificate is being used
echo "📋 Step 5: SSL certificate being used..."
nginx -T 2>/dev/null | grep -B 5 -A 5 "server_name main.acoustic.uz" | grep -E "ssl_certificate|server_name" | head -5
echo ""

# 6. Check certificate details
echo "📋 Step 6: Certificate details..."
CERT_PATH=$(nginx -T 2>/dev/null | grep -A 10 "server_name main.acoustic.uz" | grep "ssl_certificate" | head -1 | awk '{print $2}' | tr -d ';')
if [ -n "$CERT_PATH" ] && [ -f "$CERT_PATH" ]; then
    echo "  Certificate path: $CERT_PATH"
    echo "  Certificate domains:"
    openssl x509 -in "$CERT_PATH" -noout -text 2>/dev/null | grep -A 1 "Subject Alternative Name" | grep DNS || echo "    Could not read certificate"
else
    echo "  ⚠️  Certificate path not found or invalid"
fi
echo ""

echo "✅ Check complete!"
echo ""
echo "📋 Solutions:"
echo "  1. If certificate doesn't exist: Get SSL certificate for main.acoustic.uz"
echo "  2. If certificate exists but wrong: Update Nginx config to use correct certificate"
echo "  3. If main.acoustic.uz should use acoustic.uz certificate: Update config to use acoustic.uz certificate"

