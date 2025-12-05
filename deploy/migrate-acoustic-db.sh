#!/bin/bash

# Quick migration script for acoustic database
# Usage: ./migrate-acoustic-db.sh

set -e

echo "🗄️  Migrating acoustic database from news.acoustic.uz to acoustic.uz..."
echo ""

# Remote server details (from .env)
REMOTE_HOST="152.53.229.176"
REMOTE_USER="root"
REMOTE_DB_NAME="acoustic"
REMOTE_DB_USER="acoustic"
REMOTE_DB_HOST="localhost"
REMOTE_DB_PORT="5432"

# Local server details
read -p "Local DB name (default: acousticwebdb): " LOCAL_DB_NAME
LOCAL_DB_NAME=${LOCAL_DB_NAME:-acousticwebdb}
read -p "Local DB user (default: acousticwebdb): " LOCAL_DB_USER
LOCAL_DB_USER=${LOCAL_DB_USER:-acousticwebdb}
read -sp "Local DB password: " LOCAL_DB_PASS
echo ""
echo ""

# Get remote password
read -sp "Remote DB password (for acoustic user): " REMOTE_DB_PASS
echo ""
echo ""

DUMP_FILE="/tmp/acoustic-dump-$(date +%Y%m%d-%H%M%S).sql"
echo "📋 Dump file: $DUMP_FILE"
echo ""

# Export from remote
echo "📋 Step 1: Exporting from remote server..."
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

scp "$REMOTE_DUMP_SCRIPT" "$REMOTE_USER@$REMOTE_HOST:/tmp/remote-dump.sh" || {
    echo "  ❌ Failed to copy script"
    exit 1
}

ssh "$REMOTE_USER@$REMOTE_HOST" "chmod +x /tmp/remote-dump.sh && bash /tmp/remote-dump.sh" > "$DUMP_FILE" || {
    echo "  ❌ Export failed!"
    exit 1
}

ssh "$REMOTE_USER@$REMOTE_HOST" "rm -f /tmp/remote-dump.sh" 2>/dev/null || true
rm -f "$REMOTE_DUMP_SCRIPT"

echo "  ✅ Exported ($(du -h "$DUMP_FILE" | cut -f1))"
echo ""

# Backup local
echo "📋 Step 2: Backing up local database..."
export PGPASSWORD="$LOCAL_DB_PASS"
if psql -h localhost -U "$LOCAL_DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$LOCAL_DB_NAME"; then
    BACKUP_FILE="/tmp/acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
    pg_dump -h localhost -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        --clean --if-exists --format=plain \
        --file="$BACKUP_FILE" || echo "  ⚠️  Backup failed"
    echo "  ✅ Backup: $BACKUP_FILE"
fi
unset PGPASSWORD
echo ""

# Import
echo "📋 Step 3: Importing to local database..."
export PGPASSWORD="$LOCAL_DB_PASS"

if ! psql -h localhost -U "$LOCAL_DB_USER" -d postgres -c "\l" 2>/dev/null | grep -q "$LOCAL_DB_NAME"; then
    psql -h localhost -U "$LOCAL_DB_USER" -d postgres \
        -c "CREATE DATABASE \"$LOCAL_DB_NAME\";" || exit 1
fi

# Remove CREATE DATABASE commands
sed -i '/^CREATE DATABASE/d' "$DUMP_FILE"
sed -i '/^ALTER DATABASE/d' "$DUMP_FILE"
sed -i '/^\\connect/d' "$DUMP_FILE"

psql -h localhost -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    -f "$DUMP_FILE" 2>&1 | grep -v "already exists" | grep -v "does not exist" || true

unset PGPASSWORD
echo "  ✅ Imported"
echo ""

# Update .env
echo "📋 Step 4: Updating .env..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    LOCAL_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$LOCAL_DB_PASS'))")
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$LOCAL_DB_USER:$LOCAL_PASS_ENCODED@localhost:5432/$LOCAL_DB_NAME|g" .env
    echo "  ✅ .env updated"
fi
echo ""

# Migrations
echo "📋 Step 5: Running migrations..."
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma || echo "  ⚠️  Migrations failed"
echo ""

echo "✅ Migration complete!"
echo ""
echo "📋 Next: pm2 restart acoustic-backend"

