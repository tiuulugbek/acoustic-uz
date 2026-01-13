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

# GitHub token (from environment or prompt)
if [ -z "$GIT_TOKEN" ]; then
    read -sp "  Enter GitHub Personal Access Token (or press Enter to skip): " GIT_TOKEN
    echo ""
fi

# Use authenticated URL if token provided
if [ -n "$GIT_TOKEN" ]; then
    GIT_REPO_AUTH="https://${GIT_TOKEN}@github.com/tiuulugbek/acoustic-uz.git"
else
    GIT_REPO_AUTH="$GIT_REPO"
fi

# Domain configuration (CHANGE THESE!)
NEWS_DOMAIN="news.acoustic.uz"
API_DOMAIN="api.acoustic.uz"
ADMIN_DOMAIN="admins.acoustic.uz"

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
    git clone "$GIT_REPO_AUTH" news.acoustic.uz
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
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://$API_DOMAIN/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://$NEWS_DOMAIN}
cd apps/frontend
pnpm build
cd "$PROJECT_DIR"

# Admin
echo -e "${YELLOW}  Building admin...${NC}"
export VITE_API_URL=${VITE_API_URL:-https://$API_DOMAIN/api}
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
echo -e "${BLUE}  ⚠️  IMPORTANT: This will NOT modify existing Nginx configurations${NC}"
echo -e "${BLUE}  ⚠️  Only adding new server blocks for: $NEWS_DOMAIN, $API_DOMAIN, $ADMIN_DOMAIN${NC}"
echo ""

read -p "  Enter NEWS domain (default: $NEWS_DOMAIN): " INPUT_NEWS_DOMAIN
NEWS_DOMAIN=${INPUT_NEWS_DOMAIN:-$NEWS_DOMAIN}

read -p "  Enter API domain (default: $API_DOMAIN): " INPUT_API_DOMAIN
API_DOMAIN=${INPUT_API_DOMAIN:-$API_DOMAIN}

read -p "  Enter ADMIN domain (default: $ADMIN_DOMAIN): " INPUT_ADMIN_DOMAIN
ADMIN_DOMAIN=${INPUT_ADMIN_DOMAIN:-$ADMIN_DOMAIN}

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}  Creating Nginx configuration...${NC}"
    
    # Create config file with domain variables
    cat > "$NGINX_CONFIG" <<EOF
# Acoustic.uz Nginx Configuration
# This config does NOT interfere with existing server blocks

# News domain (Frontend)
server {
    listen 80;
    listen [::]:80;
    server_name $NEWS_DOMAIN;
    
    root /var/www/news.acoustic.uz/apps/frontend/.next/standalone/apps/frontend;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Static files caching
    location /_next/static {
        alias /var/www/news.acoustic.uz/apps/frontend/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Next.js API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Main application
    location / {
        try_files \$uri \$uri.html \$uri/index.html @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# API domain (Backend)
server {
    listen 80;
    listen [::]:80;
    server_name $API_DOMAIN;
    
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Uploads
    location /uploads {
        alias /var/www/news.acoustic.uz/apps/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Root redirect to /api
    location = / {
        return 301 /api;
    }
}

# Admin domain (Admin Panel)
server {
    listen 80;
    listen [::]:80;
    server_name $ADMIN_DOMAIN;
    
    root /var/www/news.acoustic.uz/apps/admin/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache busting for index.html and version.json
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    location = /version.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    # Enable site (only if not already enabled)
    if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
        ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/acoustic-uz.conf
        echo -e "${GREEN}  ✅ Nginx config enabled${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Nginx config already enabled${NC}"
    fi
    
    # Test Nginx config
    echo -e "${YELLOW}  Testing Nginx configuration...${NC}"
    if nginx -t; then
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx configured and reloaded!${NC}"
    else
        echo -e "${RED}❌ Nginx configuration test failed!${NC}"
        echo -e "${YELLOW}  Please check the configuration manually${NC}"
    fi
else
    echo -e "${YELLOW}  Nginx config already exists at $NGINX_CONFIG${NC}"
    echo -e "${YELLOW}  Skipping Nginx setup...${NC}"
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
echo "     - Update CORS_ORIGIN with your domains"
echo "     - Update NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, VITE_API_URL"
echo "  2. Update domain names in Nginx config (if needed): nano /etc/nginx/sites-available/acoustic-uz.conf"
echo "  3. Setup SSL: certbot --nginx -d $NEWS_DOMAIN -d $API_DOMAIN -d $ADMIN_DOMAIN"
echo "  4. Check PM2 status: pm2 list"
echo "  5. Check logs: pm2 logs"
echo ""
echo -e "${BLUE}📋 Configured domains:${NC}"
echo "  - News (Frontend): $NEWS_DOMAIN"
echo "  - API (Backend): $API_DOMAIN"
echo "  - Admin: $ADMIN_DOMAIN"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"

