#!/bin/bash
# Check if favicon is working

echo "🔍 Checking favicon configuration..."
echo ""

# 1. Check database
echo "📋 Step 1: Checking database..."
cd /var/www/acoustic.uz
psql -U acousticwebdb -d acousticwebdb -c "SELECT \"faviconId\" FROM \"Setting\" WHERE id = 'singleton';" 2>/dev/null || echo "⚠️  Database check failed"

# 2. Check backend API
echo ""
echo "📋 Step 2: Checking backend API..."
curl -s http://localhost:3001/api/settings | grep -o '"favicon[^}]*}' | head -5 || echo "⚠️  Favicon not found in API response"

# 3. Check if favicon field exists in Prisma schema
echo ""
echo "📋 Step 3: Checking Prisma schema..."
grep -q "faviconId" prisma/schema.prisma && echo "✅ faviconId found in schema" || echo "❌ faviconId NOT found in schema"

# 4. Check migration
echo ""
echo "📋 Step 4: Checking migration..."
if [ -f "prisma/migrations/*/migration.sql" ]; then
    grep -r "faviconId" prisma/migrations/ && echo "✅ Migration found" || echo "⚠️  Migration not found"
else
    echo "⚠️  Migration directory not found"
fi

echo ""
echo "✅ Check complete!"
