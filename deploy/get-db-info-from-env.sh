#!/bin/bash

# Get database info from .env file on remote server
# Usage: ./get-db-info-from-env.sh

set -e

echo "🔍 Getting database info from .env file..."
echo ""

# 1. Get remote server details
read -p "Remote server IP or hostname (default: 152.53.229.176): " REMOTE_HOST
REMOTE_HOST=${REMOTE_HOST:-152.53.229.176}
read -p "Remote SSH user (default: root): " REMOTE_USER
REMOTE_USER=${REMOTE_USER:-root}
read -p "Remote project path (default: /var/www/news.acoustic.uz): " REMOTE_PATH
REMOTE_PATH=${REMOTE_PATH:-/var/www/news.acoustic.uz}
echo ""

# 2. Get DATABASE_URL from .env
echo "📋 Step 1: Reading .env file..."
DB_URL=$(ssh "$REMOTE_USER@$REMOTE_HOST" "grep DATABASE_URL $REMOTE_PATH/.env 2>/dev/null | head -1" || echo "")

if [ -z "$DB_URL" ]; then
    echo "  ❌ DATABASE_URL not found in .env"
    echo "  Trying to find .env file..."
    ssh "$REMOTE_USER@$REMOTE_HOST" "find /var/www -name '.env' -type f 2>/dev/null | head -5"
    exit 1
fi

echo "  ✅ Found DATABASE_URL"
echo ""

# 3. Parse DATABASE_URL
echo "📋 Step 2: Parsing DATABASE_URL..."
# Extract components from postgresql://user:password@host:port/database
DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DB_URL" | sed -n 's/.*@[^:]*:\([^\/]*\)\/.*/\1/p')
DB_NAME=$(echo "$DB_URL" | sed -n 's/.*@[^\/]*\/\([^?]*\).*/\1/p')

# URL decode password if needed
DB_PASS_DECODED=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$DB_PASS'))" 2>/dev/null || echo "$DB_PASS")

echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo "  Database Host: $DB_HOST"
echo "  Database Port: $DB_PORT"
echo "  Database Password: [hidden]"
echo ""

# 4. Test connection
echo "📋 Step 3: Testing database connection..."
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
export PGPASSWORD='$DB_PASS_DECODED'
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ Database connection successful"
    echo "  Tables count:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' '
else
    echo "  ❌ Database connection failed"
fi
unset PGPASSWORD
EOF

echo ""
echo "✅ Database info retrieved!"
echo ""
echo "📋 Use these values for migration:"
echo "  Remote DB Name: $DB_NAME"
echo "  Remote DB User: $DB_USER"
echo "  Remote DB Host: $DB_HOST"
echo "  Remote DB Port: $DB_PORT"

