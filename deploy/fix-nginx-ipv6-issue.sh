#!/bin/bash

# Fix Nginx IPv6 issue - use 127.0.0.1 instead of localhost for proxy_pass
# This ensures Nginx connects via IPv4 instead of IPv6

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing Nginx IPv6 issue for acoustic.uz..."
echo ""

# 1. Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# 2. Create backup
echo "📋 Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# 3. Replace localhost:3000 with 127.0.0.1:3000 in acoustic.uz server block
echo "🔧 Replacing localhost:3000 with 127.0.0.1:3000..."
sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://127.0.0.1:3000|g' "$CONFIG_FILE"

# Verify the change
if grep -q "proxy_pass http://127.0.0.1:3000" "$CONFIG_FILE"; then
    echo "   ✅ Successfully updated proxy_pass to use 127.0.0.1:3000"
else
    echo "   ❌ Failed to update proxy_pass"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# 4. Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# 5. Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
if sudo systemctl reload nginx; then
    echo "   ✅ Nginx reloaded successfully"
else
    echo "   ❌ Failed to reload Nginx"
    exit 1
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Summary:"
echo "  - Changed proxy_pass from localhost:3000 to 127.0.0.1:3000"
echo "  - This ensures Nginx uses IPv4 instead of IPv6"
echo ""
echo "🔍 Test:"
echo "  - Check website: https://acoustic.uz"
echo "  - Check Nginx logs: tail -f /var/log/nginx/acoustic.uz.error.log"

