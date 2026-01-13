#!/bin/bash

# Get SSL certificate for main.acoustic.uz
# Usage: ./get-main-acoustic-uz-cert.sh

set -e

echo "🔒 Getting SSL certificate for main.acoustic.uz..."
echo ""

# 1. Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# 2. Check DNS
echo "📋 Step 1: Checking DNS..."
MAIN_IP=$(dig +short main.acoustic.uz | head -1)
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "  main.acoustic.uz -> $MAIN_IP (server: $SERVER_IP)"

if [ "$MAIN_IP" != "$SERVER_IP" ]; then
    echo "  ⚠️  DNS may not be pointing to this server"
    echo "  Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Aborted"
        exit 1
    fi
fi
echo ""

# 3. Check current config
echo "📋 Step 2: Checking current config..."
if grep -q "server_name main.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf; then
    echo "  ✅ main.acoustic.uz found in acoustic-uz.conf"
    MAIN_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
elif [ -f "/etc/nginx/sites-available/main.acoustic.uz" ]; then
    echo "  ✅ main.acoustic.uz found in separate config"
    MAIN_CONFIG="/etc/nginx/sites-available/main.acoustic.uz"
else
    echo "  ❌ Config not found, creating..."
    MAIN_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
fi
echo ""

# 4. Ensure HTTP config exists (for certbot)
echo "📋 Step 3: Ensuring HTTP config exists..."
if ! grep -q "listen 80" "$MAIN_CONFIG" | grep -A 2 "server_name main.acoustic.uz"; then
    echo "  Adding HTTP server block..."
    # Add HTTP server block if not exists
    cat >> "$MAIN_CONFIG" << 'EOF'

# HTTP to HTTPS redirect for main.acoustic.uz
server {
    listen 80;
    server_name main.acoustic.uz;
    return 301 https://main.acoustic.uz$request_uri;
}
EOF
    nginx -t && systemctl reload nginx
fi
echo ""

# 5. Get SSL certificate
echo "📋 Step 4: Getting SSL certificate..."
certbot --nginx \
    -d main.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect || {
    echo "  ⚠️  Certbot failed"
    echo "  Error details:"
    tail -20 /var/log/letsencrypt/letsencrypt.log
    exit 1
}
echo ""

# 6. Test config
echo "📋 Step 5: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Config has errors!"
    exit 1
fi
echo ""

# 7. Test connection
echo "📋 Step 6: Testing connection..."
sleep 3
MAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://main.acoustic.uz 2>&1 | tail -1 || echo "000")
echo "  HTTPS Status: $MAIN_CODE"

if [ "$MAIN_CODE" = "200" ] || [ "$MAIN_CODE" = "301" ] || [ "$MAIN_CODE" = "302" ]; then
    echo "  ✅ main.acoustic.uz is working!"
else
    echo "  ⚠️  Still has issues"
    echo "  Testing HTTP redirect:"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://main.acoustic.uz 2>&1 | tail -1 || echo "000")
    echo "    HTTP Status: $HTTP_CODE"
fi
echo ""

echo "✅ SSL certificate setup complete!"
echo ""
echo "📋 Verify:"
echo "  - Certificate: ls -la /etc/letsencrypt/live/main.acoustic.uz/"
echo "  - Test: curl -I https://main.acoustic.uz"

