#!/bin/bash

# Database Setup Script for Acoustic.uz
# Bu script PostgreSQL database va userni yaratadi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Database Setup${NC}"
echo "=================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

# Get database information
read -p "Enter database name (default: acoustic_db): " DB_NAME
read -p "Enter database user (default: acoustic): " DB_USER
read -p "Enter database password: " -s DB_PASSWORD
echo ""

# Set defaults
DB_NAME=${DB_NAME:-acoustic_db}
DB_USER=${DB_USER:-acoustic}

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Database password is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Database Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Create PostgreSQL user
echo -e "${BLUE}1️⃣ Creating PostgreSQL user...${NC}"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  User already exists, updating password...${NC}"
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
}
echo -e "${GREEN}✅ User created/updated${NC}"

# Create database
echo ""
echo -e "${BLUE}2️⃣ Creating database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Database already exists${NC}"
}
echo -e "${GREEN}✅ Database created${NC}"

# Grant privileges
echo ""
echo -e "${BLUE}3️⃣ Granting privileges...${NC}"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
echo -e "${GREEN}✅ Privileges granted${NC}"

# Create .env file template
echo ""
echo -e "${BLUE}4️⃣ Creating .env file template...${NC}"
APP_DIR="/var/www/acoustic.uz"
ENV_FILE="$APP_DIR/.env"

# Get domain names
read -p "Enter main domain (default: acoustic.uz): " DOMAIN_NAME
read -p "Enter admin domain (default: admin.acoustic.uz): " ADMIN_DOMAIN
read -p "Enter API domain (default: a.acoustic.uz): " API_DOMAIN

DOMAIN_NAME=${DOMAIN_NAME:-acoustic.uz}
ADMIN_DOMAIN=${ADMIN_DOMAIN:-admin.acoustic.uz}
API_DOMAIN=${API_DOMAIN:-a.acoustic.uz}

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists, backing up...${NC}"
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d%H%M%S)"
fi

cat > "$ENV_FILE" << EOF
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"

# Application
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://$DOMAIN_NAME,https://www.$DOMAIN_NAME,https://$ADMIN_DOMAIN,https://$API_DOMAIN

# JWT Secret (generate a secure random string)
JWT_SECRET=$(openssl rand -base64 32)

# Admin
ADMIN_DEFAULT_EMAIL=admin@acoustic.uz
ADMIN_DEFAULT_PASSWORD=ChangeMe123!

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# SMTP (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@acoustic.uz
EOF

chown acoustic:acoustic "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo -e "${GREEN}✅ .env file created: $ENV_FILE${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Update .env file with additional settings:"
echo "   sudo nano $ENV_FILE"
echo ""
echo "2. Run migrations:"
echo "   cd $APP_DIR && sudo -u acoustic pnpm exec prisma migrate deploy"
echo ""
echo "3. Seed database (optional):"
echo "   cd $APP_DIR && sudo -u acoustic pnpm exec prisma db seed"
echo ""

