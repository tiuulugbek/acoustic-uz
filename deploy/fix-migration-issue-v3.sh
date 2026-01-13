#!/bin/bash
# Fix migration issue: check and resolve failed migration using Prisma

set -e

echo "🔧 Fixing migration issue..."

cd /var/www/news.acoustic.uz

# Check migration status first
echo "📋 Checking migration status..."
npx prisma migrate status || true

# List all migrations in folder
echo "📁 Listing migrations..."
ls -la prisma/migrations/ | grep -E "(homepage|date)" || echo "No problematic migrations found in folder"

# Check if problematic migration folder exists
if [ -d "prisma/migrations/\$(date +%Y%m%d%H%M%S)_add_homepage_content_models" ]; then
    echo "⚠️  Found problematic migration folder: \$(date +%Y%m%d%H%M%S)_add_homepage_content_models"
    echo "🗑️  Removing it..."
    rm -rf "prisma/migrations/\$(date +%Y%m%d%H%M%S)_add_homepage_content_models"
fi

# Check for any migration folders with "date" in name
for dir in prisma/migrations/*date*; do
    if [ -d "$dir" ]; then
        echo "⚠️  Found problematic migration folder: $dir"
        echo "🗑️  Removing it..."
        rm -rf "$dir"
    fi
done

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Try to resolve migration using Prisma
echo "🔍 Checking for failed migrations..."
FAILED_MIGRATIONS=$(npx prisma migrate status 2>&1 | grep -i "failed\|error" || true)

if [ -n "$FAILED_MIGRATIONS" ]; then
    echo "⚠️  Found failed migrations. Attempting to resolve..."
    
    # Try to find the migration name from Prisma status
    MIGRATION_NAME=$(npx prisma migrate status 2>&1 | grep -oE "[0-9]+_[a-zA-Z_]+" | head -1 || true)
    
    if [ -n "$MIGRATION_NAME" ]; then
        echo "📝 Found migration: $MIGRATION_NAME"
        
        # Check if HomepageSection table exists using Prisma
        TABLE_EXISTS=$(npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'HomepageSection');" 2>/dev/null | grep -i "true" || echo "false")
        
        if [ "$TABLE_EXISTS" != "false" ]; then
            echo "✅ HomepageSection table exists. Marking migration as applied..."
            npx prisma migrate resolve --applied "$MIGRATION_NAME" || {
                echo "⚠️  Could not resolve migration. Trying to mark as rolled back..."
                npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" || true
            }
        fi
    fi
fi

# Try deploy again
echo "🚀 Deploying migrations..."
npx prisma migrate deploy

echo "✅ Migration issue fixed!"

