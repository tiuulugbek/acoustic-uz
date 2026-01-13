#!/bin/bash
# Diagnose uploads 404 issue

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
TEST_FILE="2024/07/own_cic.jpg"

echo "🔍 Diagnosing uploads 404 issue..."
echo ""

# Step 1: Check file existence
echo "📋 Step 1: Checking file existence..."
if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    echo "   ✅ File exists: $UPLOADS_DIR/$TEST_FILE"
    ls -lh "$UPLOADS_DIR/$TEST_FILE" | awk '{print "    Size: " $5 ", Permissions: " $1}'
else
    echo "   ❌ File NOT found: $UPLOADS_DIR/$TEST_FILE"
    echo "   Checking directory structure:"
    if [ -d "$UPLOADS_DIR/2024" ]; then
        echo "   ✅ 2024 directory exists"
        if [ -d "$UPLOADS_DIR/2024/07" ]; then
            echo "   ✅ 2024/07 directory exists"
            echo "   Files in 2024/07:"
            ls -la "$UPLOADS_DIR/2024/07/" | head -10 | sed 's/^/      /'
        else
            echo "   ❌ 2024/07 directory NOT found"
        fi
    else
        echo "   ❌ 2024 directory NOT found"
    fi
fi
echo ""

# Step 2: Check uploads directory permissions
echo "📋 Step 2: Checking uploads directory permissions..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   Directory: $UPLOADS_DIR"
    ls -ld "$UPLOADS_DIR" | awk '{print "    Permissions: " $1 ", Owner: " $3 ":" $4}'
    
    # Check if nginx can read
    if sudo -u www-data test -r "$UPLOADS_DIR/$TEST_FILE" 2>/dev/null; then
        echo "   ✅ www-data can read the file"
    else
        echo "   ⚠️  www-data cannot read the file (permission issue)"
    fi
else
    echo "   ❌ Uploads directory NOT found: $UPLOADS_DIR"
fi
echo ""

# Step 3: Check Nginx configuration
echo "📋 Step 3: Checking Nginx configuration..."
if grep -q "location /uploads/" "$NGINX_CONFIG"; then
    echo "   ✅ /uploads/ location found"
    echo "   Configuration:"
    grep -A 10 "location /uploads/" "$NGINX_CONFIG" | sed 's/^/      /'
    
    # Check alias path
    ALIAS_PATH=$(grep -A 10 "location /uploads/" "$NGINX_CONFIG" | grep "alias" | awk '{print $2}' | tr -d ';')
    if [ -n "$ALIAS_PATH" ]; then
        echo "   Alias path: $ALIAS_PATH"
        if [ -d "$ALIAS_PATH" ]; then
            echo "   ✅ Alias directory exists"
        else
            echo "   ❌ Alias directory NOT found: $ALIAS_PATH"
        fi
        
        # Check if file exists at alias path
        if [ -f "$ALIAS_PATH/$TEST_FILE" ]; then
            echo "   ✅ File exists at alias path"
        else
            echo "   ❌ File NOT found at alias path: $ALIAS_PATH/$TEST_FILE"
        fi
    fi
    
    # Check try_files
    if grep -A 10 "location /uploads/" "$NGINX_CONFIG" | grep -q "try_files"; then
        echo "   ✅ try_files directive exists"
    else
        echo "   ⚠️  try_files directive missing"
    fi
else
    echo "   ❌ /uploads/ location NOT found in Nginx config"
fi
echo ""

# Step 4: Test Nginx config
echo "📋 Step 4: Testing Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
fi
echo ""

# Step 5: Check Nginx error logs
echo "📋 Step 5: Checking Nginx error logs..."
if [ -f "/var/log/nginx/a.acoustic.uz.error.log" ]; then
    echo "   Last 10 lines of error log:"
    tail -10 /var/log/nginx/a.acoustic.uz.error.log | sed 's/^/      /'
else
    echo "   ⚠️  Error log file not found"
fi
echo ""

# Step 6: Test URL directly
echo "📋 Step 6: Testing URL directly..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://a.acoustic.uz/uploads/$TEST_FILE" 2>/dev/null || echo "000")
echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ URL is accessible"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ URL returns 404"
    echo "   Testing with verbose output:"
    curl -v "https://a.acoustic.uz/uploads/$TEST_FILE" 2>&1 | grep -E "(< HTTP|Location|alias)" | head -5 | sed 's/^/      /'
elif [ "$HTTP_CODE" = "403" ]; then
    echo "   ⚠️  URL returns 403 (permission denied)"
else
    echo "   ⚠️  Unexpected HTTP status: $HTTP_CODE"
fi
echo ""

# Step 7: Check if file is accessible via backend
echo "📋 Step 7: Checking backend uploads serving..."
if pm2 list | grep -q "acoustic-backend.*online"; then
    BACKEND_UPLOADS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3001/uploads/$TEST_FILE" 2>/dev/null || echo "000")
    echo "   Backend uploads test: HTTP $BACKEND_UPLOADS"
fi
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "💡 Recommendations:"
if [ ! -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    echo "   1. File doesn't exist - check if it was uploaded correctly"
fi
if ! grep -q "try_files" <<< "$(grep -A 10 'location /uploads/' "$NGINX_CONFIG" 2>/dev/null || true)"; then
    echo "   2. Check Nginx configuration for /uploads/ location"
fi
echo "   3. Check file permissions: chmod -R 755 $UPLOADS_DIR"
echo "   4. Check owner: chown -R www-data:www-data $UPLOADS_DIR"

