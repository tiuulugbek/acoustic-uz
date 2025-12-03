#!/bin/bash
# Deploy admin panel build to Nginx directory

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"
ADMIN_DIST_DIR="/var/www/admins.acoustic.uz/dist"

echo "🚀 Deploying admin panel build..."

cd "$PROJECT_DIR"

# Check if admin dist exists or needs rebuild
if [ ! -d "apps/admin/dist" ] || [ "$1" == "--rebuild" ]; then
    echo "🔨 Building admin panel..."
    export PNPM_FORCE=true
    export NODE_ENV=production
    export VITE_API_URL=https://api.acoustic.uz/api
    
    echo "📋 Environment variables:"
    echo "  NODE_ENV=$NODE_ENV"
    echo "  VITE_API_URL=$VITE_API_URL"
    
    pnpm install --force || true
    pnpm --filter @acoustic/admin build || {
        echo "⚠️  Build failed, trying again without postinstall scripts..."
        cd apps/admin
        SKIP_POSTINSTALL=true pnpm build || pnpm build
        cd "$PROJECT_DIR"
    }
    
    echo "✅ Admin panel build completed!"
else
    echo "✅ Admin dist directory exists, skipping build..."
fi

# Create admin dist directory if it doesn't exist
echo "📁 Creating admin dist directory..."
sudo mkdir -p "$ADMIN_DIST_DIR"

# Remove old files
echo "🧹 Removing old admin panel files..."
sudo rm -rf "$ADMIN_DIST_DIR"/*

# Copy new files
echo "📋 Copying admin panel build files..."
sudo cp -r apps/admin/dist/* "$ADMIN_DIST_DIR"/

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data "$ADMIN_DIST_DIR"
sudo chmod -R 755 "$ADMIN_DIST_DIR"

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# Verify deployment
echo "✅ Verifying deployment..."
if [ -f "$ADMIN_DIST_DIR/index.html" ]; then
    BUILD_TIME=$(stat -c "%y" "$ADMIN_DIST_DIR/index.html" 2>/dev/null || stat -f "%Sm" "$ADMIN_DIST_DIR/index.html" 2>/dev/null || echo "Unknown")
    echo "✅ Admin panel deployed successfully!"
    echo "📅 Build time: $BUILD_TIME"
    echo "📁 Files in dist:"
    ls -la "$ADMIN_DIST_DIR" | head -10
else
    echo "❌ Admin panel deployment failed!"
    exit 1
fi

echo ""
echo "🌐 Admin panel should now be available at https://admins.acoustic.uz"
echo "💡 Clear browser cache (Ctrl+Shift+R) to see the latest version"

