#!/bin/bash

# Find database name on remote server
# Usage: ./find-remote-database.sh

set -e

echo "🔍 Finding database on remote server..."
echo ""

# 1. Get remote server details
read -p "Remote server IP or hostname (default: 152.53.229.176): " REMOTE_HOST
REMOTE_HOST=${REMOTE_HOST:-152.53.229.176}
read -p "Remote SSH user (default: root): " REMOTE_USER
REMOTE_USER=${REMOTE_USER:-root}
read -p "Remote PostgreSQL user (default: postgres): " REMOTE_PG_USER
REMOTE_PG_USER=${REMOTE_PG_USER:-postgres}
read -sp "Remote PostgreSQL password (if needed): " REMOTE_PG_PASS
echo ""
echo ""

# 2. Connect and list databases
echo "📋 Step 1: Listing databases on remote server..."
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
export PGPASSWORD='$REMOTE_PG_PASS'
psql -h localhost -U $REMOTE_PG_USER -d postgres -c "\l" | grep -E "Name|acoustic|news|web"
unset PGPASSWORD
EOF

echo ""
echo "📋 Step 2: Checking common database names..."
for db_name in "acousticwebdb" "acoustic" "news_acoustic" "acoustic_news" "newsacoustic"; do
    echo "  Checking: $db_name"
    ssh "$REMOTE_USER@$REMOTE_HOST" "export PGPASSWORD='$REMOTE_PG_PASS' && psql -h localhost -U $REMOTE_PG_USER -d postgres -c '\l' | grep -q '$db_name' && echo '    ✅ Found!' || echo '    ❌ Not found'" 2>/dev/null || echo "    ⚠️  Could not check"
done
echo ""

# 3. Check .env file on remote server
echo "📋 Step 3: Checking .env file on remote server..."
ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
if [ -f "/var/www/news.acoustic.uz/.env" ]; then
    echo "  Found .env file:"
    grep DATABASE_URL /var/www/news.acoustic.uz/.env | sed 's/.*:\/\/[^:]*:[^@]*@[^\/]*\/\([^?]*\).*/    Database: \1/'
elif [ -f "/var/www/acoustic.uz/.env" ]; then
    echo "  Found .env file:"
    grep DATABASE_URL /var/www/acoustic.uz/.env | sed 's/.*:\/\/[^:]*:[^@]*@[^\/]*\/\([^?]*\).*/    Database: \1/'
else
    echo "  ⚠️  .env file not found"
fi
EOF

echo ""
echo "✅ Check complete!"
echo ""
echo "📋 Use the database name found above in the migration script"

