#!/bin/bash

# Check local database configuration
# Usage: ./check-local-database.sh

set -e

echo "🔍 Checking local database configuration..."
echo ""

# 1. Check .env file
echo "📋 Step 1: Checking .env file..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    DB_URL=$(grep DATABASE_URL .env | head -1)
    if [ -n "$DB_URL" ]; then
        DB_NAME=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:[^@]*@[^\/]*\/\([^?]*\).*/\1/p')
        DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DB_URL" | sed -n 's/.*@[^:]*:\([^\/]*\)\/.*/\1/p')
        DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        DB_PASS_DECODED=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$DB_PASS'))" 2>/dev/null || echo "$DB_PASS")
        
        echo "    Database Name: $DB_NAME"
        echo "    Database User: $DB_USER"
        echo "    Database Host: $DB_HOST"
        echo "    Database Port: $DB_PORT"
    fi
else
    echo "  ❌ .env file not found"
fi
echo ""

# 2. Check PostgreSQL users
echo "📋 Step 2: Checking PostgreSQL users..."
sudo -u postgres psql -c "\du" 2>/dev/null | grep -E "acoustic|webdb" || echo "  No acoustic users found"
echo ""

# 3. Check PostgreSQL databases
echo "📋 Step 3: Checking PostgreSQL databases..."
sudo -u postgres psql -c "\l" 2>/dev/null | grep -E "acoustic|webdb" || echo "  No acoustic databases found"
echo ""

# 4. Test connection with postgres user
echo "📋 Step 4: Testing connection..."
if sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ PostgreSQL is running"
else
    echo "  ❌ PostgreSQL is not running or not accessible"
fi
echo ""

echo "✅ Check complete!"
echo ""
echo "📋 If user doesn't exist, create it:"
echo "  sudo -u postgres psql -c \"CREATE USER acousticwebdb WITH PASSWORD 'your_password';\""
echo "  sudo -u postgres psql -c \"ALTER USER acousticwebdb CREATEDB;\""
echo ""
echo "📋 If database doesn't exist, create it:"
echo "  sudo -u postgres psql -c \"CREATE DATABASE acousticwebdb OWNER acousticwebdb;\""

