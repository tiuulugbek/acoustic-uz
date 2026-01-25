#!/bin/bash
# Find and fix acoustic.uz server block in Nginx

set -e

echo "🔍 Finding acoustic.uz server block in Nginx..."
echo ""

# Find all Nginx config files
echo "📋 Searching for acoustic.uz in Nginx configs..."
NGINX_CONFIGS=(
    "/etc/nginx/sites-available/acoustic-uz.conf"
    "/etc/nginx/sites-enabled/acoustic-uz.conf"
    "/etc/nginx/conf.d/acoustic-uz.conf"
)

FOUND_CONFIG=""

for config in "${NGINX_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo "   Checking: $config"
        if grep -q "server_name acoustic.uz" "$config"; then
            echo "   ✅ Found acoustic.uz in: $config"
            FOUND_CONFIG="$config"
            break
        fi
    fi
done

if [ -z "$FOUND_CONFIG" ]; then
    echo "   ⚠️  acoustic.uz not found in standard locations"
    echo "   Searching in all Nginx configs..."
    sudo find /etc/nginx -name "*.conf" -type f -exec grep -l "server_name acoustic.uz" {} \; 2>/dev/null | head -5
    exit 1
fi

echo ""
echo "📋 Current acoustic.uz server block:"
awk '/server_name acoustic.uz/,/^}/' "$FOUND_CONFIG" | head -50 | sed 's/^/   /'
echo ""

# Check for proxy_pass
echo "📋 Checking proxy_pass configuration:"
if grep -A 20 "server_name acoustic.uz" "$FOUND_CONFIG" | grep -q "proxy_pass.*127.0.0.1:3000"; then
    echo "   ✅ Already using 127.0.0.1:3000"
elif grep -A 20 "server_name acoustic.uz" "$FOUND_CONFIG" | grep -q "proxy_pass.*localhost:3000"; then
    echo "   ⚠️  Found localhost:3000, fixing..."
    BACKUP_FILE="${FOUND_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$FOUND_CONFIG" "$BACKUP_FILE"
    sudo sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://127.0.0.1:3000|g' "$FOUND_CONFIG"
    sudo sed -i 's|proxy_pass http://\[::1\]:3000|proxy_pass http://127.0.0.1:3000|g' "$FOUND_CONFIG"
    echo "   ✅ Fixed"
elif grep -A 20 "server_name acoustic.uz" "$FOUND_CONFIG" | grep -q "proxy_pass.*\[::1\]:3000"; then
    echo "   ⚠️  Found [::1]:3000, fixing..."
    BACKUP_FILE="${FOUND_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$FOUND_CONFIG" "$BACKUP_FILE"
    sudo sed -i 's|proxy_pass http://\[::1\]:3000|proxy_pass http://127.0.0.1:3000|g' "$FOUND_CONFIG"
    echo "   ✅ Fixed"
else
    echo "   ⚠️  No proxy_pass found for acoustic.uz"
    echo "   Showing location blocks:"
    grep -A 20 "server_name acoustic.uz" "$FOUND_CONFIG" | grep -A 10 "location" | sed 's/^/      /'
fi

echo ""
echo "📋 Updated configuration:"
awk '/server_name acoustic.uz/,/^}/' "$FOUND_CONFIG" | grep -A 10 "location /" | sed 's/^/   /'
echo ""

# Test and reload
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Configuration is valid"
    echo ""
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Configuration test failed"
    exit 1
fi

echo ""
echo "🧪 Testing frontend..."
sleep 2
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Frontend accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Frontend not accessible (HTTP $NGINX_HTTP)"
    echo "   Recent errors:"
    sudo tail -3 /var/log/nginx/acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || true
fi

echo ""
echo "✅ Fix complete!"

