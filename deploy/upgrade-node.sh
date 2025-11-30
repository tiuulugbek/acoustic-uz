#!/bin/bash

# Node.js ni yangilash scripti

set -e

echo "🔄 Upgrading Node.js to version 20..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Remove old Node.js
echo -e "${YELLOW}Removing old Node.js...${NC}"
apt-get remove -y nodejs npm 2>/dev/null || true
apt-get purge -y nodejs npm 2>/dev/null || true

# Install Node.js 20.x
echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"

# Reinstall pnpm
echo -e "${YELLOW}Reinstalling pnpm...${NC}"
npm install -g pnpm@8.15.0

PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✅ pnpm installed: $PNPM_VERSION${NC}"

echo ""
echo -e "${GREEN}✅ Node.js upgrade completed!${NC}"
echo "You can now run deployment scripts."

