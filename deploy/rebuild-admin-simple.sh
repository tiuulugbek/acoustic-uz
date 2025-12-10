#!/bin/bash
# Simple admin panel rebuild script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="$PROJECT_DIR/apps/admin"

echo -e "${BLUE}🚀 Rebuilding admin panel...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Pull latest code
echo -e "${BLUE}📥 Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing...${NC}"

# 2. Install dependencies (including devDependencies)
echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"
export NODE_ENV=development
pnpm install --frozen-lockfile || pnpm install
export NODE_ENV=production

# 3. Build admin panel
echo -e "${BLUE}🏗️  Step 3: Building admin panel...${NC}"
cd "$ADMIN_DIR"

# Ensure vite is available
if [ ! -f "node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}  ⚠️  Vite CLI not found, installing vite...${NC}"
    export NODE_ENV=development
    pnpm install --frozen-lockfile || pnpm install
    export NODE_ENV=production
fi

# Build
pnpm build || {
    echo -e "${RED}❌ Admin build failed${NC}"
    echo -e "${YELLOW}  Trying alternative build method...${NC}"
    if [ -f "node_modules/.bin/vite" ]; then
        ./node_modules/.bin/vite build || {
            echo -e "${RED}❌ Admin build failed with direct path${NC}"
            exit 1
        }
    else
        echo -e "${RED}❌ Admin build failed: Vite CLI not found${NC}"
        exit 1
    fi
}

echo -e "${GREEN}✅ Admin panel built successfully${NC}"

# 4. Show build info
echo -e "${BLUE}📋 Step 4: Build information...${NC}"
if [ -f "$ADMIN_DIR/dist/index.html" ]; then
    BUILD_SIZE=$(du -sh "$ADMIN_DIR/dist" | awk '{print $1}')
    echo "  Build directory: $ADMIN_DIR/dist"
    echo "  Build size: $BUILD_SIZE"
    echo -e "${GREEN}  ✅ Build files exist${NC}"
else
    echo -e "${RED}  ❌ Build files not found!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Admin panel rebuild complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Check admin panel: https://admin.acoustic.uz"
echo "  3. If still not updated, check nginx configuration"
echo ""

