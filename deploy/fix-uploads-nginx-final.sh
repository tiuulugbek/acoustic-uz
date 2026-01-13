#!/bin/bash
# Final fix for uploads Nginx configuration

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Final fix for uploads Nginx configuration..."
echo ""

# Step 1: Check uploads directory
echo "📋 Step 1: Checking uploads directory..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✅ Uploads directory exists: $UPLOADS_DIR"
    FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    echo "   Total files: $FILE_COUNT"
    
    # Check specific file
    if [ -f "$UPLOADS_DIR/2024/07/own_cic.jpg" ]; then
        echo "   ✅ Test file exists: 2024/07/own_cic.jpg"
        ls -lh "$UPLOADS_DIR/2024/07/own_cic.jpg" | awk '{print "    Size: " $5 ", Permissions: " $1}'
    else
        echo "   ⚠️  Test file NOT found: 2024/07/own_cic.jpg"
        echo "   Checking 2024/07 directory:"
        ls -la "$UPLOADS_DIR/2024/07/" 2>/dev/null | head -10 | sed 's/^/      /' || echo "      Directory not found"
    fi
else
    echo "   ❌ Uploads directory NOT found: $UPLOADS_DIR"
    echo "   Creating directory..."
    mkdir -p "$UPLOADS_DIR"
fi
echo ""

# Step 2: Fix permissions
echo "📋 Step 2: Fixing permissions..."
chmod -R 755 "$UPLOADS_DIR"
chown -R www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown -R nginx:nginx "$UPLOADS_DIR" 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# Step 3: Backup Nginx config
echo "📋 Step 3: Backing up Nginx configuration..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 4: Fix Nginx /uploads/ location
echo "📋 Step 4: Fixing Nginx /uploads/ location..."
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block
server_pattern = r'(server\s+\{[^}]*server_name\s+a\.acoustic\.uz[^}]*\{[^}]*?)(location\s+/uploads/[^}]*\})([^}]*?)(location\s+/api[^}]*\})'

def fix_uploads_location(match):
    before = match.group(1)
    uploads_block = match.group(2)
    between = match.group(3)
    api_block = match.group(4)
    
    # Check if uploads block is correct
    correct_uploads_block = '''    # Uploads static files - MUST be before location /api
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
        
        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
    }'''
    
    # Check if alias is correct
    if '/var/www/acoustic.uz/apps/backend/uploads/' not in uploads_block:
        return before + correct_uploads_block + between + api_block
    
    # Check if try_files exists
    if 'try_files' not in uploads_block:
        # Add try_files to existing block
        uploads_block = uploads_block.rstrip('}')
        uploads_block += '''
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }'''
        return before + uploads_block + between + api_block
    
    return match.group(0)

# Try to fix existing block
new_content = re.sub(server_pattern, fix_uploads_location, content, flags=re.DOTALL)

# If no /uploads/ location found, add it
if 'location /uploads/' not in new_content:
    # Find a.acoustic.uz server block and add /uploads/ before /api
    lines = new_content.split('\n')
    insert_pos = -1
    
    for i, line in enumerate(lines):
        if 'server_name a.acoustic.uz' in line:
            # Find /api location block
            for j in range(i, min(i+100, len(lines))):
                if 'location /api' in lines[j]:
                    insert_pos = j
                    break
            break
    
    if insert_pos != -1:
        uploads_block = '''    # Uploads static files - MUST be before location /api
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
        
        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
    }
    
'''
        lines.insert(insert_pos, uploads_block)
        new_content = '\n'.join(lines)

with open(config_file, 'w') as f:
    f.write(new_content)

print("   ✅ /uploads/ location fixed")
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "   ❌ Failed to fix Nginx config"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 5: Verify Nginx config
echo "📋 Step 5: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    echo "   /uploads/ location configuration:"
    grep -A 10 "location /uploads/" "$NGINX_CONFIG" | sed 's/^/      /'
else
    echo "   ❌ Nginx configuration test failed"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 6: Reload Nginx
echo "📋 Step 6: Reloading Nginx..."
systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
echo "   ✅ Nginx reloaded"
echo ""

# Step 7: Test uploads URL
echo "📋 Step 7: Testing uploads URL..."
sleep 3

TEST_URL="https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Uploads URL accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
    
    # Test file size
    FILE_SIZE=$(curl -s -I "$TEST_URL" 2>/dev/null | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
    if [ -n "$FILE_SIZE" ]; then
        echo "   File size: $FILE_SIZE bytes"
    fi
else
    echo "   ❌ Uploads URL not accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
    
    # Check error log
    echo "   Checking Nginx error log:"
    tail -5 /var/log/nginx/a.acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || echo "      No errors found"
    
    # Test with verbose output
    echo "   Verbose test output:"
    curl -v "$TEST_URL" 2>&1 | grep -E "(< HTTP|Location|alias|404)" | head -5 | sed 's/^/      /'
fi
echo ""

# Step 8: Check file permissions
echo "📋 Step 8: Checking file permissions..."
if [ -f "$UPLOADS_DIR/2024/07/own_cic.jpg" ]; then
    echo "   File permissions:"
    ls -l "$UPLOADS_DIR/2024/07/own_cic.jpg" | awk '{print "    " $1 " " $3 ":" $4}'
    
    # Test if www-data can read
    if sudo -u www-data test -r "$UPLOADS_DIR/2024/07/own_cic.jpg" 2>/dev/null; then
        echo "   ✅ www-data can read the file"
    else
        echo "   ⚠️  www-data cannot read the file"
        echo "   Fixing permissions..."
        chmod 644 "$UPLOADS_DIR/2024/07/own_cic.jpg"
        chown www-data:www-data "$UPLOADS_DIR/2024/07/own_cic.jpg" 2>/dev/null || true
    fi
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Uploads: https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"
echo "  - Products: https://acoustic.uz/products/..."
echo ""
echo "💡 If still not working:"
echo "   1. Check file exists: ls -la $UPLOADS_DIR/2024/07/own_cic.jpg"
echo "   2. Check Nginx logs: tail -f /var/log/nginx/a.acoustic.uz.error.log"
echo "   3. Test locally: curl -I https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"

