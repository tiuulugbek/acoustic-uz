#!/bin/bash
# Script to fix node_modules permissions

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Fixing node_modules Permissions      ${NC}"
echo -e "${BLUE}=======================================${NC}"

PROJECT_DIR="/var/www/acoustic.uz"

# Check if acoustic user exists
if ! id "acoustic" &>/dev/null; then
    echo -e "${RED}❌ User 'acoustic' does not exist${NC}"
    exit 1
fi

# 1. Remove node_modules directories
echo ""
echo -e "${BLUE}1️⃣ Removing node_modules directories...${NC}"
sudo rm -rf "$PROJECT_DIR/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/packages/shared/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/admin/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/backend/node_modules" 2>/dev/null || true
sudo rm -rf "$PROJECT_DIR/apps/frontend/node_modules" 2>/dev/null || true
echo -e "${GREEN}✅ node_modules directories removed${NC}"

# 2. Fix ownership of project directory
echo ""
echo -e "${BLUE}2️⃣ Fixing ownership of project directory...${NC}"
sudo chown -R acoustic:acoustic "$PROJECT_DIR"
echo -e "${GREEN}✅ Ownership set to acoustic:acoustic${NC}"

# 3. Install dependencies as acoustic user
echo ""
echo -e "${BLUE}3️⃣ Installing dependencies as acoustic user...${NC}"
cd "$PROJECT_DIR"
sudo -u acoustic pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 4. Verify ownership
echo ""
echo -e "${BLUE}4️⃣ Verifying ownership...${NC}"
if [ -d "$PROJECT_DIR/node_modules" ]; then
    OWNER=$(stat -c '%U:%G' "$PROJECT_DIR/node_modules")
    if [ "$OWNER" = "acoustic:acoustic" ]; then
        echo -e "${GREEN}✅ node_modules ownership is correct: $OWNER${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules ownership: $OWNER (expected: acoustic:acoustic)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  node_modules directory not found${NC}"
fi

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}✅ Fix Complete!                      ${NC}"
echo -e "${BLUE}=======================================${NC}"

