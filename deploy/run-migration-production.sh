#!/bin/bash
# Run migration in production environment
# Uses migrate deploy instead of migrate dev (no shadow database needed)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${BLUE}🔄 Running migration in production mode...${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env file not found at: $ENV_FILE${NC}"
    exit 1
fi

# Source .env file to load variables
set -a
source "$ENV_FILE"
set +a

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

cd "$PROJECT_DIR/apps/backend"

# Generate Prisma Client
echo -e "${BLUE}📋 Step 1: Generating Prisma Client...${NC}"
pnpm db:generate || {
    echo -e "${RED}❌ Prisma Client generation failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Prisma Client generated${NC}"

# Run migration deploy (production mode - no shadow database)
echo -e "${BLUE}📋 Step 2: Running migration deploy (production mode)...${NC}"
echo -e "${YELLOW}Note: Using migrate deploy instead of migrate dev (no shadow database needed)${NC}"
pnpm db:migrate:deploy || {
    echo -e "${RED}❌ Migration deploy failed${NC}"
    echo ""
    echo -e "${YELLOW}If migration fails, you may need to create migration manually:${NC}"
    echo "  1. Create migration file manually"
    echo "  2. Or run SQL directly on database"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Migration completed successfully!${NC}"

# Rebuild backend
echo ""
echo -e "${BLUE}📋 Step 3: Rebuilding backend...${NC}"
cd "$PROJECT_DIR/apps/backend"
pnpm install --frozen-lockfile || pnpm install
pnpm build || {
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Backend built successfully${NC}"

# Restart backend
echo ""
echo -e "${BLUE}📋 Step 4: Restarting backend...${NC}"
pm2 restart acoustic-backend || {
    echo -e "${YELLOW}⚠️  PM2 restart failed, trying start...${NC}"
    pm2 start ecosystem.config.js --only acoustic-backend
}
pm2 save
echo -e "${GREEN}✅ Backend restarted${NC}"

# Rebuild admin panel
echo ""
echo -e "${BLUE}📋 Step 5: Rebuilding admin panel...${NC}"
cd "$PROJECT_DIR/apps/admin"
pnpm install --frozen-lockfile || pnpm install
pnpm build || {
    echo -e "${RED}❌ Admin build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Admin panel built successfully${NC}"

# Rebuild frontend
echo ""
echo -e "${BLUE}📋 Step 6: Rebuilding frontend...${NC}"
cd "$PROJECT_DIR"
bash deploy/optimized-build-frontend.sh || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ All migrations and builds completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Services status:${NC}"
pm2 list | grep -E "(acoustic-backend|acoustic-frontend)" || echo "  No services found"

