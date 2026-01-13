#!/bin/bash
# Remove failed migration from database - final version

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Removing failed migration from database..."

# First, let's find the exact migration name in database
echo "📋 Finding failed migration in database..."

# Create SQL file to find and delete the migration
cat > /tmp/find_and_delete_migration.sql <<'EOF'
-- Find the migration
SELECT migration_name, started_at, finished_at 
FROM "_prisma_migrations" 
WHERE migration_name LIKE '%homepage_content_models%' 
AND finished_at IS NULL
ORDER BY started_at DESC
LIMIT 1;

-- Delete it (uncomment to execute)
-- DELETE FROM "_prisma_migrations" 
-- WHERE migration_name LIKE '%homepage_content_models%' 
-- AND finished_at IS NULL;
EOF

echo "📝 Checking database for failed migrations..."
npx prisma db execute --file /tmp/find_and_delete_migration.sql 2>&1 | head -20 || true

# Now delete it - use the pattern that matches the actual name in database
echo "🗑️  Deleting failed migration from database..."

cat > /tmp/delete_migration.sql <<'EOF'
DELETE FROM "_prisma_migrations" 
WHERE migration_name LIKE '%homepage_content_models%' 
AND finished_at IS NULL;
EOF

npx prisma db execute --file /tmp/delete_migration.sql

echo "✅ Migration removed from database"

# Verify it's gone
echo "🔍 Verifying migration is removed..."
npx prisma migrate status

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

