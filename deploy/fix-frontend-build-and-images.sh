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

# Clean build
rm -rf .next
rm -rf dist
rm -rf out

# Build
pnpm build || {
    echo "❌ Frontend build failed!"
    exit 1
}

# 4. Copy standalone build files
echo "📦 Copying standalone build files..."
if [ -d ".next/standalone" ]; then
    # Copy standalone files
    cp -r .next/standalone/* "$PROJECT_DIR/" || true
    
    # Copy static files
    if [ -d ".next/static" ]; then
        mkdir -p "$PROJECT_DIR/.next/static"
        cp -r .next/static/* "$PROJECT_DIR/.next/static/" || true
    fi
    
    # Copy public files
    if [ -d "public" ]; then
        cp -r public/* "$PROJECT_DIR/public/" 2>/dev/null || true
    fi
else
    echo "⚠️  Standalone build not found, using regular build..."
    # Copy .next directory
    cp -r .next "$PROJECT_DIR/" || true
    
    # Copy public files
    if [ -d "public" ]; then
        mkdir -p "$PROJECT_DIR/public"
        cp -r public/* "$PROJECT_DIR/public/" 2>/dev/null || true
    fi
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

