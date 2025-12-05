#!/bin/bash
# Fix git conflicts and apply favicon migration

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔧 Fixing git conflicts and applying migration..."
echo ""

# 1. Fix git conflicts
echo "📋 Step 1: Fixing git conflicts..."
git stash || true
rm -f apps/admin/src/version.json apps/admin/public/version.json || true
git pull origin main || {
    echo "⚠️  Git pull failed, trying reset..."
    git reset --hard origin/main
}

# 2. Get database URL from .env
echo ""
echo "📋 Step 2: Getting database connection..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Read DATABASE_URL and URL decode password if needed
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "Database URL found (password hidden)"

# 3. Use Prisma migrate deploy (best option)
echo ""
echo "📋 Step 3: Applying migration using Prisma..."
pnpm exec prisma migrate deploy || {
    echo "⚠️  Prisma migrate deploy failed"
    echo "💡 Trying manual SQL..."
    
    # Extract connection details using Python for URL decoding
    python3 << PYTHON
import os
import urllib.parse
import subprocess
import sys

db_url = os.environ.get('DB_URL', '')
if not db_url:
    print("❌ DB_URL not set")
    sys.exit(1)

try:
    parsed = urllib.parse.urlparse(db_url)
    db_user = parsed.username
    db_pass = urllib.parse.unquote(parsed.password) if parsed.password else ''
    db_host = parsed.hostname or 'localhost'
    db_port = parsed.port or 5432
    db_name = parsed.path.lstrip('/').split('?')[0]
    
    # Set PGPASSWORD
    os.environ['PGPASSWORD'] = db_pass
    
    # SQL commands
    sql = """
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "faviconId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_faviconId_key" ON "Setting"("faviconId");
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
"""
    
    # Execute psql
    cmd = [
        'psql',
        '-h', db_host,
        '-p', str(db_port),
        '-U', db_user,
        '-d', db_name,
        '-c', sql
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        sys.exit(result.returncode)
        
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON
}

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
