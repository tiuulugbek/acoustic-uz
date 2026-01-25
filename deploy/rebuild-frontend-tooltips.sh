#!/bin/bash

# Quick rebuild script for frontend tooltip fixes
# This script pulls latest changes and rebuilds frontend

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}🔄 Rebuilding Frontend for Tooltip Fixes...${NC}"
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

# 3. Stop frontend
echo -e "${BLUE}📋 Step 2: Stopping frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo -e "${GREEN}  ✅ Frontend stopped${NC}"
echo ""

# 4. Build frontend
echo -e "${BLUE}📋 Step 3: Building frontend...${NC}"
cd "$FRONTEND_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz

pnpm build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}
echo -e "${GREEN}  ✅ Frontend build completed${NC}"
echo ""

# 5. Start frontend
echo -e "${BLUE}📋 Step 4: Starting frontend...${NC}"
cd "$PROJECT_DIR"

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

pm2 start "$START_SCRIPT" \
    --name acoustic-frontend \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --merge-logs \
    --max-memory-restart 500M

pm2 save
echo -e "${GREEN}  ✅ Frontend started${NC}"
echo ""

# 6. Wait and check status
echo -e "${BLUE}📋 Step 5: Checking status...${NC}"
sleep 5
pm2 status acoustic-frontend
echo ""

# 7. Test connection
echo -e "${BLUE}📋 Step 6: Testing connection...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Frontend is running (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Check logs: pm2 logs acoustic-frontend --lines 50${NC}"
fi
echo ""

echo -e "${GREEN}✅ Frontend rebuild complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check logs: pm2 logs acoustic-frontend --lines 50"
echo "  Restart: pm2 restart acoustic-frontend"
echo "  Test: curl http://localhost:3000"
echo ""

