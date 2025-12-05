#!/bin/bash

# Fix all deployment issues: Admin panel, Frontend, Nginx
# Usage: ./fix-all-issues.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing all deployment issues..."
echo ""

# 1. Disable old Nginx configs
echo "📋 Step 1: Disabling old Nginx configs..."
if [ -L "/etc/nginx/sites-enabled/news.acoustic.uz.conf" ]; then
    echo "  Disabling news.acoustic.uz.conf..."
    rm -f /etc/nginx/sites-enabled/news.acoustic.uz.conf
fi
if [ -L "/etc/nginx/sites-enabled/api.acoustic.uz.conf" ]; then
    echo "  Disabling api.acoustic.uz.conf..."
    rm -f /etc/nginx/sites-enabled/api.acoustic.uz.conf
fi
if [ -L "/etc/nginx/sites-enabled/admins.acoustic.uz.conf" ]; then
    echo "  Disabling admins.acoustic.uz.conf..."
    rm -f /etc/nginx/sites-enabled/admins.acoustic.uz.conf
fi

# Ensure acoustic-uz.conf is enabled
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "  Enabling acoustic-uz.conf..."
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
fi

# 2. Rebuild admin panel
echo "📋 Step 2: Rebuilding admin panel..."
cd "$PROJECT_DIR"
export VITE_API_URL="https://a.acoustic.uz/api"
cd apps/admin
pnpm build

# Copy admin build
echo "  Copying admin build..."
rm -rf /var/www/admin.acoustic.uz
mkdir -p /var/www/admin.acoustic.uz
cp -r dist/* /var/www/admin.acoustic.uz/
chown -R www-data:www-data /var/www/admin.acoustic.uz

# 3. Rebuild frontend
echo "📋 Step 3: Rebuilding frontend..."
cd "$PROJECT_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
cd apps/frontend
pnpm build

# 4. Restart PM2
echo "📋 Step 4: Restarting PM2..."
cd "$PROJECT_DIR"
pm2 restart acoustic-frontend
pm2 save

# 5. Test and reload Nginx
echo "📋 Step 5: Testing and reloading Nginx..."
if nginx -t; then
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Nginx config test failed!"
    echo "  Check the error above"
    exit 1
fi

# 6. Check status
echo ""
echo "📋 Step 6: Final status check..."
pm2 list
echo ""
echo "  Admin panel files:"
ls -la /var/www/admin.acoustic.uz/ | head -5
echo ""
echo "  Frontend build:"
ls -la "$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend/server.js" 2>/dev/null && echo "    ✅ Exists" || echo "    ❌ Missing"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Test URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Backend: https://a.acoustic.uz/api"
echo "  - Admin: https://admin.acoustic.uz"

