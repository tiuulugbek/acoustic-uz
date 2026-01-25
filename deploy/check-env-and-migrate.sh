#!/bin/bash
# Check environment variables and run migration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${BLUE}🔍 Checking environment variables...${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env file not found at: $ENV_FILE${NC}"
    echo ""
    echo -e "${YELLOW}Please create .env file with DATABASE_URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    echo -e "${RED}❌ DATABASE_URL not found in .env file${NC}"
    echo ""
    echo -e "${YELLOW}Please add DATABASE_URL to .env file${NC}"
    echo "Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL found in .env file${NC}"

# Source .env file to load variables
set -a
source "$ENV_FILE"
set +a

# Check if DATABASE_URL is actually set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is empty after loading .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL loaded successfully${NC}"
echo ""

# Run migration
echo -e "${BLUE}🔄 Running migration...${NC}"
cd "$PROJECT_DIR/apps/backend"

# Generate Prisma Client
echo -e "${BLUE}📋 Step 1: Generating Prisma Client...${NC}"
pnpm db:generate || {
    echo -e "${RED}❌ Prisma Client generation failed${NC}"
    exit 1
}

# Run migration
echo -e "${BLUE}📋 Step 2: Running migration...${NC}"
pnpm db:migrate || {
    echo -e "${YELLOW}⚠️  Migration dev failed, trying migrate deploy...${NC}"
    pnpm db:migrate:deploy || {
        echo -e "${RED}❌ Migration failed${NC}"
        exit 1
    }
}

echo ""
echo -e "${GREEN}✅ Migration completed successfully!${NC}"

