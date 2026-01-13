#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Create Safe Int ID Migration${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

# Load environment variables
cd "$PROJECT_DIR"
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set in .env file${NC}"
    exit 1
fi

# Export DATABASE_URL for Prisma
export DATABASE_URL

cd "$BACKEND_DIR"

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "${YELLOW}This will create a migration that converts String IDs to Int IDs.${NC}"
echo -e "${YELLOW}The migration will preserve existing data by:${NC}"
echo -e "${YELLOW}1. Creating new tables with Int IDs${NC}"
echo -e "${YELLOW}2. Migrating data with ID mapping${NC}"
echo -e "${YELLOW}3. Updating foreign keys and arrays${NC}"
echo -e "${YELLOW}4. Dropping old tables and renaming new ones${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

# Create migration using Prisma
echo -e "${BLUE}Creating migration...${NC}"
echo -e "${BLUE}DATABASE_URL: ${DATABASE_URL:0:30}...${NC}"

# Read .env file and pass DATABASE_URL to Prisma
cd "$BACKEND_DIR"
sudo -u acoustic bash << EOF
export DATABASE_URL='$DATABASE_URL'
export PRISMA_MIGRATE_SKIP_GENERATE=1
cd '$BACKEND_DIR'

# Try to create migration without shadow database
# Use prisma migrate diff if available, otherwise use migrate dev with --skip-seed
if command -v prisma &> /dev/null || npx prisma --version &> /dev/null; then
    echo "Creating migration using prisma migrate dev..."
    npx prisma migrate dev --name change_ids_to_int --create-only --skip-seed || {
        echo -e "${YELLOW}⚠️  Migration creation failed. Creating manual migration...${NC}"
        # Create migration directory manually
        MIGRATION_NAME="change_ids_to_int"
        MIGRATION_TIMESTAMP=\$(date +%Y%m%d%H%M%S)
        MIGRATION_DIR="prisma/migrations/\${MIGRATION_TIMESTAMP}_\${MIGRATION_NAME}"
        mkdir -p "\$MIGRATION_DIR"
        echo "-- Migration: Change String IDs to Int IDs" > "\$MIGRATION_DIR/migration.sql"
        echo "-- This migration needs to be manually edited to preserve data" >> "\$MIGRATION_DIR/migration.sql"
        echo "-- See deploy/migrate-string-to-int-ids.sh for template" >> "\$MIGRATION_DIR/migration.sql"
        echo -e "${GREEN}✅ Manual migration directory created: \$MIGRATION_DIR${NC}"
    }
else
    echo -e "${RED}❌ Prisma CLI not found${NC}"
    exit 1
fi
EOF

MIGRATION_DIR=$(ls -td prisma/migrations/*change_ids_to_int* | head -1)
MIGRATION_FILE="$MIGRATION_DIR/migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration created: ${MIGRATION_FILE}${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING:${NC}"
echo -e "${YELLOW}The auto-generated migration will DROP all tables!${NC}"
echo -e "${YELLOW}You need to manually edit the migration file to preserve data.${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the migration file: $MIGRATION_FILE"
echo "2. Edit it to preserve data (use the template in deploy/migrate-string-to-int-ids.sh)"
echo "3. Test on a copy of production database"
echo "4. Apply migration: sudo -u acoustic npx prisma migrate deploy"

