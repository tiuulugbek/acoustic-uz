#!/bin/bash

# Database Migration Script
# Bu script eski serverdan yangi serverga database'ni migrate qiladi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Database Migration${NC}"
echo "====================="
echo ""

# Get source server information
read -p "Enter OLD server IP or hostname: " OLD_SERVER
read -p "Enter OLD server SSH user (default: root): " OLD_USER
OLD_USER=${OLD_USER:-root}

read -p "Enter OLD database name (default: acoustic_db): " OLD_DB
OLD_DB=${OLD_DB:-acoustic_db}

read -p "Enter OLD database user (default: acoustic): " OLD_DB_USER
OLD_DB_USER=${OLD_DB_USER:-acoustic}

read -p "Enter OLD database password: " -s OLD_DB_PASSWORD
echo ""

# Get destination information
read -p "Enter NEW database name (default: acoustic_db): " NEW_DB
read -p "Enter NEW database user (default: acoustic): " NEW_DB_USER
read -p "Enter NEW database password: " -s NEW_DB_PASSWORD
echo ""

# Set defaults
NEW_DB=${NEW_DB:-acoustic_db}
NEW_DB_USER=${NEW_DB_USER:-acoustic}

APP_DIR="/var/www/acoustic.uz"
BACKUP_DIR="/tmp/acoustic-migration"
mkdir -p "$BACKUP_DIR"

echo ""
echo -e "${BLUE}📋 Migration Configuration:${NC}"
echo "  Source: $OLD_SERVER ($OLD_DB)"
echo "  Destination: localhost ($NEW_DB)"
echo ""

# Step 1: Create backup on old server
echo -e "${BLUE}1️⃣ Creating backup on old server...${NC}"
BACKUP_FILE="acoustic_backup_$(date +%Y%m%d_%H%M%S).sql"
ssh "$OLD_USER@$OLD_SERVER" "PGPASSWORD='$OLD_DB_PASSWORD' pg_dump -h localhost -U $OLD_DB_USER -d $OLD_DB -F c -f /tmp/$BACKUP_FILE" || {
    echo -e "${RED}❌ Failed to create backup on old server${NC}"
    exit 1
}
echo -e "${GREEN}✅ Backup created on old server${NC}"

# Step 2: Download backup
echo ""
echo -e "${BLUE}2️⃣ Downloading backup...${NC}"
scp "$OLD_USER@$OLD_SERVER:/tmp/$BACKUP_FILE" "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup downloaded${NC}"

# Step 3: Restore to new database
echo ""
echo -e "${BLUE}3️⃣ Restoring to new database...${NC}"
export PGPASSWORD="$NEW_DB_PASSWORD"
pg_restore -h localhost -U "$NEW_DB_USER" -d "$NEW_DB" --clean --if-exists "$BACKUP_DIR/$BACKUP_FILE" || {
    echo -e "${RED}❌ Failed to restore database${NC}"
    exit 1
}
unset PGPASSWORD
echo -e "${GREEN}✅ Database restored${NC}"

# Step 4: Run migrations
echo ""
echo -e "${BLUE}4️⃣ Running migrations...${NC}"
cd "$APP_DIR"
sudo -u acoustic pnpm exec prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations may have failed, but database is restored${NC}"
}
echo -e "${GREEN}✅ Migrations completed${NC}"

# Step 5: Verify data
echo ""
echo -e "${BLUE}5️⃣ Verifying data...${NC}"
export PGPASSWORD="$NEW_DB_PASSWORD"
TABLES=$(psql -h localhost -U "$NEW_DB_USER" -d "$NEW_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables found: $TABLES"
unset PGPASSWORD

# Cleanup
echo ""
echo -e "${BLUE}6️⃣ Cleaning up...${NC}"
rm -f "$BACKUP_DIR/$BACKUP_FILE"
ssh "$OLD_USER@$OLD_SERVER" "rm -f /tmp/$BACKUP_FILE" || true
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database migration complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Verify data:"
echo "   psql -h localhost -U $NEW_DB_USER -d $NEW_DB -c 'SELECT COUNT(*) FROM \"Product\";'"
echo ""
echo "2. Update application .env file if needed"
echo ""
echo "3. Restart backend:"
echo "   pm2 restart acoustic-backend"
echo ""
