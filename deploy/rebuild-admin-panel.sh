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
NGINX_ROOT="/var/www/acoustic.uz/apps/admin/dist"

# Check if we're in the right directory
if [ ! -f "$ADMIN_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: Admin directory not found at $ADMIN_DIR${NC}"
    exit 1
fi

# 1. Build admin panel
echo ""
echo -e "${BLUE}1️⃣ Building admin panel...${NC}"
cd "$ADMIN_DIR"

# Set environment variable for API URL
export VITE_API_URL="https://a.acoustic.uz/api"

# Build
pnpm build

if [ ! -d "$ADMIN_DIR/dist" ]; then
    echo -e "${RED}❌ Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

# 2. Copy dist to Nginx root
echo ""
echo -e "${BLUE}2️⃣ Copying dist to Nginx root...${NC}"
sudo rm -rf "$NGINX_ROOT"
sudo mkdir -p "$(dirname "$NGINX_ROOT")"
sudo cp -r "$ADMIN_DIR/dist" "$NGINX_ROOT"

# 3. Fix permissions
echo ""
echo -e "${BLUE}3️⃣ Fixing permissions...${NC}"
sudo chown -R www-data:www-data "$NGINX_ROOT"
sudo chmod -R 755 "$NGINX_ROOT"

echo -e "${GREEN}✅ Permissions fixed${NC}"

# 4. Reload Nginx
echo ""
echo -e "${BLUE}4️⃣ Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx reload failed${NC}"
    exit 1
fi

# 5. Test admin panel
echo ""
echo -e "${BLUE}5️⃣ Testing admin panel...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin panel is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Admin panel returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}✅ Rebuild Complete!                 ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${GREEN}📋 Next steps:${NC}"
echo "   1. Visit: https://admin.acoustic.uz"
echo "   2. Check browser console for errors"
echo "   3. If issues persist, check Nginx logs:"
echo "      sudo tail -50 /var/log/nginx/admin.acoustic.uz.error.log"

