#!/bin/bash

# Apply Nginx Configurations Script
# Bu script barcha Nginx config'larini qo'llaydi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Applying Nginx Configurations${NC}"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
NGINX_DIR="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
CONFIG_DIR="$APP_DIR/deploy/nginx-configs"

# Check if config directory exists
if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "${RED}❌ Config directory not found: $CONFIG_DIR${NC}"
    exit 1
fi

# Backup existing configs
echo -e "${BLUE}1️⃣ Backing up existing configs...${NC}"
BACKUP_DIR="/tmp/nginx-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$NGINX_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✅ Backups saved to: $BACKUP_DIR${NC}"

# Copy configs
echo ""
echo -e "${BLUE}2️⃣ Copying configs...${NC}"
cp "$CONFIG_DIR/acoustic.uz.conf" "$NGINX_DIR/acoustic.uz"
cp "$CONFIG_DIR/a.acoustic.uz.conf" "$NGINX_DIR/a.acoustic.uz"
cp "$CONFIG_DIR/admin.acoustic.uz.conf" "$NGINX_DIR/admin.acoustic.uz"
echo -e "${GREEN}✅ Configs copied${NC}"

# Enable sites
echo ""
echo -e "${BLUE}3️⃣ Enabling sites...${NC}"
ln -sf "$NGINX_DIR/acoustic.uz" "$NGINX_ENABLED/acoustic.uz"
ln -sf "$NGINX_DIR/a.acoustic.uz" "$NGINX_ENABLED/a.acoustic.uz"
ln -sf "$NGINX_DIR/admin.acoustic.uz" "$NGINX_ENABLED/admin.acoustic.uz"

# Remove default config if exists
rm -f "$NGINX_ENABLED/default"
echo -e "${GREEN}✅ Sites enabled${NC}"

# Test Nginx configuration
echo ""
echo -e "${BLUE}4️⃣ Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo -e "${YELLOW}⚠️  Restoring backups...${NC}"
    cp -r "$BACKUP_DIR"/* "$NGINX_DIR/" 2>/dev/null || true
    exit 1
fi

# Reload Nginx
echo ""
echo -e "${BLUE}5️⃣ Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Nginx configurations applied successfully!${NC}"
echo ""
echo "📋 Test websites:"
echo "   curl -I https://acoustic.uz"
echo "   curl -I https://a.acoustic.uz/api/settings?lang=uz"
echo "   curl -I https://admin.acoustic.uz"
echo ""

