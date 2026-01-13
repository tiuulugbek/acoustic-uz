#!/bin/bash

# Nginx Configuration Setup Script
# Bu script Nginx konfiguratsiyasini yaratadi va sozlaydi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Nginx Configuration Setup${NC}"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

# Get domain information
read -p "Enter main domain (default: acoustic.uz): " MAIN_DOMAIN
read -p "Enter admin domain (default: admin.acoustic.uz): " ADMIN_DOMAIN
read -p "Enter API domain (default: a.acoustic.uz): " API_DOMAIN

# Set defaults
MAIN_DOMAIN=${MAIN_DOMAIN:-acoustic.uz}
ADMIN_DOMAIN=${ADMIN_DOMAIN:-admin.acoustic.uz}
API_DOMAIN=${API_DOMAIN:-a.acoustic.uz}

APP_DIR="/var/www/acoustic.uz"
NGINX_DIR="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo ""
echo -e "${BLUE}📋 Nginx Configuration:${NC}"
echo "  Main: $MAIN_DOMAIN"
echo "  Admin: $ADMIN_DOMAIN"
echo "  API: $API_DOMAIN"
echo ""

# Create main domain config
echo -e "${BLUE}1️⃣ Creating main domain config...${NC}"
cat > "$NGINX_DIR/$MAIN_DOMAIN" << EOF
# Frontend (Next.js)
server {
    listen 80;
    listen [::]:80;
    server_name $MAIN_DOMAIN www.$MAIN_DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $MAIN_DOMAIN www.$MAIN_DOMAIN;

    # SSL will be configured by Certbot
    # ssl_certificate /etc/letsencrypt/live/$MAIN_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$MAIN_DOMAIN/privkey.pem;

    # Root directory
    root $APP_DIR/apps/frontend;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Next.js static files
    location /_next/static/ {
        alias $APP_DIR/apps/frontend/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /favicon.ico {
        alias $APP_DIR/apps/frontend/public/favicon.ico;
        expires 30d;
        access_log off;
    }

    # Robots.txt and sitemap
    location ~ ^/(robots\.txt|sitemap\.xml) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # Main application
    location / {
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
EOF
echo -e "${GREEN}✅ Main domain config created${NC}"

# Create admin domain config
echo ""
echo -e "${BLUE}2️⃣ Creating admin domain config...${NC}"
cat > "$NGINX_DIR/$ADMIN_DOMAIN" << EOF
# Admin Panel (Static)
server {
    listen 80;
    listen [::]:80;
    server_name $ADMIN_DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $ADMIN_DOMAIN;

    # SSL will be configured by Certbot
    # ssl_certificate /etc/letsencrypt/live/$ADMIN_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$ADMIN_DOMAIN/privkey.pem;

    root $APP_DIR/apps/admin/dist;
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

    # Static assets
    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
echo -e "${GREEN}✅ Admin domain config created${NC}"

# Create API domain config
echo ""
echo -e "${BLUE}3️⃣ Creating API domain config...${NC}"
cat > "$NGINX_DIR/$API_DOMAIN" << EOF
# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name $API_DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $API_DOMAIN;

    # SSL will be configured by Certbot
    # ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Uploads
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # API
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeouts for large uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF
echo -e "${GREEN}✅ API domain config created${NC}"

# Enable sites
echo ""
echo -e "${BLUE}4️⃣ Enabling sites...${NC}"
ln -sf "$NGINX_DIR/$MAIN_DOMAIN" "$NGINX_ENABLED/$MAIN_DOMAIN"
ln -sf "$NGINX_DIR/$ADMIN_DOMAIN" "$NGINX_ENABLED/$ADMIN_DOMAIN"
ln -sf "$NGINX_DIR/$API_DOMAIN" "$NGINX_ENABLED/$API_DOMAIN"
echo -e "${GREEN}✅ Sites enabled${NC}"

# Test and reload Nginx
echo ""
echo -e "${BLUE}5️⃣ Testing Nginx configuration...${NC}"
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Nginx configuration complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Setup SSL certificates:"
echo "   sudo certbot --nginx -d $MAIN_DOMAIN -d www.$MAIN_DOMAIN -d $ADMIN_DOMAIN -d $API_DOMAIN"
echo ""
echo "2. Certbot will automatically update Nginx configs with SSL"
echo ""
echo "3. Test websites:"
echo "   curl -I http://$MAIN_DOMAIN"
echo "   curl -I http://$ADMIN_DOMAIN"
echo "   curl -I http://$API_DOMAIN"
echo ""

