#!/bin/bash

# Fix main.acoustic.uz SSL certificate issue
# Usage: ./fix-main-acoustic-uz-ssl.sh

set -e

echo "🔧 Fixing main.acoustic.uz SSL certificate issue..."
echo ""

# 1. Check current situation
echo "📋 Step 1: Checking current situation..."
if [ -d "/etc/letsencrypt/live/main.acoustic.uz" ]; then
    echo "  ✅ SSL certificate exists for main.acoustic.uz"
    USE_EXISTING_CERT=true
elif [ -d "/etc/letsencrypt/live/acoustic.uz" ]; then
    echo "  ℹ️  Using acoustic.uz certificate for main.acoustic.uz"
    USE_EXISTING_CERT=false
else
    echo "  ❌ No SSL certificates found"
    exit 1
fi
echo ""

# 2. Find main.acoustic.uz config
echo "📋 Step 2: Finding main.acoustic.uz config..."
MAIN_CONFIG=""
if [ -f "/etc/nginx/sites-available/acoustic-uz.conf" ] && grep -q "server_name main.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf; then
    MAIN_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
    echo "  ✅ Found in acoustic-uz.conf"
elif [ -f "/etc/nginx/sites-available/main.acoustic.uz" ]; then
    MAIN_CONFIG="/etc/nginx/sites-available/main.acoustic.uz"
    echo "  ✅ Found in separate config file"
else
    echo "  ❌ Config not found"
    exit 1
fi
echo ""

# 3. Backup config
echo "📋 Step 3: Backing up config..."
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 4. Fix SSL certificate path
echo "📋 Step 4: Fixing SSL certificate path..."

if [ "$USE_EXISTING_CERT" = "true" ]; then
    # Use main.acoustic.uz certificate
    sed -i 's|ssl_certificate.*main.acoustic.uz|ssl_certificate /etc/letsencrypt/live/main.acoustic.uz/fullchain.pem|g' "$MAIN_CONFIG"
    sed -i 's|ssl_certificate_key.*main.acoustic.uz|ssl_certificate_key /etc/letsencrypt/live/main.acoustic.uz/privkey.pem|g' "$MAIN_CONFIG"
    echo "  ✅ Updated to use main.acoustic.uz certificate"
else
    # Use acoustic.uz certificate (if main.acoustic.uz should share it)
    sed -i 's|ssl_certificate.*|ssl_certificate /etc/letsencrypt/live/acoustic.uz/fullchain.pem;|g' "$MAIN_CONFIG"
    sed -i 's|ssl_certificate_key.*|ssl_certificate_key /etc/letsencrypt/live/acoustic.uz/privkey.pem;|g' "$MAIN_CONFIG"
    echo "  ✅ Updated to use acoustic.uz certificate"
fi
echo ""

# 5. Get SSL certificate if needed
if [ "$USE_EXISTING_CERT" = "false" ]; then
    echo "📋 Step 5: Getting SSL certificate for main.acoustic.uz..."
    certbot --nginx \
        -d main.acoustic.uz \
        --non-interactive \
        --agree-tos \
        --email admin@acoustic.uz \
        --redirect || {
        echo "  ⚠️  Certbot failed, but config may still work"
    }
    echo ""
fi

# 6. Test config
echo "📋 Step 6: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Config has errors!"
    echo "  Restoring backup..."
    cp "$MAIN_CONFIG.backup."* "$MAIN_CONFIG" 2>/dev/null || true
    exit 1
fi
echo ""

# 7. Test connection
echo "📋 Step 7: Testing connection..."
sleep 2
MAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://main.acoustic.uz 2>&1 | tail -1 || echo "000")
echo "  HTTPS Status: $MAIN_CODE"

if [ "$MAIN_CODE" = "200" ] || [ "$MAIN_CODE" = "301" ] || [ "$MAIN_CODE" = "302" ]; then
    echo "  ✅ main.acoustic.uz is working!"
else
    echo "  ⚠️  Still has issues, but SSL error should be fixed"
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Note: If main.acoustic.uz should have its own certificate, run:"
echo "  certbot --nginx -d main.acoustic.uz --non-interactive --agree-tos --email admin@acoustic.uz"

