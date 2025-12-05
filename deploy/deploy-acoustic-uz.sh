#!/bin/bash

# Script to deploy Acoustic.uz to existing server
# Domains: acoustic.uz (frontend), admin.acoustic.uz (admin), a.acoustic.uz (backend)
# IP: 159.69.214.82

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Acoustic.uz - Mavjud Serverga Deploy Qilish${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Variables
PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"
GIT_REPO="https://github.com/tiuulugbek/acoustic-uz.git"
BACKUP_DIR="/root/backups"

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

# Domains
FRONTEND_DOMAIN="acoustic.uz"
ADMIN_DOMAIN="admin.acoustic.uz"
API_DOMAIN="a.acoustic.uz"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Frontend: $FRONTEND_DOMAIN → $PROJECT_DIR"
echo "  Admin: $ADMIN_DOMAIN → $ADMIN_DIR"
echo "  Backend API: $API_DOMAIN → Backend (PM2)"
echo ""

# Step 1: Backup existing directories
echo -e "${YELLOW}📦 Step 1: Creating backups...${NC}"
mkdir -p "$BACKUP_DIR"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}  Backing up $PROJECT_DIR...${NC}"
    tar -czf "$BACKUP_DIR/acoustic.uz-$(date +%Y%m%d_%H%M%S).tar.gz" "$PROJECT_DIR" 2>/dev/null || true
    echo -e "${GREEN}  ✅ Backup created${NC}"
fi

if [ -d "$ADMIN_DIR" ]; then
    echo -e "${YELLOW}  Backing up $ADMIN_DIR...${NC}"
    tar -czf "$BACKUP_DIR/admin.acoustic.uz-$(date +%Y%m%d_%H%M%S).tar.gz" "$ADMIN_DIR" 2>/dev/null || true
    echo -e "${GREEN}  ✅ Backup created${NC}"
fi

echo -e "${GREEN}✅ Step 1 complete!${NC}"
echo ""

# Step 2: Clone or update repository
echo -e "${YELLOW}📦 Step 2: Cloning/updating repository...${NC}"
if [ -d "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${YELLOW}  Updating existing repository...${NC}"
    cd "$PROJECT_DIR"
    # Always update remote URL to correct repository
    echo -e "${YELLOW}  Updating Git remote URL...${NC}"
    if [ -n "$GIT_TOKEN" ]; then
        git remote set-url origin "$GIT_REPO_AUTH"
    else
        git remote set-url origin "$GIT_REPO"
    fi
    # Verify remote URL
    CURRENT_REMOTE=$(git remote get-url origin)
    echo -e "${BLUE}  Current remote: $CURRENT_REMOTE${NC}"
    # Pull latest changes
    git pull origin main
else
    echo -e "${YELLOW}  Cloning repository...${NC}"
    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}  Moving existing directory...${NC}"
        mv "$PROJECT_DIR" "${PROJECT_DIR}.old.$(date +%Y%m%d_%H%M%S)"
    fi
    mkdir -p /var/www
    cd /var/www
    git clone "$GIT_REPO_AUTH" acoustic.uz
    cd "$PROJECT_DIR"
fi

echo -e "${GREEN}✅ Step 2 complete!${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"
cd "$PROJECT_DIR"
pnpm install

echo -e "${GREEN}✅ Step 3 complete!${NC}"
echo ""

# Step 4: Environment variables
echo -e "${YELLOW}🔐 Step 4: Setting up environment variables...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}  Creating .env file...${NC}"
    cp "$PROJECT_DIR/deploy/env.production.example" "$PROJECT_DIR/.env"
    
    # Generate JWT secrets
    JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Read database password
    read -p "  Enter database password for 'acoustic' user: " DB_PASSWORD
    
    # Update .env file
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://acoustic:$DB_PASSWORD@localhost:5432/acoustic|g" "$PROJECT_DIR/.env"
    sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" "$PROJECT_DIR/.env"
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" "$PROJECT_DIR/.env"
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://$FRONTEND_DOMAIN,https://$ADMIN_DOMAIN|g" "$PROJECT_DIR/.env"
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api|g" "$PROJECT_DIR/.env"
    sed -i "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$FRONTEND_DOMAIN|g" "$PROJECT_DIR/.env"
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$API_DOMAIN/api|g" "$PROJECT_DIR/.env"
    sed -i "s|APP_URL=.*|APP_URL=https://$API_DOMAIN|g" "$PROJECT_DIR/.env"
    
    chmod 600 "$PROJECT_DIR/.env"
    echo -e "${GREEN}  ✅ .env file created${NC}"
else
    echo -e "${YELLOW}  .env file already exists, updating domain URLs...${NC}"
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://$FRONTEND_DOMAIN,https://$ADMIN_DOMAIN|g" "$PROJECT_DIR/.env"
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api|g" "$PROJECT_DIR/.env"
    sed -i "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$FRONTEND_DOMAIN|g" "$PROJECT_DIR/.env"
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$API_DOMAIN/api|g" "$PROJECT_DIR/.env"
    sed -i "s|APP_URL=.*|APP_URL=https://$API_DOMAIN|g" "$PROJECT_DIR/.env"
fi

echo -e "${GREEN}✅ Step 4 complete!${NC}"
echo ""

# Step 5: Database migrations
echo -e "${YELLOW}🗄️  Step 5: Running database migrations...${NC}"
cd "$PROJECT_DIR"
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

echo -e "${GREEN}✅ Step 5 complete!${NC}"
echo ""

# Step 6: Build projects
echo -e "${YELLOW}🏗️  Step 6: Building projects...${NC}"

# Shared package
echo -e "${YELLOW}  Building shared package...${NC}"
pnpm --filter @acoustic/shared build

# Backend
echo -e "${YELLOW}  Building backend...${NC}"
pnpm --filter @acoustic/backend build

# Frontend
echo -e "${YELLOW}  Building frontend...${NC}"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://$API_DOMAIN/api"
export NEXT_PUBLIC_SITE_URL="https://$FRONTEND_DOMAIN"
cd apps/frontend
pnpm build
cd "$PROJECT_DIR"

# Admin
echo -e "${YELLOW}  Building admin...${NC}"
export VITE_API_URL="https://$API_DOMAIN/api"
cd apps/admin
pnpm build
cd "$PROJECT_DIR"

echo -e "${GREEN}✅ Step 6 complete!${NC}"
echo ""

# Step 7: Setup directories
echo -e "${YELLOW}📁 Step 7: Setting up directories...${NC}"
mkdir -p "$PROJECT_DIR/apps/backend/uploads"
mkdir -p /var/log/pm2
chmod -R 755 "$PROJECT_DIR/apps/backend/uploads"
chmod -R 755 /var/log/pm2

# Admin directory
echo -e "${YELLOW}  Setting up admin directory...${NC}"
rm -rf "$ADMIN_DIR"
mkdir -p "$ADMIN_DIR"
cp -r "$PROJECT_DIR/apps/admin/dist"/* "$ADMIN_DIR/"
chown -R www-data:www-data "$ADMIN_DIR"
chmod -R 755 "$ADMIN_DIR"

echo -e "${GREEN}✅ Step 7 complete!${NC}"
echo ""

# Step 8: PM2 setup
echo -e "${YELLOW}🚀 Step 8: Setting up PM2...${NC}"
cd "$PROJECT_DIR"
cp deploy/ecosystem.config.js ecosystem.config.js

# Stop existing processes
pm2 stop acoustic-backend acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-backend acoustic-frontend 2>/dev/null || true

# Start processes
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Step 8 complete!${NC}"
echo ""

# Step 9: Nginx configuration
echo -e "${YELLOW}🌐 Step 9: Configuring Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

cat > "$NGINX_CONFIG" <<'NGINX_EOF'
# Acoustic.uz - Frontend (acoustic.uz)
server {
    listen 80;
    listen [::]:80;
    server_name acoustic.uz www.acoustic.uz;
    
    root /var/www/acoustic.uz/apps/frontend/.next/standalone/apps/frontend;
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
        alias /var/www/acoustic.uz/apps/frontend/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Next.js API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        try_files $uri $uri.html $uri/index.html @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# a.acoustic.uz - Backend API
server {
    listen 80;
    listen [::]:80;
    server_name a.acoustic.uz;
    
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Uploads
    location /uploads {
        alias /var/www/acoustic.uz/apps/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Root redirect to /api
    location = / {
        return 301 /api;
    }
}

# admin.acoustic.uz - Admin Panel
server {
    listen 80;
    listen [::]:80;
    server_name admin.acoustic.uz;
    
    root /var/www/admin.acoustic.uz;
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
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

# Enable site
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/acoustic-uz.conf
fi

# Test and reload Nginx
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configured and reloaded!${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Step 9 complete!${NC}"
echo ""

# Summary
echo -e "${GREEN}✅✅✅ Deployment Complete! ✅✅✅${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  - Frontend: https://$FRONTEND_DOMAIN → $PROJECT_DIR"
echo "  - Admin: https://$ADMIN_DOMAIN → $ADMIN_DIR"
echo "  - Backend API: https://$API_DOMAIN → Backend (PM2)"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Setup SSL: certbot --nginx -d $FRONTEND_DOMAIN -d www.$FRONTEND_DOMAIN -d $API_DOMAIN -d $ADMIN_DOMAIN"
echo "  2. Check PM2 status: pm2 list"
echo "  3. Check logs: pm2 logs"
echo "  4. Test websites:"
echo "     - https://$FRONTEND_DOMAIN"
echo "     - https://$ADMIN_DOMAIN"
echo "     - https://$API_DOMAIN/api"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"

