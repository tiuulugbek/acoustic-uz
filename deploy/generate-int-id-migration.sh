#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Generate Int ID Migration${NC}"
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

# Find migration directory
MIGRATION_DIR=$(ls -td prisma/migrations/*change_ids_to_int* 2>/dev/null | head -1)

if [ -z "$MIGRATION_DIR" ]; then
    echo -e "${YELLOW}⚠️  Migration directory not found. Creating one...${NC}"
    MIGRATION_TIMESTAMP=$(date +%Y%m%d%H%M%S)
    MIGRATION_DIR="prisma/migrations/${MIGRATION_TIMESTAMP}_change_ids_to_int"
    sudo -u acoustic mkdir -p "$MIGRATION_DIR"
fi

MIGRATION_FILE="$MIGRATION_DIR/migration.sql"

echo -e "${BLUE}Migration directory: ${MIGRATION_DIR}${NC}"
echo -e "${BLUE}Migration file: ${MIGRATION_FILE}${NC}"
echo ""

# Generate migration SQL using prisma migrate diff
echo -e "${BLUE}Generating migration SQL...${NC}"

# Ensure migration directory exists and has correct permissions
sudo -u acoustic mkdir -p "$MIGRATION_DIR"
sudo chown -R acoustic:acoustic "$MIGRATION_DIR"

# Generate migration SQL directly to the migration file
sudo -u acoustic bash << EOF
export DATABASE_URL='$DATABASE_URL'
cd '$BACKEND_DIR'
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > '$MIGRATION_FILE'
EOF

# Ensure correct permissions
sudo chown acoustic:acoustic "$MIGRATION_FILE"

if [ ! -f "$MIGRATION_FILE" ] || [ ! -s "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not created or is empty${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration SQL generated${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING:${NC}"
echo -e "${YELLOW}The generated migration will DROP all tables!${NC}"
echo -e "${YELLOW}You MUST edit it to preserve data.${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review migration file: sudo nano $MIGRATION_FILE"
echo "2. Edit it to preserve data (see deploy/migrate-string-to-int-ids.sh for template)"
echo "3. Test on a copy of production database"
echo "4. Apply migration: sudo -u acoustic npx prisma migrate deploy"

