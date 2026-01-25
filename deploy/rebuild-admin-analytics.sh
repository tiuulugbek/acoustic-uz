#!/bin/bash

# Admin Panel Rebuild Script for Analytics Update
# Bu script admin panelni rebuild qiladi va versiyani yangilaydi

set -e

echo "🔨 Admin Panel Rebuild (Analytics Update)"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project directory
if [ ! -f "apps/admin/package.json" ]; then
    echo -e "${RED}❌ Error: apps/admin/package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

ADMIN_DIR="apps/admin"
BUILD_DIR="$ADMIN_DIR/dist"

echo "1️⃣ Cleaning old build..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}✅ Old build directory removed${NC}"
else
    echo -e "${YELLOW}⚠️  Build directory not found (will be created)${NC}"
fi

echo ""
echo "2️⃣ Installing dependencies..."
cd "$ADMIN_DIR"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "3️⃣ Building admin panel..."
# Get current git hash and timestamp for version
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date +"%Y%m%d%H%M%S")
echo "Git hash: $GIT_HASH"
echo "Build time: $BUILD_TIME"

# Build with production API URL
VITE_API_URL="https://a.acoustic.uz/api" pnpm build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed: dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

echo ""
echo "4️⃣ Checking build output..."
if [ -f "dist/index.html" ]; then
    # Check if version is injected
    if grep -q "__APP_VERSION__" dist/index.html; then
        VERSION=$(grep -oP '__APP_VERSION__=\K[^;]*' dist/index.html | tr -d "'" || echo "unknown")
        echo -e "${GREEN}✅ Version found in build: $VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Version not found in build HTML${NC}"
    fi
    
    # Check if version.json exists
    if [ -f "dist/version.json" ]; then
        VERSION_JSON=$(cat dist/version.json)
        echo -e "${GREEN}✅ version.json found:${NC}"
        echo "$VERSION_JSON"
    else
        echo -e "${YELLOW}⚠️  version.json not found${NC}"
    fi
else
    echo -e "${RED}❌ Build output not found${NC}"
    exit 1
fi

echo ""
echo "5️⃣ Copying build to nginx directory..."
NGINX_DIR="/var/www/admin.acoustic.uz"
if [ -d "$NGINX_DIR" ]; then
    # Backup old build
    if [ -d "$NGINX_DIR/dist" ]; then
        BACKUP_DIR="$NGINX_DIR/dist.backup.$(date +%Y%m%d%H%M%S)"
        mv "$NGINX_DIR/dist" "$BACKUP_DIR"
        echo -e "${GREEN}✅ Old build backed up to: $BACKUP_DIR${NC}"
    fi
    
    # Copy new build
    cp -r dist "$NGINX_DIR/"
    echo -e "${GREEN}✅ Build copied to $NGINX_DIR${NC}"
    
    # Set permissions
    chown -R www-data:www-data "$NGINX_DIR/dist"
    chmod -R 755 "$NGINX_DIR/dist"
    echo -e "${GREEN}✅ Permissions set${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx directory not found: $NGINX_DIR${NC}"
    echo -e "${YELLOW}⚠️  Please copy dist directory manually to nginx directory${NC}"
fi

echo ""
echo "6️⃣ Reloading nginx..."
if command -v nginx &> /dev/null; then
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx not found. Please reload manually: sudo systemctl reload nginx${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Admin panel rebuild complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Visit admin panel: https://admin.acoustic.uz"
echo "3. Check version in footer (should show new version)"
echo "4. Check browser console for version logs"
echo ""
echo "To verify version:"
echo "  - Open browser console (F12)"
echo "  - Type: window.__APP_VERSION__"
echo "  - Should show: v1.0.0.[timestamp].[git-hash]"
echo ""

