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

# 3. Check current proxy_pass configuration
echo "📋 Current proxy_pass configuration:"
grep -A 2 "server_name acoustic.uz" "$CONFIG_FILE" | grep "proxy_pass" || echo "   Not found"
echo ""

# 4. Replace localhost:3000 with 127.0.0.1:3000 using Python for more reliable replacement
echo "🔧 Replacing localhost:3000 with 127.0.0.1:3000..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Find acoustic.uz server block and replace localhost:3000 with 127.0.0.1:3000
    # Pattern: match proxy_pass http://localhost:3000 (with optional trailing slash or semicolon)
    pattern = r'(proxy_pass\s+http://)localhost:3000([\s;])'
    replacement = r'\1127.0.0.1:3000\2'
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content == content:
        print("   ⚠️  No changes made - localhost:3000 not found")
        print("   Checking for other patterns...")
        # Try alternative patterns
        patterns = [
            r'proxy_pass\s+http://localhost:3000',
            r'proxy_pass\s+http://localhost:3000/',
            r'proxy_pass\s+http://localhost:3000;',
        ]
        for p in patterns:
            if re.search(p, content):
                print(f"   Found pattern: {p}")
                new_content = re.sub(p, p.replace('localhost', '127.0.0.1'), content)
                break
    else:
        print("   ✅ Successfully updated proxy_pass to use 127.0.0.1:3000")
    
    # Write back
    with open(config_file, 'w') as f:
        f.write(new_content)
    
    # Verify
    if 'proxy_pass http://127.0.0.1:3000' in new_content:
        print("   ✅ Verification: Found 127.0.0.1:3000 in config")
    else:
        print("   ⚠️  Warning: 127.0.0.1:3000 not found after update")
        print("   Showing proxy_pass lines:")
        for line in new_content.split('\n'):
            if 'proxy_pass' in line:
                print(f"      {line.strip()}")
    
except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    print(traceback.format_exc())
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Failed to update config"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# 5. Test Nginx config
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

# 6. Reload Nginx
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

