#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Creating Migration for Int IDs${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

# 1. Load environment variables
echo -e "${BLUE}1️⃣ Loading environment variables...${NC}"
cd "$PROJECT_DIR"
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ Error: .env file not found in $PROJECT_DIR${NC}"
    exit 1
fi

# 2. Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
echo ""

# 3. Navigate to backend directory
echo -e "${BLUE}2️⃣ Navigating to backend directory...${NC}"
cd "$BACKEND_DIR"
echo -e "${GREEN}✅ Current directory: $(pwd)${NC}"
echo ""

# 4. Create migration
echo -e "${BLUE}3️⃣ Creating migration...${NC}"
echo -e "${YELLOW}⚠️  WARNING: This will create a migration that may drop all existing data!${NC}"
echo -e "${YELLOW}⚠️  Make sure you have a backup before proceeding!${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Migration creation cancelled${NC}"
    exit 1
fi

sudo -u acoustic npx prisma migrate dev --name change_ids_to_int --create-only

echo ""
echo -e "${GREEN}✅ Migration created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the migration file in: prisma/migrations/"
echo "2. If migration looks correct, apply it with:"
echo "   cd $BACKEND_DIR"
echo "   sudo -u acoustic npx prisma migrate deploy"
echo "3. Generate Prisma Client:"
echo "   sudo -u acoustic npx prisma generate"
