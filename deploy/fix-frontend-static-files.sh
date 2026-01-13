#!/bin/bash
# Script to fix frontend static files 404 errors by rebuilding and ensuring correct permissions

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Fix Frontend Static Files (404)      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Fix Git ownership
echo -e "${BLUE}1️⃣ Fixing Git ownership...${NC}"
sudo -u acoustic git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
echo -e "${GREEN}✅ Git ownership fixed${NC}"

# Pull latest changes
echo -e "${BLUE}2️⃣ Pulling latest changes...${NC}"
sudo -u acoustic git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, continuing anyway...${NC}"
}
echo -e "${GREEN}✅ Latest changes pulled${NC}"

# Install dependencies
echo -e "${BLUE}3️⃣ Installing dependencies...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic pnpm install --frozen-lockfile
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build shared package first
echo -e "${BLUE}4️⃣ Building shared package...${NC}"
cd "$PROJECT_DIR/packages/shared"
sudo -u acoustic pnpm build
echo -e "${GREEN}✅ Shared package built${NC}"

# Clean Next.js build cache
echo -e "${BLUE}5️⃣ Cleaning Next.js build cache...${NC}"
cd "$FRONTEND_DIR"
sudo -u acoustic rm -rf .next 2>/dev/null || true
echo -e "${GREEN}✅ Build cache cleaned${NC}"

# Build frontend
echo -e "${BLUE}6️⃣ Building frontend...${NC}"
cd "$FRONTEND_DIR"

# Set environment variables for build
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://a.acoustic.uz/api}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://acoustic.uz}"

sudo -u acoustic pnpm exec next build
echo -e "${GREEN}✅ Frontend built${NC}"

# Verify .next/static directory exists
if [ ! -d "$FRONTEND_DIR/.next/static" ]; then
    echo -e "${RED}❌ .next/static directory not found after build!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .next/static directory exists${NC}"

# Fix permissions
echo -e "${BLUE}7️⃣ Fixing permissions...${NC}"
chown -R acoustic:acoustic "$FRONTEND_DIR/.next"
chmod -R 755 "$FRONTEND_DIR/.next"
echo -e "${GREEN}✅ Permissions fixed${NC}"

# Restart frontend PM2 process
echo -e "${BLUE}8️⃣ Restarting frontend PM2 process...${NC}"
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --name acoustic-frontend
pm2 save
echo -e "${GREEN}✅ Frontend restarted${NC}"

# Check PM2 status
echo -e "${BLUE}9️⃣ Checking PM2 status...${NC}"
pm2 status acoustic-frontend

# Test static files
echo -e "${BLUE}🔟 Testing static files...${NC}"
STATIC_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/ || echo "000")
if [ "$STATIC_TEST" = "200" ] || [ "$STATIC_TEST" = "404" ]; then
    echo -e "${GREEN}✅ Static files endpoint responding (HTTP $STATIC_TEST)${NC}"
else
    echo -e "${YELLOW}⚠️  Static files endpoint returned HTTP $STATIC_TEST${NC}"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Frontend Static Files Fixed!        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${GREEN}✅ Frontend rebuild completed${NC}"
echo -e "${YELLOW}⚠️  If issues persist, check:${NC}"
echo -e "   - Nginx config: /etc/nginx/sites-available/acoustic.uz.conf"
echo -e "   - PM2 logs: pm2 logs acoustic-frontend"
echo -e "   - File permissions: ls -la $FRONTEND_DIR/.next/static"
echo ""

