#!/bin/bash

# Fix Permissions and Clone Repository
# Bu script directory permissions'ni to'g'rilaydi va repository'ni clone qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Permissions and Cloning Repository${NC}"
echo "============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"

# Step 1: Create /var/www if doesn't exist
echo -e "${BLUE}1️⃣ Creating /var/www directory...${NC}"
mkdir -p /var/www
chown root:root /var/www
chmod 755 /var/www
echo -e "${GREEN}✅ Directory created${NC}"

# Step 2: Remove existing directory if exists
echo ""
echo -e "${BLUE}2️⃣ Cleaning up existing directory...${NC}"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  Existing directory found, removing...${NC}"
    rm -rf "$APP_DIR"
fi
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Step 3: Clone repository as root first
echo ""
echo -e "${BLUE}3️⃣ Cloning repository...${NC}"
cd /var/www
git clone https://github.com/tiuulugbek/acoustic-uz.git acoustic.uz
echo -e "${GREEN}✅ Repository cloned${NC}"

# Step 4: Fix ownership
echo ""
echo -e "${BLUE}4️⃣ Fixing ownership...${NC}"
chown -R acoustic:acoustic "$APP_DIR"
echo -e "${GREEN}✅ Ownership fixed${NC}"

# Step 5: Verify clone
echo ""
echo -e "${BLUE}5️⃣ Verifying clone...${NC}"
cd "$APP_DIR"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Repository clone failed or incomplete${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Repository verified${NC}"

echo ""
echo "============================================="
echo -e "${GREEN}✅ Repository cloned successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "cd $APP_DIR"
echo "sudo bash deploy/quick-setup-new-server.sh"
echo ""

