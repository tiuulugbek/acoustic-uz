#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Create Int ID Migration (Manual)${NC}"
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
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "${YELLOW}This will create a migration file manually (without shadow database).${NC}"
echo -e "${YELLOW}The migration file will need to be manually edited to preserve data.${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

# Create migration directory
MIGRATION_NAME="change_ids_to_int"
MIGRATION_TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_DIR="prisma/migrations/${MIGRATION_TIMESTAMP}_${MIGRATION_NAME}"
mkdir -p "$MIGRATION_DIR"

MIGRATION_FILE="$MIGRATION_DIR/migration.sql"

# Create migration file with warning
cat > "$MIGRATION_FILE" << 'EOF'
-- Migration: Change String IDs to Int IDs
-- WARNING: This migration will DROP all tables and recreate them with Int IDs
-- You MUST manually edit this file to preserve existing data!
-- See deploy/migrate-string-to-int-ids.sh for a template on how to preserve data

-- This is a placeholder migration file.
-- Prisma will generate the actual migration SQL when you run:
--   npx prisma migrate dev --name change_ids_to_int
-- 
-- However, since shadow database creation failed, we're creating this manually.
-- You need to:
-- 1. Use prisma migrate diff to generate the SQL
-- 2. Or manually write the migration to preserve data
-- 3. See deploy/migrate-string-to-int-ids.sh for a data-preserving template

-- To generate migration SQL without shadow database:
-- npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > migration.sql

-- Or use prisma db push to sync schema (WARNING: This will drop all data!)
-- npx prisma db push
EOF

echo -e "${GREEN}✅ Migration directory created: ${MIGRATION_DIR}${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "1. Generate migration SQL using one of these methods:"
echo ""
echo "   Option A - Use prisma migrate diff (recommended):"
echo "   cd $BACKEND_DIR"
echo "   sudo -u acoustic bash -c \"export DATABASE_URL='$DATABASE_URL' && npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > $MIGRATION_FILE\""
echo ""
echo "   Option B - Manually edit migration file:"
echo "   sudo nano $MIGRATION_FILE"
echo "   (Use deploy/migrate-string-to-int-ids.sh as a template)"
echo ""
echo "2. Review the migration file carefully"
echo "3. Test on a copy of production database"
echo "4. Apply migration: sudo -u acoustic npx prisma migrate deploy"

