#!/bin/bash
# Restart frontend with correct environment variables

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🔄 Restarting frontend with correct environment variables..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Stop frontend
echo "📋 Step 1: Stopping frontend..."
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo "   ✅ Frontend stopped"
echo ""

# Step 2: Create wrapper script with correct environment variables
echo "📋 Step 2: Creating wrapper script..."
cat > /tmp/start-frontend.sh << 'EOF'
#!/bin/bash
cd /var/www/acoustic.uz/apps/frontend
export NODE_ENV=production
export PORT=3000
export HOSTNAME=127.0.0.1
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
exec npm start
EOF
chmod +x /tmp/start-frontend.sh
echo "   ✅ Wrapper script created"
echo ""

# Step 3: Start frontend
echo "📋 Step 3: Starting frontend..."
pm2 start /tmp/start-frontend.sh \
    --name acoustic-frontend \
    --update-env \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --merge-logs \
    --max-memory-restart 500M

sleep 5
echo ""

# Step 4: Check status
echo "📋 Step 4: Checking frontend status..."
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo ""
    echo "   Recent errors:"
    pm2 logs acoustic-frontend --err --lines 10 --nostream 2>/dev/null | tail -10 | sed 's/^/      /' || true
fi
echo ""

# Step 5: Verify
echo "📋 Step 5: Verifying frontend..."
sleep 3

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding locally (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding locally (HTTP $FRONTEND_HTTP)"
fi

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ Frontend restart complete!"
echo ""
pm2 status acoustic-frontend
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - API: https://a.acoustic.uz/api"
echo ""
echo "📋 Environment variables set:"
echo "  - NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api"
echo "  - NEXT_PUBLIC_SITE_URL=https://acoustic.uz"
echo ""
echo "📋 To check logs:"
echo "  pm2 logs acoustic-frontend --lines 50"

