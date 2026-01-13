#!/bin/bash

# Script to setup Nginx ONLY for acoustic.uz domains (without touching other configs)
# Usage: ./setup-acoustic-uz-only.sh

set -e

echo "🌐 Setting up Nginx for acoustic.uz domains ONLY..."
echo "⚠️  This will NOT touch any existing Nginx configurations"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

PROJECT_DIR="/var/www/acoustic.uz"

# Pull latest code
echo "📥 Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main || echo "⚠️  Git pull failed, trying to continue..."

# Check if config file exists
if [ ! -f "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf" ]; then
    echo "❌ Config file not found. Downloading from GitHub..."
    curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/nginx-acoustic-uz-new-server.conf -o "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf"
fi

# Copy Nginx config
echo "📋 Copying Nginx config..."
cp "$PROJECT_DIR/deploy/nginx-acoustic-uz-new-server.conf" /etc/nginx/sites-available/acoustic-uz.conf

# Enable config (only if not already enabled)
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "🔗 Enabling Nginx config..."
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
else
    echo "✅ Config already enabled"
fi

# Test Nginx config
echo "🧪 Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Nginx config is valid"
else
    echo "  ❌ Nginx config test failed"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Check DNS
echo "🔍 Checking DNS..."
ACOUSTIC_IP=$(dig +short acoustic.uz | head -1)
A_ACOUSTIC_IP=$(dig +short a.acoustic.uz | head -1)
ADMIN_ACOUSTIC_IP=$(dig +short admin.acoustic.uz | head -1)
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "  acoustic.uz -> $ACOUSTIC_IP (server: $SERVER_IP)"
echo "  a.acoustic.uz -> $A_ACOUSTIC_IP (server: $SERVER_IP)"
echo "  admin.acoustic.uz -> $ADMIN_ACOUSTIC_IP (server: $SERVER_IP)"

if [ "$ACOUSTIC_IP" != "$SERVER_IP" ] || [ "$A_ACOUSTIC_IP" != "$SERVER_IP" ] || [ "$ADMIN_ACOUSTIC_IP" != "$SERVER_IP" ]; then
    echo "⚠️  DNS may not be pointing to this server. Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Setup SSL certificates
echo "🔒 Setting up SSL certificates..."
certbot --nginx \
    -d acoustic.uz \
    -d www.acoustic.uz \
    -d a.acoustic.uz \
    -d admin.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect || {
    echo "⚠️  Certbot failed. You may need to run manually:"
    echo "   certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz"
}

# Test Nginx config again
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx configured and reloaded"
else
    echo "❌ Nginx config test failed after SSL setup"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Check status:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Backend: https://a.acoustic.uz/api"
echo "  - Admin: https://admin.acoustic.uz"
echo ""
echo "📝 To check existing Nginx configs:"
echo "  ls -la /etc/nginx/sites-enabled/"

