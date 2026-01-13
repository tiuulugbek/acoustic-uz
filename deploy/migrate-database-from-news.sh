#!/bin/bash

# Migrate database from news.acoustic.uz to acoustic.uz
# Usage: ./migrate-database-from-news.sh

set -e

echo "🗄️  Migrating database from news.acoustic.uz to acoustic.uz..."
echo ""

# 1. Check if we're on the right server
echo "📋 Step 1: Checking server..."
CURRENT_HOST=$(hostname)
echo "  Current server: $CURRENT_HOST"
echo "  Make sure you're on the acoustic.uz server (159.69.214.82)"
echo ""
read -p "  Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Aborted"
    exit 1
fi
echo ""

# 2. Get source database credentials
echo "📋 Step 2: Source database (news.acoustic.uz)..."
read -p "  Source DB host (default: localhost): " SOURCE_HOST
SOURCE_HOST=${SOURCE_HOST:-localhost}
read -p "  Source DB port (default: 5432): " SOURCE_PORT
SOURCE_PORT=${SOURCE_PORT:-5432}
read -p "  Source DB name (default: acousticwebdb): " SOURCE_DB
SOURCE_DB=${SOURCE_DB:-acousticwebdb}
read -p "  Source DB user (default: acousticwebdb): " SOURCE_USER
SOURCE_USER=${SOURCE_USER:-acousticwebdb}
read -sp "  Source DB password: " SOURCE_PASS
echo ""
echo ""

# 3. Get target database credentials
echo "📋 Step 3: Target database (acoustic.uz)..."
read -p "  Target DB host (default: localhost): " TARGET_HOST
TARGET_HOST=${TARGET_HOST:-localhost}
read -p "  Target DB port (default: 5432): " TARGET_PORT
TARGET_PORT=${TARGET_PORT:-5432}
read -p "  Target DB name (default: acousticwebdb): " TARGET_DB
TARGET_DB=${TARGET_DB:-acousticwebdb}
read -p "  Target DB user (default: acousticwebdb): " TARGET_USER
TARGET_USER=${TARGET_USER:-acousticwebdb}
read -sp "  Target DB password: " TARGET_PASS
echo ""
echo ""

# 4. Create dump file name
DUMP_FILE="/tmp/acoustic-dump-$(date +%Y%m%d-%H%M%S).sql"
echo "📋 Step 4: Dump file will be: $DUMP_FILE"
echo ""

# 5. Export source database
echo "📋 Step 5: Exporting source database..."
export PGPASSWORD="$SOURCE_PASS"
pg_dump -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --file="$DUMP_FILE" || {
    echo "  ❌ Export failed!"
    exit 1
}
unset PGPASSWORD
echo "  ✅ Database exported to $DUMP_FILE"
echo "  File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

# 6. Backup target database (if exists)
echo "📋 Step 6: Backing up target database..."
export PGPASSWORD="$TARGET_PASS"
if psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres -c "\l" | grep -q "$TARGET_DB"; then
    BACKUP_FILE="/tmp/acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "  Target database exists, creating backup..."
    pg_dump -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
        --clean \
        --if-exists \
        --format=plain \
        --file="$BACKUP_FILE" || {
        echo "  ⚠️  Backup failed, but continuing..."
    }
    echo "  ✅ Backup created: $BACKUP_FILE"
else
    echo "  ℹ️  Target database doesn't exist, will be created"
fi
unset PGPASSWORD
echo ""

# 7. Import to target database
echo "📋 Step 7: Importing to target database..."
export PGPASSWORD="$TARGET_PASS"

# If database doesn't exist, create it first
if ! psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres -c "\l" | grep -q "$TARGET_DB"; then
    echo "  Creating target database..."
    psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres \
        -c "CREATE DATABASE \"$TARGET_DB\";" || {
        echo "  ❌ Failed to create database!"
        exit 1
    }
fi

# Import the dump
psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
    -f "$DUMP_FILE" || {
    echo "  ❌ Import failed!"
    echo "  You can restore from backup: $BACKUP_FILE"
    exit 1
}
unset PGPASSWORD
echo "  ✅ Database imported successfully"
echo ""

# 8. Verify import
echo "📋 Step 8: Verifying import..."
export PGPASSWORD="$TARGET_PASS"
TABLE_COUNT=$(psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "  Tables in target database: $TABLE_COUNT"
unset PGPASSWORD
echo ""

# 9. Update .env file
echo "📋 Step 9: Updating .env file..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    echo "  Updating DATABASE_URL in .env..."
    # URL encode password
    TARGET_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TARGET_PASS'))")
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$TARGET_USER:$TARGET_PASS_ENCODED@$TARGET_HOST:$TARGET_PORT/$TARGET_DB|g" .env
    echo "  ✅ .env updated"
else
    echo "  ⚠️  .env file not found"
fi
echo ""

# 10. Run migrations
echo "📋 Step 10: Running Prisma migrations..."
cd /var/www/acoustic.uz
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma || {
    echo "  ⚠️  Migrations failed, but database is imported"
}
echo ""

echo "✅ Database migration complete!"
echo ""
echo "📋 Summary:"
echo "  - Dump file: $DUMP_FILE"
if [ -n "$BACKUP_FILE" ]; then
    echo "  - Backup file: $BACKUP_FILE"
fi
echo "  - Target database: $TARGET_DB"
echo ""
echo "📋 Next steps:"
echo "  1. Restart backend: pm2 restart acoustic-backend"
echo "  2. Test API: curl https://a.acoustic.uz/api"
echo "  3. Check logs: pm2 logs acoustic-backend"

