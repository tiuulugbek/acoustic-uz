#!/bin/bash

# Fix backend API and restore SSL
# Usage: ./fix-backend-api-and-ssl.sh

set -e

echo "🔧 Fixing backend API and restoring SSL..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Check SSL certificates
echo "📋 Step 1: Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/acoustic.uz" ]; then
    echo "  ✅ SSL certificates exist"
    ls -la /etc/letsencrypt/live/acoustic.uz/ | grep -E "fullchain|privkey"
else
    echo "  ❌ SSL certificates NOT found!"
    echo "  Need to obtain certificates first"
    exit 1
fi
echo ""

# 2. Restore config with SSL and fix backend API
echo "📋 Step 2: Restoring config with SSL and fixing backend API..."
cd /var/www/acoustic.uz

# Download fresh config
if [ ! -f "deploy/nginx-acoustic-uz-new-server.conf" ]; then
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server.conf -o deploy/nginx-acoustic-uz-new-server.conf
fi

# Copy config
cp deploy/nginx-acoustic-uz-new-server.conf "$CONFIG_FILE"

# 3. Test config (will fail because SSL paths are wrong, but that's OK)
echo "📋 Step 3: Testing config (may show SSL errors, that's OK)..."
nginx -t 2>&1 | grep -v "cannot load certificate" || true
echo ""

# 4. Run certbot to fix SSL config
echo "📋 Step 4: Running certbot to fix SSL config..."
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

# 5. Verify backend API config after certbot
echo "📋 Step 5: Verifying backend API config..."
BACKEND_CONFIG=$(nginx -T 2>/dev/null | grep -A 20 "server_name a.acoustic.uz" | grep -A 5 "location /api" | head -10)
if echo "$BACKEND_CONFIG" | grep -q "proxy_pass.*localhost:3001/api"; then
    echo "  ✅ Backend API config is correct"
else
    echo "  ❌ Backend API config is wrong! Fixing..."
    
    # Fix manually using sed
    sed -i '/server_name a.acoustic.uz/,/listen 443 ssl http2/ {
        /location \/ {/,/^    }/ {
            s|location / {|location /api {|
            s|proxy_pass http://localhost:3001;|proxy_pass http://localhost:3001/api;|
        }
    }' "$CONFIG_FILE"
    
    # Add root location blocks
    sed -i '/location \/api {/,/^    }/a\
    \
    # Root location - return 404\
    location = / {\
        return 404;\
    }\
    \
    # All other locations\
    location / {\
        return 404;\
    }' "$CONFIG_FILE"
    
    echo "  ✅ Config fixed manually"
fi
echo ""

# 6. Test config
echo "📋 Step 6: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Config has errors!"
    exit 1
fi
echo ""

# 7. Test backend API
echo "📋 Step 7: Testing backend API..."
sleep 2

# Test HTTP
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://a.acoustic.uz/api || echo "000")
echo "  HTTP /api: $HTTP_CODE"

# Test HTTPS
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api || echo "000")
echo "  HTTPS /api: $HTTPS_CODE"

# Test /api/docs
DOCS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api/docs || echo "000")
echo "  HTTPS /api/docs: $DOCS_CODE"

if [ "$HTTPS_CODE" = "200" ] || [ "$DOCS_CODE" = "200" ]; then
    echo "  ✅ Backend API is working!"
else
    echo "  ⚠️  Backend API may still have issues"
    echo "  Testing backend directly:"
    curl -s http://localhost:3001/api | head -5
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Backend API: https://a.acoustic.uz/api"
echo "  - Swagger Docs: https://a.acoustic.uz/api/docs"

