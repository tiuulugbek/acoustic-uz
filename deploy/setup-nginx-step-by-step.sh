#!/bin/bash

# Step-by-step Nginx setup: HTTP first, then SSL
# Usage: ./setup-nginx-step-by-step.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🌐 Setting up Nginx step-by-step..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# Step 2: Copy HTTP-only config
echo "📋 Step 2: Copying HTTP-only config..."
if [ ! -f "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server-http-only.conf" ]; then
    echo "  Downloading HTTP-only config..."
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server-http-only.conf -o "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server-http-only.conf"
fi

cp "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server-http-only.conf" /etc/nginx/sites-available/acoustic-uz.conf

# Step 3: Enable config
echo "🔗 Step 3: Enabling config..."
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
fi

# Step 4: Test HTTP config
echo "🧪 Step 4: Testing HTTP config..."
if nginx -t; then
    systemctl reload nginx
    echo "  ✅ Nginx reloaded with HTTP config"
else
    echo "  ❌ Nginx config test failed"
    exit 1
fi

# Step 5: Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Step 6: Setup SSL certificates
echo ""
echo "🔒 Step 5: Setting up SSL certificates..."
echo "  This will automatically update the config to HTTPS"
echo ""
read -p "  Continue with SSL setup? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    certbot --nginx \
        -d acoustic.uz \
        -d www.acoustic.uz \
        -d a.acoustic.uz \
        -d admin.acoustic.uz \
        --non-interactive \
        --agree-tos \
        --email admin@acoustic.uz \
        --redirect || {
        echo "⚠️  Certbot failed. You can try again later."
        echo "  Run: certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"
    }
    
    # Test config after SSL
    if nginx -t; then
        systemctl reload nginx
        echo "  ✅ Nginx reloaded with SSL config"
    else
        echo "  ❌ Nginx config test failed after SSL"
        echo "  You may need to manually fix the config"
    fi
else
    echo "  ⏭️  Skipping SSL setup. You can run it later with:"
    echo "  certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Check status:"
echo "  - Frontend: http://acoustic.uz (or https:// if SSL is setup)"
echo "  - Backend: http://a.acoustic.uz/api (or https:// if SSL is setup)"
echo "  - Admin: http://admin.acoustic.uz (or https:// if SSL is setup)"

