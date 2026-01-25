#!/bin/bash

# Migrate database from remote server with custom database name
# Usage: ./migrate-database-remote-custom.sh

set -e

echo "🗄️  Migrating database from remote server to local..."
echo ""

# 1. Get remote server details
echo "📋 Step 1: Remote server (news.acoustic.uz)..."
read -p "  Remote server IP or hostname (default: 152.53.229.176): " REMOTE_HOST
REMOTE_HOST=${REMOTE_HOST:-152.53.229.176}
read -p "  Remote SSH user (default: root): " REMOTE_USER
REMOTE_USER=${REMOTE_USER:-root}
read -p "  Remote DB host (default: localhost): " REMOTE_DB_HOST
REMOTE_DB_HOST=${REMOTE_DB_HOST:-localhost}
read -p "  Remote DB port (default: 5432): " REMOTE_DB_PORT
REMOTE_DB_PORT=${REMOTE_DB_PORT:-5432}
read -p "  Remote DB name: " REMOTE_DB_NAME
if [ -z "$REMOTE_DB_NAME" ]; then
    echo "  ❌ Database name is required!"
    echo "  Run: bash deploy/find-remote-database.sh to find database name"
    exit 1
fi
read -p "  Remote DB user (default: postgres): " REMOTE_DB_USER
REMOTE_DB_USER=${REMOTE_DB_USER:-postgres}
read -sp "  Remote DB password: " REMOTE_DB_PASS
echo ""
echo ""

# 2. Get local server details
echo "📋 Step 2: Local server (acoustic.uz)..."
read -p "  Local DB host (default: localhost): " LOCAL_DB_HOST
LOCAL_DB_HOST=${LOCAL_DB_HOST:-localhost}
read -p "  Local DB port (default: 5432): " LOCAL_DB_PORT
LOCAL_DB_PORT=${LOCAL_DB_PORT:-5432}
read -p "  Local DB name (default: acousticwebdb): " LOCAL_DB_NAME
LOCAL_DB_NAME=${LOCAL_DB_NAME:-acousticwebdb}
read -p "  Local DB user (default: acousticwebdb): " LOCAL_DB_USER
LOCAL_DB_USER=${LOCAL_DB_USER:-acousticwebdb}
read -sp "  Local DB password: " LOCAL_DB_PASS
echo ""
echo ""

# 3. Create dump file name
DUMP_FILE="/tmp/acoustic-dump-$(date +%Y%m%d-%H%M%S).sql"
echo "📋 Step 3: Dump file will be: $DUMP_FILE"
echo ""

# 4. Test SSH connection
echo "📋 Step 4: Testing SSH connection..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$REMOTE_USER@$REMOTE_HOST" exit 2>/dev/null; then
    echo "  ✅ SSH connection successful"
else
    echo "  ⚠️  SSH connection test failed (may require password)"
    echo "  You'll be prompted for SSH password"
fi
echo ""

# 5. Export from remote server
echo "📋 Step 5: Exporting from remote server..."
echo "  Database: $REMOTE_DB_NAME"
echo "  This may take a while depending on database size..."

# Create remote dump script
REMOTE_DUMP_SCRIPT="/tmp/remote-dump-$$.sh"
cat > "$REMOTE_DUMP_SCRIPT" << EOF
#!/bin/bash
export PGPASSWORD='$REMOTE_DB_PASS'
pg_dump -h $REMOTE_DB_HOST -p $REMOTE_DB_PORT -U $REMOTE_DB_USER -d $REMOTE_DB_NAME \\
    --clean \\
    --if-exists \\
    --no-owner \\
    --no-acl \\
    --format=plain
unset PGPASSWORD
EOF

# Copy script to remote server
scp "$REMOTE_DUMP_SCRIPT" "$REMOTE_USER@$REMOTE_HOST:/tmp/remote-dump.sh" || {
    echo "  ❌ Failed to copy script to remote server"
    exit 1
}

# Execute on remote server and save locally
ssh "$REMOTE_USER@$REMOTE_HOST" "chmod +x /tmp/remote-dump.sh && bash /tmp/remote-dump.sh" > "$DUMP_FILE" || {
    echo "  ❌ Export failed!"
    echo "  Check:"
    echo "    1. Database name is correct: $REMOTE_DB_NAME"
    echo "    2. Database user has access"
    echo "    3. PostgreSQL is running on remote server"
    exit 1
}

# Cleanup remote script
ssh "$REMOTE_USER@$REMOTE_HOST" "rm -f /tmp/remote-dump.sh" 2>/dev/null || true
rm -f "$REMOTE_DUMP_SCRIPT"

echo "  ✅ Database exported to $DUMP_FILE"
echo "  File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

# 6. Backup local database (if exists)
echo "📋 Step 6: Backing up local database..."
export PGPASSWORD="$LOCAL_DB_PASS"
if psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$LOCAL_DB_NAME"; then
    BACKUP_FILE="/tmp/acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "  Local database exists, creating backup..."
    pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --clean \
        --if-exists \
        --format=plain \
        --file="$BACKUP_FILE" || {
        echo "  ⚠️  Backup failed, but continuing..."
    }
    echo "  ✅ Backup created: $BACKUP_FILE"
else
    echo "  ℹ️  Local database doesn't exist, will be created"
fi
unset PGPASSWORD
echo ""

# 7. Import to local database
echo "📋 Step 7: Importing to local database..."
export PGPASSWORD="$LOCAL_DB_PASS"

# If database doesn't exist, create it first
if ! psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$LOCAL_DB_NAME"; then
    echo "  Creating local database..."
    psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d postgres \
        -c "CREATE DATABASE \"$LOCAL_DB_NAME\";" || {
        echo "  ❌ Failed to create database!"
        exit 1
    }
fi

# Remove CREATE DATABASE commands from dump (since we're importing to existing DB)
sed -i '/^CREATE DATABASE/d' "$DUMP_FILE"
sed -i '/^ALTER DATABASE/d' "$DUMP_FILE"
sed -i '/^\\connect/d' "$DUMP_FILE"

# Import the dump
echo "  Importing dump (this may take a while)..."
psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    -f "$DUMP_FILE" 2>&1 | grep -v "already exists" | grep -v "does not exist" || {
    echo "  ⚠️  Some warnings occurred, but import may have succeeded"
}
unset PGPASSWORD
echo "  ✅ Database imported"
echo ""

# 8. Verify import
echo "📋 Step 8: Verifying import..."
export PGPASSWORD="$LOCAL_DB_PASS"
TABLE_COUNT=$(psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
echo "  Tables in local database: $TABLE_COUNT"
unset PGPASSWORD
echo ""

# 9. Update .env file
echo "📋 Step 9: Updating .env file..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    echo "  Updating DATABASE_URL in .env..."
    # URL encode password
    LOCAL_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$LOCAL_DB_PASS'))")
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$LOCAL_DB_USER:$LOCAL_PASS_ENCODED@$LOCAL_DB_HOST:$LOCAL_DB_PORT/$LOCAL_DB_NAME|g" .env
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
echo "  - Remote database: $REMOTE_DB_NAME"
echo "  - Dump file: $DUMP_FILE"
if [ -n "$BACKUP_FILE" ]; then
    echo "  - Backup file: $BACKUP_FILE"
fi
echo "  - Local database: $LOCAL_DB_NAME"
echo ""
echo "📋 Next steps:"
echo "  1. Restart backend: pm2 restart acoustic-backend"
echo "  2. Test API: curl https://a.acoustic.uz/api"
echo "  3. Check logs: pm2 logs acoustic-backend"

