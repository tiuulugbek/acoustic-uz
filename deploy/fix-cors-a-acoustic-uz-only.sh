#!/bin/bash

# Fix CORS headers for a.acoustic.uz ONLY
# This script only modifies the a.acoustic.uz server block in Nginx config
# Other domains are not affected

set -e

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing CORS headers for a.acoustic.uz ONLY..."
echo ""

# 1. Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# 2. Check if a.acoustic.uz server block exists
if ! grep -q "server_name a.acoustic.uz" "$CONFIG_FILE"; then
    echo "❌ ERROR: a.acoustic.uz server block not found"
    exit 1
fi

# 3. Create backup
echo "📋 Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# 4. Use Python to fix only a.acoustic.uz server block
echo "🔧 Updating /api location block in a.acoustic.uz server block..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        lines = f.readlines()
    
    # Find a.acoustic.uz server block boundaries
    in_a_acoustic_block = False
    a_acoustic_start = -1
    a_acoustic_end = -1
    brace_count = 0
    
    for i, line in enumerate(lines):
        if 'server_name a.acoustic.uz' in line:
            in_a_acoustic_block = True
            a_acoustic_start = i
            brace_count = 0
        
        if in_a_acoustic_block:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0 and i > a_acoustic_start:
                a_acoustic_end = i
                break
    
    if a_acoustic_start == -1:
        print("❌ Could not find a.acoustic.uz server block")
        sys.exit(1)
    
    if a_acoustic_end == -1:
        a_acoustic_end = len(lines)
    
    # Extract server block
    server_block = lines[a_acoustic_start:a_acoustic_end+1]
    
    # Find /api location block (but not /api/docs)
    api_start = -1
    api_end = -1
    api_brace_count = 0
    
    for i, line in enumerate(server_block):
        # Match "location /api {" but not "location /api/docs"
        if 'location /api' in line and '/api/docs' not in line and '{' in line:
            api_start = i
            api_brace_count = 0
        
        if api_start >= 0:
            api_brace_count += line.count('{') - line.count('}')
            if api_brace_count == 0 and i > api_start:
                api_end = i
                break
    
    # New /api location block with CORS headers
    new_api_block = '''    # API endpoints
    location /api {
        # Handle OPTIONS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Locale, Accept, Origin, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
        proxy_cache_bypass $http_upgrade;
        
        # Preserve CORS headers from backend
        proxy_pass_header Access-Control-Allow-Origin;
        proxy_pass_header Access-Control-Allow-Credentials;
        proxy_pass_header Access-Control-Allow-Methods;
        proxy_pass_header Access-Control-Allow-Headers;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
'''
    
    # Replace or add /api location block
    if api_start >= 0 and api_end >= 0:
        # Replace existing /api location block
        new_api_lines = []
        for line in new_api_block.split('\n'):
            if line.strip():  # Skip empty lines
                new_api_lines.append(line + '\n')
        
        new_server_block = (
            server_block[:api_start] +
            new_api_lines +
            server_block[api_end+1:]
        )
    else:
        # Add new /api location block before root location or at the end
        # Find where to insert (before location = / or location /)
        insert_idx = len(server_block)
        for i, line in enumerate(server_block):
            if 'location = /' in line or 'location / {' in line:
                insert_idx = i
                break
        
        new_api_lines = []
        for line in new_api_block.split('\n'):
            if line.strip():  # Skip empty lines
                new_api_lines.append(line + '\n')
        
        new_server_block = (
            server_block[:insert_idx] +
            new_api_lines +
            server_block[insert_idx:]
        )
    
    # Reconstruct file
    new_lines = (
        lines[:a_acoustic_start] +
        new_server_block +
        lines[a_acoustic_end+1:]
    )
    
    # Write back
    with open(config_file, 'w') as f:
        f.writelines(new_lines)
    
    print("✅ Successfully updated /api location block in a.acoustic.uz server block")
    print("   - Added CORS headers for preflight requests")
    print("   - Added proxy headers to preserve CORS from backend")
    
except Exception as e:
    print(f"❌ Error: {e}")
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
echo "✅ Fix complete! Only a.acoustic.uz server block was modified."
echo ""
echo "📋 Summary:"
echo "  - Only a.acoustic.uz server block was updated"
echo "  - Other domains (acoustic.uz, admin.acoustic.uz, etc.) were NOT modified"
echo "  - CORS headers added to /api location block"
echo ""
echo "🔍 Test:"
echo "  - Check admin panel: https://admin.acoustic.uz"
echo "  - Check API: curl -I https://a.acoustic.uz/api/leads"

