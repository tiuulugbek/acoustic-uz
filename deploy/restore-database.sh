#!/bin/bash

# Database Restore Script
# Bu script database dump'ni restore qiladi (yangi serverga)

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Database Restore${NC}"
echo "=================="
echo ""

# Get database information
read -p "Enter dump file path (e.g., /tmp/acoustic_backup_*.sql): " DUMP_FILE

if [ ! -f "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Dump file not found: $DUMP_FILE${NC}"
    exit 1
fi

read -p "Enter database name (default: acousticwebdb): " DB_NAME
DB_NAME=${DB_NAME:-acousticwebdb}

read -p "Enter database user (default: acoustic): " DB_USER
DB_USER=${DB_USER:-acoustic}

read -p "Enter database password: " -s DB_PASSWORD
echo ""

echo ""
echo -e "${BLUE}📋 Restore Configuration:${NC}"
echo "  Dump file: $DUMP_FILE"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Confirm
read -p "⚠️  This will DROP existing data in $DB_NAME. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

# Step 1: Drop and recreate database using postgres superuser
echo -e "${BLUE}1️⃣ Preparing database...${NC}"
echo "  Using postgres superuser to drop/create database..."

# Drop database using postgres user
sudo -u postgres psql -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || true

# Create database using postgres user
sudo -u postgres psql -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" || {
    echo -e "${YELLOW}⚠️  Database creation failed, checking if it exists...${NC}"
    # Check if database exists
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" | xargs)
    if [ "$DB_EXISTS" != "1" ]; then
        echo -e "${RED}❌ Database does not exist and could not be created${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⚠️  Database already exists, continuing...${NC}"
}
echo -e "${GREEN}✅ Database prepared${NC}"

# Step 2: Restore dump
echo ""
echo -e "${BLUE}2️⃣ Restoring database dump...${NC}"
pg_restore -h localhost -U "$DB_USER" -d "$DB_NAME" --clean --if-exists "$DUMP_FILE" || {
    echo -e "${RED}❌ Failed to restore database${NC}"
    unset PGPASSWORD
    exit 1
}
unset PGPASSWORD
echo -e "${GREEN}✅ Database restored${NC}"

# Step 3: Run migrations (to ensure schema is up to date)
echo ""
echo -e "${BLUE}3️⃣ Running migrations...${NC}"
APP_DIR="/var/www/acoustic.uz"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    sudo -u acoustic pnpm exec prisma migrate deploy || {
        echo -e "${YELLOW}⚠️  Migrations may have warnings, but database is restored${NC}"
    }
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Application directory not found, skipping migrations${NC}"
fi

# Step 4: Verify data
echo ""
echo -e "${BLUE}4️⃣ Verifying data...${NC}"
export PGPASSWORD="$DB_PASSWORD"
TABLES=$(psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
echo "  Tables found: $TABLES"

# Count some key tables
if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'Product';" | grep -q 1; then
    PRODUCT_COUNT=$(psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Product\";" | xargs)
    echo "  Products: $PRODUCT_COUNT"
fi

if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'Branch';" | grep -q 1; then
    BRANCH_COUNT=$(psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Branch\";" | xargs)
    echo "  Branches: $BRANCH_COUNT"
fi

unset PGPASSWORD
echo -e "${GREEN}✅ Verification complete${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database restore complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Update .env file if needed:"
echo "   DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "2. Restart backend:"
echo "   pm2 restart acoustic-backend"
echo ""
echo "3. Test backend:"
echo "   curl http://localhost:3001/api/settings?lang=uz"
echo ""
