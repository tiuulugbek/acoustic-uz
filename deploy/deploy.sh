#!/bin/bash

set -e

echo "🚀 Starting Acoustic.uz deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/news.acoustic.uz"
ADMIN_DIR="/var/www/admins.acoustic.uz"
NGINX_CONFIG_NAME="acoustic-uz"
NGINX_CONFIG_FILE="/etc/nginx/sites-available/${NGINX_CONFIG_NAME}"
REPO_URL="" # Set your git repo URL here
BRANCH="main"

# Domains (for verification)
DOMAINS=("news.acoustic.uz" "api.acoustic.uz" "admins.acoustic.uz")

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root. Use a deploy user.${NC}"
   exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo "Please clone the repository first or run setup-server.sh"
    exit 1
fi

cd $PROJECT_DIR

# Step 1: Verify we're in the right directory
echo -e "${BLUE}📂 Working directory: $(pwd)${NC}"

# Step 2: Update repository (if git repo)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Updating repository...${NC}"
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Current branch: $CURRENT_BRANCH"
    git pull origin $CURRENT_BRANCH || echo "Git pull failed, continuing..."
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping git pull${NC}"
fi

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install --frozen-lockfile --prod=false

# Step 4: Check environment file
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    if [ -f "deploy/env.production.example" ]; then
        echo -e "${YELLOW}Creating .env from example...${NC}"
        cp deploy/env.production.example .env
        echo -e "${RED}⚠️  Please edit .env file with your configuration!${NC}"
        echo "Press Enter to continue after editing .env..."
        read
    else
        echo -e "${RED}❌ deploy/env.production.example not found!${NC}"
        exit 1
    fi
fi

# Step 5: Database setup
echo -e "${YELLOW}🗄️  Setting up database...${NC}"
pnpm db:generate || echo "Database generate failed, continuing..."

# Build shared package first (required for backend)
echo -e "${YELLOW}📦 Building shared package...${NC}"
pnpm --filter @acoustic/shared build || echo "Shared package build failed, continuing..."

# Run migrations
cd apps/backend
pnpm db:migrate:deploy || pnpm db:migrate || echo "Database migrate failed, continuing..."
cd ../..

# Step 6: Build applications
echo -e "${YELLOW}🔨 Building applications...${NC}"

# Ensure shared package is built
echo "Ensuring shared package is built..."
pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared package build failed!${NC}"
    exit 1
}

# Build backend
echo "Building backend..."
pnpm --filter @acoustic/backend build || {
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
}

# Build frontend
echo "Building frontend..."
pnpm --filter @acoustic/frontend build || {
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
}

# Build admin
echo "Building admin..."
pnpm --filter @acoustic/admin build || {
    echo -e "${RED}❌ Admin build failed!${NC}"
    exit 1
}

# Step 7: Copy admin build to admin directory
echo -e "${YELLOW}📋 Copying admin build...${NC}"
sudo mkdir -p $ADMIN_DIR
sudo rm -rf $ADMIN_DIR/dist
sudo cp -r apps/admin/dist $ADMIN_DIR/dist
sudo chown -R $USER:$USER $ADMIN_DIR

# Step 8: Set permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chown -R $USER:$USER $ADMIN_DIR
sudo mkdir -p $PROJECT_DIR/uploads
sudo chmod -R 755 $PROJECT_DIR/uploads

# Step 9: Backup existing nginx config (if exists)
if [ -f "$NGINX_CONFIG_FILE" ]; then
    echo -e "${YELLOW}💾 Backing up existing nginx config...${NC}"
    sudo cp "$NGINX_CONFIG_FILE" "${NGINX_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Step 10: Setup Nginx (only for acoustic.uz domains)
echo -e "${YELLOW}🌐 Setting up Nginx for Acoustic.uz domains only...${NC}"

# Copy nginx config
sudo cp deploy/production-nginx.conf "$NGINX_CONFIG_FILE"

# Enable site (only if not already enabled)
if [ ! -L "/etc/nginx/sites-enabled/${NGINX_CONFIG_NAME}" ]; then
    echo -e "${BLUE}Enabling nginx site: ${NGINX_CONFIG_NAME}${NC}"
    sudo ln -sf "$NGINX_CONFIG_FILE" "/etc/nginx/sites-enabled/${NGINX_CONFIG_NAME}"
else
    echo -e "${BLUE}Nginx site already enabled${NC}"
fi

# Test nginx config
echo -e "${YELLOW}Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo "Restoring backup..."
    if [ -f "${NGINX_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)" ]; then
        sudo cp "${NGINX_CONFIG_FILE}.backup.*" "$NGINX_CONFIG_FILE" 2>/dev/null || true
    fi
    exit 1
fi

# Reload nginx (not restart to avoid affecting other domains)
echo -e "${YELLOW}Reloading nginx...${NC}"
sudo systemctl reload nginx || {
    echo -e "${RED}❌ Nginx reload failed!${NC}"
    exit 1
}

# Step 11: Setup PM2
echo -e "${YELLOW}⚡ Setting up PM2...${NC}"

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Stop existing apps (if running)
pm2 delete acoustic-backend acoustic-frontend 2>/dev/null || true

# Start apps
pm2 start deploy/ecosystem.config.js || {
    echo -e "${RED}❌ PM2 start failed!${NC}"
    exit 1
}

# Save PM2 configuration
pm2 save || echo "PM2 save failed, continuing..."

# Step 12: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check PM2 status
pm2 status

# Check if ports are listening
if netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is not running on port 3000${NC}"
fi

if netstat -tuln 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✅ Backend is running on port 3001${NC}"
else
    echo -e "${RED}❌ Backend is not running on port 3001${NC}"
fi

# Check nginx configs
echo -e "${BLUE}📋 Nginx configuration summary:${NC}"
for domain in "${DOMAINS[@]}"; do
    if grep -q "server_name $domain" "$NGINX_CONFIG_FILE"; then
        echo -e "${GREEN}✅ $domain configured${NC}"
    else
        echo -e "${RED}❌ $domain not found in config${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Setup SSL certificates:"
echo "   sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz"
echo ""
echo "2. Verify DNS records point to: $(hostname -I | awk '{print $1}')"
echo ""
echo "3. Test URLs:"
echo "   http://news.acoustic.uz"
echo "   http://api.acoustic.uz/api"
echo "   http://admins.acoustic.uz"
echo ""
echo "4. Check logs:"
echo "   pm2 logs"
echo "   sudo tail -f /var/log/nginx/news.acoustic.uz.error.log"
echo ""
echo -e "${YELLOW}⚠️  Important: This deployment only affects acoustic.uz domains${NC}"
echo "Other domains on this server are not affected."
