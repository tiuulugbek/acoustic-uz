#!/bin/bash

# Script to fix database password encoding issue

set -e

echo "🔧 Fixing database password encoding..."

# Read password
read -p "Enter database password for 'acoustic' user: " DB_PASSWORD

# URL encode password properly (handle all special characters)
DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse; import sys; print(urllib.parse.quote(sys.argv[1]))" "$DB_PASSWORD")

echo "Encoded password: $DB_PASSWORD_ENCODED"

# Update .env file
if [ -f ".env" ]; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://acoustic:$DB_PASSWORD_ENCODED@localhost:5432/acoustic|g" .env
    echo "✅ .env file updated"
    
    # Show DATABASE_URL (without password)
    echo "DATABASE_URL updated (password hidden)"
    grep DATABASE_URL .env | sed 's/:[^@]*@/:***@/'
else
    echo "❌ .env file not found"
    exit 1
fi

# Test database connection
echo ""
echo "🔍 Testing database connection..."
if psql -U acoustic -d acoustic -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo ""
    echo "Please check:"
    echo "1. Database user 'acoustic' exists"
    echo "2. Password is correct"
    echo "3. Database 'acoustic' exists"
    echo ""
    echo "To create user and database:"
    echo "  sudo -u postgres psql"
    echo "  CREATE USER acoustic WITH PASSWORD 'YOUR_PASSWORD';"
    echo "  CREATE DATABASE acoustic OWNER acoustic;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;"
fi

