#!/bin/bash
# Test various backend endpoints

echo "🔍 Testing backend endpoints..."
echo ""

# Test Swagger docs (should work if backend is running)
echo "📋 Testing /api/docs (Swagger):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://127.0.0.1:3001/api/docs
echo ""

# Test /api endpoint
echo "📋 Testing /api:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://127.0.0.1:3001/api
echo ""

# Test /api/health
echo "📋 Testing /api/health:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://127.0.0.1:3001/api/health
echo ""

# Test root
echo "📋 Testing / (root):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://127.0.0.1:3001/
echo ""

# Show backend logs
echo "📋 Recent backend logs (last 20 lines):"
pm2 logs acoustic-backend --lines 20 --nostream 2>/dev/null | tail -20 | sed 's/^/   /' || echo "   No logs"
echo ""

# Check if backend started successfully
echo "📋 Checking backend startup logs:"
pm2 logs acoustic-backend --lines 100 --nostream 2>/dev/null | grep -E "Application is running|Swagger|Error|Failed" | tail -10 | sed 's/^/   /' || echo "   No startup messages"

