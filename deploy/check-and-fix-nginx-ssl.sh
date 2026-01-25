#!/bin/bash

# Check and fix Nginx SSL configuration
# Usage: ./check-and-fix-nginx-ssl.sh

set -e

echo "🔧 Checking and fixing Nginx SSL configuration..."
echo ""

# 1. Show current HTTPS server block
echo "📋 Step 1: Current HTTPS server block for acoustic.uz..."
nginx -T 2>/dev/null | grep -B 2 -A 30 "listen 443.*acoustic.uz" | head -35
echo ""

# 2. Check if there are multiple HTTPS blocks
echo "📋 Step 2: Checking for multiple HTTPS blocks..."
HTTPS_BLOCKS=$(nginx -T 2>/dev/null | grep -c "listen 443.*acoustic.uz" || echo "0")
echo "  Found $HTTPS_BLOCKS HTTPS blocks for acoustic.uz"
echo ""

# 3. Backup current config
echo "📋 Step 3: Backing up current config..."
cp /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-available/acoustic-uz.conf.backup.$(date +%Y%m%d%H%M%S)
echo "  ✅ Backup created"
echo ""

# 4. Check if certbot modified the config
echo "📋 Step 4: Checking certbot modifications..."
if grep -q "# managed by Certbot" /etc/nginx/sites-available/acoustic-uz.conf; then
    echo "  ⚠️  Certbot has modified the config"
    echo "  Checking SSL certificate paths..."
    grep -E "ssl_certificate|ssl_certificate_key" /etc/nginx/sites-available/acoustic-uz.conf | head -4
else
    echo "  ✅ No certbot modifications found"
fi
echo ""

# 5. Show the actual config file
echo "📋 Step 5: Current config file content (first 50 lines)..."
head -50 /etc/nginx/sites-available/acoustic-uz.conf
echo ""

# 6. Check what's actually being served
echo "📋 Step 6: Testing what's being served..."
echo "  Testing HTTPS..."
curl -s https://acoustic.uz | head -20
echo ""
echo "  Response headers:"
curl -I https://acoustic.uz 2>&1 | head -15
echo ""

# 7. Check Nginx access logs
echo "📋 Step 7: Recent access logs..."
if [ -f "/var/log/nginx/acoustic.uz.access.log" ]; then
    tail -5 /var/log/nginx/acoustic.uz.access.log || echo "    No recent access"
else
    echo "  Access log not found"
fi
echo ""

# 8. Check error logs
echo "📋 Step 8: Recent error logs..."
if [ -f "/var/log/nginx/acoustic.uz.error.log" ]; then
    tail -10 /var/log/nginx/acoustic.uz.error.log || echo "    No errors"
else
    echo "  Error log not found"
fi
echo ""

echo "✅ Check complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review the config above"
echo "  2. If proxy_pass is wrong, fix it manually"
echo "  3. Or restore from backup and re-run certbot"

