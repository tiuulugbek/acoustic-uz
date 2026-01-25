#!/bin/bash

# Fix /api location block for a.acoustic.uz only (without touching main.acoustic.uz)
# Usage: ./fix-api-location-only.sh

set -e

echo "🔧 Fixing /api location block for a.acoustic.uz..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Backup
echo "📋 Step 1: Backing up config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 2. Check if /api location exists
echo "📋 Step 2: Checking current config..."
if grep -q "location /api {" "$CONFIG_FILE" | grep -A 5 "server_name a.acoustic.uz"; then
    echo "  ✅ /api location already exists"
    exit 0
else
    echo "  ❌ /api location NOT found, adding it..."
fi
echo ""

# 3. Find a.acoustic.uz server block and add /api location
echo "📋 Step 3: Adding /api location block..."

# Use Python to properly insert the location block
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block
# Look for the pattern: server_name a.acoustic.uz followed by location /
pattern = r'(server_name a\.acoustic\.uz;.*?)(location / \{.*?proxy_pass http://localhost:3001;.*?\n    \})'

def replace_func(match):
    server_block_start = match.group(1)
    location_block = match.group(2)
    
    # Replace location / with location /api
    new_location = location_block.replace('location / {', 'location /api {')
    new_location = new_location.replace('proxy_pass http://localhost:3001;', 'proxy_pass http://localhost:3001/api;')
    
    # Add the new location block
    replacement = server_block_start + new_location + '''
    
    # Root location - return 404
    location = / {
        return 404;
    }
    
    # All other locations - return 404
    location / {
        return 404;
    }'''
    
    return replacement

# Check if replacement is needed
if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, replace_func, content, flags=re.DOTALL)
    
    with open(config_file, 'w') as f:
        f.write(content)
    
    print("✅ /api location block added")
else:
    # Try a simpler approach - just add after location /
    pattern2 = r'(server_name a\.acoustic\.uz;.*?location / \{.*?proxy_pass http://localhost:3001;.*?\n    \}\n\n)'
    
    def replace_func2(match):
        block = match.group(1)
        # Replace location / with location /api
        new_block = block.replace('location / {', 'location /api {')
        new_block = new_block.replace('proxy_pass http://localhost:3001;', 'proxy_pass http://localhost:3001/api;')
        new_block += '''    # Root location - return 404
    location = / {
        return 404;
    }
    
    # All other locations - return 404
    location / {
        return 404;
    }
    
'''
        return new_block
    
    if re.search(pattern2, content, re.DOTALL):
        content = re.sub(pattern2, replace_func2, content, flags=re.DOTALL)
        
        with open(config_file, 'w') as f:
            f.write(content)
        
        print("✅ /api location block added (method 2)")
    else:
        print("❌ Could not find location to replace")
        print("   Manual fix may be needed")
PYTHON_SCRIPT

echo ""

# 4. Test config
echo "📋 Step 4: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
else
    echo "  ❌ Config has errors!"
    echo "  Restoring backup..."
    cp "$CONFIG_FILE.backup."* "$CONFIG_FILE" 2>/dev/null || true
    exit 1
fi
echo ""

# 5. Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
systemctl reload nginx
echo "  ✅ Nginx reloaded"
echo ""

# 6. Test backend API
echo "📋 Step 6: Testing backend API..."
sleep 2
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api || echo "000")
echo "  HTTPS /api: $API_CODE"

if [ "$API_CODE" = "200" ]; then
    echo "  ✅ Backend API is working!"
elif [ "$API_CODE" = "404" ]; then
    echo "  ⚠️  Still 404, checking backend response..."
    curl -s http://localhost:3001/api | head -3
else
    echo "  ⚠️  Backend API response: $API_CODE"
fi
echo ""

# 7. Verify main.acoustic.uz is not affected
echo "📋 Step 7: Verifying main.acoustic.uz is not affected..."
if grep -q "server_name main.acoustic.uz" "$CONFIG_FILE"; then
    echo "  ✅ main.acoustic.uz config still exists"
    MAIN_CONFIG=$(nginx -T 2>/dev/null | grep -A 10 "server_name main.acoustic.uz" | head -15)
    if echo "$MAIN_CONFIG" | grep -q "location /api"; then
        echo "  ⚠️  main.acoustic.uz has /api location (may need to check)"
    else
        echo "  ✅ main.acoustic.uz does not have /api location (correct)"
    fi
else
    echo "  ℹ️  main.acoustic.uz not found in config (may be in separate file)"
fi
echo ""

echo "✅ Fix complete!"

