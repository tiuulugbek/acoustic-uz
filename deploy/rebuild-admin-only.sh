#!/bin/bash
# Rebuild admin panel only

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo -e "${BLUE}🔧 Rebuilding admin panel...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Pull latest code
echo -e "${BLUE}📥 Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing...${NC}"

# 2. Install dependencies
echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"
pnpm install --frozen-lockfile || pnpm install

# 3. Build shared package
echo -e "${BLUE}🏗️  Step 3: Building shared package...${NC}"
pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared build failed${NC}"
    exit 1
}

# 4. Clean admin build directories
echo -e "${BLUE}🧹 Step 4: Cleaning admin build directories...${NC}"
rm -rf apps/admin/dist
rm -rf apps/admin/.vite
rm -rf apps/admin/node_modules/.vite

# 5. Build admin with proper environment
echo -e "${BLUE}🏗️  Step 5: Building admin panel...${NC}"
cd apps/admin

export VITE_API_URL=${VITE_API_URL:-https://a.acoustic.uz/api}
export NODE_ENV=production

echo "  Environment:"
echo "    VITE_API_URL=$VITE_API_URL"
echo "    NODE_ENV=$NODE_ENV"

pnpm build || {
    echo -e "${RED}❌ Admin build failed${NC}"
    exit 1
}

cd "$PROJECT_DIR"

# 6. Verify admin build
echo -e "${BLUE}📋 Step 6: Verifying admin build...${NC}"
if [ -d "apps/admin/dist" ]; then
    ADMIN_FILES=$(find apps/admin/dist -type f | wc -l)
    ADMIN_SIZE=$(du -sh apps/admin/dist | awk '{print $1}')
    echo -e "${GREEN}  ✅ Admin build exists: $ADMIN_FILES files, $ADMIN_SIZE${NC}"
    
    if [ -f "apps/admin/dist/index.html" ]; then
        echo -e "${GREEN}  ✅ index.html exists${NC}"
    else
        echo -e "${RED}  ❌ index.html NOT found!${NC}"
        exit 1
    fi
    
    # Show version file if it exists
    if [ -f "apps/admin/dist/version.json" ]; then
        echo -e "${GREEN}  ✅ version.json exists${NC}"
        echo "  Version info:"
        cat apps/admin/dist/version.json | sed 's/^/    /'
    fi
else
    echo -e "${RED}  ❌ Admin build directory NOT found!${NC}"
    exit 1
fi

# 7. Copy admin build to Nginx root
echo -e "${BLUE}📋 Step 7: Copying admin build to Nginx root...${NC}"
mkdir -p "$ADMIN_DIR"
rm -rf "$ADMIN_DIR"/*
cp -r apps/admin/dist/* "$ADMIN_DIR/"
chown -R www-data:www-data "$ADMIN_DIR"
chmod -R 755 "$ADMIN_DIR"

echo -e "${GREEN}  ✅ Admin build copied to $ADMIN_DIR${NC}"

# 8. Verify copied files
echo -e "${BLUE}📋 Step 8: Verifying copied files...${NC}"
if [ -f "$ADMIN_DIR/index.html" ]; then
    echo -e "${GREEN}  ✅ index.html copied successfully${NC}"
    ls -lh "$ADMIN_DIR/index.html" | awk '{print "    Size: " $5}'
else
    echo -e "${RED}  ❌ index.html NOT found in $ADMIN_DIR!${NC}"
    exit 1
fi

# 9. Reload Nginx
echo -e "${BLUE}🔄 Step 9: Reloading Nginx...${NC}"
nginx -t && systemctl reload nginx || {
    echo -e "${RED}  ❌ Nginx reload failed!${NC}"
    exit 1
}

echo -e "${GREEN}  ✅ Nginx reloaded${NC}"

# 10. Test admin panel
echo -e "${BLUE}📋 Step 10: Testing admin panel...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Admin panel accessible (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${YELLOW}  ⚠️  Admin panel redirecting (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}  ❌ Admin panel returned HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}  💡 Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log${NC}"
fi

echo ""
echo -e "${GREEN}✅ Admin panel rebuild complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  Admin build: apps/admin/dist"
echo "  Nginx root: $ADMIN_DIR"
echo "  URL: https://admin.acoustic.uz"
echo ""
echo -e "${YELLOW}💡 If admin panel still shows old version:${NC}"
echo "  1. Hard refresh browser (Ctrl+Shift+R)"
echo "  2. Check Nginx cache headers"
echo "  3. Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log"

