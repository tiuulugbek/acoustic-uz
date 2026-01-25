#!/bin/bash

# Fix post-categories API endpoint
# This script rebuilds backend after adding PostCategoriesModule

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo -e "${BLUE}🔧 Fixing post-categories API endpoint...${NC}"
echo ""

# 1. Navigate to project directory
cd "$PROJECT_DIR"

# 2. Pull latest changes
echo -e "${BLUE}📋 Step 1: Pulling latest changes...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
}
echo -e "${GREEN}  ✅ Latest changes pulled${NC}"
echo ""

# 3. Stop backend
echo -e "${BLUE}📋 Step 2: Stopping backend...${NC}"
pm2 stop acoustic-backend 2>/dev/null || true
sleep 2
echo -e "${GREEN}  ✅ Backend stopped${NC}"
echo ""

# 4. Build backend
echo -e "${BLUE}📋 Step 3: Building backend...${NC}"
cd "$BACKEND_DIR"
export NODE_ENV=production

# Clean build
rm -rf dist
rm -f tsconfig.tsbuildinfo

# Build
pnpm exec nest build || {
    echo -e "${YELLOW}⚠️  Nest build failed, trying tsc...${NC}"
    pnpm exec tsc --build || {
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    }
}

echo -e "${GREEN}  ✅ Backend build completed${NC}"
echo ""

# 5. Start backend
echo -e "${BLUE}📋 Step 4: Starting backend...${NC}"
cd "$PROJECT_DIR"
pm2 restart acoustic-backend || pm2 start ecosystem.config.js --only acoustic-backend
pm2 save
echo -e "${GREEN}  ✅ Backend started${NC}"
echo ""

# 6. Wait and check status
echo -e "${BLUE}📋 Step 5: Checking status...${NC}"
sleep 5
pm2 status acoustic-backend
echo ""

# 7. Test API endpoint
echo -e "${BLUE}📋 Step 6: Testing API endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/post-categories 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}  ✅ API endpoint is working (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Check logs: pm2 logs acoustic-backend --lines 50${NC}"
fi
echo ""

echo -e "${GREEN}✅ Post-categories API fix complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check logs: pm2 logs acoustic-backend --lines 50"
echo "  Restart: pm2 restart acoustic-backend"
echo "  Test: curl http://localhost:3001/api/post-categories"
echo ""

