#!/bin/bash
# Rebuild Admin Panel Script
# Admin panel static fayllar sifatida Nginx orqali serve qilinadi, PM2'da emas

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Rebuilding Admin Panel              ${NC}"
echo -e "${BLUE}=======================================${NC}"

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="$PROJECT_DIR/apps/admin"
NGINX_ROOT="/var/www/admin.acoustic.uz/build"

# Check if we're in the right directory
if [ ! -f "$ADMIN_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: Admin directory not found at $ADMIN_DIR${NC}"
    exit 1
fi

# 1. Build admin panel
echo ""
echo -e "${BLUE}1️⃣ Building admin panel...${NC}"
cd "$ADMIN_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Current directory: $(pwd)${NC}"
    exit 1
fi

echo -e "${BLUE}   Current directory: $(pwd)${NC}"

# Set environment variables
export VITE_API_URL="https://a.acoustic.uz/api"
export VITE_FRONTEND_URL="https://acoustic.uz"

# Remove old dist if exists (bu yangi hash olish uchun zarur)
echo -e "${YELLOW}   Removing old dist directory...${NC}"
rm -rf dist

# Build
echo -e "${BLUE}   Running pnpm exec vite build...${NC}"
pnpm exec vite build

# Check if build succeeded
BUILD_DIR="$(pwd)/dist"
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Error: Build failed - dist directory not found${NC}"
    echo -e "${YELLOW}   Expected: $BUILD_DIR${NC}"
    echo -e "${YELLOW}   Current directory: $(pwd)${NC}"
    exit 1
fi

# Check if HTML editor code exists in build
if grep -q "HTML kod yozish" "$BUILD_DIR/assets"/*.js 2>/dev/null; then
    echo -e "${GREEN}✅ HTML editor code found in build${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: HTML editor code not found in build${NC}"
fi

# Get new JS file name
NEW_JS=$(grep -o 'assets/index-[^"]*\.js' "$BUILD_DIR/index.html" | head -1)
echo -e "${BLUE}   New JavaScript file: $NEW_JS${NC}"

echo -e "${GREEN}✅ Build completed - dist directory created at $BUILD_DIR${NC}"

# 2. Copy dist to Nginx root
echo ""
echo -e "${BLUE}2️⃣ Copying dist to Nginx root...${NC}"

# Remove old Nginx root completely
echo -e "${BLUE}   Removing old Nginx root: $NGINX_ROOT${NC}"
sudo rm -rf "$NGINX_ROOT"/*

# Create directory if doesn't exist
sudo mkdir -p "$NGINX_ROOT"

# Copy dist to Nginx root
echo -e "${BLUE}   Copying from $BUILD_DIR to $NGINX_ROOT...${NC}"
sudo cp -r "$BUILD_DIR"/* "$NGINX_ROOT/"

# Verify copy succeeded
if [ ! -f "$NGINX_ROOT/index.html" ]; then
    echo -e "${RED}❌ Error: Copy failed - index.html not found at $NGINX_ROOT${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Copy completed${NC}"

# 3. Fix permissions
echo ""
echo -e "${BLUE}3️⃣ Fixing permissions...${NC}"
sudo chown -R www-data:www-data "$NGINX_ROOT"
sudo chmod -R 755 "$NGINX_ROOT"

echo -e "${GREEN}✅ Permissions fixed${NC}"

# 4. Clear Nginx cache
echo ""
echo -e "${BLUE}4️⃣ Clearing Nginx cache...${NC}"
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true
echo -e "${GREEN}✅ Nginx cache cleared${NC}"

# 5. Reload Nginx
echo ""
echo -e "${BLUE}5️⃣ Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx reload failed${NC}"
    exit 1
fi

# 6. Test admin panel
echo ""
echo -e "${BLUE}6️⃣ Testing admin panel...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin panel is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Admin panel returned HTTP $HTTP_CODE${NC}"
fi

# 7. Show version info
echo ""
echo -e "${BLUE}7️⃣ Version information:${NC}"
if [ -f "$NGINX_ROOT/version.json" ]; then
    cat "$NGINX_ROOT/version.json"
else
    echo -e "${YELLOW}⚠️  version.json not found${NC}"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}✅ Rebuild Complete!                 ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${GREEN}📋 Next steps:${NC}"
echo "   1. Visit: https://admin.acoustic.uz"
echo "   2. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   3. Check browser console for errors"
echo "   4. If issues persist, check Nginx logs:"
echo "      sudo tail -50 /var/log/nginx/error.log"
