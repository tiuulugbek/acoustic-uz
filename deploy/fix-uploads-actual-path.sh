#!/bin/bash
# Fix uploads path - files are in uploads/products/ not uploads/2024/07/

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing uploads path issue..."
echo ""

# Step 1: Check actual file structure
echo "📋 Step 1: Checking actual file structure..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   Uploads directory: $UPLOADS_DIR"
    echo ""
    
    echo "   Directory structure:"
    find "$UPLOADS_DIR" -type d -maxdepth 2 | sort | sed 's/^/      /'
    echo ""
    
    echo "   Files in uploads/products/:"
    find "$UPLOADS_DIR/products" -type f 2>/dev/null | head -10 | sed 's/^/      /' || echo "      No products directory"
    echo ""
    
    echo "   Files in uploads/2024/:"
    find "$UPLOADS_DIR/2024" -type f 2>/dev/null | head -10 | sed 's/^/      /' || echo "      No 2024 directory"
    echo ""
    
    # Count files by directory
    echo "   File counts by directory:"
    for DIR in products 2024 2023; do
        if [ -d "$UPLOADS_DIR/$DIR" ]; then
            COUNT=$(find "$UPLOADS_DIR/$DIR" -type f | wc -l)
            echo "      $DIR: $COUNT files"
        fi
    done
else
    echo "   ❌ Uploads directory NOT found: $UPLOADS_DIR"
    exit 1
fi
echo ""

# Step 2: Check what URLs frontend is requesting
echo "📋 Step 2: Checking frontend image URLs..."
# Check if there are any references to 2024/07 in the codebase
echo "   Searching for 2024/07 references in frontend:"
grep -r "2024/07" apps/frontend/src 2>/dev/null | head -5 | sed 's/^/      /' || echo "      No hardcoded references found"
echo ""

# Step 3: Check backend media URLs
echo "📋 Step 3: Checking backend media URLs..."
# Test backend API to see what URLs it returns
if pm2 list | grep -q "acoustic-backend.*online"; then
    echo "   Testing backend media endpoint:"
    BACKEND_RESPONSE=$(curl -s "http://127.0.0.1:3001/api/media?limit=1" 2>/dev/null || echo "")
    if [ -n "$BACKEND_RESPONSE" ]; then
        echo "$BACKEND_RESPONSE" | grep -o '"url":"[^"]*"' | head -3 | sed 's/^/      /' || echo "      No URLs found"
    fi
fi
echo ""

# Step 4: Verify Nginx can serve files from products directory
echo "📋 Step 4: Verifying Nginx configuration..."
if grep -q "location /uploads/" "$NGINX_CONFIG"; then
    ALIAS_PATH=$(grep -A 5 "location /uploads/" "$NGINX_CONFIG" | grep "alias" | awk '{print $2}' | tr -d ';')
    echo "   Current alias: $ALIAS_PATH"
    
    # Test if products directory is accessible
    TEST_FILE="products/oticon-jet-cic-jet_cic.webp"
    if [ -f "${ALIAS_PATH%/}/$TEST_FILE" ] || [ -f "$ALIAS_PATH$TEST_FILE" ]; then
        echo "   ✅ Test file exists at alias path: $TEST_FILE"
        
        # Test URL
        TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "   ✅ URL accessible: $TEST_URL (HTTP $HTTP_CODE)"
        else
            echo "   ⚠️  URL not accessible: $TEST_URL (HTTP $HTTP_CODE)"
        fi
    else
        echo "   ⚠️  Test file NOT found at alias path"
    fi
fi
echo ""

# Step 5: Check if there's a symlink or different structure
echo "📋 Step 5: Checking for symlinks or alternative structures..."
# Check if 2024/07 is a symlink
if [ -L "$UPLOADS_DIR/2024" ] || [ -L "$UPLOADS_DIR/2024/07" ]; then
    echo "   Found symlinks:"
    ls -la "$UPLOADS_DIR/2024" 2>/dev/null | sed 's/^/      /' || true
fi

# Check if products directory has the files we need
if [ -d "$UPLOADS_DIR/products" ]; then
    echo "   Products directory exists with files:"
    ls -la "$UPLOADS_DIR/products" | head -10 | sed 's/^/      /'
fi
echo ""

# Step 6: Summary and recommendations
echo "📋 Step 6: Summary and recommendations..."
echo "   Based on the file structure:"
echo "   - Files are stored in: uploads/products/"
echo "   - Frontend might be requesting: uploads/2024/07/"
echo ""
echo "   Possible solutions:"
echo "   1. Update frontend to use correct paths (uploads/products/)"
echo "   2. Create symlinks: ln -s products 2024/07"
echo "   3. Check backend media service to see what URLs it generates"
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Check backend media URLs: curl http://127.0.0.1:3001/api/media?limit=5"
echo "   2. Check frontend product pages to see what URLs they use"
echo "   3. Test: curl -I https://a.acoustic.uz/uploads/products/oticon-jet-cic-jet_cic.webp"

