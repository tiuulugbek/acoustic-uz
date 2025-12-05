#!/bin/bash
# Fix /uploads location for a.acoustic.uz only
# This script only modifies the a.acoustic.uz server block

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="/etc/nginx/sites-available/acoustic-uz.conf.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing /uploads location for a.acoustic.uz only..."

# 1. Backup current config
echo "📋 Step 1: Backing up current config..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# 2. Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# 3. Check if a.acoustic.uz server block exists
if ! grep -q "server_name a.acoustic.uz" "$CONFIG_FILE"; then
    echo "❌ ERROR: a.acoustic.uz server block not found in config"
    exit 1
fi

# 4. Use Python to fix the config (more reliable than sed for complex replacements)
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Find a.acoustic.uz server block
    # Pattern: from "server_name a.acoustic.uz" to next "server {" or end of file
    pattern = r'(server\s*\{[^}]*server_name\s+a\.acoustic\.uz[^}]*?)(location\s+/uploads[^{]*\{[^}]*?\})(.*?)(location\s+/api[^{]*?\{[^}]*?\})(.*?)(location\s*=\s*/\s*\{[^}]*?\})(.*?)(location\s+/\s*\{[^}]*?\})'
    
    # More specific pattern for a.acoustic.uz server block
    # We'll find the server block and replace only the /uploads location
    server_block_pattern = r'(server\s*\{[^}]*?server_name\s+a\.acoustic\.uz.*?)(location\s+/uploads[^{]*?\{[^}]*?\})(.*?server\s*\{|$)'
    
    # Better approach: find the a.acoustic.uz server block boundaries
    lines = content.split('\n')
    new_lines = []
    in_a_acoustic_block = False
    a_acoustic_start = -1
    a_acoustic_end = -1
    brace_count = 0
    in_uploads_location = False
    uploads_location_start = -1
    uploads_location_end = -1
    
    for i, line in enumerate(lines):
        if 'server_name a.acoustic.uz' in line:
            in_a_acoustic_block = True
            a_acoustic_start = i
        
        if in_a_acoustic_block:
            # Count braces to find server block end
            brace_count += line.count('{') - line.count('}')
            
            # Find /uploads location
            if 'location /uploads' in line or 'location /uploads/' in line:
                in_uploads_location = True
                uploads_location_start = i
            
            if in_uploads_location:
                brace_count_loc = 0
                if '{' in line:
                    brace_count_loc = line.count('{') - line.count('}')
                if brace_count_loc > 0 or (brace_count_loc == 0 and '{' in line):
                    # Find the end of location block
                    j = i
                    loc_brace_count = 0
                    while j < len(lines):
                        loc_brace_count += lines[j].count('{') - lines[j].count('}')
                        if loc_brace_count == 0 and '}' in lines[j]:
                            uploads_location_end = j
                            break
                        j += 1
                    break
            
            # Check if we've left the server block
            if brace_count == 0 and i > a_acoustic_start:
                a_acoustic_end = i
                in_a_acoustic_block = False
    
    # Replace the /uploads location block
    if uploads_location_start >= 0 and uploads_location_end >= 0:
        # New /uploads location block
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
    }'''
        
        # Replace the old block
        new_content = '\n'.join(lines[:uploads_location_start]) + '\n' + new_uploads_block + '\n' + '\n'.join(lines[uploads_location_end+1:])
        
        with open(config_file, 'w') as f:
            f.write(new_content)
        
        print("✅ Successfully replaced /uploads location block")
    else:
        print("⚠️  Could not find /uploads location block, trying alternative method...")
        # Alternative: simple string replacement
        old_uploads = r'location\s+/uploads\s*\{[^}]*?\}'
        new_uploads = '''location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Max-Age 3600 always;
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        try_files $uri =404;
    }'''
        
        # Only replace within a.acoustic.uz server block
        lines = content.split('\n')
        new_lines = []
        in_block = False
        brace_level = 0
        
        for line in lines:
            if 'server_name a.acoustic.uz' in line:
                in_block = True
                brace_level = 0
            
            if in_block:
                brace_level += line.count('{') - line.count('}')
                
                # Replace /uploads location
                if 'location /uploads' in line and not 'location /uploads/' in line:
                    # Start of location block
                    new_lines.append('    location /uploads/ {')
                    # Skip until closing brace
                    skip_until_brace = True
                    continue
                elif skip_until_brace:
                    if '}' in line:
                        skip_until_brace = False
                        # Add new content
                        new_lines.append('        alias /var/www/acoustic.uz/apps/backend/uploads/;')
                        new_lines.append('        expires 30d;')
                        new_lines.append('        add_header Cache-Control "public, immutable";')
                        new_lines.append('        add_header Access-Control-Allow-Origin * always;')
                        new_lines.append('        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;')
                        new_lines.append('        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;')
                        new_lines.append('        add_header Access-Control-Max-Age 3600 always;')
                        new_lines.append('        if ($request_method = \'OPTIONS\') {')
                        new_lines.append('            add_header Access-Control-Allow-Origin * always;')
                        new_lines.append('            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;')
                        new_lines.append('            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;')
                        new_lines.append('            add_header Access-Control-Max-Age 3600 always;')
                        new_lines.append('            add_header Content-Length 0;')
                        new_lines.append('            add_header Content-Type text/plain;')
                        new_lines.append('            return 204;')
                        new_lines.append('        }')
                        new_lines.append('        try_files $uri =404;')
                        new_lines.append('    }')
                        continue
                
                if brace_level == 0 and in_block:
                    in_block = False
            
            new_lines.append(line)
        
        with open(config_file, 'w') as f:
            f.write('\n'.join(new_lines))
        
        print("✅ Used alternative method to replace /uploads location")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Python script failed, trying simpler sed approach..."
    # Fallback: simple sed replacement (only for a.acoustic.uz block)
    sed -i '/server_name a.acoustic.uz/,/^}/ {
        s|location /uploads {|location /uploads/ {|
        s|alias /var/www/acoustic.uz/apps/backend/uploads;|alias /var/www/acoustic.uz/apps/backend/uploads/;|
        /location \/uploads\/ {/,/^    }/ {
            /^    }/ a\
        try_files $uri =404;
        }
    }' "$CONFIG_FILE"
fi

# 5. Test Nginx config
echo "📋 Step 2: Testing Nginx config..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx config is valid"
else
    echo "   ❌ Nginx config test failed!"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "   Backup restored. Please check the config manually."
    exit 1
fi

# 6. Reload Nginx
echo "📋 Step 3: Reloading Nginx..."
systemctl reload nginx || {
    echo "   ❌ Nginx reload failed!"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    systemctl reload nginx
    exit 1
}

echo "   ✅ Nginx reloaded successfully"

# 7. Test uploads endpoint
echo "📋 Step 4: Testing uploads endpoint..."
TEST_URL="https://a.acoustic.uz/uploads/"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" || echo "000")

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Uploads endpoint responding (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Uploads endpoint returned HTTP $HTTP_CODE"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Summary:"
echo "  - Config file: $CONFIG_FILE"
echo "  - Backup: $BACKUP_FILE"
echo "  - Only a.acoustic.uz server block was modified"
echo ""
echo "🔍 Test URLs:"
echo "  - https://a.acoustic.uz/uploads/ (should return 404 or directory listing)"
echo "  - https://a.acoustic.uz/uploads/2025-12-04-1764833768750-blob-rbrw6k.webp (if file exists)"

