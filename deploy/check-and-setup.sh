#!/bin/bash

# Check and Setup Script
# Bu script repository'ni yangilaydi va setup qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking repository...${NC}"
echo ""

APP_DIR="/var/www/acoustic.uz"
CURRENT_DIR=$(pwd)

# Check if we're in the right directory
if [ "$CURRENT_DIR" != "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  Not in application directory${NC}"
    echo "Current: $CURRENT_DIR"
    echo "Expected: $APP_DIR"
    
    if [ -d "$APP_DIR" ]; then
        echo -e "${BLUE}📁 Switching to application directory...${NC}"
        cd "$APP_DIR"
    else
        echo -e "${BLUE}📥 Cloning repository...${NC}"
        mkdir -p /var/www
        sudo -u acoustic git clone https://github.com/tiuulugbek/acoustic-uz.git "$APP_DIR"
        cd "$APP_DIR"
    fi
fi

# Pull latest changes
echo ""
echo -e "${BLUE}📥 Pulling latest changes from GitHub...${NC}"
sudo -u acoustic git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, but continuing...${NC}"
}

# Check if script exists
if [ ! -f "deploy/quick-setup-new-server.sh" ]; then
    echo -e "${RED}❌ Script not found after git pull${NC}"
    echo "Please check:"
    echo "  1. Repository is cloned correctly"
    echo "  2. You have internet connection"
    echo "  3. GitHub repository is accessible"
    exit 1
fi

echo -e "${GREEN}✅ Repository updated${NC}"
echo ""
echo -e "${BLUE}🚀 Starting quick setup...${NC}"
echo ""

# Run the quick setup script
bash deploy/quick-setup-new-server.sh

