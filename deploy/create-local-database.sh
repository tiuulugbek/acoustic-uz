#!/bin/bash

# Create local database and user for acoustic.uz
# Usage: ./create-local-database.sh

set -e

echo "🔧 Creating local database and user..."
echo ""

# 1. Get database details
read -p "Database name (default: acousticwebdb): " DB_NAME
DB_NAME=${DB_NAME:-acousticwebdb}
read -p "Database user (default: acousticwebdb): " DB_USER
DB_USER=${DB_USER:-acousticwebdb}
read -sp "Database password: " DB_PASS
echo ""
echo ""

# 2. Create user
echo "📋 Step 1: Creating database user..."
sudo -u postgres psql << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
        ALTER USER $DB_USER CREATEDB;
        RAISE NOTICE 'User $DB_USER created';
    ELSE
        ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';
        RAISE NOTICE 'User $DB_USER already exists, password updated';
    END IF;
END
\$\$;
EOF
echo "  ✅ User created/updated"
echo ""

# 3. Create database
echo "📋 Step 2: Creating database..."
sudo -u postgres psql << EOF
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOF
echo "  ✅ Database created"
echo ""

# 4. Test connection
echo "📋 Step 3: Testing connection..."
export PGPASSWORD="$DB_PASS"
if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ Connection successful"
else
    echo "  ❌ Connection failed"
    exit 1
fi
unset PGPASSWORD
echo ""

# 5. Update .env
echo "📋 Step 4: Updating .env file..."
cd /var/www/acoustic.uz
if [ -f ".env" ]; then
    DB_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASS'))")
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS_ENCODED@localhost:5432/$DB_NAME|g" .env
    echo "  ✅ .env updated"
else
    echo "  ⚠️  .env file not found"
fi
echo ""

echo "✅ Database setup complete!"
echo ""
echo "📋 Database info:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: [hidden]"

