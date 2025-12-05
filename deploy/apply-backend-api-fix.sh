#!/bin/bash

# Apply backend API fix without breaking SSL
# Usage: ./apply-backend-api-fix.sh

set -e

echo "🔧 Applying backend API fix..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Backup current config
echo "📋 Step 1: Backing up current config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 2. Check if SSL certificates exist
echo "📋 Step 2: Checking SSL certificates..."
if [ -f "/etc/letsencrypt/live/a.acoustic.uz/fullchain.pem" ]; then
    echo "  ✅ SSL certificates exist"
    USE_SSL=true
else
    echo "  ⚠️  SSL certificates not found, using HTTP-only config"
    USE_SSL=false
fi
echo ""

# 3. Apply fix based on SSL status
if [ "$USE_SSL" = "true" ]; then
    echo "📋 Step 3: Updating config with SSL..."
    
    # Update location / to location /api in the existing config
    sed -i '/server_name a.acoustic.uz/,/listen 443 ssl http2/ {
        /location \/ {/,/^    }/ {
            s|location / {|location /api {|
            s|proxy_pass http://localhost:3001;|proxy_pass http://localhost:3001/api;|
        }
    }' "$CONFIG_FILE"
    
    # Add root location block after /api location
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
    
else
    echo "📋 Step 3: Using HTTP-only config..."
    cp /var/www/acoustic.uz/deploy/nginx-acoustic-uz-new-server-http-only.conf "$CONFIG_FILE"
fi
echo ""

# 4. Test config
echo "📋 Step 4: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
else
    echo "  ❌ Config has errors!"
    echo "  Restoring backup..."
    cp "$CONFIG_FILE.backup."* "$CONFIG_FILE" 2>/dev/null || true
    exit 1
fi
echo ""

# 5. Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
systemctl reload nginx
echo "  ✅ Nginx reloaded"
echo ""

# 6. Test backend API
echo "📋 Step 6: Testing backend API..."
sleep 2
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://a.acoustic.uz/api || echo "000")
echo "  HTTP Status: $API_CODE"

if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
    echo "  ✅ Backend API is responding"
else
    echo "  ⚠️  Backend API response: $API_CODE"
fi
echo ""

# 7. If SSL exists, re-run certbot
if [ "$USE_SSL" = "true" ]; then
    echo "📋 Step 7: Re-running certbot to update SSL config..."
    certbot --nginx --expand \
        -d acoustic.uz \
        -d www.acoustic.uz \
        -d a.acoustic.uz \
        -d admin.acoustic.uz \
        --non-interactive \
        --agree-tos \
        --email admin@acoustic.uz \
        --redirect || {
        echo "  ⚠️  Certbot failed, but config may still work"
    }
    
    # Reload again after certbot
    nginx -t && systemctl reload nginx
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Backend API: http://a.acoustic.uz/api (or https://)"
echo "  - Swagger Docs: http://a.acoustic.uz/api/docs (or https://)"

