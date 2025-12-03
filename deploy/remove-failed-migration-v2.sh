#!/bin/bash
# Remove failed migration from database using Prisma

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Removing failed migration from database..."

# Check migration status
echo "📋 Current migration status:"
npx prisma migrate status || true

# Try to resolve the migration as rolled back first
echo "🔄 Attempting to resolve migration as rolled back..."
MIGRATION_NAME="20251203083645_add_homepage_content_models"

# Try resolve as rolled back
npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" 2>&1 || {
    echo "⚠️  Could not resolve as rolled back. Trying to remove from database directly..."
    
    # Extract DATABASE_URL from .env
    if [ -f .env ]; then
        DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        
        # Remove schema parameter if exists (for psql compatibility)
        DB_URL_FOR_PSQL=$(echo "$DATABASE_URL" | sed 's/?schema=public//g')
        
        echo "📝 Removing migration from database: $MIGRATION_NAME"
        
        # Try using psql with cleaned URL
        psql "$DB_URL_FOR_PSQL" -c "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '$MIGRATION_NAME';" 2>&1 || {
            echo "⚠️  psql failed. Trying Prisma db execute..."
            
            # Use Prisma db execute
            echo "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '$MIGRATION_NAME';" | npx prisma db execute --stdin 2>&1 || {
                echo "⚠️  Prisma db execute failed. Manual intervention required."
                echo ""
                echo "Please run this SQL manually:"
                echo "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '$MIGRATION_NAME';"
                echo ""
                echo "Or use Prisma Studio:"
                echo "npx prisma studio"
                echo "Then go to _prisma_migrations table and delete the row with migration_name = '$MIGRATION_NAME'"
                exit 1
            }
        }
    else
        echo "❌ .env file not found"
        exit 1
    fi
}

echo "✅ Migration removed from database"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Deploy migrations
echo "🚀 Deploying migrations..."
npx prisma migrate deploy

# Check final status
echo "✅ Final migration status:"
npx prisma migrate status

echo "✅ Done!"

