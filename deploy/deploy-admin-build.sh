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
    
    # Install dependencies (without NODE_ENV=production to get devDependencies)
    echo "📦 Installing dependencies..."
    pnpm install --force || true
    
    # Clean old build
    echo "🧹 Cleaning old build..."
    rm -rf apps/admin/dist
    
    # Build with production environment variables
    echo "🏗️  Building admin panel..."
    cd apps/admin
    
    # Set environment variables explicitly for vite
    export NODE_ENV=production
    export VITE_API_URL=https://api.acoustic.uz/api
    
    echo "📋 Build environment variables:"
    echo "  NODE_ENV=$NODE_ENV"
    echo "  VITE_API_URL=$VITE_API_URL"
    
    # Verify environment variable is set
    if [ -z "$VITE_API_URL" ]; then
        echo "❌ VITE_API_URL is not set!"
        exit 1
    fi
    
    pnpm build || {
        echo "⚠️  Build failed, trying again with explicit env..."
        NODE_ENV=production VITE_API_URL=https://api.acoustic.uz/api pnpm build
    }
    
    cd "$PROJECT_DIR"
    
    # Verify build contains correct API URL
    echo "🔍 Verifying build..."
    JS_FILE=$(find apps/admin/dist -name "*.js" -type f | head -1)
    if [ -n "$JS_FILE" ]; then
        if grep -q "localhost:3001" "$JS_FILE"; then
            echo "❌ Build still contains localhost:3001!"
            echo "💡 This means VITE_API_URL was not used during build"
            exit 1
        else
            echo "✅ Build verified - no localhost:3001 found"
        fi
    fi
    
    echo "✅ Admin panel build completed!"
    
    # Show version info
    echo "📋 Build version info:"
    if [ -f "apps/admin/dist/assets/index-*.js" ]; then
        JS_FILE=$(find apps/admin/dist/assets -name "index-*.js" -type f | head -1)
        if grep -q "__APP_VERSION__" "$JS_FILE" 2>/dev/null; then
            echo "  Version found in build file"
        fi
    fi
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

