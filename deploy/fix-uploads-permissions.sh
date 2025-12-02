#!/bin/bash

# Script to fix uploads directory permissions

UPLOADS_DIR="/var/www/news.acoustic.uz/uploads"

echo "🔧 Fixing uploads directory permissions..."

# Set ownership to deploy:deploy (or www-data:www-data)
sudo chown -R deploy:deploy "$UPLOADS_DIR"

# Set directory permissions (755)
sudo find "$UPLOADS_DIR" -type d -exec chmod 755 {} \;

# Set file permissions (644)
sudo find "$UPLOADS_DIR" -type f -exec chmod 644 {} \;

echo "✅ Permissions fixed!"
echo ""
echo "📋 Current permissions:"
ls -la "$UPLOADS_DIR" | head -10

echo ""
echo "🔍 Testing file access:"
sudo -u www-data test -r "$UPLOADS_DIR/2025-12-02-1764676763655-blob-xnssfj.webp" && echo "✅ www-data can read the file" || echo "❌ www-data cannot read the file"

