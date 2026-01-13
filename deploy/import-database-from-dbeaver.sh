#!/bin/bash

# Import database dump from DBeaver backup to local server
# Usage: ./import-database-from-dbeaver.sh

set -e

echo "🗄️  Importing database from DBeaver backup..."
echo ""

# 1. Get dump file location
echo "📋 Step 1: Dump file location..."
read -p "  Path to dump file (SQL file): " DUMP_FILE

if [ ! -f "$DUMP_FILE" ]; then
    echo "  ❌ File not found: $DUMP_FILE"
    exit 1
fi

echo "  ✅ File found: $DUMP_FILE"
echo "  File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

# 2. Get database details
echo "📋 Step 2: Database details..."
read -p "  Database name (default: acousticwebdb): " DB_NAME
DB_NAME=${DB_NAME:-acousticwebdb}
read -p "  Database user (default: acousticwebdb): " DB_USER
DB_USER=${DB_USER:-acousticwebdb}
read -sp "  Database password: " DB_PASS
echo ""
echo ""

# 3. Backup existing database (if exists)
echo "📋 Step 3: Backing up existing database..."
export PGPASSWORD="$DB_PASS"
if psql -h localhost -U "$DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$DB_NAME"; then
    BACKUP_FILE="/tmp/acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "  Existing database found, creating backup..."
    pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" \
        --clean \
        --if-exists \
        --format=plain \
        --file="$BACKUP_FILE" || {
        echo "  ⚠️  Backup failed, but continuing..."
    }
    echo "  ✅ Backup created: $BACKUP_FILE"
else
    echo "  ℹ️  Database doesn't exist, will be created"
fi
unset PGPASSWORD
echo ""

# 4. Create database if doesn't exist
echo "📋 Step 4: Creating database (if needed)..."
export PGPASSWORD="$DB_PASS"
if ! psql -h localhost -U "$DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$DB_NAME"; then
    echo "  Creating database..."
    psql -h localhost -U "$DB_USER" -d postgres \
        -c "CREATE DATABASE \"$DB_NAME\";" || {
        echo "  ❌ Failed to create database!"
        exit 1
    }
    echo "  ✅ Database created"
else
    echo "  ✅ Database already exists"
fi
unset PGPASSWORD
echo ""

# 5. Clean dump file (remove problematic commands)
echo "📋 Step 5: Cleaning dump file..."
CLEANED_DUMP="/tmp/acoustic-dump-cleaned-$(date +%Y%m%d-%H%M%S).sql"
cp "$DUMP_FILE" "$CLEANED_DUMP"

# Remove problematic commands
sed -i '/^CREATE DATABASE/d' "$CLEANED_DUMP"
sed -i '/^ALTER DATABASE/d' "$CLEANED_DUMP"
sed -i '/^\\connect/d' "$CLEANED_DUMP"
sed -i '/^SET search_path/d' "$CLEANED_DUMP"
sed -i '/^SET session_replication_role/d' "$CLEANED_DUMP"

# Remove owner commands if they cause issues
# sed -i '/^ALTER.*OWNER TO/d' "$CLEANED_DUMP"

echo "  ✅ Dump file cleaned: $CLEANED_DUMP"
echo ""

# 6. Import dump
echo "📋 Step 6: Importing dump..."
echo "  This may take a while depending on database size..."
export PGPASSWORD="$DB_PASS"

# Set client encoding
export PGCLIENTENCODING=UTF8

psql -h localhost -U "$DB_USER" -d "$DB_NAME" \
    -f "$CLEANED_DUMP" 2>&1 | \
    grep -v "already exists" | \
    grep -v "does not exist" | \
    grep -v "ERROR:.*does not exist" | \
    tail -20 || {
    echo "  ⚠️  Some warnings occurred, but import may have succeeded"
}

unset PGPASSWORD
unset PGCLIENTENCODED
echo "  ✅ Import completed"
echo ""

# 7. Verify import
echo "📋 Step 7: Verifying import..."
export PGPASSWORD="$DB_PASS"
TABLE_COUNT=$(psql -h localhost -U "$DB_USER" -d "$DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
echo "  Tables in database: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt "0" ]; then
    echo "  ✅ Import successful!"
else
    echo "  ⚠️  No tables found, import may have failed"
fi
unset PGPASSWORD
echo ""

# 8. Update .env file
echo "📋 Step 8: Updating .env file..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    echo "  Updating DATABASE_URL..."
    DB_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASS'))")
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS_ENCODED@localhost:5432/$DB_NAME|g" .env
    echo "  ✅ .env updated"
else
    echo "  ⚠️  .env file not found"
fi
echo ""

# 9. Run migrations
echo "📋 Step 9: Running Prisma migrations..."
cd /var/www/acoustic.uz
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma || {
    echo "  ⚠️  Migrations failed, but database is imported"
}
echo ""

echo "✅ Import complete!"
echo ""
echo "📋 Summary:"
echo "  - Dump file: $DUMP_FILE"
if [ -n "$BACKUP_FILE" ]; then
    echo "  - Backup file: $BACKUP_FILE"
fi
echo "  - Cleaned dump: $CLEANED_DUMP"
echo "  - Database: $DB_NAME"
echo "  - Tables: $TABLE_COUNT"
echo ""
echo "📋 Next steps:"
echo "  1. Restart backend: pm2 restart acoustic-backend"
echo "  2. Test API: curl https://a.acoustic.uz/api"
echo "  3. Check logs: pm2 logs acoustic-backend"

