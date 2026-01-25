#!/bin/bash
# Fix favicon configuration

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔧 Fixing favicon configuration..."
echo ""

# 1. Check if migration exists
echo "📋 Step 1: Checking migration..."
MIGRATION_FILE=$(find prisma/migrations -name "*favicon*" -type f | head -1)
if [ -n "$MIGRATION_FILE" ]; then
    echo "✅ Migration file found: $MIGRATION_FILE"
else
    echo "❌ Migration file not found"
    exit 1
fi

# 2. Apply migration
echo ""
echo "📋 Step 2: Applying migration..."
pnpm exec prisma migrate deploy || {
    echo "⚠️  Migration failed, trying to apply manually..."
    psql -U acousticwebdb -d acousticwebdb << SQL
-- Add faviconId column if not exists
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "faviconId" TEXT;

-- Create unique index if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_faviconId_key" ON "Setting"("faviconId");

-- Add foreign key if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Setting_faviconId_fkey'
  ) THEN
    ALTER TABLE "Setting" ADD CONSTRAINT "Setting_faviconId_fkey" 
    FOREIGN KEY ("faviconId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
SQL
}

# 3. Check database
echo ""
echo "📋 Step 3: Checking database..."
psql -U acousticwebdb -d acousticwebdb -c "\d \"Setting\"" | grep favicon || echo "⚠️  faviconId column not found"

# 4. Restart backend
echo ""
echo "📋 Step 4: Restarting backend..."
pm2 restart acoustic-backend
sleep 3

# 5. Test API
echo ""
echo "📋 Step 5: Testing API..."
curl -s http://localhost:3001/api/settings | python3 -c "import sys, json; data = json.load(sys.stdin); print('faviconId:', data.get('faviconId')); print('favicon:', 'present' if data.get('favicon') else 'null')" || echo "⚠️  API test failed"

echo ""
echo "✅ Fix complete!"
