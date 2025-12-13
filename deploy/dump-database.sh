#!/bin/bash

# Database Dump Script
# Bu script database'ni dump qiladi (eski serverdan)

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💾 Database Dump${NC}"
echo "================"
echo ""

# Get database information
read -p "Enter database name (default: acousticwebdb): " DB_NAME
DB_NAME=${DB_NAME:-acousticwebdb}

read -p "Enter database user (default: acoustic): " DB_USER
DB_USER=${DB_USER:-acoustic}

read -p "Enter database password: " -s DB_PASSWORD
echo ""

# Backup directory
BACKUP_DIR="/tmp/acoustic-backups"
mkdir -p "$BACKUP_DIR"

# Backup file name
BACKUP_FILE="acoustic_backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

echo ""
echo -e "${BLUE}📋 Dump Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $BACKUP_PATH"
echo ""

# Step 1: Create dump
echo -e "${BLUE}1️⃣ Creating database dump...${NC}"
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_PATH" || {
    echo -e "${RED}❌ Failed to create dump${NC}"
    unset PGPASSWORD
    exit 1
}
unset PGPASSWORD
echo -e "${GREEN}✅ Dump created: $BACKUP_PATH${NC}"

# Step 2: Show file size
FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo -e "${BLUE}📊 Dump file size: $FILE_SIZE${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database dump complete!${NC}"
echo ""
echo "📋 Dump file location:"
echo "   $BACKUP_PATH"
echo ""
echo "📋 To transfer to new server:"
echo "   scp $BACKUP_PATH user@new-server:/tmp/"
echo ""
echo "📋 To restore on new server:"
echo "   pg_restore -h localhost -U <user> -d <database> --clean --if-exists $BACKUP_FILE"
echo ""

