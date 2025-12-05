#!/bin/bash
# Fix frontend build and image URLs

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔧 Fixing frontend build and image URLs..."

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# 2. Fix database URLs
echo "🔗 Fixing database URLs..."
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
pnpm fix:database-urls || echo "⚠️  URL fix failed, continuing..."

# 3. Rebuild frontend
echo "🏗️  Rebuilding frontend..."
cd apps/frontend

# Set environment variable
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NODE_ENV="production"

# Clean build
echo "   Cleaning old build files..."
rm -rf .next
rm -rf dist
rm -rf out
rm -rf node_modules/.cache

# Build
echo "   Building frontend..."
pnpm build || {
    echo "❌ Frontend build failed!"
    exit 1
}

echo "   ✅ Frontend build complete!"

# 4. Copy standalone build files
echo "📦 Copying standalone build files..."
if [ -d ".next/standalone" ]; then
    echo "   Found standalone build..."
    
    # Standalone build structure:
    # .next/standalone/apps/frontend/server.js
    # .next/standalone/apps/frontend/.next/static (CRITICAL!)
    # .next/standalone/apps/frontend/public
    
    STANDALONE_TARGET="$PROJECT_DIR/apps/frontend/.next/standalone"
    
    # Copy standalone directory structure
    echo "   Copying standalone directory..."
    mkdir -p "$STANDALONE_TARGET"
    cp -r .next/standalone/* "$STANDALONE_TARGET/" || true
    
    # CRITICAL: Copy static files to standalone location
    if [ -d ".next/static" ]; then
        echo "   Copying static files to standalone location..."
        STATIC_TARGET="$STANDALONE_TARGET/apps/frontend/.next/static"
        mkdir -p "$STATIC_TARGET"
        cp -r .next/static/* "$STATIC_TARGET/" || true
        echo "   ✅ Static files copied to $STATIC_TARGET"
        
        # Verify
        STATIC_COUNT=$(find "$STATIC_TARGET" -type f | wc -l)
        echo "   ✅ Found $STATIC_COUNT static files"
    else
        echo "   ⚠️  WARNING: .next/static not found in build!"
    fi
    
    # Copy public files to standalone
    if [ -d "public" ]; then
        PUBLIC_TARGET="$STANDALONE_TARGET/apps/frontend/public"
        mkdir -p "$PUBLIC_TARGET"
        cp -r public/* "$PUBLIC_TARGET/" 2>/dev/null || true
        echo "   ✅ Public files copied"
    fi
    
    # Verify server.js exists
    SERVER_JS="$STANDALONE_TARGET/apps/frontend/server.js"
    if [ -f "$SERVER_JS" ]; then
        echo "   ✅ Server.js found at $SERVER_JS"
    else
        echo "   ❌ ERROR: server.js not found at $SERVER_JS"
    fi
else
    echo "   ❌ ERROR: Standalone build not found!"
    echo "   Checking .next directory structure..."
    ls -la .next/ 2>/dev/null || echo "    .next directory not found"
    exit 1
fi

cd "$PROJECT_DIR"

# 5. Check uploads directory
echo "📁 Checking uploads directory..."
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "⚠️  Uploads directory not found, creating..."
    mkdir -p "$UPLOADS_DIR"
    chmod -R 755 "$UPLOADS_DIR"
fi

# Check if uploads directory has files
UPLOAD_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
echo "   Found $UPLOAD_COUNT files in uploads directory"

# 6. Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --only acoustic-frontend

# 7. Reload Nginx
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx || echo "⚠️  Nginx reload failed"

# 8. Test
echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Backend API: https://a.acoustic.uz/api"
echo "  - Uploads: https://a.acoustic.uz/uploads/ (check if files exist)"
echo ""
echo "🔍 Check logs:"
echo "  - Frontend: pm2 logs acoustic-frontend --lines 20"
echo "  - Nginx: tail -20 /var/log/nginx/acoustic.uz.error.log"

