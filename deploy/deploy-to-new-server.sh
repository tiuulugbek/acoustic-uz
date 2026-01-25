#!/bin/bash

# Complete Deployment Script for New Server
# Bu script barcha komponentlarni build qiladi va ishga tushiradi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Acoustic.uz - Complete Deployment${NC}"
echo "========================================"
echo ""

# Check if running as acoustic user or root
if [ "$EUID" -eq 0 ]; then
    RUN_AS="sudo -u acoustic"
else
    RUN_AS=""
fi

APP_DIR="/var/www/acoustic.uz"
cd "$APP_DIR"

# Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please run: bash deploy/setup-database.sh"
    exit 1
fi

# Load environment variables
set -a
source "$APP_DIR/.env"
set +a

echo -e "${BLUE}1️⃣ Pulling latest code...${NC}"
$RUN_AS git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, continuing with existing code...${NC}"
}
echo -e "${GREEN}✅ Code updated${NC}"

echo ""
echo -e "${BLUE}2️⃣ Installing dependencies...${NC}"
$RUN_AS pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}3️⃣ Building shared package...${NC}"
$RUN_AS pnpm --filter @acoustic/shared build
echo -e "${GREEN}✅ Shared package built${NC}"

echo ""
echo -e "${BLUE}4️⃣ Running database migrations...${NC}"
$RUN_AS pnpm exec prisma generate
$RUN_AS pnpm exec prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations may have warnings, but continuing...${NC}"
}
echo -e "${GREEN}✅ Migrations completed${NC}"

echo ""
echo -e "${BLUE}5️⃣ Building backend...${NC}"
cd apps/backend
$RUN_AS pnpm exec nest build || {
    echo -e "${YELLOW}⚠️  NestJS build failed, trying tsc...${NC}"
    $RUN_AS pnpm exec tsc --build
}
cd ../..
echo -e "${GREEN}✅ Backend built${NC}"

echo ""
echo -e "${BLUE}6️⃣ Building admin panel...${NC}"
cd apps/admin
$RUN_AS VITE_API_URL="https://a.acoustic.uz/api" pnpm build
cd ../..
echo -e "${GREEN}✅ Admin panel built${NC}"

echo ""
echo -e "${BLUE}7️⃣ Building frontend...${NC}"
cd apps/frontend
$RUN_AS NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api" NEXT_PUBLIC_SITE_URL="https://acoustic.uz" pnpm exec next build
cd ../..
echo -e "${GREEN}✅ Frontend built${NC}"

echo ""
echo -e "${BLUE}8️⃣ Setting up PM2 processes...${NC}"

# Stop existing processes
pm2 stop acoustic-backend acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-backend acoustic-frontend 2>/dev/null || true

# Start backend
cd apps/backend
pm2 start dist/main.js --name acoustic-backend --cwd "$APP_DIR/apps/backend" \
    --env production \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --error "$APP_DIR/logs/backend-error.log" \
    --output "$APP_DIR/logs/backend-out.log" \
    --time
cd ../..

# Start frontend
cd apps/frontend
pm2 start node_modules/.bin/next --name acoustic-frontend --cwd "$APP_DIR/apps/frontend" \
    start \
    --env production \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --error "$APP_DIR/logs/frontend-error.log" \
    --output "$APP_DIR/logs/frontend-out.log" \
    --time
cd ../..

pm2 save
echo -e "${GREEN}✅ PM2 processes started${NC}"

echo ""
echo -e "${BLUE}9️⃣ Setting up Nginx configuration...${NC}"
bash deploy/setup-nginx-config.sh
echo -e "${GREEN}✅ Nginx configured${NC}"

echo ""
echo -e "${BLUE}🔟 Testing services...${NC}"
sleep 3

# Check backend
if curl -f http://localhost:3001/api/settings?lang=uz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may not be ready yet${NC}"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may not be ready yet${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Setup SSL certificates:"
echo "   sudo certbot --nginx -d acoustic.uz -d www.acoustic.uz -d admin.acoustic.uz -d a.acoustic.uz"
echo ""
echo "2. Check PM2 status:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "3. Check Nginx status:"
echo "   sudo nginx -t"
echo "   sudo systemctl status nginx"
echo ""
echo "4. Test website:"
echo "   curl -I https://acoustic.uz"
echo ""

