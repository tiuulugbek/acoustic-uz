#!/bin/bash

# Script to check deployment status
# Usage: ./check-deployment-status.sh

set -e

echo "🔍 Checking deployment status..."
echo ""

# Check PM2 status
echo "📋 PM2 Status:"
pm2 list | grep -E "acoustic-backend|acoustic-frontend" || echo "  No PM2 processes found"
echo ""

# Check if processes are running
echo "🔍 Process Status:"
ps aux | grep -E "node.*3000|node.*3001" | grep -v grep || echo "  No Node processes found on ports 3000/3001"
echo ""

# Check ports
echo "🔌 Port Status:"
netstat -tulpn | grep -E ":3000|:3001" || echo "  Ports 3000/3001 not listening"
echo ""

# Check Nginx config
echo "🌐 Nginx Config:"
if [ -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    echo "  ✅ Nginx config exists"
    echo "  Checking server_name:"
    grep -E "server_name" /etc/nginx/sites-available/acoustic-uz.conf | head -3
else
    echo "  ❌ Nginx config not found"
fi
echo ""

# Check if Nginx config is enabled
if [ -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "  ✅ Nginx config is enabled"
else
    echo "  ❌ Nginx config is NOT enabled"
fi
echo ""

# Check Nginx status
echo "🔄 Nginx Status:"
systemctl status nginx --no-pager | head -5
echo ""

# Check project directories
echo "📁 Project Directories:"
echo "  Frontend build:"
ls -la /var/www/acoustic.uz/apps/frontend/.next/standalone/apps/frontend/server.js 2>/dev/null && echo "    ✅ Frontend build exists" || echo "    ❌ Frontend build NOT found"
echo "  Backend build:"
ls -la /var/www/acoustic.uz/apps/backend/dist/main.js 2>/dev/null && echo "    ✅ Backend build exists" || echo "    ❌ Backend build NOT found"
echo "  Admin build:"
ls -la /var/www/admin.acoustic.uz/index.html 2>/dev/null && echo "    ✅ Admin build exists" || echo "    ❌ Admin build NOT found"
echo ""

# Check SSL certificates
echo "🔒 SSL Certificates:"
if [ -d "/etc/letsencrypt/live/a.acoustic.uz" ]; then
    echo "  ✅ SSL cert exists for a.acoustic.uz"
    ls -la /etc/letsencrypt/live/a.acoustic.uz/ | grep -E "cert.pem|privkey.pem"
else
    echo "  ❌ SSL cert NOT found for a.acoustic.uz"
fi
echo ""

# Check PM2 logs
echo "📝 Recent PM2 Logs (last 10 lines):"
echo "  Backend:"
pm2 logs acoustic-backend --lines 10 --nostream 2>/dev/null || echo "    No logs found"
echo "  Frontend:"
pm2 logs acoustic-frontend --lines 10 --nostream 2>/dev/null || echo "    No logs found"
echo ""

echo "✅ Status check complete!"

