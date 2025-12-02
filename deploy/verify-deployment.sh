#!/bin/bash

# Verification script to check deployment
# This script checks that only acoustic.uz domains are configured

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying Acoustic.uz deployment...${NC}"
echo ""

# Check nginx config
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz"
DOMAINS=("news.acoustic.uz" "api.acoustic.uz" "admins.acoustic.uz")

if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${GREEN}✅ Nginx config file exists${NC}"
    
    # Check each domain
    for domain in "${DOMAINS[@]}"; do
        if grep -q "server_name $domain" "$NGINX_CONFIG"; then
            echo -e "${GREEN}✅ $domain configured${NC}"
        else
            echo -e "${RED}❌ $domain NOT found in config${NC}"
        fi
    done
    
    # Check that no other domains are accidentally included
    echo ""
    echo -e "${BLUE}Checking for other domains in config...${NC}"
    OTHER_DOMAINS=$(grep -oP 'server_name \K[^;]+' "$NGINX_CONFIG" | grep -v "acoustic.uz" || true)
    if [ -z "$OTHER_DOMAINS" ]; then
        echo -e "${GREEN}✅ No other domains found in config${NC}"
    else
        echo -e "${YELLOW}⚠️  Found other domains: $OTHER_DOMAINS${NC}"
    fi
else
    echo -e "${RED}❌ Nginx config file not found${NC}"
fi

# Check PM2
echo ""
echo -e "${BLUE}Checking PM2 processes...${NC}"
if pm2 list | grep -q "acoustic"; then
    echo -e "${GREEN}✅ PM2 processes running${NC}"
    pm2 list | grep acoustic
else
    echo -e "${RED}❌ No PM2 processes found${NC}"
fi

# Check ports
echo ""
echo -e "${BLUE}Checking ports...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000 (Frontend) is listening${NC}"
else
    echo -e "${RED}❌ Port 3000 is not listening${NC}"
fi

if netstat -tuln 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✅ Port 3001 (Backend) is listening${NC}"
else
    echo -e "${RED}❌ Port 3001 is not listening${NC}"
fi

# Check directories
echo ""
echo -e "${BLUE}Checking directories...${NC}"
if [ -d "/var/www/news.acoustic.uz" ]; then
    echo -e "${GREEN}✅ Project directory exists${NC}"
else
    echo -e "${RED}❌ Project directory not found${NC}"
fi

if [ -d "/var/www/admins.acoustic.uz/dist" ]; then
    echo -e "${GREEN}✅ Admin directory exists${NC}"
else
    echo -e "${RED}❌ Admin directory not found${NC}"
fi

# Check nginx is not affecting other sites
echo ""
echo -e "${BLUE}Checking other nginx sites...${NC}"
OTHER_SITES=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "acoustic-uz" | grep -v "default" || true)
if [ -n "$OTHER_SITES" ]; then
    echo -e "${GREEN}✅ Other nginx sites found (not affected):${NC}"
    echo "$OTHER_SITES"
else
    echo -e "${YELLOW}⚠️  No other nginx sites found${NC}"
fi

echo ""
echo -e "${BLUE}✅ Verification complete${NC}"


