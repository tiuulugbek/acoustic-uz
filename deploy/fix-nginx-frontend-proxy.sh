#!/bin/bash
# Fix Nginx frontend proxy to use 127.0.0.1 instead of localhost/IPv6

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing Nginx frontend proxy configuration..."
echo ""

# Check if config file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ ERROR: Config file not found: $NGINX_CONFIG"
    exit 1
fi

# Create backup
echo "📋 Creating backup..."
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Check current configuration
echo "📋 Current proxy_pass configuration for acoustic.uz:"
grep -A 5 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 3 "location /" | grep "proxy_pass" || echo "   Not found"
echo ""

# Fix using Python for reliable replacement
echo "🔧 Replacing localhost:3000 and [::1]:3000 with 127.0.0.1:3000..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Find acoustic.uz server block and replace all localhost:3000 variants
    # Pattern: match proxy_pass with localhost:3000 or [::1]:3000
    patterns = [
        (r'proxy_pass\s+http://localhost:3000([\s;])', r'proxy_pass http://127.0.0.1:3000\1'),
        (r'proxy_pass\s+http://\[::1\]:3000([\s;])', r'proxy_pass http://127.0.0.1:3000\1'),
        (r'proxy_pass\s+http://\[::ffff:127\.0\.0\.1\]:3000([\s;])', r'proxy_pass http://127.0.0.1:3000\1'),
    ]
    
    new_content = content
    changes_made = False
    
    for pattern, replacement in patterns:
        if re.search(pattern, new_content):
            new_content = re.sub(pattern, replacement, new_content)
            changes_made = True
            print(f"   ✅ Replaced pattern: {pattern}")
    
    if not changes_made:
        # Check if already correct
        if 'proxy_pass http://127.0.0.1:3000' in new_content:
            print("   ✅ Configuration already uses 127.0.0.1:3000")
        else:
            print("   ⚠️  No matching patterns found")
            print("   Showing all proxy_pass lines:")
            for line in new_content.split('\n'):
                if 'proxy_pass' in line and '3000' in line:
                    print(f"      {line.strip()}")
    else:
        # Write back
        with open(config_file, 'w') as f:
            f.write(new_content)
        print("   ✅ Configuration updated")
    
except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    print(traceback.format_exc())
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Failed to update config"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

# Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

# Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
if sudo systemctl reload nginx; then
    echo "   ✅ Nginx reloaded successfully"
else
    echo "   ❌ Failed to reload Nginx"
    exit 1
fi

# Verify
echo ""
echo "📋 Verifying configuration..."
echo "   proxy_pass lines for acoustic.uz:"
grep -A 10 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 5 "location /" | grep "proxy_pass" | sed 's/^/      /' || echo "      Not found"

echo ""
echo "✅ Fix complete!"
echo ""
echo "🧪 Testing frontend via Nginx..."
sleep 2
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Frontend accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Frontend not accessible via Nginx (HTTP $NGINX_HTTP)"
    echo "   Check logs: sudo tail -f /var/log/nginx/acoustic.uz.error.log"
fi

