#!/bin/bash
# Check if upload files exist on server

set -e

UPLOADS_DIR="/var/www/acoustic.uz/apps/backend/uploads"
PROJECT_DIR="/var/www/acoustic.uz"

echo "🔍 Checking uploads directory and files..."
echo ""

# 1. Check if uploads directory exists
echo "📁 Step 1: Checking uploads directory..."
if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✅ Directory exists: $UPLOADS_DIR"
    
    # Count files
    FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    echo "   📊 Total files: $FILE_COUNT"
    
    # Show directory size
    DIR_SIZE=$(du -sh "$UPLOADS_DIR" 2>/dev/null | cut -f1)
    echo "   💾 Directory size: $DIR_SIZE"
    
    # List first 20 files
    echo ""
    echo "   📋 First 20 files:"
    find "$UPLOADS_DIR" -type f | head -20 | while read file; do
        filename=$(basename "$file")
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "     - $filename ($size)"
    done
else
    echo "   ❌ Directory NOT found: $UPLOADS_DIR"
    echo "   Creating directory..."
    mkdir -p "$UPLOADS_DIR"
    chmod -R 755 "$UPLOADS_DIR"
    echo "   ✅ Directory created"
fi

# 2. Check specific file from database
echo ""
echo "📋 Step 2: Checking specific file from URL..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
TEST_FILE_PATH="$UPLOADS_DIR/$TEST_FILE"

if [ -f "$TEST_FILE_PATH" ]; then
    FILE_SIZE=$(ls -lh "$TEST_FILE_PATH" | awk '{print $5}')
    echo "   ✅ File exists: $TEST_FILE"
    echo "   📏 Size: $FILE_SIZE"
    echo "   📍 Path: $TEST_FILE_PATH"
else
    echo "   ❌ File NOT found: $TEST_FILE"
    echo "   📍 Expected path: $TEST_FILE_PATH"
fi

# 3. Check database for media URLs
echo ""
echo "📋 Step 3: Checking database for media URLs..."
cd "$PROJECT_DIR" || exit 1

# Try to query database for media records
if command -v psql &> /dev/null; then
    # Get DATABASE_URL from .env
    if [ -f ".env" ]; then
        DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
        
        if [ -n "$DATABASE_URL" ]; then
            echo "   Querying database for media records..."
            
            # Extract connection info
            # Format: postgresql://user:password@host:port/database
            DB_INFO=$(echo "$DATABASE_URL" | sed 's|postgresql://||' | sed 's|@| |' | sed 's|:| |' | sed 's|/| |')
            DB_USER=$(echo "$DB_INFO" | awk '{print $1}')
            DB_PASS=$(echo "$DB_INFO" | awk '{print $2}')
            DB_HOST=$(echo "$DB_INFO" | awk '{print $3}')
            DB_PORT=$(echo "$DB_INFO" | awk '{print $4}')
            DB_NAME=$(echo "$DB_INFO" | awk '{print $5}')
            
            # Query for recent media
            PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT url, filename FROM \"Media\" ORDER BY \"createdAt\" DESC LIMIT 10;" 2>/dev/null | tail -n +3 | head -n -1 | while read line; do
                if [ -n "$line" ]; then
                    echo "     - $line"
                fi
            done || echo "   ⚠️  Could not query database"
        else
            echo "   ⚠️  DATABASE_URL not found in .env"
        fi
    else
        echo "   ⚠️  .env file not found"
    fi
else
    echo "   ⚠️  psql not found, skipping database check"
fi

# 4. Test Nginx access
echo ""
echo "📋 Step 4: Testing Nginx access to uploads..."
TEST_URL="https://a.acoustic.uz/uploads/$TEST_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ File accessible via Nginx (HTTP 200)"
    echo "   🔗 URL: $TEST_URL"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ File NOT accessible via Nginx (HTTP 404)"
    echo "   🔗 URL: $TEST_URL"
    echo "   💡 File might not exist or Nginx config issue"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "   ⚠️  Access forbidden (HTTP 403)"
    echo "   💡 Check file permissions"
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

# 5. Check Nginx config
echo ""
echo "📋 Step 5: Checking Nginx config for /uploads..."
if [ -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    UPLOADS_CONFIG=$(grep -A 15 "server_name a.acoustic.uz" /etc/nginx/sites-available/acoustic-uz.conf | grep -A 10 "location /uploads" | head -12)
    if [ -n "$UPLOADS_CONFIG" ]; then
        echo "   ✅ Found /uploads location block:"
        echo "$UPLOADS_CONFIG" | sed 's/^/     /'
    else
        echo "   ❌ /uploads location block NOT found in a.acoustic.uz server block"
    fi
else
    echo "   ⚠️  Nginx config file not found"
fi

# 6. Check file permissions
echo ""
echo "📋 Step 6: Checking file permissions..."
if [ -d "$UPLOADS_DIR" ]; then
    DIR_PERM=$(stat -c "%a" "$UPLOADS_DIR" 2>/dev/null || stat -f "%OLp" "$UPLOADS_DIR" 2>/dev/null || echo "unknown")
    echo "   📁 Directory permissions: $DIR_PERM"
    
    if [ -f "$TEST_FILE_PATH" ]; then
        FILE_PERM=$(stat -c "%a" "$TEST_FILE_PATH" 2>/dev/null || stat -f "%OLp" "$TEST_FILE_PATH" 2>/dev/null || echo "unknown")
        echo "   📄 File permissions: $FILE_PERM"
    fi
    
    # Check if nginx user can read
    if id nginx &>/dev/null; then
        echo "   👤 Nginx user exists"
    elif id www-data &>/dev/null; then
        echo "   👤 www-data user exists (might be nginx user)"
    else
        echo "   ⚠️  Could not find nginx/www-data user"
    fi
fi

echo ""
echo "✅ Check complete!"
echo ""
echo "💡 Summary:"
echo "  - Uploads directory: $UPLOADS_DIR"
echo "  - Test file: $TEST_FILE"
echo "  - Test URL: $TEST_URL"
echo ""
echo "🔧 If file doesn't exist, you may need to:"
echo "  1. Copy files from old server"
echo "  2. Re-upload files via admin panel"
echo "  3. Check if files are in a different location"

