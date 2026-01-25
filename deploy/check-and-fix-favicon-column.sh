#!/bin/bash
# Check if faviconId column exists and add it if not

set -e

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "🔍 Checking faviconId column..."
echo ""

# Get DATABASE_URL from .env
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL not found"
    exit 1
fi

# Check if column exists using Prisma
python3 << PYTHON
import os
import urllib.parse
import subprocess
import sys

db_url = os.environ.get('DB_URL', '')
parsed = urllib.parse.urlparse(db_url)
db_user = parsed.username
db_pass = urllib.parse.unquote(parsed.password) if parsed.password else ''
db_host = parsed.hostname or 'localhost'
db_port = parsed.port or 5432
db_name = parsed.path.lstrip('/').split('?')[0]

os.environ['PGPASSWORD'] = db_pass

# Check if column exists
check_cmd = [
    'psql',
    '-h', db_host,
    '-p', str(db_port),
    '-U', db_user,
    '-d', db_name,
    '-t', '-c',
    "SELECT column_name FROM information_schema.columns WHERE table_name='Setting' AND column_name='faviconId';"
]

result = subprocess.run(check_cmd, capture_output=True, text=True)
column_exists = result.stdout.strip()

if column_exists:
    print("✅ faviconId column exists")
    sys.exit(0)
else:
    print("❌ faviconId column does NOT exist")
    print("📋 Adding column...")
    
    sql = """
ALTER TABLE "Setting" ADD COLUMN "faviconId" TEXT;
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
    
    add_cmd = [
        'psql',
        '-h', db_host,
        '-p', str(db_port),
        '-U', db_user,
        '-d', db_name,
        '-c', sql
    ]
    
    result = subprocess.run(add_cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Column added successfully")
        sys.exit(0)
    else:
        print(f"❌ Error: {result.stderr}", file=sys.stderr)
        sys.exit(1)
PYTHON

if [ $? -eq 0 ]; then
    echo ""
    echo "🔄 Restarting backend..."
    pm2 restart acoustic-backend
    sleep 3
    
    echo ""
    echo "📋 Testing API..."
    curl -s http://localhost:3001/api/settings | python3 -c "import sys, json; data = json.load(sys.stdin); print('faviconId:', data.get('faviconId')); print('favicon:', 'present' if data.get('favicon') else 'null')" || echo "⚠️  API test failed"
fi
