#!/bin/bash

# Check frontend status and diagnose 404 issues

echo "🔍 Checking Frontend Status..."
echo ""

# 1. Check PM2 status
echo "📋 Step 1: PM2 Status"
pm2 list | grep -E "acoustic-frontend|frontend" || echo "  ⚠️  Frontend not found in PM2"
echo ""

# 2. Check if port 3000 is listening
echo "📋 Step 2: Port 3000 Status"
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "  ✅ Port 3000 is listening"
    netstat -tuln 2>/dev/null | grep ":3000 " || ss -tuln 2>/dev/null | grep ":3000 "
else
    echo "  ❌ Port 3000 is NOT listening"
fi
echo ""

# 3. Test localhost:3000 directly
echo "📋 Step 3: Testing localhost:3000"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
echo "  HTTP Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "  ✅ Frontend is responding"
    echo "  Response preview:"
    curl -s http://localhost:3000 | head -10
elif [ "$HTTP_CODE" = "000" ]; then
    echo "  ❌ Cannot connect to localhost:3000"
    echo "  Error: Connection refused or timeout"
else
    echo "  ⚠️  Frontend returned HTTP $HTTP_CODE"
    echo "  Response preview:"
    curl -s http://localhost:3000 | head -10
fi
echo ""

# 4. Check Nginx proxy configuration
echo "📋 Step 4: Nginx Proxy Configuration"
PROXY_PASS=$(nginx -T 2>/dev/null | grep -A 10 "server_name acoustic.uz www.acoustic.uz" | grep "proxy_pass" | head -1)
echo "  proxy_pass: $PROXY_PASS"

if echo "$PROXY_PASS" | grep -q "localhost:3000"; then
    echo "  ✅ Nginx proxy_pass is correct"
else
    echo "  ❌ Nginx proxy_pass is WRONG!"
fi
echo ""

# 5. Check frontend build directory
echo "📋 Step 5: Frontend Build Status"
FRONTEND_DIR="/var/www/acoustic.uz/apps/frontend"
if [ -d "$FRONTEND_DIR/.next" ]; then
    echo "  ✅ Build directory exists: $FRONTEND_DIR/.next"
    ls -la "$FRONTEND_DIR/.next" | head -5
else
    echo "  ❌ Build directory NOT found: $FRONTEND_DIR/.next"
fi
echo ""

# 6. Check frontend process
echo "📋 Step 6: Frontend Process"
FRONTEND_PID=$(lsof -ti:3000 2>/dev/null || echo "")
if [ -n "$FRONTEND_PID" ]; then
    echo "  ✅ Process found on port 3000: PID $FRONTEND_PID"
    ps aux | grep "$FRONTEND_PID" | grep -v grep
else
    echo "  ❌ No process found on port 3000"
fi
echo ""

# 7. Check Nginx error logs
echo "📋 Step 7: Recent Nginx Errors (last 10 lines)"
if [ -f "/var/log/nginx/acoustic.uz.error.log" ]; then
    tail -10 /var/log/nginx/acoustic.uz.error.log
else
    echo "  ⚠️  Error log not found"
fi
echo ""

# 8. Recommendations
echo "📋 Recommendations:"
if [ "$HTTP_CODE" = "000" ] || [ -z "$FRONTEND_PID" ]; then
    echo "  ❌ Frontend is not running!"
    echo "  → Start frontend: cd /var/www/acoustic.uz && pm2 start apps/frontend/ecosystem.config.js --only acoustic-frontend"
    echo "  → Or: cd /var/www/acoustic.uz/apps/frontend && npm start"
elif [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "301" ] && [ "$HTTP_CODE" != "302" ]; then
    echo "  ⚠️  Frontend is running but returning errors"
    echo "  → Check frontend logs: pm2 logs acoustic-frontend"
    echo "  → Rebuild frontend: cd /var/www/acoustic.uz && bash deploy/optimized-build-frontend.sh"
else
    echo "  ✅ Frontend appears to be working correctly"
fi
echo ""

echo "✅ Diagnostic complete!"
