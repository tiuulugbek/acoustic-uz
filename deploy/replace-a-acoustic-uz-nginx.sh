#!/bin/bash

# Replace a.acoustic.uz server block in Nginx config with complete configuration
# This script replaces ONLY the a.acoustic.uz server block

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEW_CONFIG="${SCRIPT_DIR}/nginx-a-acoustic-uz-complete.conf"

echo "🔧 Replacing a.acoustic.uz server block with complete configuration..."
echo ""

# 1. Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# 2. Check if new config exists
if [ ! -f "$NEW_CONFIG" ]; then
    echo "❌ ERROR: New config file not found: $NEW_CONFIG"
    exit 1
fi

# 3. Check if a.acoustic.uz server block exists
if ! grep -q "server_name a.acoustic.uz" "$CONFIG_FILE"; then
    echo "❌ ERROR: a.acoustic.uz server block not found"
    exit 1
fi

# 4. Create backup
echo "📋 Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# 5. Extract new server block
NEW_SERVER_BLOCK=$(grep -A 200 "server_name a.acoustic.uz" "$NEW_CONFIG" | grep -B 2 -A 200 "server {" | head -120)

# 6. Use Python to replace server block
echo "🔧 Replacing a.acoustic.uz server block..."
python3 << PYTHON_SCRIPT
import re
import sys

config_file = "$CONFIG_FILE"
new_server_block = """$NEW_SERVER_BLOCK"""

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Find a.acoustic.uz server block (including HTTP redirect)
    # Pattern: from "server {" before "server_name a.acoustic.uz" to next "server {" or end
    # Also include HTTP redirect server block
    pattern = r'(server\s*\{[^}]*?server_name\s+a\.acoustic\.uz.*?)(?=server\s*\{|$)'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("❌ Could not find a.acoustic.uz server block")
        sys.exit(1)
    
    # Also find HTTP redirect block
    http_pattern = r'(server\s*\{[^}]*?listen\s+80[^}]*?server_name\s+a\.acoustic\.uz.*?return\s+301.*?)(?=server\s*\{|$)'
    http_match = re.search(http_pattern, content, re.DOTALL)
    
    # Read new server block from file
    with open("$NEW_CONFIG", 'r') as f:
        new_content = f.read()
    
    # Extract server block (from "server {" to next "server {" or end)
    new_server_match = re.search(r'(server\s*\{.*?server_name\s+a\.acoustic\.uz.*?)(?=server\s*\{|$)', new_content, re.DOTALL)
    if not new_server_match:
        print("❌ Could not extract new server block")
        sys.exit(1)
    
    new_server = new_server_match.group(1)
    
    # Extract HTTP redirect block
    new_http_match = re.search(r'(server\s*\{[^}]*?listen\s+80[^}]*?server_name\s+a\.acoustic\.uz.*?return\s+301.*?)(?=server\s*\{|$)', new_content, re.DOTALL)
    if new_http_match:
        new_server += '\n\n' + new_http_match.group(1)
    
    # Replace in content
    new_content_full = content[:match.start()] + new_server + content[match.end():]
    
    # If HTTP redirect block exists, replace it too
    if http_match and new_http_match:
        # Find position after HTTPS server block
        https_end = match.end()
        # Find HTTP redirect block after HTTPS block
        http_pos = content.find(http_match.group(1), https_end)
        if http_pos > 0:
            new_content_full = new_content_full[:http_pos] + new_http_match.group(1) + new_content_full[http_pos + len(http_match.group(1)):]
    
    # Write back
    with open(config_file, 'w') as f:
        f.write(new_content_full)
    
    print("✅ Successfully replaced a.acoustic.uz server block")
    print("   - Added CORS headers for /api location")
    print("   - Added OPTIONS preflight request handling")
    print("   - Preserved /uploads and /api/docs locations")
    
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

# 7. Test Nginx config
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

# 8. Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
if sudo systemctl reload nginx; then
    echo "   ✅ Nginx reloaded successfully"
else
    echo "   ❌ Failed to reload Nginx"
    exit 1
fi

echo ""
echo "✅ Fix complete! a.acoustic.uz server block was replaced."
echo ""
echo "📋 Summary:"
echo "  - Complete a.acoustic.uz server block configuration"
echo "  - CORS headers added to /api location"
echo "  - OPTIONS preflight request handling"
echo "  - Other domains were NOT modified"
echo ""
echo "🔍 Test:"
echo "  - Check admin panel: https://admin.acoustic.uz"
echo "  - Check API: curl -I https://a.acoustic.uz/api/leads"

