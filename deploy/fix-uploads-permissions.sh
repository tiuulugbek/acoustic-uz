#!/bin/bash

# Script to fix uploads directory permissions

UPLOADS_DIR="/var/www/news.acoustic.uz/uploads"
BACKEND_UPLOADS="/var/www/news.acoustic.uz/apps/backend/uploads"

echo "🔧 Fixing uploads directory permissions..."

# Check if uploads is a symlink
if [ -L "$UPLOADS_DIR" ]; then
    echo "📌 Uploads is a symlink, checking target..."
    TARGET=$(readlink -f "$UPLOADS_DIR")
    echo "   Target: $TARGET"
    
    # If symlink is broken or points to wrong location, recreate it
    if [ ! -d "$TARGET" ] || [ "$TARGET" != "$BACKEND_UPLOADS" ]; then
        echo "⚠️  Symlink is broken or points to wrong location, recreating..."
        sudo rm -f "$UPLOADS_DIR"
        sudo ln -sf "$BACKEND_UPLOADS" "$UPLOADS_DIR"
        echo "✅ Symlink recreated: $UPLOADS_DIR -> $BACKEND_UPLOADS"
    fi
else
    # If not a symlink, check if backend uploads exists
    if [ -d "$BACKEND_UPLOADS" ]; then
        echo "📌 Creating symlink to backend uploads..."
        sudo rm -rf "$UPLOADS_DIR" 2>/dev/null
        sudo ln -sf "$BACKEND_UPLOADS" "$UPLOADS_DIR"
        echo "✅ Symlink created: $UPLOADS_DIR -> $BACKEND_UPLOADS"
    else
        echo "⚠️  Backend uploads directory not found, creating it..."
        sudo mkdir -p "$BACKEND_UPLOADS"
        sudo ln -sf "$BACKEND_UPLOADS" "$UPLOADS_DIR"
    fi
fi

# Ensure backend uploads directory exists
sudo mkdir -p "$BACKEND_UPLOADS"

# Set ownership to deploy:deploy (or www-data:www-data)
sudo chown -R deploy:deploy "$BACKEND_UPLOADS" 2>/dev/null || sudo chown -R www-data:www-data "$BACKEND_UPLOADS"

# Set directory permissions (755)
sudo find "$BACKEND_UPLOADS" -type d -exec chmod 755 {} \;

# Set file permissions (644)
sudo find "$BACKEND_UPLOADS" -type f -exec chmod 644 {} \;

echo "✅ Permissions fixed!"
echo ""
echo "📋 Current permissions:"
ls -la "$UPLOADS_DIR" | head -10
ls -la "$BACKEND_UPLOADS" | head -10

echo ""
echo "🔍 Testing file access:"
TEST_FILE=$(ls "$BACKEND_UPLOADS"/*.webp 2>/dev/null | head -1)
if [ -n "$TEST_FILE" ]; then
    sudo -u www-data test -r "$TEST_FILE" && echo "✅ www-data can read: $(basename "$TEST_FILE")" || echo "❌ www-data cannot read: $(basename "$TEST_FILE")"
else
    echo "⚠️  No test files found in uploads directory"
fi

