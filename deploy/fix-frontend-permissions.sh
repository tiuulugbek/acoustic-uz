#!/bin/bash

# Fix Frontend Permissions Script
# Bu script frontend papkasidagi permissions muammosini hal qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Frontend Permissions${NC}"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$APP_DIR/apps/frontend"

# Step 1: Fix ownership
echo -e "${BLUE}1️⃣ Fixing ownership...${NC}"
chown -R acoustic:acoustic "$FRONTEND_DIR"
echo -e "${GREEN}✅ Ownership fixed${NC}"

# Step 2: Fix .next directory permissions
echo ""
echo -e "${BLUE}2️⃣ Fixing .next directory permissions...${NC}"
if [ -d "$FRONTEND_DIR/.next" ]; then
    chown -R acoustic:acoustic "$FRONTEND_DIR/.next"
    chmod -R 755 "$FRONTEND_DIR/.next"
    echo -e "${GREEN}✅ .next directory permissions fixed${NC}"
else
    echo -e "${YELLOW}⚠️  .next directory not found${NC}"
fi

# Step 3: Fix cache directory permissions
echo ""
echo -e "${BLUE}3️⃣ Fixing cache directory permissions...${NC}"
if [ -d "$FRONTEND_DIR/.next/cache" ]; then
    chown -R acoustic:acoustic "$FRONTEND_DIR/.next/cache"
    chmod -R 755 "$FRONTEND_DIR/.next/cache"
    echo -e "${GREEN}✅ Cache directory permissions fixed${NC}"
else
    echo -e "${YELLOW}⚠️  Cache directory not found${NC}"
fi

# Step 4: Clean cache if needed
echo ""
read -p "Do you want to clean the cache? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}4️⃣ Cleaning cache...${NC}"
    cd "$FRONTEND_DIR"
    sudo -u acoustic rm -rf .next/cache 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some cache files couldn't be removed, trying with sudo...${NC}"
        rm -rf .next/cache 2>/dev/null || true
    }
    echo -e "${GREEN}✅ Cache cleaned${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Permissions fixed!${NC}"
echo ""
echo "📋 Next steps:"
echo "   sudo bash deploy/rebuild-frontend-acoustic.sh"
echo ""

