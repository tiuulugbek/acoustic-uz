#!/bin/bash
# Copy uploads from old server (news.acoustic.uz) to new server (acoustic.uz)

set -e

OLD_SERVER="news.acoustic.uz"
OLD_UPLOADS="/var/www/news.acoustic.uz/apps/backend/uploads"
NEW_UPLOADS="/var/www/acoustic.uz/apps/backend/uploads"

echo "📦 Copying uploads from old server to new server..."
echo ""

# 1. Check if old uploads directory exists
echo "📋 Step 1: Checking old server uploads..."
if [ -d "$OLD_UPLOADS" ]; then
    FILE_COUNT=$(find "$OLD_UPLOADS" -type f | wc -l)
    DIR_SIZE=$(du -sh "$OLD_UPLOADS" 2>/dev/null | cut -f1)
    echo "   ✅ Old uploads directory found"
    echo "   📊 Files: $FILE_COUNT"
    echo "   💾 Size: $DIR_SIZE"
else
    echo "   ❌ Old uploads directory NOT found: $OLD_UPLOADS"
    echo "   💡 Trying alternative locations..."
    
    # Try alternative locations
    ALTERNATIVE_LOCATIONS=(
        "/var/www/news.acoustic.uz/uploads"
        "/var/www/news.acoustic.uz/apps/backend/storage/uploads"
        "/var/www/news.acoustic.uz/storage/uploads"
    )
    
    FOUND=false
    for loc in "${ALTERNATIVE_LOCATIONS[@]}"; do
        if [ -d "$loc" ]; then
            FILE_COUNT=$(find "$loc" -type f | wc -l)
            DIR_SIZE=$(du -sh "$loc" 2>/dev/null | cut -f1)
            echo "   ✅ Found alternative location: $loc"
            echo "   📊 Files: $FILE_COUNT"
            echo "   💾 Size: $DIR_SIZE"
            OLD_UPLOADS="$loc"
            FOUND=true
            break
        fi
    done
    
    if [ "$FOUND" = false ]; then
        echo "   ❌ Could not find uploads directory on old server"
        echo "   💡 Please check manually:"
        echo "      find /var/www/news.acoustic.uz -type d -name 'uploads' 2>/dev/null"
        exit 1
    fi
fi

# 2. Create new uploads directory
echo ""
echo "📋 Step 2: Preparing new uploads directory..."
if [ ! -d "$NEW_UPLOADS" ]; then
    echo "   Creating directory: $NEW_UPLOADS"
    mkdir -p "$NEW_UPLOADS"
fi

# Check current files in new directory
CURRENT_FILES=$(find "$NEW_UPLOADS" -type f | wc -l)
echo "   Current files in new directory: $CURRENT_FILES"

# 3. Copy files
echo ""
echo "📋 Step 3: Copying files..."
echo "   From: $OLD_UPLOADS"
echo "   To: $NEW_UPLOADS"
echo "   This may take a while..."

# Use rsync if available, otherwise cp
if command -v rsync &> /dev/null; then
    echo "   Using rsync..."
    rsync -av --progress "$OLD_UPLOADS/" "$NEW_UPLOADS/" || {
        echo "   ❌ rsync failed, trying cp..."
        cp -r "$OLD_UPLOADS"/* "$NEW_UPLOADS/" 2>/dev/null || true
    }
else
    echo "   Using cp..."
    cp -r "$OLD_UPLOADS"/* "$NEW_UPLOADS/" 2>/dev/null || {
        echo "   ⚠️  Some files may have failed to copy"
    }
fi

# 4. Set permissions
echo ""
echo "📋 Step 4: Setting permissions..."
chmod -R 755 "$NEW_UPLOADS" 2>/dev/null || true
find "$NEW_UPLOADS" -type f -exec chmod 644 {} \; 2>/dev/null || true
find "$NEW_UPLOADS" -type d -exec chmod 755 {} \; 2>/dev/null || true

# 5. Verify
echo ""
echo "📋 Step 5: Verifying copy..."
NEW_FILE_COUNT=$(find "$NEW_UPLOADS" -type f | wc -l)
NEW_DIR_SIZE=$(du -sh "$NEW_UPLOADS" 2>/dev/null | cut -f1)

echo "   ✅ Files copied: $NEW_FILE_COUNT"
echo "   💾 New directory size: $NEW_DIR_SIZE"

# 6. Test specific file
echo ""
echo "📋 Step 6: Testing specific file..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
if [ -f "$NEW_UPLOADS/$TEST_FILE" ]; then
    FILE_SIZE=$(ls -lh "$NEW_UPLOADS/$TEST_FILE" | awk '{print $5}')
    echo "   ✅ Test file found: $TEST_FILE ($FILE_SIZE)"
else
    echo "   ⚠️  Test file NOT found: $TEST_FILE"
    echo "   💡 File might not exist on old server either"
fi

# 7. Show sample files
echo ""
echo "📋 Step 7: Sample files in new directory:"
find "$NEW_UPLOADS" -type f | head -10 | while read file; do
    filename=$(basename "$file")
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "   - $filename ($size)"
done

echo ""
echo "✅ Copy complete!"
echo ""
echo "🔍 Next steps:"
echo "  1. Test URL: curl -I https://a.acoustic.uz/uploads/2025-12-04-1764833768750-blob-rbrw6k.webp"
echo "  2. Check Nginx config: sudo nginx -t"
echo "  3. Reload Nginx if needed: sudo systemctl reload nginx"

