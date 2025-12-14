#!/bin/bash
# Script to fix media uploads directory permissions and verify files

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Fixing Media Uploads Directory      ${NC}"
echo -e "${BLUE}=======================================${NC}"

UPLOADS_DIR="/var/www/acoustic.uz/apps/backend/uploads"
PROJECT_DIR="/var/www/acoustic.uz"

# 1. Check if uploads directory exists
echo ""
echo -e "${BLUE}1️⃣ Checking uploads directory...${NC}"
if [ ! -d "$UPLOADS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Uploads directory does not exist, creating...${NC}"
    sudo mkdir -p "$UPLOADS_DIR"
    echo -e "${GREEN}✅ Uploads directory created${NC}"
else
    echo -e "${GREEN}✅ Uploads directory exists: $UPLOADS_DIR${NC}"
fi

# 2. Check file count
FILE_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
echo "   Files count: $FILE_COUNT"

# 3. Fix permissions
echo ""
echo -e "${BLUE}2️⃣ Fixing permissions...${NC}"
# Set ownership to acoustic:acoustic (or www-data:www-data)
if id "acoustic" &>/dev/null; then
    sudo chown -R acoustic:acoustic "$UPLOADS_DIR"
    echo -e "${GREEN}✅ Ownership set to acoustic:acoustic${NC}"
else
    sudo chown -R www-data:www-data "$UPLOADS_DIR" 2>/dev/null || sudo chown -R nginx:nginx "$UPLOADS_DIR" 2>/dev/null || true
    echo -e "${GREEN}✅ Ownership set to www-data:www-data${NC}"
fi

# Set permissions: directories 755, files 644
sudo find "$UPLOADS_DIR" -type d -exec chmod 755 {} \;
sudo find "$UPLOADS_DIR" -type f -exec chmod 644 {} \;
echo -e "${GREEN}✅ Permissions set (755 for dirs, 644 for files)${NC}"

# 4. Check specific file mentioned in error
echo ""
echo -e "${BLUE}3️⃣ Checking specific file...${NC}"
TEST_FILE="2025-12-14-1765701586530-blob-909s6v.webp"
if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    echo -e "${GREEN}✅ File exists: $TEST_FILE${NC}"
    ls -lh "$UPLOADS_DIR/$TEST_FILE"
else
    echo -e "${YELLOW}⚠️  File not found: $TEST_FILE${NC}"
    echo "   This might be normal if the file was uploaded recently or deleted."
fi

# 5. List recent files
echo ""
echo -e "${BLUE}4️⃣ Recent files in uploads directory:${NC}"
ls -lht "$UPLOADS_DIR" | head -10

# 6. Test Nginx access
echo ""
echo -e "${BLUE}5️⃣ Testing Nginx access...${NC}"
if [ -f "$UPLOADS_DIR/$TEST_FILE" ]; then
    echo "Testing URL: https://a.acoustic.uz/uploads/$TEST_FILE"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://a.acoustic.uz/uploads/$TEST_FILE" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ File is accessible via Nginx (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}❌ File is NOT accessible via Nginx (HTTP $HTTP_CODE)${NC}"
        echo "   Check Nginx error log: sudo tail -20 /var/log/nginx/a.acoustic.uz.error.log"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test - file not found${NC}"
fi

# 7. Verify Nginx config
echo ""
echo -e "${BLUE}6️⃣ Verifying Nginx config...${NC}"
if grep -q "location /uploads/" /etc/nginx/sites-available/a.acoustic.uz.conf; then
    echo -e "${GREEN}✅ Nginx config includes /uploads/ location${NC}"
    UPLOADS_ALIAS=$(grep -A 1 "location /uploads/" /etc/nginx/sites-available/a.acoustic.uz.conf | grep "alias" | awk '{print $2}' | tr -d ';')
    if [ -n "$UPLOADS_ALIAS" ]; then
        echo "   Alias: $UPLOADS_ALIAS"
        if [ "$UPLOADS_ALIAS" = "$UPLOADS_DIR/" ] || [ "$UPLOADS_ALIAS" = "$UPLOADS_DIR" ]; then
            echo -e "${GREEN}✅ Nginx alias matches uploads directory${NC}"
        else
            echo -e "${YELLOW}⚠️  Nginx alias does not match uploads directory${NC}"
            echo "   Expected: $UPLOADS_DIR/"
            echo "   Found: $UPLOADS_ALIAS"
        fi
    fi
else
    echo -e "${RED}❌ Nginx config does NOT include /uploads/ location${NC}"
fi

# 8. Reload Nginx
echo ""
echo -e "${BLUE}7️⃣ Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}✅ Fix Complete!                      ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Try uploading a new image in admin panel"
echo "   2. Check browser console for errors"
echo "   3. Verify file exists: ls -lh $UPLOADS_DIR/"

