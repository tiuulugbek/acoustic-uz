#!/bin/bash
# Copy uploads from old location to backend/uploads

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_UPLOADS="$PROJECT_DIR/apps/backend/uploads"

# Possible old locations
OLD_LOCATIONS=(
    "$PROJECT_DIR/uploads"
    "/var/www/news.acoustic.uz/apps/backend/uploads"
    "/var/www/news.acoustic.uz/uploads"
)

echo "🔍 Looking for uploads directory..."
echo ""

# Find existing uploads
FOUND_LOCATION=""
for location in "${OLD_LOCATIONS[@]}"; do
    if [ -d "$location" ] && [ "$(find "$location" -type f | wc -l)" -gt 0 ]; then
        FILE_COUNT=$(find "$location" -type f | wc -l)
        echo "   ✅ Found: $location ($FILE_COUNT files)"
        FOUND_LOCATION="$location"
        break
    fi
done

if [ -z "$FOUND_LOCATION" ]; then
    echo "   ⚠️  No uploads directory found in expected locations"
    echo "   💡 Please specify the source directory manually"
    exit 1
fi

# Ensure backend uploads directory exists
echo ""
echo "📋 Ensuring backend uploads directory exists..."
mkdir -p "$BACKEND_UPLOADS"
chmod -R 755 "$BACKEND_UPLOADS"

# Check if backend uploads already has files
EXISTING_COUNT=$(find "$BACKEND_UPLOADS" -type f | wc -l)
if [ "$EXISTING_COUNT" -gt 0 ]; then
    echo "   ⚠️  Backend uploads already has $EXISTING_COUNT files"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   ❌ Cancelled"
        exit 1
    fi
fi

# Copy files
echo ""
echo "📋 Copying files..."
echo "   From: $FOUND_LOCATION"
echo "   To: $BACKEND_UPLOADS"

# Use rsync for efficient copying
rsync -av --progress "$FOUND_LOCATION/" "$BACKEND_UPLOADS/" || {
    echo "   ❌ rsync failed, trying cp..."
    cp -r "$FOUND_LOCATION"/* "$BACKEND_UPLOADS/" 2>/dev/null || {
        echo "   ❌ cp failed"
        exit 1
    }
}

# Set permissions
chmod -R 755 "$BACKEND_UPLOADS"

# Verify
NEW_COUNT=$(find "$BACKEND_UPLOADS" -type f | wc -l)
echo ""
echo "✅ Copy complete!"
echo "   Files copied: $NEW_COUNT"
echo ""
echo "📋 Testing backend..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"
if [ -f "$BACKEND_UPLOADS/$TEST_FILE" ]; then
    echo "   ✅ Test file found: $TEST_FILE"
    echo "   💡 Restart backend: pm2 restart acoustic-backend"
else
    echo "   ⚠️  Test file not found (this is OK if it doesn't exist)"
fi

