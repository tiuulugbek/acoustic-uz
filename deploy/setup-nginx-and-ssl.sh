#!/bin/bash

# Script to setup Nginx and SSL certificates for acoustic.uz domains
# Usage: ./setup-nginx-and-ssl.sh

set -e

echo "🌐 Setting up Nginx and SSL certificates..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Copy Nginx config
echo "📋 Copying Nginx config..."
cp /var/www/acoustic.uz/deploy/nginx-acoustic-uz-new-server.conf /etc/nginx/sites-available/acoustic-uz.conf

# Enable config
if [ ! -L "/etc/nginx/sites-enabled/acoustic-uz.conf" ]; then
    echo "🔗 Enabling Nginx config..."
    ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
fi

# Test Nginx config (without SSL first)
echo "🧪 Testing Nginx config..."
# Temporarily comment out SSL lines for testing
sed -i.bak 's/listen 443 ssl http2;/listen 80;/g' /etc/nginx/sites-available/acoustic-uz.conf
sed -i.bak '/ssl_certificate/d' /etc/nginx/sites-available/acoustic-uz.conf
sed -i.bak '/ssl_dhparam/d' /etc/nginx/sites-available/acoustic-uz.conf
sed -i.bak '/include.*ssl-nginx/d' /etc/nginx/sites-available/acoustic-uz.conf

if nginx -t; then
    echo "  ✅ Nginx config is valid"
    systemctl reload nginx
    echo "  ✅ Nginx reloaded"
else
    echo "  ❌ Nginx config test failed"
    # Restore backup
    mv /etc/nginx/sites-available/acoustic-uz.conf.bak /etc/nginx/sites-available/acoustic-uz.conf
    exit 1
fi

# Restore SSL config
echo "🔒 Restoring SSL config..."
mv /etc/nginx/sites-available/acoustic-uz.conf.bak /etc/nginx/sites-available/acoustic-uz.conf
sed -i 's/listen 80;/listen 443 ssl http2;/g' /etc/nginx/sites-available/acoustic-uz.conf

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Setup SSL certificates
echo "🔒 Setting up SSL certificates..."
echo ""
echo "⚠️  Make sure DNS records are pointing to this server:"
echo "   - acoustic.uz -> $(hostname -I | awk '{print $1}')"
echo "   - www.acoustic.uz -> $(hostname -I | awk '{print $1}')"
echo "   - a.acoustic.uz -> $(hostname -I | awk '{print $1}')"
echo "   - admin.acoustic.uz -> $(hostname -I | awk '{print $1}')"
echo ""
read -p "Press Enter when DNS is configured..."

# Get SSL certificates
echo "🔒 Obtaining SSL certificates..."
certbot --nginx \
    -d acoustic.uz \
    -d www.acoustic.uz \
    -d a.acoustic.uz \
    -d admin.acoustic.uz \
    --non-interactive \
    --agree-tos \
    --email admin@acoustic.uz \
    --redirect

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

