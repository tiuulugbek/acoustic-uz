#!/bin/bash
# Fix /uploads location for a.acoustic.uz in Nginx config only
# This script ONLY modifies the a.acoustic.uz server block

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="/etc/nginx/sites-available/acoustic-uz.conf.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing /uploads location for a.acoustic.uz ONLY..."
echo ""

# 1. Backup
echo "📋 Step 1: Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup: $BACKUP_FILE"

# 2. Check current config
echo "📋 Step 2: Checking current /uploads location..."
UPLOADS_BLOCK=$(grep -A 20 "server_name a.acoustic.uz" "$CONFIG_FILE" | grep -A 15 "location /uploads" | head -20)
if [ -n "$UPLOADS_BLOCK" ]; then
    echo "   Current /uploads block:"
    echo "$UPLOADS_BLOCK" | sed 's/^/     /'
else
    echo "   ⚠️  /uploads location not found in a.acoustic.uz block"
fi

# 3. Use Python to fix the config
echo ""
echo "📋 Step 3: Fixing /uploads location..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    in_a_acoustic = False
    in_uploads_location = False
    uploads_location_start = -1
    brace_count = 0
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Detect a.acoustic.uz server block
        if 'server_name a.acoustic.uz' in line:
            in_a_acoustic = True
            brace_count = 0
        
        if in_a_acoustic:
            # Count braces
            brace_count += line.count('{') - line.count('}')
            
            # Find /uploads location
            if re.search(r'location\s+/uploads', line):
                in_uploads_location = True
                uploads_location_start = i
                
                # Replace with correct location block
                new_lines.append('    # Uploads static files - MUST be before location / to avoid 404\n')
                new_lines.append('    location /uploads/ {\n')
                new_lines.append('        alias /var/www/acoustic.uz/apps/backend/uploads/;\n')
                new_lines.append('        expires 30d;\n')
                new_lines.append('        add_header Cache-Control "public, immutable";\n')
                new_lines.append('        \n')
                new_lines.append('        # CORS headers\n')
                new_lines.append('        add_header Access-Control-Allow-Origin * always;\n')
                new_lines.append('        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;\n')
                new_lines.append('        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;\n')
                new_lines.append('        add_header Access-Control-Max-Age 3600 always;\n')
                new_lines.append('        \n')
                new_lines.append('        # Handle OPTIONS requests\n')
                new_lines.append('        if ($request_method = \'OPTIONS\') {\n')
                new_lines.append('            add_header Access-Control-Allow-Origin * always;\n')
                new_lines.append('            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;\n')
                new_lines.append('            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;\n')
                new_lines.append('            add_header Access-Control-Max-Age 3600 always;\n')
                new_lines.append('            add_header Content-Length 0;\n')
                new_lines.append('            add_header Content-Type text/plain;\n')
                new_lines.append('            return 204;\n')
                new_lines.append('        }\n')
                new_lines.append('        \n')
                new_lines.append('        # Try to serve file, return 404 if not found\n')
                new_lines.append('        try_files $uri =404;\n')
                new_lines.append('    }\n')
                
                # Skip old location block until closing brace
                i += 1
                loc_brace_count = 0
                while i < len(lines):
                    loc_brace_count += lines[i].count('{') - lines[i].count('}')
                    if loc_brace_count <= 0 and '}' in lines[i]:
                        i += 1
                        break
                    i += 1
                continue
            
            # Check if we've left the server block
            if brace_count == 0 and in_a_acoustic and i > 0:
                in_a_acoustic = False
        
        new_lines.append(line)
        i += 1
    
    # Write new config
    with open(config_file, 'w') as f:
        f.writelines(new_lines)
    
    print("✅ Successfully fixed /uploads location block")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "   ❌ Python script failed!"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    exit 1
fi

# 4. Move /uploads before /api (if needed)
echo ""
echo "📋 Step 4: Ensuring /uploads comes before /api..."
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block and reorder locations
# Pattern: find server block, extract locations, reorder
pattern = r'(server\s*\{[^}]*?server_name\s+a\.acoustic\.uz.*?)(location\s+/uploads/[^{]*?\{[^}]*?\})(.*?)(location\s+/api[^{]*?\{[^}]*?\})(.*?)(location\s*=\s*/\s*\{[^}]*?\})(.*?)(location\s+/\s*\{[^}]*?\})(.*?listen\s+443)'

match = re.search(pattern, content, re.DOTALL)
if match:
    server_start = match.group(1)
    uploads_block = match.group(2)
    between_uploads_api = match.group(3)
    api_block = match.group(4)
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
    print("✅ Reordered /uploads before /api")
else:
    print("⚠️  Could not reorder (might already be correct)")
PYTHON_SCRIPT

# 5. Test config
echo ""
echo "📋 Step 5: Testing Nginx config..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Config is valid"
else
    echo "   ❌ Config test failed!"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    nginx -t
    exit 1
fi

# 6. Reload Nginx
echo ""
echo "📋 Step 6: Reloading Nginx..."
systemctl reload nginx && echo "   ✅ Nginx reloaded" || {
    echo "   ❌ Reload failed! Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    systemctl reload nginx
    exit 1
}

# 7. Test
echo ""
echo "📋 Step 7: Testing uploads endpoint..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
CONTENT_TYPE=$(curl -s -I "$TEST_URL" 2>/dev/null | grep -i "content-type" | cut -d: -f2 | tr -d '\r\n' || echo "")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ File accessible! (HTTP 200)"
    echo "   📄 Content-Type: $CONTENT_TYPE"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ File NOT found (HTTP 404)"
    echo "   💡 Check if file exists: ls -lh /var/www/acoustic.uz/apps/backend/uploads/$TEST_FILE"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "   ⚠️  Access forbidden (HTTP 403)"
    echo "   💡 Check file permissions"
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "🔍 Test URLs:"
echo "  - https://a.acoustic.uz/uploads/$TEST_FILE"
echo "  - https://a.acoustic.uz/uploads/ (directory listing)"

