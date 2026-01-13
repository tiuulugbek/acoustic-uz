#!/bin/bash
# Update project from git and rebuild
# This script pulls latest changes and rebuilds the project

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"

echo -e "${BLUE}🔄 Updating project from git...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Check current git status
echo -e "${BLUE}📋 Step 1: Checking git status...${NC}"
git status --short || echo -e "${YELLOW}⚠️  Git status check failed${NC}"

# 2. Stash any local changes (if any)
echo -e "${BLUE}📋 Step 2: Stashing local changes (if any)...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}  ⚠️  Found local changes, stashing...${NC}"
    git stash push -m "Auto-stash before pull $(date +%Y-%m-%d_%H:%M:%S)" || true
else
    echo -e "${GREEN}  ✅ No local changes${NC}"
fi

# 3. Pull latest changes
echo -e "${BLUE}📋 Step 3: Pulling latest changes from git...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
}
echo -e "${GREEN}  ✅ Pulled latest changes${NC}"

# 4. Show latest commits
echo -e "${BLUE}📋 Step 4: Latest commits:${NC}"
git log --oneline -5 | sed 's/^/  /'

# 5. Rebuild backend
echo -e "${BLUE}📋 Step 5: Rebuilding backend...${NC}"
cd apps/backend
pnpm install --frozen-lockfile || pnpm install
pnpm build || {
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
}
echo -e "${GREEN}  ✅ Backend built successfully${NC}"

# 6. Restart backend
echo -e "${BLUE}📋 Step 6: Restarting backend...${NC}"
pm2 restart acoustic-backend || {
    echo -e "${YELLOW}⚠️  PM2 restart failed, trying start...${NC}"
    pm2 start ecosystem.config.js --only acoustic-backend
}
pm2 save
echo -e "${GREEN}  ✅ Backend restarted${NC}"

# 7. Rebuild frontend
echo -e "${BLUE}📋 Step 7: Rebuilding frontend...${NC}"
cd "$PROJECT_DIR"
bash deploy/optimized-build-frontend.sh || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

# 8. Check services status
echo -e "${BLUE}📋 Step 8: Checking services status...${NC}"
pm2 list | grep -E "(acoustic-backend|acoustic-frontend)" || echo "  No services found"

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Check backend: pm2 logs acoustic-backend --lines 20"
echo "  2. Check frontend: pm2 logs acoustic-frontend --lines 20"
echo "  3. Test backend: curl http://localhost:3001/api/health"
echo "  4. Test frontend: curl http://localhost:3000"

