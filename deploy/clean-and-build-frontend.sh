#!/bin/bash
# Clean and build frontend without unnecessary files
# Removes .next from git tracking and cleans before build

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}🧹 Cleaning and building frontend...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Remove .next from git tracking (if it exists)
echo -e "${BLUE}📋 Step 1: Removing .next from git tracking...${NC}"
if git ls-files | grep -q "^apps/frontend/\.next"; then
    echo "  Found .next files in git, removing..."
    git rm -r --cached apps/frontend/.next 2>/dev/null || true
    git commit -m "chore: Remove .next directory from git tracking" 2>/dev/null || echo "  No changes to commit"
    echo -e "${GREEN}  ✅ Removed .next from git tracking${NC}"
else
    echo -e "${GREEN}  ✅ .next is not tracked in git${NC}"
fi

# 2. Stop PM2 frontend
echo -e "${BLUE}🛑 Step 2: Stopping PM2 frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true

# 3. Clean old builds and cache
echo -e "${BLUE}🧹 Step 3: Cleaning old builds and cache...${NC}"
cd "$FRONTEND_DIR"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo -e "${GREEN}  ✅ Cleaned .next, node_modules/.cache, and .turbo${NC}"

# 4. Pull latest code
echo -e "${BLUE}📥 Step 4: Pulling latest code...${NC}"
cd "$PROJECT_DIR"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing...${NC}"

# 5. Install dependencies
echo -e "${BLUE}📦 Step 5: Installing dependencies...${NC}"
pnpm install --frozen-lockfile || pnpm install

# 6. Build shared package
echo -e "${BLUE}🏗️  Step 6: Building shared package...${NC}"
pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared build failed${NC}"
    exit 1
}

# 7. Build frontend with production environment
echo -e "${BLUE}🏗️  Step 7: Building frontend (production)...${NC}"
cd "$FRONTEND_DIR"

export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
export NEXT_TELEMETRY_DISABLED=1

echo "  Environment:"
echo "    NODE_ENV=$NODE_ENV"
echo "    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"

pnpm build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

# 8. Verify standalone build
echo -e "${BLUE}📋 Step 8: Verifying standalone build...${NC}"
STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"
STANDALONE_SERVER="$STANDALONE_DIR/server.js"

if [ ! -f "$STANDALONE_SERVER" ]; then
    echo -e "${RED}❌ Standalone server.js NOT found at: $STANDALONE_SERVER${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Standalone server.js exists${NC}"

# 9. Copy .next/static to standalone (required for Next.js)
echo -e "${BLUE}📋 Step 9: Copying .next/static files...${NC}"
if [ -d "$FRONTEND_DIR/.next/static" ]; then
    mkdir -p "$STANDALONE_DIR/.next/static"
    rm -rf "$STANDALONE_DIR/.next/static"/* || true
    cp -r "$FRONTEND_DIR/.next/static"/* "$STANDALONE_DIR/.next/static/" || {
        echo -e "${RED}❌ Failed to copy static files${NC}"
        exit 1
    }
    STATIC_COUNT=$(find "$STANDALONE_DIR/.next/static" -type f | wc -l)
    echo -e "${GREEN}  ✅ Copied $STATIC_COUNT static files${NC}"
else
    echo -e "${RED}❌ .next/static directory not found${NC}"
    exit 1
fi

# 10. Copy public files
echo -e "${BLUE}📋 Step 10: Copying public files...${NC}"
if [ -d "$FRONTEND_DIR/public" ]; then
    mkdir -p "$STANDALONE_DIR/public"
    cp -r "$FRONTEND_DIR/public"/* "$STANDALONE_DIR/public/" 2>/dev/null || true
    echo -e "${GREEN}  ✅ Public files copied${NC}"
fi

# 11. Show build size
echo -e "${BLUE}📋 Step 11: Build size information...${NC}"
STANDALONE_SIZE=$(du -sh "$STANDALONE_DIR" | awk '{print $1}')
STATIC_SIZE=$(du -sh "$STANDALONE_DIR/.next/static" | awk '{print $1}')
echo "  Standalone directory: $STANDALONE_SIZE"
echo "  Static files: $STATIC_SIZE"

# 12. Restart PM2
echo -e "${BLUE}🚀 Step 12: Restarting PM2...${NC}"
cd "$PROJECT_DIR"
pm2 delete acoustic-frontend 2>/dev/null || true
pm2 start ecosystem.config.js --only acoustic-frontend
pm2 save

# Wait for startup
sleep 3

# 13. Check PM2 status
echo -e "${BLUE}📋 Step 13: Checking PM2 status...${NC}"
pm2 list | grep acoustic-frontend || {
    echo -e "${RED}  ❌ Frontend not found in PM2!${NC}"
    exit 1
}

# 14. Test connection
echo -e "${BLUE}📋 Step 14: Testing connection...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Frontend is running (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Check logs: pm2 logs acoustic-frontend${NC}"
fi

echo ""
echo -e "${GREEN}✅ Frontend build complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check status: pm2 list"
echo "  View logs: pm2 logs acoustic-frontend"
echo "  Test local: curl http://localhost:3000"
echo ""
echo -e "${YELLOW}💡 Note: .next directory is NOT tracked in git${NC}"
echo "  It will be regenerated on each build"

