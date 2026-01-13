#!/bin/bash
# Fix /uploads location for a.acoustic.uz only (simple version)
# Only modifies the a.acoustic.uz server block, does not touch other blocks

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="/etc/nginx/sites-available/acoustic-uz.conf.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing /uploads location for a.acoustic.uz only..."

# 1. Backup
echo "📋 Step 1: Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup: $BACKUP_FILE"

# 2. Use sed to fix only within a.acoustic.uz block
echo "📋 Step 2: Fixing /uploads location..."

# Find and replace /uploads location only in a.acoustic.uz block
sed -i '/server_name a.acoustic.uz/,/^}/ {
    # Replace location /uploads { with location /uploads/ {
    s|location /uploads {|location /uploads/ {|
    # Replace alias without trailing slash
    s|alias /var/www/acoustic.uz/apps/backend/uploads;|alias /var/www/acoustic.uz/apps/backend/uploads/;|
    # Add try_files if not present (before closing brace of location block)
    /location \/uploads\/ {/,/^    }/ {
        /^    }/ {
            i\
        try_files $uri =404;
        }
    }
}' "$CONFIG_FILE"

# 3. Move /uploads location before location /api (if needed)
# Use Python for more reliable block manipulation
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block
pattern = r'(server\s*\{[^}]*?server_name\s+a\.acoustic\.uz.*?)(location\s+/uploads/[^{]*?\{[^}]*?\})(.*?)(location\s+/api[^{]*?\{[^}]*?\})(.*?)(location\s*=\s*/\s*\{[^}]*?\})(.*?)(location\s+/\s*\{[^}]*?\})(.*?listen\s+443)'

def extract_uploads_block(match):
    """Extract and format /uploads block"""
    uploads_block = match.group(2)
    # Ensure it has try_files
    if 'try_files' not in uploads_block:
        uploads_block = uploads_block.rstrip('}').rstrip()
        uploads_block += '\n        try_files $uri =404;\n    }'
    return uploads_block

# Try to reorder: /uploads should come before /api
match = re.search(pattern, content, re.DOTALL)
if match:
    server_start = match.group(1)
    uploads_block = extract_uploads_block(match)
    api_block = match.group(4)
    between_uploads_api = match.group(3)
    between_api_root = match.group(5)
    root_block = match.group(6)
    between_root_slash = match.group(7)
    slash_block = match.group(8)
    after_slash = match.group(9)
    listen_block = match.group(10)
    
    # Reorder: uploads before api
    new_content = (
        server_start +
        uploads_block + '\n\n' +
        api_block + '\n\n' +
        between_api_root +
        root_block + '\n    \n' +
        between_root_slash +
        slash_block + '\n\n' +
        after_slash +
        listen_block
    )
    
    with open(config_file, 'w') as f:
        f.write(new_content)
    print("✅ Reordered /uploads location before /api")
else:
    print("⚠️  Could not reorder blocks, but /uploads should still work")

PYTHON_SCRIPT

# 4. Test config
echo "📋 Step 3: Testing Nginx config..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Config is valid"
else
    echo "   ❌ Config test failed! Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# 5. Reload
echo "📋 Step 4: Reloading Nginx..."
systemctl reload nginx && echo "   ✅ Nginx reloaded" || {
    echo "   ❌ Reload failed! Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    systemctl reload nginx
    exit 1
}

echo ""
echo "✅ Fix complete! Only a.acoustic.uz server block was modified."
echo ""
echo "🔍 Test: curl -I https://a.acoustic.uz/uploads/2025-12-04-1764833768750-blob-rbrw6k.webp"

