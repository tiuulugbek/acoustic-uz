#!/bin/bash
# Optimized frontend build script
# Cleans old builds, removes unnecessary files, and builds efficiently

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}🚀 Optimized frontend build...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Stop PM2 frontend
echo -e "${BLUE}🛑 Step 1: Stopping PM2 frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true

# 2. Clean ALL build artifacts and cache
echo -e "${BLUE}🧹 Step 2: Cleaning build artifacts and cache...${NC}"
cd "$FRONTEND_DIR"

# Remove Next.js build directories
rm -rf .next
rm -rf out
rm -rf build
rm -rf dist

# Remove cache directories
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf .cache
rm -rf .parcel-cache

# Remove Next.js cache more aggressively
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove TypeScript build info
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
find . -name "tsconfig.tsbuildinfo" -delete 2>/dev/null || true

# Remove ESLint cache
rm -rf .eslintcache
rm -rf .stylelintcache

echo -e "${GREEN}  ✅ Cleaned all build artifacts and cache${NC}"

# 3. Pull latest code
echo -e "${BLUE}📥 Step 3: Pulling latest code...${NC}"
cd "$PROJECT_DIR"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing...${NC}"

# 4. Install dependencies (including devDependencies for build tools)
echo -e "${BLUE}📦 Step 4: Installing dependencies (including devDependencies)...${NC}"
# Temporarily set NODE_ENV to development to install devDependencies
export NODE_ENV=development
pnpm install --frozen-lockfile || pnpm install
export NODE_ENV=production

# 5. Build shared package
echo -e "${BLUE}🏗️  Step 5: Building shared package...${NC}"
pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared build failed${NC}"
    exit 1
}

# 6. Build frontend with production environment
echo -e "${BLUE}🏗️  Step 6: Building frontend (production)...${NC}"
cd "$FRONTEND_DIR"

# Ensure tailwindcss and other build tools are available
if [ ! -f "node_modules/.bin/tailwindcss" ] && [ ! -d "node_modules/tailwindcss" ]; then
    echo -e "${YELLOW}  ⚠️  TailwindCSS not found, installing devDependencies...${NC}"
    export NODE_ENV=development
    pnpm install --frozen-lockfile || pnpm install
    export NODE_ENV=production
fi

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

# 7. Verify standalone build
echo -e "${BLUE}📋 Step 7: Verifying standalone build...${NC}"
STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"
STANDALONE_SERVER="$STANDALONE_DIR/server.js"

if [ ! -f "$STANDALONE_SERVER" ]; then
    echo -e "${RED}❌ Standalone server.js NOT found${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Standalone server.js exists${NC}"

# 8. Copy .next/static to standalone (required for Next.js)
echo -e "${BLUE}📋 Step 8: Copying .next/static files...${NC}"
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

# 9. Copy public files
echo -e "${BLUE}📋 Step 9: Copying public files...${NC}"
if [ -d "$FRONTEND_DIR/public" ]; then
    mkdir -p "$STANDALONE_DIR/public"
    cp -r "$FRONTEND_DIR/public"/* "$STANDALONE_DIR/public/" 2>/dev/null || true
    echo -e "${GREEN}  ✅ Public files copied${NC}"
fi

# 10. Clean up unnecessary files from standalone build
echo -e "${BLUE}📋 Step 10: Cleaning up unnecessary files...${NC}"
# Remove source maps in production (optional, reduces size)
find "$STANDALONE_DIR" -name "*.map" -delete 2>/dev/null || true
echo -e "${GREEN}  ✅ Cleaned up unnecessary files${NC}"

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
echo -e "${GREEN}✅ Optimized frontend build complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check status: pm2 list"
echo "  View logs: pm2 logs acoustic-frontend"
echo "  Test local: curl http://localhost:3000"
echo ""
echo -e "${YELLOW}💡 Note: Build artifacts are NOT tracked in git${NC}"
echo "  They will be regenerated on each build"

