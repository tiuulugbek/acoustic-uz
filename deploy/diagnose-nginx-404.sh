#!/bin/bash
# Diagnose Nginx 404 issue

set -e

echo "🔍 Diagnosing Nginx 404 issue..."
echo ""

# Step 1: Check frontend is running
echo "📋 Step 1: Checking frontend..."
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
echo "   Frontend PM2 status: $FRONTEND_STATUS"

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
echo "   Frontend local response: HTTP $FRONTEND_HTTP"
echo ""

# Step 2: Check Nginx configuration
echo "📋 Step 2: Checking Nginx configuration..."
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "   acoustic.uz server block location /:"
grep -A 15 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 10 "location /" | sed 's/^/      /' || echo "      Not found"
echo ""

# Step 3: Test Nginx directly
echo "📋 Step 3: Testing Nginx..."
echo "   Testing: curl -H 'Host: acoustic.uz' http://127.0.0.1/"
NGINX_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: acoustic.uz" http://127.0.0.1/ 2>/dev/null || echo "000")
echo "   Response: HTTP $NGINX_LOCAL"
echo ""

# Step 4: Check Nginx error logs
echo "📋 Step 4: Recent Nginx errors:"
sudo tail -10 /var/log/nginx/acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || echo "      Cannot read logs"
echo ""

# Step 5: Check if SSL is configured
echo "📋 Step 5: Checking SSL configuration..."
grep -A 5 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -E "listen|ssl_certificate" | sed 's/^/      /' || echo "      Not found"
echo ""

# Step 6: Test with verbose curl
echo "📋 Step 6: Testing with verbose curl..."
curl -v -H "Host: acoustic.uz" https://127.0.0.1/ 2>&1 | head -30 | sed 's/^/      /' || echo "      Request failed"
echo ""

# Step 7: Check Nginx access logs
echo "📋 Step 7: Recent access logs:"
sudo tail -5 /var/log/nginx/acoustic.uz.access.log 2>/dev/null | sed 's/^/      /' || echo "      Cannot read logs"

