#!/bin/bash

# Complete fix script: Backend + Nginx setup for acoustic.uz ONLY
# Usage: ./fix-backend-and-setup-nginx.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔧 Fixing backend and setting up Nginx..."
echo ""

# 1. Pull latest code
echo "📥 Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# 2. Install dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "apps/backend/node_modules" ]; then
    echo "  Installing dependencies..."
    pnpm install --frozen-lockfile
fi

# 3. Rebuild backend
echo "🏗️  Rebuilding backend..."
cd "$PROJECT_DIR"
pnpm --filter @acoustic/backend build

# 4. Stop PM2
echo "🛑 Stopping PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 5. Start PM2
echo "🚀 Starting PM2..."
cp "$PROJECT_DIR/deploy/ecosystem.config.js" "$PROJECT_DIR/ecosystem.config.js"
pm2 start ecosystem.config.js
pm2 save

# Wait a bit
sleep 3

# 6. Check PM2 status
echo "📋 PM2 Status:"
pm2 list

# 7. Check backend logs
echo "📝 Backend logs (last 5 lines):"
pm2 logs acoustic-backend --lines 5 --nostream || echo "  No logs yet"

# 8. Setup Nginx (only acoustic.uz domains)
echo ""
echo "🌐 Setting up Nginx for acoustic.uz domains..."

# Download config if not exists
if [ ! -f "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf" ]; then
    echo "  Downloading config from GitHub..."
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server.conf -o "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf"
fi

# Copy config
cp "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf" /etc/nginx/sites-available/acoustic-uz.conf

# Enable config
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
fi

# Test Nginx
if nginx -t; then
    echo "  ✅ Nginx config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Nginx config test failed"
    exit 1
fi

# 9. Setup SSL (optional, can be done manually)
echo ""
echo "🔒 SSL Certificate Setup:"
echo "  To setup SSL certificates, run:"
echo "  certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"
echo ""
read -p "  Setup SSL now? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    if command -v certbot &> /dev/null; then
        certbot --nginx \
            -d acoustic.uz \
            -d www.acoustic.uz \
            -d a.acoustic.uz \
            -d admin.acoustic.uz \
            --non-interactive \
            --agree-tos \
            --email admin@acoustic.uz \
            --redirect || echo "⚠️  Certbot failed, you can run it manually later"
        
        if nginx -t; then
            systemctl reload nginx
        fi
    else
        echo "  ❌ Certbot not installed. Install with: apt-get install certbot python3-certbot-nginx"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Check status:"
echo "  - PM2: pm2 list"
echo "  - Logs: pm2 logs"
echo "  - Frontend: http://acoustic.uz (or https:// if SSL is setup)"
echo "  - Backend: http://a.acoustic.uz/api (or https:// if SSL is setup)"
echo "  - Admin: http://admin.acoustic.uz (or https:// if SSL is setup)"

