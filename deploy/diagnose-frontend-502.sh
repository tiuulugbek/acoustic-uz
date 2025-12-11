#!/bin/bash
# Diagnose frontend 502 Bad Gateway issue

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔍 Diagnosing frontend 502 Bad Gateway..."
echo ""

# Step 1: Check PM2 status
echo "📋 Step 1: Checking PM2 status..."
pm2 status acoustic-frontend
echo ""

# Step 2: Check if frontend is listening
echo "📋 Step 2: Checking if frontend is listening on port 3000..."
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "   ✅ Port 3000 is in use"
    netstat -tuln 2>/dev/null | grep ":3000 " || ss -tuln 2>/dev/null | grep ":3000 "
else
    echo "   ❌ Port 3000 is NOT in use"
fi
echo ""

# Step 3: Test local connection
echo "📋 Step 3: Testing local connection to frontend..."
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding locally (HTTP $FRONTEND_HTTP)"
else
    echo "   ❌ Frontend NOT responding locally (HTTP $FRONTEND_HTTP)"
    echo "   Trying to get response..."
    curl -v http://127.0.0.1:3000/ 2>&1 | head -20 || true
fi
echo ""

# Step 4: Check frontend logs
echo "📋 Step 4: Recent frontend logs..."
pm2 logs acoustic-frontend --lines 20 --nostream 2>/dev/null | tail -20 || true
echo ""

# Step 5: Check Nginx config for acoustic.uz
echo "📋 Step 5: Checking Nginx config for acoustic.uz..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
if [ -f "$NGINX_CONFIG" ]; then
    echo "   Checking proxy_pass directive..."
    grep -A 5 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 5 "location /" | head -10 || true
    echo ""
    echo "   Checking for localhost vs 127.0.0.1..."
    grep "proxy_pass" "$NGINX_CONFIG" | grep -E "(localhost|127.0.0.1|::1)" || true
else
    echo "   ⚠️  Nginx config not found at $NGINX_CONFIG"
    echo "   Searching for acoustic.uz config..."
    find /etc/nginx -name "*acoustic*" -type f 2>/dev/null | head -5 || true
fi
echo ""

# Step 6: Test Nginx connection to frontend
echo "📋 Step 6: Testing Nginx connection to frontend..."
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ❌ Website NOT accessible via Nginx (HTTP $NGINX_HTTP)"
fi
echo ""

# Step 7: Check Nginx error logs
echo "📋 Step 7: Recent Nginx errors for acoustic.uz..."
if [ -f "/var/log/nginx/acoustic.uz.error.log" ]; then
    tail -20 /var/log/nginx/acoustic.uz.error.log | grep -E "(502|Bad Gateway|connect|upstream)" || tail -10 /var/log/nginx/acoustic.uz.error.log
else
    echo "   ⚠️  Error log not found"
fi
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "💡 Common fixes:"
echo "  1. If frontend is not running: bash deploy/fix-frontend-complete.sh"
echo "  2. If Nginx proxy_pass uses localhost: bash deploy/fix-nginx-ipv6-issue-v2.sh"
echo "  3. If port 3000 is not listening: Check PM2 logs and restart frontend"

