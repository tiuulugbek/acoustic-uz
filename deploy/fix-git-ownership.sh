#!/bin/bash

# Fix Git Ownership Issues Script
# Bu script git ownership muammosini hal qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Git Ownership Issues${NC}"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"

# Step 1: Fix git safe.directory
echo -e "${BLUE}1️⃣ Configuring git safe.directory...${NC}"
sudo -u acoustic git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
echo -e "${GREEN}✅ Git safe.directory configured${NC}"

# Step 2: Fix repository ownership
echo ""
echo -e "${BLUE}2️⃣ Fixing repository ownership...${NC}"
chown -R acoustic:acoustic "$APP_DIR/.git" 2>/dev/null || true
echo -e "${GREEN}✅ Repository ownership fixed${NC}"

# Step 3: Test git pull
echo ""
echo -e "${BLUE}3️⃣ Testing git pull...${NC}"
cd "$APP_DIR"
if sudo -u acoustic git pull origin main --dry-run > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git pull test successful${NC}"
else
    echo -e "${YELLOW}⚠️  Git pull test failed, but continuing...${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Git ownership issues fixed!${NC}"
echo ""
echo "📋 You can now run:"
echo "   sudo bash deploy/rebuild-frontend-acoustic.sh"
echo ""

