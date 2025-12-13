#!/bin/bash

# Database Dump Script (Safe version with multiple authentication methods)
# Bu script database'ni dump qiladi (eski serverdan)

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💾 Database Dump (Safe Version)${NC}"
echo "=================================="
echo ""

# Get database information
read -p "Enter database name (default: acousticwebdb): " DB_NAME
DB_NAME=${DB_NAME:-acousticwebdb}

read -p "Enter database user (default: acoustic): " DB_USER
DB_USER=${DB_USER:-acoustic}

echo ""
echo "Choose authentication method:"
echo "1. Password (PGPASSWORD)"
echo "2. PostgreSQL superuser (postgres) - recommended"
echo "3. Peer authentication (local socket)"
read -p "Enter choice (1-3, default: 2): " AUTH_METHOD
AUTH_METHOD=${AUTH_METHOD:-2}

case $AUTH_METHOD in
    1)
        read -p "Enter database password: " -s DB_PASSWORD
        echo ""
        AUTH_STRING="PGPASSWORD='$DB_PASSWORD'"
        ;;
    2)
        echo "Using PostgreSQL superuser (postgres)"
        DB_USER="postgres"
        AUTH_STRING="sudo -u postgres"
        ;;
    3)
        echo "Using peer authentication (local socket)"
        AUTH_STRING=""
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Backup directory - use /tmp directly or create with proper permissions
BACKUP_DIR="/tmp/acoustic-backups"
mkdir -p "$BACKUP_DIR"
# Ensure postgres user can write to this directory
chmod 1777 "$BACKUP_DIR" 2>/dev/null || true

# Backup file name
BACKUP_FILE="acoustic_backup_$(date +%Y%m%d_%H%M%S).sql"
# Use /tmp directly if postgres user, or create in a writable location
if [ "$AUTH_METHOD" = "2" ]; then
    # For postgres user, use /var/tmp or create file first
    BACKUP_PATH="/var/tmp/$BACKUP_FILE"
else
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
fi

echo ""
echo -e "${BLUE}📋 Dump Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Auth method: $AUTH_METHOD"
echo "  Output: $BACKUP_PATH"
echo ""

# Step 1: Test connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if [ "$AUTH_METHOD" = "1" ]; then
    export PGPASSWORD="$DB_PASSWORD"
    psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1 || {
        echo -e "${RED}❌ Connection failed. Trying alternative methods...${NC}"
        unset PGPASSWORD
        
        # Try with postgres user
        echo -e "${YELLOW}⚠️  Trying with postgres user...${NC}"
        AUTH_STRING="sudo -u postgres"
        DB_USER="postgres"
    }
    unset PGPASSWORD
elif [ "$AUTH_METHOD" = "2" ]; then
    sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1 || {
        echo -e "${RED}❌ Connection failed with postgres user${NC}"
        exit 1
    }
else
    psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1 || {
        echo -e "${RED}❌ Connection failed${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ Connection successful${NC}"

# Step 2: Create dump
echo ""
echo -e "${BLUE}1️⃣ Creating database dump...${NC}"
if [ "$AUTH_METHOD" = "1" ]; then
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_PATH" || {
        echo -e "${RED}❌ Failed to create dump${NC}"
        unset PGPASSWORD
        exit 1
    }
    unset PGPASSWORD
elif [ "$AUTH_METHOD" = "2" ]; then
    # Create dump in /var/tmp (writable by postgres)
    sudo -u postgres pg_dump -d "$DB_NAME" -F c -f "$BACKUP_PATH" || {
        echo -e "${RED}❌ Failed to create dump${NC}"
        exit 1
    }
    # Change ownership to current user and move to backup directory
    sudo chown $(whoami):$(whoami) "$BACKUP_PATH"
    # Copy to backup directory if different
    if [ "$BACKUP_PATH" != "$BACKUP_DIR/$BACKUP_FILE" ]; then
        cp "$BACKUP_PATH" "$BACKUP_DIR/$BACKUP_FILE"
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
    fi
else
    pg_dump -d "$DB_NAME" -F c -f "$BACKUP_PATH" || {
        echo -e "${RED}❌ Failed to create dump${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ Dump created: $BACKUP_PATH${NC}"

# Step 3: Show file size
FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo -e "${BLUE}📊 Dump file size: $FILE_SIZE${NC}"

# Step 4: Verify dump
echo ""
echo -e "${BLUE}2️⃣ Verifying dump...${NC}"
if [ "$AUTH_METHOD" = "2" ]; then
    sudo -u postgres pg_restore --list "$BACKUP_PATH" > /dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️  Warning: Could not verify dump file${NC}"
    }
else
    pg_restore --list "$BACKUP_PATH" > /dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️  Warning: Could not verify dump file${NC}"
    }
fi
echo -e "${GREEN}✅ Dump verified${NC}"

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

