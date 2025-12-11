#!/bin/bash
# Rebuild admin panel with fixed API URL (api.acoustic.uz -> a.acoustic.uz)

set -e

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo "🔧 Rebuilding admin panel with fixed API URL..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Pull latest code
echo "📋 Step 1: Pulling latest code..."
git pull origin main
echo "   ✅ Code updated"
echo ""

# Step 2: Remove old .js files and build artifacts
echo "📋 Step 2: Cleaning old files..."
find apps/admin/src -name "*.js" -type f -delete 2>/dev/null || true
rm -f apps/admin/vite.config.js
rm -rf apps/admin/dist
rm -rf apps/admin/node_modules/.vite
echo "   ✅ Old files removed"
echo ""

# Step 3: Verify API URL changes
echo "📋 Step 3: Verifying API URL changes..."
if grep -q "api.acoustic.uz" apps/admin/src/lib/api.ts apps/admin/vite.config.ts apps/admin/src/utils/image.ts 2>/dev/null; then
    echo "   ⚠️  WARNING: Still found api.acoustic.uz references!"
    grep -n "api.acoustic.uz" apps/admin/src/lib/api.ts apps/admin/vite.config.ts apps/admin/src/utils/image.ts 2>/dev/null | sed 's/^/      /'
else
    echo "   ✅ No api.acoustic.uz references found (all changed to a.acoustic.uz)"
fi
echo ""

# Step 4: Build shared package
echo "📋 Step 4: Building shared package..."
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

# Set environment variables
export NODE_ENV=production
export VITE_API_URL="https://a.acoustic.uz/api"

echo "   Building with VITE_API_URL=$VITE_API_URL"
if pnpm build; then
    echo "   ✅ Admin panel built"
else
    echo "   ❌ Admin panel build failed"
    exit 1
fi
echo ""

# Step 6: Verify build output
echo "📋 Step 6: Verifying build output..."
if [ -d "dist" ]; then
    echo "   ✅ dist directory exists"
    
    # Check if index.html exists
    if [ -f "dist/index.html" ]; then
        echo "   ✅ index.html exists"
        
        # Check if API URL is correct in built files
        if grep -q "api.acoustic.uz" dist/index.html dist/assets/*.js 2>/dev/null; then
            echo "   ⚠️  WARNING: Found api.acoustic.uz in build output!"
            echo "   This might be from cached build or environment variable"
        else
            echo "   ✅ No api.acoustic.uz found in build output"
        fi
        
        # Check for a.acoustic.uz
        if grep -q "a.acoustic.uz" dist/index.html dist/assets/*.js 2>/dev/null | head -1; then
            echo "   ✅ Found a.acoustic.uz in build output (correct)"
        fi
    else
        echo "   ❌ index.html NOT found!"
        exit 1
    fi
else
    echo "   ❌ dist directory NOT found!"
    exit 1
fi
echo ""

# Step 7: Copy files
echo "📋 Step 7: Copying admin panel files..."
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
        
        # Check API URL in deployed index.html
        if grep -q "__VITE_API_URL__" "$ADMIN_DIR/index.html"; then
            API_URL_IN_HTML=$(grep "__VITE_API_URL__" "$ADMIN_DIR/index.html" | sed "s/.*__VITE_API_URL__='\([^']*\)'.*/\1/" | head -1)
            echo "   API URL in index.html: $API_URL_IN_HTML"
            if [[ "$API_URL_IN_HTML" == *"api.acoustic.uz"* ]]; then
                echo "   ⚠️  WARNING: index.html still contains api.acoustic.uz!"
            elif [[ "$API_URL_IN_HTML" == *"a.acoustic.uz"* ]]; then
                echo "   ✅ index.html contains correct API URL (a.acoustic.uz)"
            fi
        fi
    else
        echo "   ❌ index.html NOT found after copy!"
        exit 1
    fi
else
    echo "   ❌ dist directory not found!"
    exit 1
fi
echo ""

# Step 8: Clear browser cache hint
echo "📋 Step 8: Clearing Nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    echo "   ✅ Nginx cache cleared"
fi
echo ""

# Step 9: Reload Nginx
echo "📋 Step 9: Reloading Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 10: Verify
echo "📋 Step 10: Verifying admin panel..."
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
echo "✅ Rebuild complete!"
echo ""
echo "📋 Admin panel URLs:"
echo "  - HTTPS: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"
echo ""
echo "💡 Important:"
echo "   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Check browser console for API calls - should be to a.acoustic.uz"
echo "   3. If still seeing api.acoustic.uz, hard refresh the page"

