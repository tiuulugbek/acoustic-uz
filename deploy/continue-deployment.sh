#!/bin/bash

# Script to continue deployment after migrations
# Usage: ./continue-deployment.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo -e "${BLUE}🚀 Continuing Acoustic.uz Deployment...${NC}"
echo ""

# Step 6: Build projects
echo -e "${YELLOW}🏗️  Step 6: Building projects...${NC}"

# Shared package
echo -e "${YELLOW}  Building shared package...${NC}"
cd "$PROJECT_DIR"
pnpm --filter @acoustic/shared build

# Backend
echo -e "${YELLOW}  Building backend...${NC}"
pnpm --filter @acoustic/backend build

# Frontend
echo -e "${YELLOW}  Building frontend...${NC}"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
cd apps/frontend
pnpm build
cd "$PROJECT_DIR"

# Admin
echo -e "${YELLOW}  Building admin...${NC}"
export VITE_API_URL="https://a.acoustic.uz/api"
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

if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}  Creating Nginx configuration...${NC}"
    
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
else
    echo -e "${YELLOW}  Nginx config already exists, skipping...${NC}"
fi

echo -e "${GREEN}✅ Step 9 complete!${NC}"
echo ""

# Summary
echo -e "${GREEN}✅✅✅ Deployment Complete! ✅✅✅${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  - Frontend: https://acoustic.uz → $PROJECT_DIR"
echo "  - Admin: https://admin.acoustic.uz → $ADMIN_DIR"
echo "  - Backend API: https://a.acoustic.uz → Backend (PM2)"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Setup SSL: certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"
echo "  2. Check PM2 status: pm2 list"
echo "  3. Check logs: pm2 logs"
echo "  4. Test websites:"
echo "     - http://acoustic.uz"
echo "     - http://admin.acoustic.uz"
echo "     - http://a.acoustic.uz/api"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"

