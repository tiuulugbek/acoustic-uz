#!/bin/bash
# Check backend API and logs

set -e

echo "🔍 Checking backend API..."
echo ""

# Check PM2 status
echo "📋 PM2 Status:"
pm2 status acoustic-backend
echo ""

# Check if backend is listening
echo "📋 Port 3001 status:"
netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp 2>/dev/null | grep 3001 || echo "   Port 3001 not listening"
echo ""

# Test different API endpoints
echo "📋 Testing API endpoints:"
echo ""

# Test root API
echo "   Testing: http://127.0.0.1:3001/api"
ROOT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api 2>/dev/null || echo "000")
echo "   Response: HTTP $ROOT_HTTP"

# Test health endpoint
echo "   Testing: http://127.0.0.1:3001/api/health"
HEALTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
echo "   Response: HTTP $HEALTH_HTTP"

# Test without /api prefix
echo "   Testing: http://127.0.0.1:3001/health"
HEALTH_NO_API=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/health 2>/dev/null || echo "000")
echo "   Response: HTTP $HEALTH_NO_API"

# Test root
echo "   Testing: http://127.0.0.1:3001/"
ROOT=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/ 2>/dev/null || echo "000")
echo "   Response: HTTP $ROOT"
echo ""

# Show recent logs
echo "📋 Recent backend logs (last 30 lines):"
pm2 logs acoustic-backend --lines 30 --nostream 2>/dev/null | tail -30 | sed 's/^/   /' || echo "   No logs available"
echo ""

# Show errors
echo "📋 Recent errors:"
pm2 logs acoustic-backend --err --lines 20 --nostream 2>/dev/null | tail -20 | sed 's/^/   /' || echo "   No errors"
echo ""

# Check backend process
echo "📋 Backend process info:"
pm2 describe acoustic-backend 2>/dev/null | grep -E "script|status|pid|uptime" | sed 's/^/   /' || echo "   Cannot get process info"
echo ""

# Test with verbose curl
echo "📋 Testing API with verbose output:"
curl -v http://127.0.0.1:3001/api 2>&1 | head -20 | sed 's/^/   /' || echo "   Request failed"

