#!/bin/bash

# Script to fix deployment issues
# Usage: ./fix-deployment.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing deployment issues..."
echo ""

# 1. Stop old processes
echo "🛑 Stopping old processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
sleep 2

# 2. Copy ecosystem config
echo "📋 Copying ecosystem config..."
cd "$PROJECT_DIR"
cp deploy/ecosystem.config.js ecosystem.config.js

# 3. Start PM2
echo "🚀 Starting PM2..."
pm2 start ecosystem.config.js
pm2 save

# 4. Wait a bit
sleep 3

# 5. Check PM2 status
echo "📋 PM2 Status:"
pm2 list

# 6. Check Nginx config
echo "🌐 Checking Nginx config..."
if [ -f "/etc/nginx/sites-available/acoustic-uz.conf" ]; then
    echo "  ✅ Config exists"
    
    # Enable if not enabled
    if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
        echo "  Enabling config..."
        ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
    fi
    
    # Test and reload
    if nginx -t; then
        systemctl reload nginx
        echo "  ✅ Nginx reloaded"
    else
        echo "  ❌ Nginx config test failed"
        exit 1
    fi
else
    echo "  ❌ Config not found, creating..."
    # Create config (from continue-deployment.sh)
    # This will be handled by continue-deployment.sh
fi

# 7. Check ports
echo "🔌 Checking ports..."
netstat -tulpn | grep -E ":3000|:3001" || echo "  ⚠️  Ports not listening yet"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check PM2: pm2 list"
echo "  2. Check logs: pm2 logs"
echo "  3. Setup SSL: certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"

