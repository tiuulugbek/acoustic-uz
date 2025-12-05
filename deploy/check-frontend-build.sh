#!/bin/bash

# Check frontend build and PM2 configuration
# Usage: ./check-frontend-build.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔍 Checking frontend build and PM2 configuration..."
echo ""

# 1. Check standalone build
echo "📋 Step 1: Checking standalone build..."
STANDALONE_PATH="$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend/server.js"
if [ -f "$STANDALONE_PATH" ]; then
    echo "  ✅ Standalone server.js exists: $STANDALONE_PATH"
    ls -lh "$STANDALONE_PATH"
else
    echo "  ❌ Standalone server.js NOT found: $STANDALONE_PATH"
    echo "  Checking .next directory structure:"
    find "$PROJECT_DIR/apps/frontend/.next" -name "server.js" 2>/dev/null | head -5 || echo "    No server.js found"
fi
echo ""

# 2. Check PM2 config
echo "📋 Step 2: Checking PM2 configuration..."
if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    echo "  Ecosystem config exists:"
    grep -A 5 "acoustic-frontend" "$PROJECT_DIR/ecosystem.config.js" || echo "    acoustic-frontend not found"
else
    echo "  ❌ Ecosystem config NOT found!"
fi
echo ""

# 3. Check PM2 process
echo "📋 Step 3: Checking PM2 process..."
pm2 list | grep acoustic-frontend || echo "  Frontend process not found"
echo ""

# 4. Check PM2 logs
echo "📋 Step 4: Recent PM2 logs (last 10 lines):"
pm2 logs acoustic-frontend --lines 10 --nostream 2>/dev/null || echo "  No logs found"
echo ""

# 5. Check if port 3000 is listening
echo "📋 Step 5: Checking port 3000..."
netstat -tulpn | grep :3000 || echo "  Port 3000 not listening"
echo ""

# 6. Test local connection
echo "📋 Step 6: Testing local connection..."
curl -s http://localhost:3000 | head -20 || echo "  Connection failed"
echo ""

echo "✅ Check complete!"

