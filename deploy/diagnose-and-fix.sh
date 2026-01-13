#!/bin/bash

# Diagnose and fix deployment issues
# Usage: ./diagnose-and-fix.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔍 Diagnosing deployment issues..."
echo ""

# 1. Check Nginx configs
echo "📋 Step 1: Checking Nginx configurations..."
echo "  Enabled configs:"
ls -la /etc/nginx/sites-enabled/ | grep -v "^d" | tail -n +2
echo ""

# 2. Check which configs are active
echo "📋 Step 2: Checking active server blocks..."
nginx -T 2>/dev/null | grep -E "server_name|listen" | head -20
echo ""

# 3. Check admin panel files
echo "📋 Step 3: Checking admin panel files..."
if [ -d "/var/www/admin.acoustic.uz" ]; then
    echo "  ✅ Admin directory exists"
    ls -la /var/www/admin.acoustic.uz/ | head -10
    if [ -f "/var/www/admin.acoustic.uz/index.html" ]; then
        echo "  ✅ index.html exists"
    else
        echo "  ❌ index.html NOT found!"
    fi
else
    echo "  ❌ Admin directory NOT found!"
fi
echo ""

# 4. Check frontend files
echo "📋 Step 4: Checking frontend build..."
if [ -f "$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
    echo "  ✅ Frontend build exists"
else
    echo "  ❌ Frontend build NOT found!"
fi
echo ""

# 5. Check PM2 status
echo "📋 Step 5: Checking PM2 status..."
pm2 list
echo ""

# 6. Check Nginx error logs
echo "📋 Step 6: Recent Nginx errors..."
if [ -f "/var/log/nginx/admin.acoustic.uz.error.log" ]; then
    echo "  Admin panel errors (last 10 lines):"
    tail -10 /var/log/nginx/admin.acoustic.uz.error.log || echo "    No errors"
fi
if [ -f "/var/log/nginx/acoustic.uz.error.log" ]; then
    echo "  Frontend errors (last 10 lines):"
    tail -10 /var/log/nginx/acoustic.uz.error.log || echo "    No errors"
fi
echo ""

# 7. Check if old configs exist
echo "📋 Step 7: Checking for old configs..."
if [ -f "/etc/nginx/sites-enabled/news.acoustic.uz.conf" ]; then
    echo "  ⚠️  Old news.acoustic.uz.conf is still enabled!"
fi
if [ -f "/etc/nginx/sites-enabled/api.acoustic.uz.conf" ]; then
    echo "  ⚠️  Old api.acoustic.uz.conf is still enabled!"
fi
if [ -f "/etc/nginx/sites-enabled/admins.acoustic.uz.conf" ]; then
    echo "  ⚠️  Old admins.acoustic.uz.conf is still enabled!"
fi
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "🔧 Suggested fixes:"
echo "  1. Disable old configs if they exist"
echo "  2. Rebuild admin panel if index.html is missing"
echo "  3. Rebuild frontend if server.js is missing"
echo "  4. Check Nginx error logs for specific errors"

