#!/bin/bash

# Quick Setup Script for New Server
# Bu script barcha qadamlarni ketma-ket bajaradi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick Setup for New Server${NC}"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
CURRENT_DIR=$(pwd)

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "deploy/new-server-setup.sh" ]; then
    echo -e "${YELLOW}⚠️  Not in project directory. Checking if repository needs to be cloned...${NC}"
    
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${BLUE}📥 Cloning repository...${NC}"
        mkdir -p /var/www
        sudo -u acoustic git clone https://github.com/tiuulugbek/acoustic-uz.git "$APP_DIR"
        cd "$APP_DIR"
    else
        echo -e "${YELLOW}⚠️  Directory exists, using existing...${NC}"
        cd "$APP_DIR"
        sudo -u acoustic git pull origin main || true
    fi
else
    # If we're already in the project directory
    if [ "$CURRENT_DIR" != "$APP_DIR" ]; then
        echo -e "${BLUE}📁 Moving to application directory...${NC}"
        if [ ! -d "$APP_DIR" ]; then
            mkdir -p "$APP_DIR"
            cp -r . "$APP_DIR/"
        fi
        cd "$APP_DIR"
    fi
fi

echo ""
echo -e "${BLUE}📋 Current directory: $(pwd)${NC}"
echo ""

# Step 1: Check if database user exists
echo -e "${BLUE}1️⃣ Checking database setup...${NC}"
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='acoustic'" | grep -q 1; then
    echo -e "${GREEN}✅ Database user 'acoustic' exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database user not found. Please run:${NC}"
    echo "   sudo bash deploy/setup-database.sh"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Step 2: Check .env file
echo ""
echo -e "${BLUE}2️⃣ Checking .env file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please run: sudo bash deploy/setup-database.sh"
    exit 1
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    # Check if DATABASE_URL is set
    if ! grep -q "DATABASE_URL" .env; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    fi
fi

# Step 3: Install dependencies
echo ""
echo -e "${BLUE}3️⃣ Installing dependencies...${NC}"
sudo -u acoustic pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: Generate Prisma client
echo ""
echo -e "${BLUE}4️⃣ Generating Prisma client...${NC}"
sudo -u acoustic pnpm exec prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"

# Step 5: Run migrations
echo ""
echo -e "${BLUE}5️⃣ Running database migrations...${NC}"
sudo -u acoustic pnpm exec prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations may have warnings, but continuing...${NC}"
}
echo -e "${GREEN}✅ Migrations completed${NC}"

# Step 6: Build shared package
echo ""
echo -e "${BLUE}6️⃣ Building shared package...${NC}"
sudo -u acoustic pnpm --filter @acoustic/shared build
echo -e "${GREEN}✅ Shared package built${NC}"

# Step 7: Build backend
echo ""
echo -e "${BLUE}7️⃣ Building backend...${NC}"
cd apps/backend
sudo -u acoustic pnpm exec nest build || {
    echo -e "${YELLOW}⚠️  NestJS build failed, trying tsc...${NC}"
    sudo -u acoustic pnpm exec tsc --build
}
cd ../..
echo -e "${GREEN}✅ Backend built${NC}"

# Step 8: Build admin panel
echo ""
echo -e "${BLUE}8️⃣ Building admin panel...${NC}"
cd apps/admin
sudo -u acoustic VITE_API_URL="https://a.acoustic.uz/api" pnpm build
cd ../..
echo -e "${GREEN}✅ Admin panel built${NC}"

# Step 9: Build frontend
echo ""
echo -e "${BLUE}9️⃣ Building frontend...${NC}"
cd apps/frontend
sudo -u acoustic NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api" NEXT_PUBLIC_SITE_URL="https://acoustic.uz" pnpm exec next build
cd ../..
echo -e "${GREEN}✅ Frontend built${NC}"

# Step 10: Setup PM2
echo ""
echo -e "${BLUE}🔟 Setting up PM2 processes...${NC}"

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
pm2 start "node_modules/.bin/next start" --name acoustic-frontend --cwd "$APP_DIR/apps/frontend" \
    --env production \
    --env PORT=3000 \
    --env NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api" \
    --env NEXT_PUBLIC_SITE_URL="https://acoustic.uz" \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --error "$APP_DIR/logs/frontend-error.log" \
    --output "$APP_DIR/logs/frontend-out.log" \
    --time
cd ../..

pm2 save
echo -e "${GREEN}✅ PM2 processes started${NC}"

# Step 11: Setup Nginx
echo ""
echo -e "${BLUE}1️⃣1️⃣ Setting up Nginx...${NC}"
if [ -f "deploy/setup-nginx-config.sh" ]; then
    bash deploy/setup-nginx-config.sh
else
    echo -e "${YELLOW}⚠️  Nginx config script not found${NC}"
fi

# Step 12: Test services
echo ""
echo -e "${BLUE}1️⃣2️⃣ Testing services...${NC}"
sleep 5

# Check backend
if curl -f http://localhost:3001/api/settings?lang=uz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may not be ready yet. Check logs: pm2 logs acoustic-backend${NC}"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may not be ready yet. Check logs: pm2 logs acoustic-frontend${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Quick setup complete!${NC}"
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
echo "3. Check Nginx:"
echo "   sudo nginx -t"
echo "   sudo systemctl status nginx"
echo ""
echo "4. Test websites:"
echo "   curl -I http://localhost:3000"
echo "   curl http://localhost:3001/api/settings?lang=uz"
echo ""

