#!/bin/bash
# Remove failed migration from database

set -e

cd /var/www/news.acoustic.uz

echo "🔧 Removing failed migration from database..."

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    echo "Please set DATABASE_URL in .env file"
    exit 1
fi

echo "📝 Removing migration: 20251203083645_add_homepage_content_models"

# Remove migration from database using psql
psql "$DATABASE_URL" <<EOF
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251203083645_add_homepage_content_models';
SELECT 'Migration removed successfully' AS status;
EOF

echo "✅ Migration removed from database"
echo "📥 Now pulling latest changes..."
git pull origin main

echo "🚀 Deploying migrations..."
npx prisma migrate deploy

echo "✅ Done!"

