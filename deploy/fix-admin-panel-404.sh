#!/bin/bash
# Fix admin panel 404 errors

set -e

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo "🔧 Fixing admin panel 404 errors..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Check admin panel files
echo "📋 Step 1: Checking admin panel files..."
if [ -d "$ADMIN_DIR" ]; then
    echo "   ✅ Admin directory exists: $ADMIN_DIR"
    if [ -f "$ADMIN_DIR/index.html" ]; then
        echo "   ✅ index.html exists"
        ls -lh "$ADMIN_DIR/index.html" | awk '{print "    Size: " $5}'
    else
        echo "   ❌ index.html NOT found!"
    fi
    
    echo "   Files in admin directory:"
    ls -la "$ADMIN_DIR" | head -10 | sed 's/^/      /'
else
    echo "   ❌ Admin directory NOT found: $ADMIN_DIR"
fi
echo ""

# Step 2: Rebuild admin panel
echo "📋 Step 2: Rebuilding admin panel..."
cd "$PROJECT_DIR"

# Build shared package
if [ ! -d "packages/shared/dist" ]; then
    echo "   Building shared package..."
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package built"
fi

# Clean admin build
cd apps/admin
rm -rf dist
# Remove old vite.config.js if it exists (should use vite.config.ts)
rm -f vite.config.js
echo "   ✅ Admin build cleaned"
echo ""

# Build admin
echo "   Building admin panel..."
if pnpm build; then
    echo "   ✅ Admin panel built"
else
    echo "   ❌ Admin panel build failed"
    exit 1
fi
echo ""

# Step 3: Copy files
echo "📋 Step 3: Copying admin panel files..."
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
        ls -lh "$ADMIN_DIR/index.html" | awk '{print "    Size: " $5}'
    else
        echo "   ❌ index.html NOT found after copy!"
        exit 1
    fi
else
    echo "   ❌ dist directory not found!"
    exit 1
fi
echo ""

# Step 4: Clear Nginx cache
echo "📋 Step 4: Clearing Nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    echo "   ✅ Nginx cache cleared"
else
    echo "   ℹ️  Nginx cache directory not found"
fi
echo ""

# Step 5: Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 6: Verify
echo "📋 Step 6: Verifying admin panel..."
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
    echo "   Check Nginx logs: tail -20 /var/log/nginx/admin.acoustic.uz.error.log"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Admin panel URLs:"
echo "  - Root: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"
echo ""
echo "💡 If still not working:"
echo "  1. Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log"
echo "  2. Verify files: ls -la /var/www/admin.acoustic.uz/"
echo "  3. Test locally: curl -I https://admin.acoustic.uz/login"

