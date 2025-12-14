#!/bin/bash
# Fix admin panel 500 error

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Fixing Admin Panel 500 Error        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="$PROJECT_DIR/apps/admin"
NGINX_ROOT="/var/www/acoustic.uz/apps/admin/dist"

# 1. Check nginx config
echo -e "${BLUE}1️⃣ Checking nginx configuration...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/admin.acoustic.uz"
if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${GREEN}✅ Nginx config found${NC}"
    ROOT_DIR=$(grep -E "^\s*root\s+" "$NGINX_CONFIG" | head -1 | awk '{print $2}' | tr -d ';' || echo "")
    echo "   Root directory: $ROOT_DIR"
else
    echo -e "${RED}❌ Nginx config not found${NC}"
    exit 1
fi

# 2. Check if dist directory exists
echo ""
echo -e "${BLUE}2️⃣ Checking dist directory...${NC}"
if [ -d "$NGINX_ROOT" ]; then
    echo -e "${GREEN}✅ Dist directory exists: $NGINX_ROOT${NC}"
    FILE_COUNT=$(find "$NGINX_ROOT" -type f | wc -l)
    echo "   Files count: $FILE_COUNT"
    
    if [ -f "$NGINX_ROOT/index.html" ]; then
        echo -e "${GREEN}✅ index.html found${NC}"
    else
        echo -e "${RED}❌ index.html NOT found${NC}"
        echo -e "${YELLOW}   Rebuilding admin panel...${NC}"
        cd "$ADMIN_DIR"
        VITE_API_URL="https://a.acoustic.uz/api" pnpm build
        if [ ! -d "dist" ]; then
            echo -e "${RED}❌ Build failed${NC}"
            exit 1
        fi
        # Remove old dist and copy new one
        if [ -d "$NGINX_ROOT" ]; then
            echo "Removing old dist directory..."
            sudo rm -rf "$NGINX_ROOT"
        fi
        echo "Copying dist to nginx root..."
        sudo cp -r "$ADMIN_DIR/dist" "$(dirname "$NGINX_ROOT")/"
        echo -e "${GREEN}✅ Build copied to $NGINX_ROOT${NC}"
    fi
else
    echo -e "${RED}❌ Dist directory does NOT exist: $NGINX_ROOT${NC}"
    echo -e "${YELLOW}   Rebuilding admin panel...${NC}"
    cd "$ADMIN_DIR"
    VITE_API_URL="https://a.acoustic.uz/api" pnpm build
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ Build failed - dist directory not created${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Build completed - dist directory is at: $ADMIN_DIR/dist${NC}"
    echo -e "${BLUE}   Note: dist directory is already in the correct location for nginx${NC}"
fi

# 3. Fix permissions
echo ""
echo -e "${BLUE}3️⃣ Fixing permissions...${NC}"
sudo chown -R www-data:www-data "$NGINX_ROOT" 2>/dev/null || sudo chown -R nginx:nginx "$NGINX_ROOT" 2>/dev/null || true
sudo chmod -R 755 "$NGINX_ROOT"
echo -e "${GREEN}✅ Permissions fixed${NC}"

# 4. Check nginx error log
echo ""
echo -e "${BLUE}4️⃣ Checking nginx error log...${NC}"
ERROR_LOG="/var/log/nginx/admin.acoustic.uz.error.log"
if [ -f "$ERROR_LOG" ]; then
    echo "Last 10 lines of error log:"
    tail -10 "$ERROR_LOG"
else
    echo -e "${YELLOW}⚠️  Error log not found${NC}"
fi

# 5. Test nginx config
echo ""
echo -e "${BLUE}5️⃣ Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
else
    echo -e "${RED}❌ Nginx config has errors${NC}"
    exit 1
fi

# 6. Reload nginx
echo ""
echo -e "${BLUE}6️⃣ Reloading nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# 7. Test admin panel
echo ""
echo -e "${BLUE}7️⃣ Testing admin panel...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin panel is accessible (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${YELLOW}⚠️  Could not test admin panel (connection failed)${NC}"
else
    echo -e "${RED}❌ Admin panel returned HTTP $HTTP_CODE${NC}"
    echo "   Check nginx error log: tail -20 $ERROR_LOG"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}✅ Fix complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Visit: https://admin.acoustic.uz"
echo "  2. Check browser console for errors"
echo "  3. If still 500, check: tail -20 $ERROR_LOG"
echo ""

