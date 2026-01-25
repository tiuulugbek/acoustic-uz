#!/bin/bash
# Complete fix for uploads 404 issue

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing uploads 404 issue..."
echo ""

# Step 1: Check uploads directory
echo "📋 Step 1: Checking uploads directory..."
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "   Creating uploads directory..."
    mkdir -p "$UPLOADS_DIR"
    echo "   ✅ Uploads directory created"
fi

# Check if 2024/07 directory exists
if [ ! -d "$UPLOADS_DIR/2024/07" ]; then
    echo "   Creating 2024/07 directory..."
    mkdir -p "$UPLOADS_DIR/2024/07"
    echo "   ✅ Directory created"
fi

# List files in uploads directory
echo "   Files in uploads directory:"
find "$UPLOADS_DIR" -type f | head -20 | sed 's/^/      /' || echo "      No files found"
echo ""

# Step 2: Fix permissions
echo "📋 Step 2: Fixing permissions..."
chmod -R 755 "$UPLOADS_DIR"
chown -R www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown -R nginx:nginx "$UPLOADS_DIR" 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# Step 3: Check and fix Nginx configuration
echo "📋 Step 3: Checking Nginx configuration..."
if grep -q "location /uploads/" "$NGINX_CONFIG"; then
    echo "   ✅ /uploads/ location found"
    
    # Check if alias is correct
    ALIAS_PATH=$(grep -A 5 "location /uploads/" "$NGINX_CONFIG" | grep "alias" | awk '{print $2}' | tr -d ';')
    if [ -n "$ALIAS_PATH" ]; then
        echo "   Current alias: $ALIAS_PATH"
        
        # Check if alias path matches actual uploads directory
        if [ "$ALIAS_PATH" != "$UPLOADS_DIR/" ] && [ "$ALIAS_PATH" != "$UPLOADS_DIR" ]; then
            echo "   ⚠️  Alias path doesn't match, updating..."
            
            # Backup
            BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
            cp "$NGINX_CONFIG" "$BACKUP_FILE"
            echo "   ✅ Backup created: $BACKUP_FILE"
            
            # Update alias path
            sed -i "s|alias $ALIAS_PATH|alias $UPLOADS_DIR/;|g" "$NGINX_CONFIG"
            echo "   ✅ Alias path updated"
        fi
    fi
    
    # Check if try_files exists
    if grep -A 10 "location /uploads/" "$NGINX_CONFIG" | grep -q "try_files"; then
        echo "   ✅ try_files directive exists"
    else
        echo "   ⚠️  try_files directive missing, adding..."
        
        # Backup
        BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$NGINX_CONFIG" "$BACKUP_FILE"
        echo "   ✅ Backup created: $BACKUP_FILE"
        
        # Add try_files using Python
        python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find /uploads/ location block and add try_files if missing
pattern = r'(location\s+/uploads/\s*\{[^}]*?)(alias\s+[^;]+;)([^}]*?)(\})'

def add_try_files(match):
    before_alias = match.group(1)
    alias_line = match.group(2)
    after_alias = match.group(3)
    closing = match.group(4)
    
    # Check if try_files already exists
    if 'try_files' in after_alias:
        return match.group(0)
    
    # Add try_files and other directives after alias
    additions = '''
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;'''
    
    return before_alias + alias_line + additions + closing

content = re.sub(pattern, add_try_files, content, flags=re.DOTALL)

with open(config_file, 'w') as f:
    f.write(content)

print("   ✅ try_files added to /uploads/ location")
PYTHON_SCRIPT
    fi
else
    echo "   ❌ /uploads/ location NOT found, adding..."
    
    # Backup
    BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo "   ✅ Backup created: $BACKUP_FILE"
    
    # Add /uploads/ location block
    python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    lines = f.readlines()

# Find a.acoustic.uz server block and add /uploads/ location before /api
uploads_block = f'''    # Uploads static files - MUST be before location /api to avoid conflicts
    location /uploads/ {{
        alias {UPLOADS_DIR}/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }}
    
'''.replace('{UPLOADS_DIR}', '/var/www/acoustic.uz/apps/backend/uploads')

# Find server_name a.acoustic.uz and add /uploads/ before /api
insert_pos = -1
for i, line in enumerate(lines):
    if 'server_name a.acoustic.uz' in line:
        # Find /api location block
        for j in range(i, min(i+50, len(lines))):
            if 'location /api' in lines[j]:
                insert_pos = j
                break
        break

if insert_pos != -1:
    lines.insert(insert_pos, uploads_block)
    with open(config_file, 'w') as f:
        f.writelines(lines)
    print("   ✅ /uploads/ location block added")
else:
    print("   ⚠️  Could not find insertion point")
PYTHON_SCRIPT
fi
echo ""

# Step 4: Verify Nginx config
echo "📋 Step 4: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo "   Showing error:"
    nginx -t 2>&1 | tail -5 | sed 's/^/      /'
    exit 1
fi
echo ""

# Step 5: Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
echo "   ✅ Nginx reloaded"
echo ""

# Step 6: Test uploads URL
echo "📋 Step 6: Testing uploads URL..."
sleep 2

# Test with a file that should exist
TEST_FILES=(
    "2024/07/own_cic.jpg"
    "2024/07"
)

for TEST_FILE in "${TEST_FILES[@]}"; do
    if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://a.acoustic.uz/uploads/$TEST_FILE" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ File accessible: $TEST_FILE (HTTP $HTTP_CODE)"
        else
            echo "   ⚠️  File not accessible: $TEST_FILE (HTTP $HTTP_CODE)"
        fi
        break
    fi
done

# If no test file found, check directory listing
if [ -d "$UPLOADS_DIR/2024" ]; then
    echo "   Checking directory structure:"
    find "$UPLOADS_DIR" -type f | head -10 | sed 's|^.*uploads/|      /uploads/|' | sed 's/^/      /'
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. If files are missing, upload them via admin panel"
echo "   2. Check Nginx logs: tail -f /var/log/nginx/a.acoustic.uz.error.log"
echo "   3. Test URL: curl -I https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"

