#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Fix Prisma Permissions${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

cd "$BACKEND_DIR"

echo -e "${BLUE}1️⃣ Fixing node_modules permissions...${NC}"
sudo chown -R acoustic:acoustic "$PROJECT_DIR/node_modules" 2>/dev/null || true

echo -e "${BLUE}2️⃣ Fixing .prisma directory permissions...${NC}"
sudo chown -R acoustic:acoustic "$PROJECT_DIR/node_modules/.pnpm" 2>/dev/null || true
sudo chown -R acoustic:acoustic "$BACKEND_DIR/node_modules/.prisma" 2>/dev/null || true

echo -e "${BLUE}3️⃣ Generating Prisma Client...${NC}"
cd "$BACKEND_DIR"
sudo -u acoustic npx prisma generate

echo ""
echo -e "${GREEN}✅ Prisma Client generated successfully!${NC}"
