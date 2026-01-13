#!/bin/bash
# Fix uploads path issue - files exist but Nginx returns 404

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing uploads path issue..."
echo ""

# Step 1: Find actual file location
echo "📋 Step 1: Finding actual file locations..."
echo "   Searching for own_cic.jpg:"
find "$PROJECT_DIR" -name "*own_cic*" -type f 2>/dev/null | head -5 | sed 's/^/      /' || echo "      Not found"

echo "   Searching for oticon-jet-c files:"
find "$PROJECT_DIR" -name "*oticon-jet-c*" -type f 2>/dev/null | head -5 | sed 's/^/      /' || echo "      Not found"

echo "   All files in uploads directory:"
find "$UPLOADS_DIR" -type f | head -20 | sed 's/^/      /' || echo "      No files found"
echo ""

# Step 2: Check Nginx alias path
echo "📋 Step 2: Checking Nginx alias path..."
if grep -q "location /uploads/" "$NGINX_CONFIG"; then
    ALIAS_PATH=$(grep -A 5 "location /uploads/" "$NGINX_CONFIG" | grep "alias" | awk '{print $2}' | tr -d ';')
    echo "   Current alias: $ALIAS_PATH"
    
    # Check if alias path exists
    if [ -d "$ALIAS_PATH" ] || [ -d "${ALIAS_PATH%/}" ]; then
        echo "   ✅ Alias directory exists"
        
        # Check if file exists at alias path
        TEST_FILE="2024/07/own_cic.jpg"
        if [ -f "${ALIAS_PATH%/}/$TEST_FILE" ] || [ -f "$ALIAS_PATH$TEST_FILE" ]; then
            echo "   ✅ Test file exists at alias path"
        else
            echo "   ⚠️  Test file NOT found at alias path"
            echo "   Checking directory structure:"
            ls -la "${ALIAS_PATH%/}/2024/07/" 2>/dev/null | head -5 | sed 's/^/      /' || echo "      Directory not found"
        fi
    else
        echo "   ❌ Alias directory NOT found: $ALIAS_PATH"
    fi
else
    echo "   ❌ /uploads/ location NOT found"
fi
echo ""

# Step 3: Check actual uploads directory
echo "📋 Step 3: Checking actual uploads directory..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✅ Uploads directory exists: $UPLOADS_DIR"
    
    # Count files
    FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    echo "   Total files: $FILE_COUNT"
    
    # Check specific directories
    for YEAR in 2024 2023 2022; do
        if [ -d "$UPLOADS_DIR/$YEAR" ]; then
            YEAR_FILES=$(find "$UPLOADS_DIR/$YEAR" -type f | wc -l)
            echo "   $YEAR: $YEAR_FILES files"
        fi
    done
    
    # Check test file
    if [ -f "$UPLOADS_DIR/2024/07/own_cic.jpg" ]; then
        echo "   ✅ Test file exists: 2024/07/own_cic.jpg"
        ls -lh "$UPLOADS_DIR/2024/07/own_cic.jpg" | awk '{print "    Size: " $5 ", Permissions: " $1}'
    else
        echo "   ⚠️  Test file NOT found: 2024/07/own_cic.jpg"
        echo "   Files in 2024/07:"
        ls -la "$UPLOADS_DIR/2024/07/" 2>/dev/null | head -10 | sed 's/^/      /' || echo "      Directory not found"
    fi
else
    echo "   ❌ Uploads directory NOT found: $UPLOADS_DIR"
fi
echo ""

# Step 4: Fix Nginx configuration
echo "📋 Step 4: Fixing Nginx configuration..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# Ensure alias path ends with /
ALIAS_PATH_CORRECT="$UPLOADS_DIR/"
if [ "${ALIAS_PATH_CORRECT: -1}" != "/" ]; then
    ALIAS_PATH_CORRECT="${ALIAS_PATH_CORRECT}/"
fi

python3 << PYTHON_SCRIPT
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"
uploads_dir = "/var/www/acoustic.uz/apps/backend/uploads/"

with open(config_file, 'r') as f:
    content = f.read()

# Find and fix /uploads/ location block
pattern = r'(location\s+/uploads/\s*\{[^}]*?alias\s+)([^;]+)(;[^}]*?)(\})'

def fix_uploads_block(match):
    before = match.group(1)
    old_alias = match.group(2).strip()
    after_alias = match.group(3)
    closing = match.group(4)
    
    # Ensure alias ends with /
    new_alias = uploads_dir.rstrip('/') + '/'
    
    # Build new block
    new_block = before + new_alias + after_alias
    
    # Ensure try_files exists
    if 'try_files' not in new_block:
        # Add try_files before closing brace
        new_block = new_block.rstrip('}') + '''
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }'''
    else:
        new_block += closing
    
    return new_block

new_content = re.sub(pattern, fix_uploads_block, content, flags=re.DOTALL)

# If no /uploads/ location found, add it
if 'location /uploads/' not in new_content:
    # Find a.acoustic.uz server block
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
        uploads_block = f'''    # Uploads static files - MUST be before location /api
    location /uploads/ {{
        alias {uploads_dir};
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }}
    
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

# Step 5: Verify Nginx config
echo "📋 Step 5: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    echo "   Updated /uploads/ location:"
    grep -A 8 "location /uploads/" "$NGINX_CONFIG" | sed 's/^/      /'
else
    echo "   ❌ Nginx configuration test failed"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 6: Fix permissions
echo "📋 Step 6: Fixing permissions..."
chmod -R 755 "$UPLOADS_DIR"
chown -R www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown -R nginx:nginx "$UPLOADS_DIR" 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# Step 7: Reload Nginx
echo "📋 Step 7: Reloading Nginx..."
systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
echo "   ✅ Nginx reloaded"
echo ""

# Step 8: Test URLs
echo "📋 Step 8: Testing URLs..."
sleep 2

# Test multiple files
TEST_FILES=(
    "2024/07/own_cic.jpg"
    "2024/07/oticon-own-cic.jpg"
    "2024/07/oticon-jet-cic.jpg"
)

for TEST_FILE in "${TEST_FILES[@]}"; do
    if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
        TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ File accessible: $TEST_FILE (HTTP $HTTP_CODE)"
            echo "      URL: $TEST_URL"
            break
        else
            echo "   ⚠️  File not accessible: $TEST_FILE (HTTP $HTTP_CODE)"
        fi
    fi
done

# If still 404, show detailed error
if [ "$HTTP_CODE" != "200" ]; then
    echo "   Detailed test:"
    curl -v "https://a.acoustic.uz/uploads/2024/07/own_cic.jpg" 2>&1 | grep -E "(< HTTP|Location|alias|404)" | head -5 | sed 's/^/      /'
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check file exists: ls -la $UPLOADS_DIR/2024/07/own_cic.jpg"
echo "   2. Check Nginx alias: grep -A 5 'location /uploads/' $NGINX_CONFIG"
echo "   3. Test URL: curl -I https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"

