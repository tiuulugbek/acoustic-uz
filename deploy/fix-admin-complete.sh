#!/bin/bash
# Complete fix for admin panel: rebuild, fix CORS, fix Nginx

set -e

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo "🔧 Complete admin panel fix..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Pull latest code
echo "📋 Step 1: Pulling latest code..."
git pull origin main
echo "   ✅ Code updated"
echo ""

# Step 2: Remove old .js files
echo "📋 Step 2: Removing old .js files..."
find apps/admin/src -name "*.js" -type f -delete 2>/dev/null || true
rm -f apps/admin/vite.config.js
echo "   ✅ Old .js files removed"
echo ""

# Step 3: Build shared package
echo "📋 Step 3: Building shared package..."
if [ ! -d "packages/shared/dist" ]; then
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
else
    echo "   ℹ️  Shared package already built"
fi
echo ""

# Step 4: Build admin panel
echo "📋 Step 4: Building admin panel..."
cd apps/admin
rm -rf dist
if pnpm build; then
    echo "   ✅ Admin panel built"
else
    echo "   ❌ Admin panel build failed"
    exit 1
fi
echo ""

# Step 5: Copy files
echo "📋 Step 5: Copying admin panel files..."
if [ -d "dist" ]; then
    # Backup old files
    if [ -d "$ADMIN_DIR" ]; then
        BACKUP_DIR="${ADMIN_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "   Creating backup: $BACKUP_DIR"
        mv "$ADMIN_DIR" "$BACKUP_DIR"
    fi
    
    # Create new directory
    mkdir -p "$ADMIN_DIR"
    
    # Copy files
    cp -r dist/* "$ADMIN_DIR/"
    chown -R www-data:www-data "$ADMIN_DIR" 2>/dev/null || chown -R nginx:nginx "$ADMIN_DIR" 2>/dev/null || true
    
    echo "   ✅ Files copied"
    
    # Verify
    if [ -f "$ADMIN_DIR/index.html" ]; then
        echo "   ✅ index.html copied successfully"
    else
        echo "   ❌ index.html NOT found after copy!"
        exit 1
    fi
else
    echo "   ❌ dist directory not found!"
    exit 1
fi
echo ""

# Step 6: Fix backend CORS
echo "📋 Step 6: Fixing backend CORS..."
cd "$PROJECT_DIR/apps/backend"
if [ -f ".env" ]; then
    # Backup .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Remove old CORS_ORIGIN line
    sed -i '/^CORS_ORIGIN=/d' .env
    
    # Add new CORS_ORIGIN
    echo "" >> .env
    echo "# CORS origins - allow admin panel and frontend" >> .env
    echo "CORS_ORIGIN=https://admin.acoustic.uz,https://acoustic.uz,https://www.acoustic.uz" >> .env
    echo "   ✅ CORS_ORIGIN updated"
else
    echo "   ⚠️  .env file not found"
fi
echo ""

# Step 7: Restart backend
echo "📋 Step 7: Restarting backend..."
cd "$PROJECT_DIR"
if pm2 list | grep -q "acoustic-backend"; then
    pm2 restart acoustic-backend
    sleep 3
    echo "   ✅ Backend restarted"
else
    echo "   ⚠️  Backend not found in PM2"
fi
echo ""

# Step 8: Fix Nginx config
echo "📋 Step 8: Fixing Nginx configuration..."
bash deploy/restore-and-fix-admin-nginx.sh
echo ""

# Step 9: Verify
echo "📋 Step 9: Verifying admin panel..."
sleep 3

ADMIN_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_HTTPS" = "200" ]; then
    echo "   ✅ Admin panel HTTPS accessible (HTTP $ADMIN_HTTPS)"
else
    echo "   ⚠️  Admin panel HTTPS not accessible (HTTP $ADMIN_HTTPS)"
fi

ADMIN_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/login 2>/dev/null || echo "000")
if [ "$ADMIN_LOGIN" = "200" ]; then
    echo "   ✅ Admin panel login accessible (HTTP $ADMIN_LOGIN)"
else
    echo "   ⚠️  Admin panel login not accessible (HTTP $ADMIN_LOGIN)"
fi

echo ""
echo "✅ Complete fix finished!"
echo ""
echo "📋 Admin panel URLs:"
echo "  - HTTPS: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"
echo ""
echo "💡 If still not working:"
echo "  1. Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log"
echo "  2. Check backend logs: pm2 logs acoustic-backend"
echo "  3. Verify CORS: curl -I -H 'Origin: https://admin.acoustic.uz' https://a.acoustic.uz/api/auth/me"

