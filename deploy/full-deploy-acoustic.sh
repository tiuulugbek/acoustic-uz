#!/bin/bash
# Full deployment script for acoustic.uz
# Pulls latest code, runs migrations, rebuilds all apps, and restarts services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Full Deployment Script              ${NC}"
echo -e "${BLUE}  acoustic.uz                        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check if running as root or acoustic user
if [ "$EUID" -eq 0 ]; then
    USER="acoustic"
    echo -e "${YELLOW}⚠️  Running as root, will use 'acoustic' user for operations${NC}"
else
    USER=$(whoami)
    echo -e "${BLUE}Running as user: $USER${NC}"
fi

# 1. Navigate to project directory
echo ""
echo -e "${BLUE}1️⃣ Navigating to project directory...${NC}"
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Current directory: $(pwd)${NC}"

# 2. Fix Git ownership
echo ""
echo -e "${BLUE}2️⃣ Fixing Git ownership...${NC}"
sudo -u acoustic git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
if [ "$EUID" -eq 0 ]; then
    git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
fi
echo -e "${GREEN}✅ Git ownership fixed${NC}"

# 3. Pull latest code
echo ""
echo -e "${BLUE}3️⃣ Pulling latest code from Git...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, trying as root...${NC}"
    git pull origin main || {
        echo -e "${RED}❌ Git pull failed!${NC}"
        exit 1
    }
}
echo -e "${GREEN}✅ Code pulled successfully${NC}"

# 4. Run Prisma migration
echo ""
echo -e "${BLUE}4️⃣ Running database migrations...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migration failed, trying as root...${NC}"
    npx prisma migrate deploy || {
        echo -e "${RED}❌ Migration failed!${NC}"
        exit 1
    }
}
echo -e "${GREEN}✅ Migrations completed${NC}"

# 5. Generate Prisma Client
echo ""
echo -e "${BLUE}5️⃣ Generating Prisma Client...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic npx prisma generate || {
    echo -e "${YELLOW}⚠️  Prisma generate failed, trying as root...${NC}"
    npx prisma generate || {
        echo -e "${RED}❌ Prisma generate failed!${NC}"
        exit 1
    }
}
echo -e "${GREEN}✅ Prisma Client generated${NC}"

# 6. Fix node_modules permissions
echo ""
echo -e "${BLUE}6️⃣ Fixing node_modules permissions...${NC}"
cd "$PROJECT_DIR"
sudo chown -R acoustic:acoustic "$PROJECT_DIR" 2>/dev/null || true
echo -e "${GREEN}✅ Permissions fixed${NC}"

# 7. Install dependencies
echo ""
echo -e "${BLUE}7️⃣ Installing dependencies...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic pnpm install || {
    echo -e "${RED}❌ pnpm install failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 8. Build shared package
echo ""
echo -e "${BLUE}8️⃣ Building shared package...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared package build failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Shared package built${NC}"

# 9. Build backend
echo ""
echo -e "${BLUE}9️⃣ Building backend...${NC}"
cd "$PROJECT_DIR/apps/backend"

# Clean dist directory
echo -e "${BLUE}   Cleaning dist directory...${NC}"
sudo -u acoustic rm -rf dist 2>/dev/null || true
sudo -u acoustic rm -rf .tsbuildinfo tsconfig.tsbuildinfo 2>/dev/null || true

# Build backend
echo -e "${BLUE}   Running TypeScript compiler...${NC}"
sudo -u acoustic pnpm exec tsc || {
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
}

# Check if build succeeded
if [ ! -f "dist/main.js" ]; then
    echo -e "${RED}❌ Backend build failed: dist/main.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend built successfully${NC}"

# 10. Restart backend PM2
echo ""
echo -e "${BLUE}🔟 Restarting backend PM2 process...${NC}"
cd "$PROJECT_DIR"
pm2 restart acoustic-backend || pm2 start acoustic-backend
sleep 2
pm2 status acoustic-backend | grep acoustic-backend || echo -e "${YELLOW}⚠️  Backend PM2 status check failed${NC}"
echo -e "${GREEN}✅ Backend restarted${NC}"

# 11. Build frontend
echo ""
echo -e "${BLUE}1️⃣1️⃣ Building frontend...${NC}"
cd "$PROJECT_DIR/apps/frontend"

# Stop PM2 process first
echo -e "${BLUE}   Stopping frontend PM2 process...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true

# Clean Next.js cache
echo -e "${BLUE}   Cleaning Next.js cache...${NC}"
sudo chown -R acoustic:acoustic .next 2>/dev/null || true
sudo -u acoustic rm -rf .next 2>/dev/null || true

# Load environment variables
if [ -f "$PROJECT_DIR/.env.production" ]; then
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
elif [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

export NODE_ENV=production
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://a.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://acoustic.uz}
export NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED:-1}

# Build frontend
echo -e "${BLUE}   Running Next.js build...${NC}"
sudo -u acoustic pnpm build || {
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
}

# Check if build succeeded
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Frontend build failed: .next directory not found${NC}"
    exit 1
fi

# Fix permissions after build
echo -e "${BLUE}   Fixing permissions...${NC}"
sudo chown -R acoustic:acoustic .next
sudo chmod -R 755 .next
sudo -u acoustic touch .next/trace 2>/dev/null || true
sudo chown acoustic:acoustic .next/trace 2>/dev/null || true

echo -e "${GREEN}✅ Frontend built successfully${NC}"

# 12. Restart frontend PM2
echo ""
echo -e "${BLUE}1️⃣2️⃣ Restarting frontend PM2 process...${NC}"
cd "$PROJECT_DIR"
pm2 restart acoustic-frontend || pm2 start acoustic-frontend
sleep 2
pm2 status acoustic-frontend | grep acoustic-frontend || echo -e "${YELLOW}⚠️  Frontend PM2 status check failed${NC}"
echo -e "${GREEN}✅ Frontend restarted${NC}"

# 13. Build admin panel
echo ""
echo -e "${BLUE}1️⃣3️⃣ Building admin panel...${NC}"
cd "$PROJECT_DIR/apps/admin"

# Set environment variables
export VITE_API_URL="https://a.acoustic.uz/api"
export VITE_FRONTEND_URL="https://acoustic.uz"

# Remove old dist
if [ -d "dist" ]; then
    echo -e "${BLUE}   Removing old dist directory...${NC}"
    sudo -u acoustic rm -rf dist
fi

# Build admin panel
echo -e "${BLUE}   Running Vite build...${NC}"
sudo -u acoustic pnpm build || {
    echo -e "${RED}❌ Admin panel build failed!${NC}"
    exit 1
}

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Admin panel build failed: dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Admin panel built successfully${NC}"

# 14. Copy admin dist to Nginx root
echo ""
echo -e "${BLUE}1️⃣4️⃣ Deploying admin panel to Nginx...${NC}"
NGINX_ROOT="/var/www/acoustic.uz/apps/admin/dist"
ADMIN_DIST="$PROJECT_DIR/apps/admin/dist"

if [ "$ADMIN_DIST" != "$NGINX_ROOT" ]; then
    echo -e "${BLUE}   Removing old Nginx root...${NC}"
    sudo rm -rf "$NGINX_ROOT"
    sudo mkdir -p "$(dirname "$NGINX_ROOT")"
    
    echo -e "${BLUE}   Copying dist to Nginx root...${NC}"
    sudo cp -r "$ADMIN_DIST" "$(dirname "$NGINX_ROOT")/"
    
    # Fix permissions
    sudo chown -R www-data:www-data "$NGINX_ROOT"
    sudo chmod -R 755 "$NGINX_ROOT"
    
    echo -e "${GREEN}✅ Admin panel deployed${NC}"
else
    echo -e "${YELLOW}⚠️  Source and destination are the same - no copy needed${NC}"
fi

# 15. Reload Nginx
echo ""
echo -e "${BLUE}1️⃣5️⃣ Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx || {
    echo -e "${RED}❌ Nginx reload failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# 16. Show final status
echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Deployment Complete!               ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

echo -e "${GREEN}📋 PM2 Status:${NC}"
pm2 status

echo ""
echo -e "${GREEN}📋 Services:${NC}"
echo "  • Frontend: https://acoustic.uz"
echo "  • Backend API: https://a.acoustic.uz/api"
echo "  • Admin Panel: https://admin.acoustic.uz"

echo ""
echo -e "${GREEN}📋 Useful commands:${NC}"
echo "  • Check backend logs: pm2 logs acoustic-backend --lines 50"
echo "  • Check frontend logs: pm2 logs acoustic-frontend --lines 50"
echo "  • Check PM2 status: pm2 status"
echo "  • Check Nginx logs: sudo tail -50 /var/log/nginx/error.log"

echo ""
echo -e "${GREEN}✅ All done!${NC}"

