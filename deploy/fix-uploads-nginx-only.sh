#!/bin/bash
# Fix /uploads location for a.acoustic.uz ONLY
# This script only modifies the a.acoustic.uz server block in Nginx config

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
echo "📋 Step 2: Checking current config..."
if ! grep -q "server_name a.acoustic.uz" "$CONFIG_FILE"; then
    echo "   ❌ ERROR: a.acoustic.uz server block not found"
    exit 1
fi

# 3. Use Python to fix the config (more reliable)
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        lines = f.readlines()
    
    # Find a.acoustic.uz server block
    in_block = False
    block_start = -1
    block_end = -1
    brace_count = 0
    
    for i, line in enumerate(lines):
        if 'server_name a.acoustic.uz' in line:
            in_block = True
            block_start = i
            brace_count = 0
        
        if in_block:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0 and i > block_start:
                block_end = i
                break
    
    if block_start == -1:
        print("❌ Could not find a.acoustic.uz server block")
        sys.exit(1)
    
    if block_end == -1:
        block_end = len(lines)
    
    # Extract server block
    server_block = lines[block_start:block_end+1]
    
    # Find /uploads location
    uploads_start = -1
    uploads_end = -1
    uploads_brace_count = 0
    
    for i, line in enumerate(server_block):
        if 'location /uploads' in line:
            uploads_start = i
            uploads_brace_count = 0
        
        if uploads_start >= 0:
            uploads_brace_count += line.count('{') - line.count('}')
            if uploads_brace_count == 0 and uploads_start < i:
                uploads_end = i
                break
    
    # New /uploads location block (must be before location /api)
    new_uploads_block = '''    # Uploads static files - MUST be before location / to avoid 404
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Max-Age 3600 always;
        
        # Handle OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        # Try to serve file, return 404 if not found
        try_files $uri =404;
    }
'''
    
    # Find where to insert (before location /api)
    api_location_idx = -1
    for i, line in enumerate(server_block):
        if 'location /api' in line:
            api_location_idx = i
            break
    
    # Build new server block
    new_server_block = []
    
    # Add everything before /uploads location (or before /api if /uploads not found)
    insert_idx = api_location_idx if api_location_idx >= 0 else len(server_block)
    
    # If /uploads exists, remove it first
    if uploads_start >= 0 and uploads_end >= 0:
        # Add lines before uploads
        new_server_block.extend(server_block[:uploads_start])
        # Skip old uploads block
        # Add new uploads block before /api
        if api_location_idx >= 0:
            new_server_block.extend(server_block[uploads_end+1:api_location_idx])
            new_server_block.append(new_uploads_block)
            new_server_block.extend(server_block[api_location_idx:])
        else:
            new_server_block.append(new_uploads_block)
            new_server_block.extend(server_block[uploads_end+1:])
    else:
        # /uploads not found, insert before /api
        if api_location_idx >= 0:
            new_server_block.extend(server_block[:api_location_idx])
            new_server_block.append(new_uploads_block)
            new_server_block.extend(server_block[api_location_idx:])
        else:
            # No /api found, insert after client settings
            # Find where to insert (after client_max_body_size)
            insert_after = -1
            for i, line in enumerate(server_block):
                if 'client_max_body_size' in line:
                    insert_after = i
                    break
            
            if insert_after >= 0:
                new_server_block.extend(server_block[:insert_after+1])
                new_server_block.append(new_uploads_block)
                new_server_block.extend(server_block[insert_after+1:])
            else:
                # Insert at beginning of server block (after opening brace)
                new_server_block.append(server_block[0])
                new_server_block.append(new_uploads_block)
                new_server_block.extend(server_block[1:])
    
    # Rebuild full config
    new_lines = lines[:block_start] + new_server_block + lines[block_end+1:]
    
    with open(config_file, 'w') as f:
        f.writelines(new_lines)
    
    print("✅ Successfully fixed /uploads location in a.acoustic.uz server block")
    print(f"   - Moved /uploads/ before location /api")
    print(f"   - Added trailing slash and try_files directive")

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

# 4. Test config
echo ""
echo "📋 Step 3: Testing Nginx config..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Config is valid"
else
    echo "   ❌ Config test failed!"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    nginx -t
    exit 1
fi

# 5. Reload Nginx
echo ""
echo "📋 Step 4: Reloading Nginx..."
systemctl reload nginx && echo "   ✅ Nginx reloaded" || {
    echo "   ❌ Reload failed! Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    systemctl reload nginx
    exit 1
}

# 6. Test
echo ""
echo "📋 Step 5: Testing uploads endpoint..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ File accessible! (HTTP 200)"
    echo "   🔗 URL: $TEST_URL"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  File not found (HTTP 404)"
    echo "   💡 Check if file exists: ls -lh /var/www/acoustic.uz/apps/backend/uploads/$TEST_FILE"
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Summary:"
echo "  - Only a.acoustic.uz server block was modified"
echo "  - /uploads/ location moved before location /api"
echo "  - Backup saved: $BACKUP_FILE"
echo ""
echo "🔍 Test URLs:"
echo "  - https://a.acoustic.uz/uploads/$TEST_FILE"
echo "  - https://a.acoustic.uz/uploads/ (should return 403 or directory listing)"
