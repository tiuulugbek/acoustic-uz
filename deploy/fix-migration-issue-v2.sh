#!/bin/bash
# Fix migration issue: check and resolve failed migration

set -e

echo "🔧 Fixing migration issue..."

cd /var/www/news.acoustic.uz

# Check migration status first
echo "📋 Checking migration status..."
npx prisma migrate status || true

# List all migrations
echo "📁 Listing migrations..."
ls -la prisma/migrations/ | grep "add_homepage_content_models"

# Check database for migration records
echo "🔍 Checking database migration records..."
psql -U postgres -d acoustic -c "SELECT migration_name, finished_at FROM _prisma_migrations WHERE migration_name LIKE '%homepage_content_models%' ORDER BY started_at;" || {
    echo "⚠️  Could not connect to database. Please check DATABASE_URL in .env"
    exit 1
}

# Find the problematic migration name
PROBLEMATIC_MIGRATION=$(psql -U postgres -d acoustic -t -c "SELECT migration_name FROM _prisma_migrations WHERE migration_name LIKE '%homepage_content_models%' AND finished_at IS NULL ORDER BY started_at LIMIT 1;" | xargs)

if [ -z "$PROBLEMATIC_MIGRATION" ]; then
    echo "✅ No problematic migration found in database"
    
    # Try to remove the folder if it exists
    if [ -d "prisma/migrations/\$(date +%Y%m%d%H%M%S)_add_homepage_content_models" ]; then
        echo "🗑️  Removing problematic migration folder..."
        rm -rf "prisma/migrations/\$(date +%Y%m%d%H%M%S)_add_homepage_content_models"
    fi
    
    # Pull latest changes
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    # Try deploy again
    echo "🚀 Deploying migrations..."
    npx prisma migrate deploy
else
    echo "⚠️  Found problematic migration: $PROBLEMATIC_MIGRATION"
    
    # Check if HomepageSection table exists
    TABLE_EXISTS=$(psql -U postgres -d acoustic -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'HomepageSection');" | xargs)
    
    if [ "$TABLE_EXISTS" = "t" ]; then
        echo "✅ HomepageSection table already exists. Marking migration as applied..."
        npx prisma migrate resolve --applied "$PROBLEMATIC_MIGRATION"
        
        # Pull latest changes
        echo "📥 Pulling latest changes..."
        git pull origin main
        
        # Try deploy again
        echo "🚀 Deploying migrations..."
        npx prisma migrate deploy
    else
        echo "❌ HomepageSection table does not exist. Please check the migration manually."
        exit 1
    fi
fi

echo "✅ Migration issue fixed!"

