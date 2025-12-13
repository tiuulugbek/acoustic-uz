#!/bin/bash

# Rebuild frontend after adding /posts page
# This script pulls latest changes and rebuilds the frontend

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}🔧 Rebuilding frontend with /posts page...${NC}"
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

# 3. Install dependencies (if needed)
echo -e "${BLUE}📋 Step 2: Installing dependencies...${NC}"
cd "$PROJECT_DIR"
pnpm install --frozen-lockfile || {
    echo -e "${YELLOW}⚠️  pnpm install failed, trying without frozen lockfile...${NC}"
    pnpm install || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
}
echo -e "${GREEN}  ✅ Dependencies installed${NC}"
echo ""

# 4. Stop frontend
echo -e "${BLUE}📋 Step 3: Stopping frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true
sleep 2
echo -e "${GREEN}  ✅ Frontend stopped${NC}"
echo ""

# 5. Build frontend
echo -e "${BLUE}📋 Step 4: Building frontend...${NC}"
cd "$FRONTEND_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://a.acoustic.uz/api}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://acoustic.uz}"

# Clean previous build
rm -rf .next
rm -rf .next/cache

# Build
pnpm exec next build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

echo -e "${GREEN}  ✅ Frontend build completed${NC}"
echo ""

# 6. Start frontend
echo -e "${BLUE}📋 Step 5: Starting frontend...${NC}"
cd "$PROJECT_DIR"
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --only acoustic-frontend
pm2 save
echo -e "${GREEN}  ✅ Frontend started${NC}"
echo ""

# 7. Wait and check status
echo -e "${BLUE}📋 Step 6: Checking status...${NC}"
sleep 5
pm2 status acoustic-frontend
echo ""

# 8. Test /posts endpoint
echo -e "${BLUE}📋 Step 7: Testing /posts endpoint...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/posts 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✅ /posts endpoint is working (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Check logs: pm2 logs acoustic-frontend --lines 50${NC}"
fi

# Test with category parameter if available
echo -e "${BLUE}📋 Step 8: Testing /posts?category endpoint...${NC}"
CATEGORY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://acoustic.uz/posts?category=test-kategoriya" 2>&1 || echo "000")
if [ "$CATEGORY_CODE" = "200" ] || [ "$CATEGORY_CODE" = "404" ]; then
    echo -e "${GREEN}  ✅ /posts?category endpoint is responding (HTTP $CATEGORY_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $CATEGORY_CODE - This is expected if category doesn't exist${NC}"
fi
echo ""

echo -e "${GREEN}✅ Frontend rebuild complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check logs: pm2 logs acoustic-frontend --lines 50"
echo "  Restart: pm2 restart acoustic-frontend"
echo "  Test: curl https://acoustic.uz/posts"
echo ""

