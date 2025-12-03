#!/bin/bash
# Fix migration issue: remove failed migration from database

set -e

echo "🔧 Fixing migration issue..."

cd /var/www/news.acoustic.uz

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check migration status
echo "📋 Current migration status:"
npx prisma migrate status || true

# Remove failed migration from database using Prisma
echo "🗑️  Removing failed migration from database..."

# Extract DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

# Parse DATABASE_URL to get connection details
# Format: postgresql://user:password@host:port/database
DB_URL="$DATABASE_URL"

# Remove the failed migration record from database
echo "📝 Removing migration record: 20251203083645_add_homepage_content_models"

# Use Prisma's db execute to remove the migration record
npx prisma db execute --stdin <<EOF
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251203083645_add_homepage_content_models';
EOF

# Alternative: Use psql if available
if command -v psql &> /dev/null; then
    echo "📝 Using psql to remove migration record..."
    psql "$DB_URL" -c "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20251203083645_add_homepage_content_models';" || {
        echo "⚠️  psql failed, trying Prisma method..."
    }
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Deploy migrations
echo "🚀 Deploying migrations..."
npx prisma migrate deploy

# Check final status
echo "✅ Final migration status:"
npx prisma migrate status

echo "✅ Migration issue fixed!"

