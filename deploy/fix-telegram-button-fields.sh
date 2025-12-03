#!/bin/bash
# Fix Telegram Button fields in database and rebuild

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"

echo "🔧 Fixing Telegram Button fields..."

cd "$PROJECT_DIR"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Check database connection
echo "🔍 Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it in .env file."
    exit 1
fi

# Add columns if they don't exist
echo "📊 Adding Telegram Button fields to database..."
psql "$DATABASE_URL" <<EOF
-- Add columns if they don't exist
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegramButtonBotToken" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegramButtonBotUsername" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegramButtonMessage_uz" TEXT;
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegramButtonMessage_ru" TEXT;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Setting' 
AND column_name IN ('telegramButtonBotToken', 'telegramButtonBotUsername', 'telegramButtonMessage_uz', 'telegramButtonMessage_ru');
EOF

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# Rebuild admin panel
echo "🏗️  Rebuilding admin panel..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@8.15.0
fi
pnpm install
pnpm --filter @acoustic/admin build

# Rebuild frontend
echo "🏗️  Rebuilding frontend..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.acoustic.uz/api}
export NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://news.acoustic.uz}

pnpm --filter @acoustic/shared build
cd apps/frontend
pnpm build

# Copy static files
STANDALONE_DIR=".next/standalone/apps/frontend"
if [ -d "$STANDALONE_DIR" ]; then
    echo "📋 Copying static files..."
    if [ -d "public" ]; then
        cp -r public "$STANDALONE_DIR/" || true
    fi
    if [ -d ".next/static" ]; then
        mkdir -p "$STANDALONE_DIR/.next/static"
        cp -r .next/static/* "$STANDALONE_DIR/.next/static/" || true
    fi
    chown -R deploy:deploy "$STANDALONE_DIR" || true
    find "$STANDALONE_DIR" -type f -exec chmod 644 {} \;
    find "$STANDALONE_DIR" -type d -exec chmod 755 {} \;
fi

# Restart frontend
echo "🔄 Restarting frontend..."
pm2 restart acoustic-frontend

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://admins.acoustic.uz/settings"
echo "2. Fill in 'Telegram Button Bot Username' field"
echo "3. Fill in 'Telegram Button Xabari (O'zbek)' field"
echo "4. Fill in 'Telegram Button Xabari (Rus)' field"
echo "5. Click 'Saqlash' button"
echo "6. Check https://news.acoustic.uz - Telegram button should appear"

