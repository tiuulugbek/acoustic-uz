#!/bin/bash
# Apply favicon migration using Prisma

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔧 Applying favicon migration..."
echo ""

# 1. Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# 2. Apply migration using Prisma
echo "📋 Step 1: Applying migration using Prisma..."
pnpm exec prisma migrate deploy || {
    echo "⚠️  Prisma migrate deploy failed, trying manual SQL..."
    
    # Get database URL from .env
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    
    if [ -z "$DB_URL" ]; then
        echo "❌ DATABASE_URL not found in .env"
        exit 1
    fi
    
    # Extract connection details
    # Format: postgresql://user:password@host:port/database
    DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "Connecting to: $DB_HOST:$DB_PORT/$DB_NAME as $DB_USER"
    
    # Use PGPASSWORD environment variable
    export PGPASSWORD="$DB_PASS"
    
    psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" << SQL
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
    
    unset PGPASSWORD
}

# 3. Restart backend
echo ""
echo "📋 Step 2: Restarting backend..."
pm2 restart acoustic-backend
sleep 3

# 4. Test API
echo ""
echo "📋 Step 3: Testing API..."
curl -s http://localhost:3001/api/settings | python3 -c "import sys, json; data = json.load(sys.stdin); print('faviconId:', data.get('faviconId')); print('favicon:', 'present' if data.get('favicon') else 'null')" || echo "⚠️  API test failed"

echo ""
echo "✅ Migration applied!"
