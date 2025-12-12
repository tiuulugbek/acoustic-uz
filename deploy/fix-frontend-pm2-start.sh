#!/bin/bash

# Fix frontend PM2 startup issue
# This script ensures frontend starts correctly with pnpm start

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}🔧 Fixing Frontend PM2 Startup...${NC}"
echo ""

# 1. Stop and delete existing frontend
echo -e "${BLUE}📋 Step 1: Stopping existing frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo -e "${GREEN}  ✅ Frontend stopped${NC}"
echo ""

# 2. Check if .next directory exists
echo -e "${BLUE}📋 Step 2: Checking build directory...${NC}"
if [ ! -d "$FRONTEND_DIR/.next" ]; then
    echo -e "${RED}  ❌ .next directory not found!${NC}"
    echo -e "${YELLOW}  → Building frontend first...${NC}"
    cd "$FRONTEND_DIR"
    export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
    export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
    pnpm build || {
        echo -e "${RED}  ❌ Build failed!${NC}"
        exit 1
    }
    echo -e "${GREEN}  ✅ Build completed${NC}"
else
    echo -e "${GREEN}  ✅ Build directory exists${NC}"
fi
echo ""

# 3. Create a startup script for PM2
echo -e "${BLUE}📋 Step 3: Creating startup script...${NC}"
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
echo -e "${GREEN}  ✅ Startup script created: $START_SCRIPT${NC}"
echo ""

# 4. Start frontend with PM2
echo -e "${BLUE}📋 Step 4: Starting frontend with PM2...${NC}"
cd "$PROJECT_DIR"
pm2 start "$START_SCRIPT" \
    --name acoustic-frontend \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --merge-logs \
    --max-memory-restart 500M

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Frontend started${NC}"
    # Enable autorestart using PM2 command
    pm2 set acoustic-frontend autorestart true 2>/dev/null || true
else
    echo -e "${RED}  ❌ Failed to start frontend${NC}"
    exit 1
fi
pm2 save
echo ""

# 5. Wait for startup
echo -e "${BLUE}📋 Step 5: Waiting for startup...${NC}"
sleep 5
echo ""

# 6. Check PM2 status
echo -e "${BLUE}📋 Step 6: Checking PM2 status...${NC}"
pm2 list | grep acoustic-frontend || {
    echo -e "${RED}  ❌ Frontend not found in PM2!${NC}"
    exit 1
}
pm2 status acoustic-frontend
echo ""

# 7. Check logs for errors
echo -e "${BLUE}📋 Step 7: Checking recent logs...${NC}"
echo -e "${YELLOW}  Last 20 lines of logs:${NC}"
pm2 logs acoustic-frontend --lines 20 --nostream 2>/dev/null | tail -20 || echo "  (no logs yet)"
echo ""

# 8. Test connection
echo -e "${BLUE}📋 Step 8: Testing connection...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Frontend is responding (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}  ❌ Cannot connect to localhost:3000${NC}"
    echo -e "${YELLOW}  → Check logs: pm2 logs acoustic-frontend --lines 50${NC}"
    echo -e "${YELLOW}  → Check port: netstat -tuln | grep 3000${NC}"
else
    echo -e "${YELLOW}  ⚠️  Frontend returned HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}  → Check logs: pm2 logs acoustic-frontend --lines 50${NC}"
fi
echo ""

# 9. Check port
echo -e "${BLUE}📋 Step 9: Checking port 3000...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo -e "${GREEN}  ✅ Port 3000 is listening${NC}"
    netstat -tuln 2>/dev/null | grep ":3000 " || ss -tuln 2>/dev/null | grep ":3000 "
else
    echo -e "${RED}  ❌ Port 3000 is NOT listening${NC}"
    echo -e "${YELLOW}  → Frontend may not have started correctly${NC}"
fi
echo ""

echo -e "${GREEN}✅ Frontend PM2 startup fix complete!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  Check status: pm2 list"
echo "  View logs: pm2 logs acoustic-frontend --lines 50"
echo "  Restart: pm2 restart acoustic-frontend"
echo "  Test: curl http://localhost:3000"
echo ""

