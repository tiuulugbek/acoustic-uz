#!/bin/bash

# First Time Setup Script for New Server
# Bu script birinchi marta repository'ni clone qiladi va setup qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 First Time Setup for New Server${NC}"
echo "===================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
CURRENT_DIR=$(pwd)

# Check if directory exists and has files
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠️  Directory $APP_DIR already exists and is not empty${NC}"
    read -p "Remove and re-clone? (y/n): " RECLONE
    if [ "$RECLONE" = "y" ]; then
        echo -e "${BLUE}🗑️  Removing existing directory...${NC}"
        rm -rf "$APP_DIR"
    else
        echo -e "${YELLOW}⚠️  Keeping existing directory. Please check if it's a git repository.${NC}"
        exit 1
    fi
fi

# Create directory if doesn't exist
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
fi

# Clone repository
echo ""
echo -e "${BLUE}📥 Cloning repository...${NC}"
sudo -u acoustic git clone https://github.com/tiuulugbek/acoustic-uz.git "$APP_DIR"
cd "$APP_DIR"

# Verify clone
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Repository clone failed or incomplete${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Repository cloned successfully${NC}"

# Now run the quick setup
echo ""
echo -e "${BLUE}🚀 Starting quick setup...${NC}"
echo ""

if [ -f "deploy/quick-setup-new-server.sh" ]; then
    bash deploy/quick-setup-new-server.sh
else
    echo -e "${RED}❌ Quick setup script not found${NC}"
    echo "Please run setup steps manually:"
    echo "  1. sudo bash deploy/setup-database.sh"
    echo "  2. sudo bash deploy/deploy-to-new-server.sh"
    exit 1
fi

