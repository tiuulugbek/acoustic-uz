#!/bin/bash
# Fix uploads Nginx config and rebuild frontend

set -e

PROJECT_DIR="/var/www/acoustic.uz"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"

echo "🔧 Fixing uploads Nginx config and rebuilding frontend..."
echo ""

# Step 1: Check uploads directory
echo "📋 Step 1: Checking uploads directory..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✅ Uploads directory exists: $UPLOADS_DIR"
    FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    echo "   Files count: $FILE_COUNT"
    
    # Check if the specific file exists
    if [ -f "$UPLOADS_DIR/2024/07/own_cic.jpg" ]; then
        echo "   ✅ File exists: 2024/07/own_cic.jpg"
        ls -lh "$UPLOADS_DIR/2024/07/own_cic.jpg" | awk '{print "    Size: " $5}'
    else
        echo "   ⚠️  File not found: 2024/07/own_cic.jpg"
        echo "   Checking 2024/07 directory:"
        ls -la "$UPLOADS_DIR/2024/07/" 2>/dev/null | head -5 | sed 's/^/      /' || echo "      Directory not found"
    fi
else
    echo "   ❌ Uploads directory NOT found: $UPLOADS_DIR"
fi
echo ""

# Step 2: Fix Nginx uploads configuration
echo "📋 Step 2: Fixing Nginx uploads configuration..."
if grep -q "location /uploads/" "$NGINX_CONFIG"; then
    echo "   ✅ /uploads/ location found"
    
    # Check if try_files exists
    if grep -A 5 "location /uploads/" "$NGINX_CONFIG" | grep -q "try_files"; then
        echo "   ✅ try_files directive exists"
    else
        echo "   ⚠️  try_files directive missing, adding..."
        
        # Backup
        BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$NGINX_CONFIG" "$BACKUP_FILE"
        echo "   ✅ Backup created: $BACKUP_FILE"
        
        # Add try_files to /uploads/ location
        python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find /uploads/ location block and add try_files if missing
pattern = r'(location\s+/uploads/\s*\{[^}]*)(\})'
def add_try_files(match):
    block = match.group(1)
    closing = match.group(2)
    
    # Check if try_files already exists
    if 'try_files' in block:
        return match.group(0)
    
    # Add try_files before closing brace
    # Also add proper headers for images
    additions = '''
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    '''
    
    return block + additions + closing

content = re.sub(pattern, add_try_files, content, flags=re.DOTALL)

with open(config_file, 'w') as f:
    f.write(content)

print("   ✅ try_files added to /uploads/ location")
PYTHON_SCRIPT
    fi
else
    echo "   ❌ /uploads/ location NOT found in Nginx config!"
    echo "   Adding /uploads/ location block..."
    
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
uploads_block = '''    # Uploads static files - MUST be before location /api to avoid conflicts
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Allow CORS for images
        add_header Access-Control-Allow-Origin "*" always;
    }
    
'''

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
    print("   ⚠️  Could not find insertion point, please add manually")
PYTHON_SCRIPT
fi
echo ""

# Step 3: Verify Nginx config
echo "📋 Step 3: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 4: Reload Nginx
echo "📋 Step 4: Reloading Nginx..."
systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
echo "   ✅ Nginx reloaded"
echo ""

# Step 5: Rebuild frontend
echo "📋 Step 5: Rebuilding frontend..."
cd "$PROJECT_DIR"

# Build shared package
if [ ! -d "packages/shared/dist" ]; then
    pnpm --filter @acoustic/shared build
fi

# Clean and build frontend
cd apps/frontend
rm -rf .next
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"

if pnpm build; then
    echo "   ✅ Frontend built"
else
    echo "   ❌ Frontend build failed"
    exit 1
fi
echo ""

# Step 6: Restart frontend
echo "📋 Step 6: Restarting frontend..."
cd "$PROJECT_DIR"
if pm2 list | grep -q "acoustic-frontend"; then
    pm2 restart acoustic-frontend
    sleep 3
    echo "   ✅ Frontend restarted"
else
    echo "   ⚠️  Frontend not found in PM2"
fi
echo ""

# Step 7: Test uploads URL
echo "📋 Step 7: Testing uploads URL..."
sleep 2

TEST_URL="https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Uploads URL accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
else
    echo "   ⚠️  Uploads URL not accessible (HTTP $HTTP_CODE)"
    echo "   URL: $TEST_URL"
    echo "   Check Nginx logs: tail -20 /var/log/nginx/a.acoustic.uz.error.log"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Uploads: https://a.acoustic.uz/uploads/2024/07/own_cic.jpg"
echo "  - Frontend: https://acoustic.uz/products/..."

