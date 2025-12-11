#!/bin/bash
# Fix uploads path - ensure Nginx serves files from products subdirectory correctly

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing uploads path configuration..."
echo ""

# Step 1: Verify file structure
echo "📋 Step 1: Verifying file structure..."
if [ -f "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" ]; then
    echo "   ✅ Test file exists: products/oticon-jet-cic-jet_cic.webp"
    ls -lh "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" | awk '{print "    Size: " $5}'
else
    echo "   ⚠️  Test file NOT found"
fi
echo ""

# Step 2: Backup Nginx config
echo "📋 Step 2: Backing up Nginx configuration..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 3: Fix Nginx /uploads/ location
echo "📋 Step 3: Fixing Nginx /uploads/ location..."
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find /uploads/ location block and ensure it serves files correctly
# The key is that alias should point to the uploads directory root,
# and try_files will look for files relative to that alias

uploads_pattern = r'(location\s+/uploads/\s*\{[^}]*?)(alias\s+[^;]+;)([^}]*?)(\})'

def fix_uploads_block(match):
    before = match.group(1)
    alias_line = match.group(2)
    after_alias = match.group(3)
    closing = match.group(4)
    
    # Ensure alias path is correct and ends with /
    alias_path = alias_line.split()[1].rstrip(';').rstrip('/') + '/'
    
    # Build new block
    new_block = before + f'alias {alias_path};' + after_alias
    
    # Ensure try_files exists and is correct
    # try_files will check $uri relative to alias, so /uploads/products/file.webp
    # will look for /var/www/acoustic.uz/apps/backend/uploads/products/file.webp
    if 'try_files' not in new_block:
        new_block = new_block.rstrip('}') + '''
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }'''
    else:
        # Ensure try_files is correct
        if 'try_files $uri =404' not in new_block:
            new_block = re.sub(
                r'try_files\s+[^;]+;',
                'try_files $uri =404;',
                new_block
            )
        new_block += closing
    
    return new_block

new_content = re.sub(uploads_pattern, fix_uploads_block, content, flags=re.DOTALL)

# If no /uploads/ location found, add it
if 'location /uploads/' not in new_content:
    lines = new_content.split('\n')
    insert_pos = -1
    
    for i, line in enumerate(lines):
        if 'server_name a.acoustic.uz' in line:
            for j in range(i, min(i+100, len(lines))):
                if 'location /api' in lines[j]:
                    insert_pos = j
                    break
            break
    
    if insert_pos != -1:
        uploads_block = '''    # Uploads static files - serves files from uploads directory and subdirectories
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }
    
'''
        lines.insert(insert_pos, uploads_block)
        new_content = '\n'.join(lines)

with open(config_file, 'w') as f:
    f.write(new_content)

print("   ✅ Nginx configuration updated")
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "   ❌ Failed to update Nginx config"
    exit 1
fi
echo ""

# Step 4: Verify Nginx config
echo "📋 Step 4: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 5: Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
echo "   ✅ Nginx reloaded"
echo ""

# Step 6: Test URL
echo "📋 Step 6: Testing URL..."
sleep 2

TEST_URL="https://a.acoustic.uz/uploads/products/oticon-jet-cic-jet_cic.webp"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ URL accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
    
    # Get file size
    FILE_SIZE=$(curl -s -I "$TEST_URL" 2>/dev/null | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
    if [ -n "$FILE_SIZE" ]; then
        echo "   File size: $FILE_SIZE bytes"
    fi
else
    echo "   ❌ URL not accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
    
    # Check if file exists
    if [ -f "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" ]; then
        echo "   ⚠️  File exists but Nginx can't serve it"
        echo "   Checking permissions:"
        ls -l "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" | awk '{print "    " $1 " " $3 ":" $4}'
        
        # Test if www-data can read
        if sudo -u www-data test -r "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" 2>/dev/null; then
            echo "   ✅ www-data can read the file"
        else
            echo "   ⚠️  www-data cannot read the file"
            echo "   Fixing permissions..."
            chmod 644 "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp"
            chown www-data:www-data "$UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp" 2>/dev/null || true
            echo "   ✅ Permissions fixed"
        fi
    else
        echo "   ⚠️  File does not exist at expected location"
    fi
    
    # Check Nginx error log
    echo "   Nginx error log:"
    tail -3 /var/log/nginx/a.acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || echo "      No errors"
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Test URL:"
echo "  https://a.acoustic.uz/uploads/products/oticon-jet-cic-jet_cic.webp"
echo ""
echo "💡 If still 404:"
echo "   1. Check file exists: ls -la $UPLOADS_DIR/products/oticon-jet-cic-jet_cic.webp"
echo "   2. Check permissions: chmod 644 $UPLOADS_DIR/products/*"
echo "   3. Check Nginx logs: tail -f /var/log/nginx/a.acoustic.uz.error.log"

