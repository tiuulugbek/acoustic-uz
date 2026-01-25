#!/bin/bash
# Check backend uploads directory and file serving

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
UPLOADS_DIR="$BACKEND_DIR/uploads"
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"

echo "🔍 Checking backend uploads configuration..."
echo ""

# 1. Check uploads directory
echo "📋 Step 1: Checking uploads directory..."
echo "   Expected location: $UPLOADS_DIR"

if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✅ Directory exists"
    
    FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    DIR_SIZE=$(du -sh "$UPLOADS_DIR" 2>/dev/null | cut -f1)
    echo "   📊 Files: $FILE_COUNT"
    echo "   💾 Size: $DIR_SIZE"
    
    # List first 10 files
    echo ""
    echo "   📋 First 10 files:"
    find "$UPLOADS_DIR" -type f | head -10 | while read file; do
        filename=$(basename "$file")
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "     - $filename ($size)"
    done
else
    echo "   ❌ Directory NOT found!"
    echo "   💡 Creating directory..."
    mkdir -p "$UPLOADS_DIR"
    chmod -R 755 "$UPLOADS_DIR"
    echo "   ✅ Directory created"
fi

# 2. Check specific file
echo ""
echo "📋 Step 2: Checking test file..."
if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    FILE_SIZE=$(ls -lh "$UPLOADS_DIR/$TEST_FILE" | awk '{print $5}')
    FILE_PERM=$(stat -c "%a" "$UPLOADS_DIR/$TEST_FILE" 2>/dev/null || stat -f "%OLp" "$UPLOADS_DIR/$TEST_FILE" 2>/dev/null || echo "unknown")
    echo "   ✅ File exists: $TEST_FILE"
    echo "   📏 Size: $FILE_SIZE"
    echo "   🔐 Permissions: $FILE_PERM"
else
    echo "   ❌ File NOT found: $TEST_FILE"
    echo "   📍 Expected: $UPLOADS_DIR/$TEST_FILE"
    
    # Check if file exists elsewhere
    echo ""
    echo "   🔍 Searching for file in other locations..."
    find "$PROJECT_DIR" -name "$TEST_FILE" 2>/dev/null | head -5 | while read file; do
        echo "     Found: $file"
    done || echo "     Not found elsewhere"
fi

# 3. Check backend process working directory
echo ""
echo "📋 Step 3: Checking backend process..."
PM2_INFO=$(pm2 describe acoustic-backend 2>/dev/null | grep -E "cwd|script" || echo "")
if [ -n "$PM2_INFO" ]; then
    echo "   PM2 info:"
    echo "$PM2_INFO" | sed 's/^/     /'
    
    # Get actual working directory
    PM2_CWD=$(pm2 describe acoustic-backend 2>/dev/null | grep "cwd" | awk '{print $4}' || echo "")
    if [ -n "$PM2_CWD" ]; then
        echo ""
        echo "   📍 PM2 working directory: $PM2_CWD"
        PM2_UPLOADS="$PM2_CWD/uploads"
        echo "   📍 Expected uploads path: $PM2_UPLOADS"
        
        if [ -d "$PM2_UPLOADS" ]; then
            PM2_FILE_COUNT=$(find "$PM2_UPLOADS" -type f | wc -l)
            echo "   ✅ PM2 uploads directory exists ($PM2_FILE_COUNT files)"
        else
            echo "   ❌ PM2 uploads directory NOT found"
        fi
    fi
else
    echo "   ⚠️  Could not get PM2 info"
fi

# 4. Check backend code (main.ts)
echo ""
echo "📋 Step 4: Checking backend code..."
MAIN_TS="$BACKEND_DIR/src/main.ts"
if [ -f "$MAIN_TS" ]; then
    if grep -q "useStaticAssets.*uploads" "$MAIN_TS"; then
        echo "   ✅ useStaticAssets found in main.ts"
        UPLOADS_CONFIG=$(grep -A 2 "useStaticAssets.*uploads" "$MAIN_TS")
        echo "   Configuration:"
        echo "$UPLOADS_CONFIG" | sed 's/^/     /'
    else
        echo "   ❌ useStaticAssets not found in main.ts"
    fi
else
    echo "   ⚠️  main.ts not found"
fi

# 5. Test backend directly
echo ""
echo "📋 Step 5: Testing backend directly..."
BACKEND_URL="http://localhost:3001/uploads/$TEST_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend serves file correctly (HTTP 200)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Backend returns 404"
    echo "   💡 Possible issues:"
    echo "      - File doesn't exist in backend/uploads/"
    echo "      - useStaticAssets path is incorrect"
    echo "      - Backend needs restart"
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

# 6. Check if uploads directory is in the right place relative to backend
echo ""
echo "📋 Step 6: Checking directory structure..."
echo "   Backend directory: $BACKEND_DIR"
echo "   Uploads directory: $UPLOADS_DIR"
echo "   Relative path: uploads/ (from backend root)"

# Check process.cwd() - this should be backend directory when running
echo ""
echo "   💡 Note: Backend uses process.cwd() which should be:"
echo "      - Development: $BACKEND_DIR"
echo "      - Production (PM2): Check PM2 cwd above"

echo ""
echo "✅ Check complete!"
echo ""
echo "💡 If file exists but backend returns 404:"
echo "   1. Check if file is in: $UPLOADS_DIR/"
echo "   2. Check PM2 working directory matches backend location"
echo "   3. Restart backend: pm2 restart acoustic-backend"

