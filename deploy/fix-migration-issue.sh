#!/bin/bash
# Fix migration issue: mark failed migration as resolved

set -e

echo "🔧 Fixing migration issue..."

cd /var/www/news.acoustic.uz

# Check if migration is already applied
echo "📋 Checking migration status..."
npx prisma migrate status

# Resolve the failed migration by marking it as applied
# Since HomepageSection already exists, we'll mark this migration as applied
echo "✅ Marking failed migration as resolved..."
npx prisma migrate resolve --applied "$(date +%Y%m%d%H%M%S)_add_homepage_content_models" || {
    echo "⚠️  Migration resolve failed. Trying alternative approach..."
    
    # Alternative: Delete the problematic migration folder
    echo "🗑️  Removing problematic migration folder..."
    rm -rf "prisma/migrations/\$(date +%Y%m%d%H%M%S)_add_homepage_content_models"
    
    # Pull latest changes
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    # Try deploy again
    echo "🚀 Deploying migrations..."
    npx prisma migrate deploy
}

echo "✅ Migration issue fixed!"

