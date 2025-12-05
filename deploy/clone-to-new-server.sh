#!/bin/bash

# Script to clone and deploy Acoustic.uz to a new server
# Usage: ./clone-to-new-server.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Acoustic.uz - Yangi Serverga Deploy Qilish${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Variables
PROJECT_DIR="/var/www/news.acoustic.uz"
GIT_REPO="https://github.com/tiuulugbek/acoustic-uz.git"

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
apt-get update
apt-get upgrade -y

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}  Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}  ✅ Node.js already installed: $(node -v)${NC}"
fi

# pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}  Installing pnpm...${NC}"
    npm install -g pnpm@8.15.0
else
    echo -e "${GREEN}  ✅ pnpm already installed: $(pnpm -v)${NC}"
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}  Installing PostgreSQL...${NC}"
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo -e "${GREEN}  ✅ PostgreSQL already installed${NC}"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}  Installing PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}  ✅ PM2 already installed${NC}"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}  Installing Nginx...${NC}"
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${GREEN}  ✅ Nginx already installed${NC}"
fi

# Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}  Installing Git...${NC}"
    apt-get install -y git
else
    echo -e "${GREEN}  ✅ Git already installed${NC}"
fi

# Build tools
echo -e "${YELLOW}  Installing build tools...${NC}"
apt-get install -y build-essential python3

echo -e "${GREEN}✅ Step 1 complete!${NC}"
echo ""

# Step 2: Clone repository
echo -e "${YELLOW}📦 Step 2: Cloning repository...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}  Project directory exists, pulling latest changes...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo -e "${YELLOW}  Cloning repository...${NC}"
    mkdir -p /var/www
    cd /var/www
    git clone "$GIT_REPO" news.acoustic.uz
    cd "$PROJECT_DIR"
fi

echo -e "${GREEN}✅ Step 2 complete!${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing project dependencies...${NC}"
cd "$PROJECT_DIR"
pnpm install

echo -e "${GREEN}✅ Step 3 complete!${NC}"
echo ""

# Step 4: Database setup
echo -e "${YELLOW}🗄️  Step 4: Setting up database...${NC}"
read -p "  Enter database password for 'acoustic' user: " DB_PASSWORD

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE acoustic;
CREATE USER acoustic WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;
\q
EOF

echo -e "${GREEN}✅ Database created!${NC}"
echo ""

# Step 5: Environment variables
echo -e "${YELLOW}🔐 Step 5: Setting up environment variables...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/deploy/env.production.example" "$PROJECT_DIR/.env"
    
    # Generate JWT secrets
    JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env file
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://acoustic:$DB_PASSWORD@localhost:5432/acoustic|g" "$PROJECT_DIR/.env"
    sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" "$PROJECT_DIR/.env"
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" "$PROJECT_DIR/.env"
    
    chmod 600 "$PROJECT_DIR/.env"
    echo -e "${GREEN}✅ .env file created!${NC}"
else
    echo -e "${YELLOW}  .env file already exists, skipping...${NC}"
fi

echo ""

# Step 6: Database migrations
echo -e "${YELLOW}🗄️  Step 6: Running database migrations...${NC}"
cd "$PROJECT_DIR"
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

echo -e "${GREEN}✅ Step 6 complete!${NC}"
echo ""

# Step 7: Build projects
echo -e "${YELLOW}🏗️  Step 7: Building projects...${NC}"

# Shared package
echo -e "${YELLOW}  Building shared package...${NC}"
pnpm --filter @acoustic/shared build

# Backend
echo -e "${YELLOW}  Building backend...${NC}"
pnpm --filter @acoustic/backend build

# Frontend
echo -e "${YELLOW}  Building frontend...${NC}"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://news.acoustic.uz}
cd apps/frontend
pnpm build
cd "$PROJECT_DIR"

# Admin
echo -e "${YELLOW}  Building admin...${NC}"
export VITE_API_URL=${VITE_API_URL:-https://api.acoustic.uz/api}
cd apps/admin
pnpm build
cd "$PROJECT_DIR"

echo -e "${GREEN}✅ Step 7 complete!${NC}"
echo ""

# Step 8: Create directories
echo -e "${YELLOW}📁 Step 8: Creating directories...${NC}"
mkdir -p "$PROJECT_DIR/apps/backend/uploads"
mkdir -p /var/log/pm2
chmod -R 755 "$PROJECT_DIR/apps/backend/uploads"
chmod -R 755 /var/log/pm2

echo -e "${GREEN}✅ Step 8 complete!${NC}"
echo ""

# Step 9: PM2 setup
echo -e "${YELLOW}🚀 Step 9: Setting up PM2...${NC}"
cd "$PROJECT_DIR"
cp deploy/ecosystem.config.js ecosystem.config.js

pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Step 9 complete!${NC}"
echo ""

# Step 10: Nginx setup
echo -e "${YELLOW}🌐 Step 10: Setting up Nginx...${NC}"
if [ ! -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    cp "$PROJECT_DIR/deploy/nginx-acoustic-uz.conf" /etc/nginx/sites-available/acoustic-uz.conf
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
    
    # Remove default nginx config
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx configured!${NC}"
else
    echo -e "${YELLOW}  Nginx config already exists, skipping...${NC}"
fi

echo ""

# Summary
echo -e "${GREEN}✅✅✅ Deployment Complete! ✅✅✅${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  - Project directory: $PROJECT_DIR"
echo "  - Database: acoustic (password: $DB_PASSWORD)"
echo "  - Backend: PM2 (acoustic-backend)"
echo "  - Frontend: PM2 (acoustic-frontend)"
echo "  - Nginx: Configured"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Edit .env file: nano $PROJECT_DIR/.env"
echo "  2. Update domain names in Nginx config: nano /etc/nginx/sites-available/acoustic-uz.conf"
echo "  3. Setup SSL: certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz"
echo "  4. Check PM2 status: pm2 list"
echo "  5. Check logs: pm2 logs"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"

