#!/bin/bash

set -e

echo "🔧 Setting up server for Acoustic.uz deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${BLUE}This setup will install required packages for Acoustic.uz${NC}"
echo -e "${BLUE}It will NOT affect existing domains or configurations${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js already installed: $NODE_VERSION${NC}"
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm...${NC}"
    npm install -g pnpm@8.15.0
else
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✅ pnpm already installed: $PNPM_VERSION${NC}"
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PostgreSQL...${NC}"
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo -e "${GREEN}✅ PostgreSQL already installed${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
    echo -e "${BLUE}⚠️  Existing nginx configurations will be preserved${NC}"
fi

# Install Certbot (SSL)
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    apt-get install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

# Install Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Git...${NC}"
    apt-get install -y git
else
    echo -e "${GREEN}✅ Git already installed${NC}"
fi

# Install build tools
echo -e "${YELLOW}📦 Installing build tools...${NC}"
apt-get install -y build-essential python3

# Create deploy user (if doesn't exist)
if id "deploy" &>/dev/null; then
    echo -e "${GREEN}✅ User 'deploy' already exists${NC}"
else
    echo -e "${YELLOW}👤 Creating deploy user...${NC}"
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    
    # Setup SSH key (if exists)
    if [ -d "/root/.ssh" ]; then
        mkdir -p /home/deploy/.ssh
        cp /root/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
        chown -R deploy:deploy /home/deploy/.ssh
        chmod 700 /home/deploy/.ssh
        chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Deploy user created${NC}"
fi

# Setup PostgreSQL (only if database doesn't exist)
echo -e "${YELLOW}🗄️  Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF || echo "Database might already exist"
-- Create database
CREATE DATABASE acoustic;

-- Create user (change password!)
CREATE USER acoustic WITH PASSWORD 'CHANGE_THIS_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;

-- Exit
\q
EOF

echo -e "${RED}⚠️  IMPORTANT: Change PostgreSQL password!${NC}"
echo "Run: sudo -u postgres psql"
echo "Then: ALTER USER acoustic WITH PASSWORD 'YOUR_STRONG_PASSWORD';"

# Setup firewall (only if not already configured)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    # Check if ports are already allowed
    if ! ufw status | grep -q "80/tcp"; then
        ufw allow 80/tcp
    fi
    if ! ufw status | grep -q "443/tcp"; then
        ufw allow 443/tcp
    fi
    if ! ufw status | grep -q "22/tcp"; then
        ufw allow 22/tcp
    fi
    ufw --force enable || echo "UFW might already be enabled"
else
    echo -e "${YELLOW}UFW not installed, skipping firewall setup${NC}"
fi

# Create directories (only for acoustic.uz)
echo -e "${YELLOW}📁 Creating directories for Acoustic.uz...${NC}"
mkdir -p /var/www/news.acoustic.uz
mkdir -p /var/www/admins.acoustic.uz
mkdir -p /var/log/pm2
chown -R deploy:deploy /var/www/news.acoustic.uz
chown -R deploy:deploy /var/www/admins.acoustic.uz
chown -R deploy:deploy /var/log/pm2

# Setup PM2 startup (for deploy user)
echo -e "${YELLOW}⚡ Setting up PM2 startup...${NC}"
sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy || echo "PM2 startup might already be configured"

echo ""
echo -e "${GREEN}✅ Server setup completed!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Change PostgreSQL password:"
echo "   sudo -u postgres psql"
echo "   ALTER USER acoustic WITH PASSWORD 'YOUR_STRONG_PASSWORD';"
echo ""
echo "2. Switch to deploy user:"
echo "   su - deploy"
echo ""
echo "3. Clone repository:"
echo "   cd /var/www"
echo "   git clone <your-repo-url> news.acoustic.uz"
echo ""
echo "4. Run deployment:"
echo "   cd news.acoustic.uz"
echo "   ./deploy/deploy.sh"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- This setup does NOT modify existing nginx configurations"
echo "- Only acoustic.uz domains will be configured"
echo "- Other domains on this server remain unaffected"
echo ""
echo -e "${BLUE}📋 DNS Records needed:${NC}"
echo "news.acoustic.uz    → $(hostname -I | awk '{print $1}')"
echo "api.acoustic.uz     → $(hostname -I | awk '{print $1}')"
echo "admins.acoustic.uz  → $(hostname -I | awk '{print $1}')"
