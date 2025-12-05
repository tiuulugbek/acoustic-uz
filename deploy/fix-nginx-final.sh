#!/bin/bash

# Final fix: Use HTTP-only config, then get SSL certificates
# Usage: ./fix-nginx-final.sh

set -e

echo "🔧 Final Nginx fix..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Backup
echo "📋 Step 1: Backing up config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 2. Use HTTP-only config
echo "📋 Step 2: Using HTTP-only config..."
cd /var/www/acoustic.uz

# Download HTTP-only config if not exists
if [ ! -f "deploy/nginx-acoustic-uz-new-server-http-only.conf" ]; then
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server-http-only.conf -o deploy/nginx-acoustic-uz-new-server-http-only.conf
fi

cp deploy/nginx-acoustic-uz-new-server-http-only.conf "$CONFIG_FILE"
echo "  ✅ HTTP-only config applied"
echo ""

# 3. Test config
echo "📋 Step 3: Testing HTTP-only config..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Config has errors!"
    exit 1
fi
echo ""

# 4. Get SSL certificates
echo "📋 Step 4: Getting SSL certificates..."
certbot --nginx --expand \
    -d acoustic.uz \
    -d www.acoustic.uz \
    -d a.acoustic.uz \
    -d admin.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect || {
    echo "  ⚠️  Certbot failed"
    echo "  You may need to run it manually"
}
echo ""

# 5. Test config after certbot
echo "📋 Step 5: Testing config after certbot..."
if nginx -t; then
    echo "  ✅ Config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ⚠️  Config has warnings/errors, but continuing..."
    nginx -t 2>&1 | head -10
fi
echo ""

# 6. Test all endpoints
echo "📋 Step 6: Testing endpoints..."
sleep 2

echo "  Frontend:"
curl -s -o /dev/null -w "    HTTP %{http_code}\n" https://acoustic.uz || echo "    Failed"

echo "  Backend API:"
curl -s -o /dev/null -w "    HTTP %{http_code}\n" https://a.acoustic.uz/api || echo "    Failed"

echo "  Swagger Docs:"
curl -s -o /dev/null -w "    HTTP %{http_code}\n" https://a.acoustic.uz/api/docs || echo "    Failed"

echo "  Admin Panel:"
curl -s -o /dev/null -w "    HTTP %{http_code}\n" https://admin.acoustic.uz || echo "    Failed"

echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 If backend API still returns 404, check:"
echo "  1. Backend is running: pm2 list"
echo "  2. Backend logs: pm2 logs acoustic-backend"
echo "  3. Test backend directly: curl http://localhost:3001/api"

