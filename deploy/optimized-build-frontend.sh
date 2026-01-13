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

# 7. Verify build output
echo -e "${BLUE}📋 Step 7: Verifying build output...${NC}"
if [ ! -d "$FRONTEND_DIR/.next" ]; then
    echo -e "${RED}❌ .next directory NOT found${NC}"
    exit 1
fi

# Check for standard Next.js build (not standalone)
if [ -d "$FRONTEND_DIR/.next/standalone" ]; then
    echo -e "${YELLOW}  ⚠️  Standalone build found (but not required)${NC}"
    STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"
    STANDALONE_SERVER="$STANDALONE_DIR/server.js"
    if [ -f "$STANDALONE_SERVER" ]; then
        echo -e "${GREEN}  ✅ Standalone server.js exists (can be used)${NC}"
    fi
else
    echo -e "${GREEN}  ✅ Standard Next.js build (using next start)${NC}"
fi

# 8. Verify static files
echo -e "${BLUE}📋 Step 8: Verifying static files...${NC}"
if [ -d "$FRONTEND_DIR/.next/static" ]; then
    STATIC_COUNT=$(find "$FRONTEND_DIR/.next/static" -type f | wc -l)
    STATIC_SIZE=$(du -sh "$FRONTEND_DIR/.next/static" | awk '{print $1}')
    echo -e "${GREEN}  ✅ Found $STATIC_COUNT static files ($STATIC_SIZE)${NC}"
else
    echo -e "${RED}❌ .next/static directory not found${NC}"
    exit 1
fi

# 9. Show build size
echo -e "${BLUE}📋 Step 9: Build size information...${NC}"
NEXT_SIZE=$(du -sh "$FRONTEND_DIR/.next" | awk '{print $1}')
echo "  .next directory: $NEXT_SIZE"
echo "  Static files: $STATIC_SIZE"

# 10. Restart PM2
echo -e "${BLUE}🚀 Step 10: Restarting PM2...${NC}"
cd "$PROJECT_DIR"
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 1

# Start frontend using startup script (most reliable method)
echo -e "${GREEN}  ✅ Starting frontend with PM2...${NC}"

# Create startup script
START_SCRIPT="/tmp/start-frontend-$(date +%Y%m%d_%H%M%S).sh"
cat > "$START_SCRIPT" << 'EOF'
#!/bin/bash
cd /var/www/acoustic.uz/apps/frontend
export NODE_ENV=production
export PORT=3000
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
exec pnpm start
EOF

chmod +x "$START_SCRIPT"

# Try startup script first
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 1

pm2 start "$START_SCRIPT" \
    --name acoustic-frontend \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --merge-logs \
    --max-memory-restart 500M || {
    echo -e "${RED}  ❌ Failed to start frontend with startup script${NC}"
    echo -e "${YELLOW}  → Trying ecosystem config...${NC}"
    pm2 start ecosystem.config.js --only acoustic-frontend || {
        echo -e "${RED}  ❌ Failed to start frontend${NC}"
        exit 1
    }
}
pm2 save

# Wait for startup
sleep 5

# 11. Check PM2 status
echo -e "${BLUE}📋 Step 11: Checking PM2 status...${NC}"
pm2 list | grep acoustic-frontend || {
    echo -e "${RED}  ❌ Frontend not found in PM2!${NC}"
    exit 1
}

# 12. Test connection
echo -e "${BLUE}📋 Step 12: Testing connection...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Frontend is running (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Check logs: pm2 logs acoustic-frontend --lines 50${NC}"
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

