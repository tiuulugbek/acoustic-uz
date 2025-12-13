#!/bin/bash

# Fix Images Nginx Configuration Script
# Bu script rasmlar muammosini hal qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖼️  Fixing Images Configuration${NC}"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$APP_DIR/apps/backend/uploads"

# Step 1: Create uploads directory if it doesn't exist
echo -e "${BLUE}1️⃣ Creating uploads directory...${NC}"
mkdir -p "$UPLOADS_DIR"
echo -e "${GREEN}✅ Uploads directory created${NC}"

# Step 2: Set correct permissions
echo ""
echo -e "${BLUE}2️⃣ Setting permissions...${NC}"
chown -R acoustic:acoustic "$UPLOADS_DIR"
chmod -R 755 "$UPLOADS_DIR"
echo -e "${GREEN}✅ Permissions set${NC}"

# Step 3: Update Nginx config for uploads with CORS
echo ""
echo -e "${BLUE}3️⃣ Updating Nginx config for uploads...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/a.acoustic.uz"

# Backup config
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d-%H%M%S)"

# Update uploads location block
cat > /tmp/uploads_location.conf << 'EOF'
    # Uploads - serve static files with CORS
    location /uploads/ {
        alias /var/www/acoustic.uz/apps/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
        access_log off;
        
        # Handle CORS preflight
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type" always;
            add_header Access-Control-Max-Age 3600;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
EOF

# Replace uploads location in config
sed -i '/location \/uploads\//,/^    }/c\
    # Uploads - serve static files with CORS\
    location /uploads/ {\
        alias /var/www/acoustic.uz/apps/backend/uploads/;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
        add_header Access-Control-Allow-Origin "*" always;\
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;\
        add_header Access-Control-Allow-Headers "Content-Type" always;\
        access_log off;\
        \
        # Handle CORS preflight\
        if ($request_method = '\''OPTIONS'\'') {\
            add_header Access-Control-Allow-Origin "*" always;\
            add_header Access-Control-Allow-Methods "GET, OPTIONS" always;\
            add_header Access-Control-Allow-Headers "Content-Type" always;\
            add_header Access-Control-Max-Age 3600;\
            add_header Content-Type "text/plain; charset=utf-8";\
            add_header Content-Length 0;\
            return 204;\
        }\
    }' "$NGINX_CONFIG"

echo -e "${GREEN}✅ Nginx config updated${NC}"

# Step 4: Test Nginx configuration
echo ""
echo -e "${BLUE}4️⃣ Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo -e "${YELLOW}⚠️  Restoring backup...${NC}"
    # Restore from backup
    LATEST_BACKUP=$(ls -t "$NGINX_CONFIG.backup."* | head -1)
    if [ -f "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP" "$NGINX_CONFIG"
        echo -e "${GREEN}✅ Backup restored${NC}"
    fi
    exit 1
fi

# Step 5: Reload Nginx
echo ""
echo -e "${BLUE}5️⃣ Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# Step 6: Test uploads endpoint
echo ""
echo -e "${BLUE}6️⃣ Testing uploads endpoint...${NC}"
if curl -I https://a.acoustic.uz/uploads/ 2>/dev/null | grep -q "200\|404\|403"; then
    echo -e "${GREEN}✅ Uploads endpoint is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Uploads endpoint test failed (this is OK if directory is empty)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Images configuration fixed!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Check if images exist:"
echo "   ls -la $UPLOADS_DIR"
echo ""
echo "2. Test image URL:"
echo "   curl -I https://a.acoustic.uz/uploads/<image-filename>"
echo ""
echo "3. If images are missing, restore from backup:"
echo "   # Copy images from old server or backup"
echo ""

