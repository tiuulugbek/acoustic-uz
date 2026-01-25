#!/bin/bash

# Quick fix for countrymap.js loading issue

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🗺️ Fixing countrymap.js loading..."
echo ""

cd "$PROJECT_DIR"

# 1. Check if maps directory exists
MAPS_SOURCE="$FRONTEND_DIR/public/maps"
MAPS_TARGET="$FRONTEND_DIR/.next/standalone/apps/frontend/public/maps"

if [ ! -d "$MAPS_SOURCE" ]; then
    echo "❌ Maps source directory not found: $MAPS_SOURCE"
    exit 1
fi

# 2. Create target directory
mkdir -p "$MAPS_TARGET"
echo "✅ Created target directory: $MAPS_TARGET"

# 3. Copy maps files
echo "📦 Copying maps files..."
cp -r "$MAPS_SOURCE"/* "$MAPS_TARGET"/ 2>&1 || {
    echo "⚠️ Copy failed, trying with rsync..."
    rsync -av "$MAPS_SOURCE/" "$MAPS_TARGET"/ 2>&1 || {
        echo "❌ Failed to copy maps files!"
        exit 1
    }
}

# 4. Set permissions
echo "🔐 Setting permissions..."
chown -R deploy:deploy "$MAPS_TARGET" 2>/dev/null || {
    sudo chown -R deploy:deploy "$MAPS_TARGET" || {
        echo "⚠️ Failed to set ownership"
    }
}
chmod -R 755 "$MAPS_TARGET" 2>/dev/null || {
    sudo chmod -R 755 "$MAPS_TARGET" || {
        echo "⚠️ Failed to set permissions"
    }
}

# 5. Verify
if [ -f "$MAPS_TARGET/countrymap.js" ]; then
    echo "✅ countrymap.js copied successfully!"
    ls -lh "$MAPS_TARGET/countrymap.js"
else
    echo "❌ countrymap.js not found after copy!"
    exit 1
fi

# 6. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx || {
    echo "⚠️ Failed to reload nginx"
}

# 7. Test
echo ""
echo "🧪 Testing..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://news.acoustic.uz/maps/countrymap.js 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 - countrymap.js is accessible!"
else
    echo "⚠️ HTTP $HTTP_CODE - countrymap.js may not be accessible"
    echo "   Check Nginx configuration: /etc/nginx/sites-available/news.acoustic.uz"
fi

echo ""
echo "✅ Maps fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Reload the page"
echo "   3. Check browser console for any remaining errors"

