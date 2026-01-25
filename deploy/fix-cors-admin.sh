#!/bin/bash

# Fix CORS for admin panel
# This script ensures admin.acoustic.uz can access the backend API

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing CORS for admin panel..."

cd "$PROJECT_DIR"

# Step 1: Update CORS_ORIGIN in .env
echo "📋 Step 1: Updating CORS_ORIGIN in .env..."

if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Remove old CORS_ORIGIN line
sed -i '/^CORS_ORIGIN=/d' .env

# Add new CORS_ORIGIN with admin.acoustic.uz
echo "CORS_ORIGIN=https://admin.acoustic.uz,https://acoustic.uz,https://www.acoustic.uz" >> .env

echo "✅ CORS_ORIGIN updated:"
grep "CORS_ORIGIN" .env | sed 's/^/   /'

# Step 2: Restart backend
echo ""
echo "📋 Step 2: Restarting backend..."
cd "$PROJECT_DIR"
pm2 restart acoustic-backend

# Wait a moment for restart
sleep 3

# Step 3: Check backend status
echo ""
echo "📋 Step 3: Checking backend status..."
pm2 status acoustic-backend

echo ""
echo "✅ CORS fix completed!"
echo ""
echo "📋 Summary:"
echo "   - CORS_ORIGIN updated in .env"
echo "   - Backend restarted"
echo ""
echo "🔍 To verify CORS is working:"
echo "   1. Check backend logs: pm2 logs acoustic-backend --lines 50"
echo "   2. Look for: '🌐 CORS enabled for origins: ...'"
echo "   3. Test admin panel: https://admin.acoustic.uz"

