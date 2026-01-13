#!/bin/bash

# Fix Nginx HTTPS configuration for acoustic.uz
# Usage: ./fix-nginx-https-config.sh

set -e

echo "🔧 Fixing Nginx HTTPS configuration..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Backup config
echo "📋 Step 1: Backing up config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 2. Show current HTTPS block
echo "📋 Step 2: Current HTTPS server block..."
nginx -T 2>/dev/null | grep -B 2 -A 35 "listen 443.*acoustic.uz" | head -40
echo ""

# 3. Check if proxy_pass is correct
echo "📋 Step 3: Checking proxy_pass..."
PROXY_PASS=$(nginx -T 2>/dev/null | grep -A 10 "server_name acoustic.uz www.acoustic.uz" | grep "proxy_pass" | head -1)
echo "  Current proxy_pass: $PROXY_PASS"

if echo "$PROXY_PASS" | grep -q "localhost:3000"; then
    echo "  ✅ proxy_pass is correct (localhost:3000)"
else
    echo "  ❌ proxy_pass is WRONG!"
    echo "  Expected: proxy_pass http://localhost:3000;"
fi
echo ""

# 4. Check if there are multiple HTTPS blocks
echo "📋 Step 4: Checking for multiple HTTPS blocks..."
HTTPS_COUNT=$(nginx -T 2>/dev/null | grep -c "listen 443.*acoustic.uz" || echo "0")
echo "  Found $HTTPS_COUNT HTTPS blocks"

if [ "$HTTPS_COUNT" -gt "1" ]; then
    echo "  ⚠️  Multiple HTTPS blocks found! This is the problem."
    echo "  Showing all HTTPS blocks:"
    nginx -T 2>/dev/null | grep -B 5 -A 20 "listen 443.*acoustic.uz"
fi
echo ""

# 5. Restore correct config from template
echo "📋 Step 5: Restoring correct config..."
cd /var/www/acoustic.uz

# Download fresh config if not exists
if [ ! -f "deploy/nginx-acoustic-uz-new-server.conf" ]; then
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server.conf -o deploy/nginx-acoustic-uz-new-server.conf
fi

# But first, let certbot update it with SSL certificates
echo "  Config will be updated by certbot..."
echo ""

# 6. Re-run certbot to fix SSL config
echo "📋 Step 6: Re-running certbot to fix SSL config..."
certbot --nginx --expand \
    -d acoustic.uz \
    -d www.acoustic.uz \
    -d a.acoustic.uz \
    -d admin.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect || {
    echo "  ⚠️  Certbot failed, but continuing..."
}
echo ""

# 7. Verify proxy_pass after certbot
echo "📋 Step 7: Verifying proxy_pass after certbot..."
PROXY_PASS_AFTER=$(nginx -T 2>/dev/null | grep -A 10 "server_name acoustic.uz www.acoustic.uz" | grep "proxy_pass" | head -1)
echo "  proxy_pass: $PROXY_PASS_AFTER"

if echo "$PROXY_PASS_AFTER" | grep -q "localhost:3000"; then
    echo "  ✅ proxy_pass is correct"
else
    echo "  ❌ proxy_pass is still wrong! Fixing manually..."
    
    # Fix manually
    sed -i 's|proxy_pass http://localhost:3001;|proxy_pass http://localhost:3000;|g' "$CONFIG_FILE"
    sed -i 's|proxy_pass http://127.0.0.1:3001;|proxy_pass http://localhost:3000;|g' "$CONFIG_FILE"
    
    # Verify again
    PROXY_PASS_FIXED=$(nginx -T 2>/dev/null | grep -A 10 "server_name acoustic.uz www.acoustic.uz" | grep "proxy_pass" | head -1)
    echo "  After fix: $PROXY_PASS_FIXED"
fi
echo ""

# 8. Test config
echo "📋 Step 8: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Config has errors!"
    exit 1
fi
echo ""

# 9. Test connection
echo "📋 Step 9: Testing HTTPS connection..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz || echo "000")
echo "  HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "  ✅ HTTPS is working!"
else
    echo "  ❌ HTTPS still has issues"
    echo "  Response:"
    curl -s https://acoustic.uz | head -5
fi
echo ""

echo "✅ Fix complete!"

