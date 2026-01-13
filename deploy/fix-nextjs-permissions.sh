#!/bin/bash
# Script to fix Next.js .next directory permissions

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Fix Next.js Permissions              ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Stop PM2 process first to avoid permission conflicts
echo -e "${BLUE}1️⃣ Stopping PM2 process...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true
echo -e "${GREEN}✅ PM2 process stopped${NC}"

# Fix ownership of entire frontend directory
echo -e "${BLUE}2️⃣ Fixing ownership of frontend directory...${NC}"
chown -R acoustic:acoustic "$FRONTEND_DIR"
echo -e "${GREEN}✅ Ownership fixed${NC}"

# Create .next directory if it doesn't exist
if [ ! -d "$FRONTEND_DIR/.next" ]; then
    echo -e "${BLUE}3️⃣ Creating .next directory...${NC}"
    sudo -u acoustic mkdir -p "$FRONTEND_DIR/.next"
    echo -e "${GREEN}✅ .next directory created${NC}"
fi

# Fix permissions for .next directory
echo -e "${BLUE}4️⃣ Fixing .next directory permissions...${NC}"
chown -R acoustic:acoustic "$FRONTEND_DIR/.next"
chmod -R 755 "$FRONTEND_DIR/.next"
echo -e "${GREEN}✅ .next permissions fixed${NC}"

# Ensure trace file can be written
echo -e "${BLUE}5️⃣ Ensuring trace file permissions...${NC}"
if [ -f "$FRONTEND_DIR/.next/trace" ]; then
    chown acoustic:acoustic "$FRONTEND_DIR/.next/trace"
    chmod 644 "$FRONTEND_DIR/.next/trace"
fi
# Create trace file with correct permissions if it doesn't exist
sudo -u acoustic touch "$FRONTEND_DIR/.next/trace" 2>/dev/null || true
chown acoustic:acoustic "$FRONTEND_DIR/.next/trace" 2>/dev/null || true
chmod 644 "$FRONTEND_DIR/.next/trace" 2>/dev/null || true
echo -e "${GREEN}✅ Trace file permissions fixed${NC}"

# Fix node_modules permissions (if exists)
if [ -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${BLUE}6️⃣ Fixing node_modules permissions...${NC}"
    chown -R acoustic:acoustic "$FRONTEND_DIR/node_modules"
    echo -e "${GREEN}✅ node_modules permissions fixed${NC}"
fi

# Restart PM2 process
echo -e "${BLUE}7️⃣ Restarting PM2 process...${NC}"
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --name acoustic-frontend
pm2 save
echo -e "${GREEN}✅ PM2 process restarted${NC}"

# Check PM2 status
echo -e "${BLUE}8️⃣ Checking PM2 status...${NC}"
pm2 status acoustic-frontend

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Permissions Fixed!                  ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${GREEN}✅ Next.js permissions fixed${NC}"
echo -e "${YELLOW}⚠️  If issues persist, check PM2 logs:${NC}"
echo -e "   pm2 logs acoustic-frontend --lines 50"
echo ""

