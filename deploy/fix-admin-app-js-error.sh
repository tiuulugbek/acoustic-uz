#!/bin/bash
# Fix admin panel App.js error by removing old .js files

set -e

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_SRC_DIR="$PROJECT_DIR/apps/admin/src"

echo "🔧 Fixing admin panel App.js error..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Remove old .js files in src directory
echo "📋 Step 1: Removing old .js files from src directory..."
if [ -d "$ADMIN_SRC_DIR" ]; then
    JS_FILES=$(find "$ADMIN_SRC_DIR" -name "*.js" -type f 2>/dev/null || true)
    if [ -n "$JS_FILES" ]; then
        echo "   Found .js files:"
        echo "$JS_FILES" | sed 's/^/      /'
        find "$ADMIN_SRC_DIR" -name "*.js" -type f -delete
        echo "   ✅ Removed .js files"
    else
        echo "   ℹ️  No .js files found"
    fi
else
    echo "   ⚠️  src directory not found: $ADMIN_SRC_DIR"
fi
echo ""

# Step 2: Verify only .tsx/.ts files exist
echo "📋 Step 2: Verifying source files..."
if [ -d "$ADMIN_SRC_DIR" ]; then
    echo "   Source files:"
    find "$ADMIN_SRC_DIR" -name "*.tsx" -o -name "*.ts" | head -10 | sed 's/^/      /'
    if [ -f "$ADMIN_SRC_DIR/App.tsx" ]; then
        echo "   ✅ App.tsx exists"
    else
        echo "   ❌ App.tsx NOT found!"
    fi
fi
echo ""

# Step 3: Clean build directory
echo "📋 Step 3: Cleaning build directory..."
cd apps/admin
rm -rf dist
rm -f vite.config.js
echo "   ✅ Build directory cleaned"
echo ""

# Step 4: Build shared package
echo "📋 Step 4: Building shared package..."
cd "$PROJECT_DIR"
if [ ! -d "packages/shared/dist" ]; then
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
else
    echo "   ℹ️  Shared package already built"
fi
echo ""

# Step 5: Build admin panel
echo "📋 Step 5: Building admin panel..."
cd apps/admin
if pnpm build; then
    echo "   ✅ Admin panel built successfully"
else
    echo "   ❌ Admin panel build failed"
    exit 1
fi
echo ""

# Step 6: Copy files
echo "📋 Step 6: Copying admin panel files..."
if [ -d "dist" ]; then
    ADMIN_DIR="/var/www/admin.acoustic.uz"
    
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

# Step 7: Reload Nginx
echo "📋 Step 7: Reloading Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 8: Verify
echo "📋 Step 8: Verifying admin panel..."
sleep 3

ADMIN_ROOT=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_ROOT" = "200" ]; then
    echo "   ✅ Admin panel root accessible (HTTP $ADMIN_ROOT)"
else
    echo "   ⚠️  Admin panel root not accessible (HTTP $ADMIN_ROOT)"
fi

ADMIN_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/login 2>/dev/null || echo "000")
if [ "$ADMIN_LOGIN" = "200" ]; then
    echo "   ✅ Admin panel login accessible (HTTP $ADMIN_LOGIN)"
else
    echo "   ⚠️  Admin panel login not accessible (HTTP $ADMIN_LOGIN)"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Admin panel URLs:"
echo "  - Root: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"

