#!/bin/bash
# Fix uploads path - handle both uploads/ and uploads/products/ directories

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing uploads path to handle products directory..."
echo ""

# Step 1: Check file structure
echo "📋 Step 1: Checking file structure..."
if [ -d "$UPLOADS_DIR/products" ]; then
    PRODUCTS_COUNT=$(find "$UPLOADS_DIR/products" -type f | wc -l)
    echo "   ✅ Products directory exists with $PRODUCTS_COUNT files"
    
    # Show sample files
    echo "   Sample files:"
    find "$UPLOADS_DIR/products" -type f | head -5 | sed 's|^.*uploads/|      /uploads/|' | sed 's/^/      /'
fi

if [ -d "$UPLOADS_DIR/2024" ]; then
    YEAR_COUNT=$(find "$UPLOADS_DIR/2024" -type f | wc -l)
    echo "   ✅ 2024 directory exists with $YEAR_COUNT files"
fi
echo ""

# Step 2: Backup Nginx config
echo "📋 Step 2: Backing up Nginx configuration..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 3: Fix Nginx configuration to handle both paths
echo "📋 Step 3: Fixing Nginx configuration..."
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block
# Update /uploads/ location to handle both root uploads and products subdirectory

# Pattern to find /uploads/ location block
uploads_pattern = r'(location\s+/uploads/\s*\{[^}]*?)(alias\s+[^;]+;)([^}]*?)(\})'

def fix_uploads_block(match):
    before = match.group(1)
    alias_line = match.group(2)
    after_alias = match.group(3)
    closing = match.group(4)
    
    # Ensure alias ends with /
    alias_path = alias_line.split()[1].rstrip(';').rstrip('/') + '/'
    
    # Build new block with try_files that checks both root and products
    new_block = before + f'alias {alias_path};' + after_alias
    
    # Check if try_files exists
    if 'try_files' not in new_block:
        # Add try_files that checks both locations
        new_block = new_block.rstrip('}') + '''
        # Try file in root, then in products subdirectory
        try_files $uri $uri/ /uploads/products/$uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }'''
    else:
        # Update try_files to check products subdirectory
        if '/uploads/products/' not in new_block:
            new_block = re.sub(
                r'try_files\s+([^;]+);',
                r'try_files \1 /uploads/products/$uri =404;',
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
        uploads_block = '''    # Uploads static files - handles both root and products subdirectory
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        # Try file in root, then in products subdirectory
        try_files $uri $uri/ /uploads/products/$uri =404;
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
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 4: Verify Nginx config
echo "📋 Step 4: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    echo "   Updated /uploads/ location:"
    grep -A 10 "location /uploads/" "$NGINX_CONFIG" | sed 's/^/      /'
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

# Step 6: Test URLs
echo "📋 Step 6: Testing URLs..."
sleep 2

# Test products file
TEST_FILE="products/oticon-jet-cic-jet_cic.webp"
if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Products file accessible: $TEST_FILE (HTTP $HTTP_CODE)"
        echo "      URL: $TEST_URL"
    else
        echo "   ⚠️  Products file not accessible: $TEST_FILE (HTTP $HTTP_CODE)"
    fi
fi

# Test root file (if exists)
if [ -f "$UPLOADS_DIR/2024/07/own_cic.jpg" ]; then
    TEST_URL="https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Root file accessible: 2024/07/own_cic.jpg (HTTP $HTTP_CODE)"
    else
        echo "   ⚠️  Root file not accessible: 2024/07/own_cic.jpg (HTTP $HTTP_CODE)"
    fi
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Products: https://a.acoustic.uz/uploads/products/oticon-jet-cic-jet_cic.webp"
echo "  - Root: https://a.acoustic.uz/uploads/2024/07/own_cic.jpg (if exists)"
echo ""
echo "💡 Note: Nginx will now check both root and products subdirectory"

