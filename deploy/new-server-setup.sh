#!/bin/bash

# New Server Setup Script for Acoustic.uz
# Bu script yangi serverga barcha kerakli komponentlarni o'rnatadi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Acoustic.uz - Yangi Server Setup${NC}"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

# Get server information
read -p "Enter server IP or hostname: " SERVER_IP
read -p "Enter domain name (e.g., acoustic.uz): " DOMAIN_NAME
read -p "Enter admin domain (e.g., admin.acoustic.uz): " ADMIN_DOMAIN
read -p "Enter API domain (e.g., a.acoustic.uz): " API_DOMAIN

# Set default values if empty
DOMAIN_NAME=${DOMAIN_NAME:-acoustic.uz}
ADMIN_DOMAIN=${ADMIN_DOMAIN:-admin.acoustic.uz}
API_DOMAIN=${API_DOMAIN:-a.acoustic.uz}

echo ""
echo -e "${BLUE}📋 Server Configuration:${NC}"
echo "  Domain: $DOMAIN_NAME"
echo "  Admin: $ADMIN_DOMAIN"
echo "  API: $API_DOMAIN"
echo ""
read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 1
fi

# Update system
echo ""
echo -e "${BLUE}1️⃣ Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential software-properties-common

# Set timezone
echo ""
echo -e "${BLUE}2️⃣ Setting timezone...${NC}"
timedatectl set-timezone Asia/Tashkent

# Create application user
echo ""
echo -e "${BLUE}3️⃣ Creating application user...${NC}"
if ! id "acoustic" &>/dev/null; then
    useradd -m -s /bin/bash acoustic
    usermod -aG sudo acoustic
    echo -e "${GREEN}✅ User 'acoustic' created${NC}"
else
    echo -e "${YELLOW}⚠️  User 'acoustic' already exists${NC}"
fi

# Install Node.js (LTS version)
echo ""
echo -e "${BLUE}4️⃣ Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js already installed: $(node --version)${NC}"
fi

# Install pnpm
echo ""
echo -e "${BLUE}5️⃣ Installing pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@8.15.0
    echo -e "${GREEN}✅ pnpm installed: $(pnpm --version)${NC}"
else
    echo -e "${YELLOW}⚠️  pnpm already installed: $(pnpm --version)${NC}"
fi

# Install PostgreSQL
echo ""
echo -e "${BLUE}6️⃣ Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    echo -e "${GREEN}✅ PostgreSQL installed${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL already installed${NC}"
fi

# Install Nginx
echo ""
echo -e "${BLUE}7️⃣ Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx already installed${NC}"
fi

# Install PM2
echo ""
echo -e "${BLUE}8️⃣ Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u acoustic --hp /home/acoustic
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 already installed${NC}"
fi

# Install Certbot for SSL
echo ""
echo -e "${BLUE}9️⃣ Installing Certbot (SSL)...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed${NC}"
else
    echo -e "${YELLOW}⚠️  Certbot already installed${NC}"
fi

# Configure firewall
echo ""
echo -e "${BLUE}🔟 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not found, skipping firewall setup${NC}"
fi

# Create application directory
echo ""
echo -e "${BLUE}1️⃣1️⃣ Creating application directory...${NC}"
APP_DIR="/var/www/acoustic.uz"
mkdir -p "$APP_DIR"
chown -R acoustic:acoustic "$APP_DIR"
echo -e "${GREEN}✅ Application directory created: $APP_DIR${NC}"

# Create uploads directory
echo ""
echo -e "${BLUE}1️⃣2️⃣ Creating uploads directory...${NC}"
UPLOADS_DIR="/var/www/acoustic.uz/uploads"
mkdir -p "$UPLOADS_DIR"
chown -R acoustic:acoustic "$UPLOADS_DIR"
chmod -R 755 "$UPLOADS_DIR"
echo -e "${GREEN}✅ Uploads directory created: $UPLOADS_DIR${NC}"

# Create logs directory
echo ""
echo -e "${BLUE}1️⃣3️⃣ Creating logs directory...${NC}"
LOGS_DIR="/var/log/acoustic"
mkdir -p "$LOGS_DIR"
chown -R acoustic:acoustic "$LOGS_DIR"
echo -e "${GREEN}✅ Logs directory created: $LOGS_DIR${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Clone repository:"
echo "   sudo -u acoustic git clone https://github.com/tiuulugbek/acoustic-uz.git $APP_DIR"
echo ""
echo "2. Setup database:"
echo "   sudo -u postgres createuser -P acoustic"
echo "   sudo -u postgres createdb -O acoustic acoustic_db"
echo ""
echo "3. Configure environment variables:"
echo "   Edit $APP_DIR/.env files"
echo ""
echo "4. Run migrations:"
echo "   cd $APP_DIR && sudo -u acoustic pnpm exec prisma migrate deploy"
echo ""
echo "5. Build and start services:"
echo "   bash deploy/deploy-to-new-server.sh"
echo ""
echo "6. Setup SSL:"
echo "   sudo certbot --nginx -d $DOMAIN_NAME -d $ADMIN_DOMAIN -d $API_DOMAIN"
echo ""

