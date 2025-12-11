#!/bin/bash
# Start frontend correctly with PM2

set -e

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"

echo "🚀 Starting frontend correctly..."
echo ""

cd "$PROJECT_DIR"

# Step 1: Stop and delete existing frontend
echo "📋 Step 1: Stopping existing frontend..."
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 2
echo "   ✅ Frontend stopped"
echo ""

# Step 2: Check if build exists
echo "📋 Step 2: Checking frontend build..."
if [ ! -d "$FRONTEND_DIR/.next" ]; then
    echo "   ❌ Frontend build not found!"
    echo "   Run: bash deploy/fix-frontend-complete.sh"
    exit 1
fi
echo "   ✅ Frontend build exists"
echo ""

# Step 3: Start frontend with correct PM2 command
echo "📋 Step 3: Starting frontend..."
cd "$FRONTEND_DIR"

# Method 1: Try using next start directly
if [ -f "node_modules/.bin/next" ]; then
    echo "   Using: next start"
    pm2 start node_modules/.bin/next --name acoustic-frontend -- start \
        --cwd "$FRONTEND_DIR" \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-frontend-error.log \
        --output /var/log/pm2/acoustic-frontend-out.log \
        --merge-logs \
        --max-memory-restart 500M
elif [ -f "node_modules/next/dist/bin/next" ]; then
    echo "   Using: next/dist/bin/next"
    pm2 start node_modules/next/dist/bin/next --name acoustic-frontend -- start \
        --cwd "$FRONTEND_DIR" \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-frontend-error.log \
        --output /var/log/pm2/acoustic-frontend-out.log \
        --merge-logs \
        --max-memory-restart 500M
else
    echo "   Using: npm start (with correct syntax)"
    cd "$FRONTEND_DIR"
    # Create a wrapper script
    cat > /tmp/start-frontend.sh << 'EOF'
#!/bin/bash
cd /var/www/acoustic.uz/apps/frontend
export NODE_ENV=production
exec npm start
EOF
    chmod +x /tmp/start-frontend.sh
    pm2 start /tmp/start-frontend.sh \
        --name acoustic-frontend \
        --update-env \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
        --error /var/log/pm2/acoustic-frontend-error.log \
        --output /var/log/pm2/acoustic-frontend-out.log \
        --merge-logs \
        --max-memory-restart 500M
fi

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
    pm2 logs acoustic-frontend --err --lines 20 --nostream 2>/dev/null | tail -20 | sed 's/^/      /' || true
fi
echo ""

# Step 5: Verify
echo "📋 Step 5: Verifying frontend..."
sleep 3

# Check if port 3000 is listening
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "   ✅ Port 3000 is listening"
else
    echo "   ❌ Port 3000 is NOT listening"
fi

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding locally (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding locally (HTTP $FRONTEND_HTTP)"
    echo "   Response:"
    curl -s http://127.0.0.1:3000/ 2>&1 | head -5 || true
fi

NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

echo ""
echo "✅ Frontend start complete!"
echo ""
pm2 status acoustic-frontend
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Local: http://127.0.0.1:3000"
echo ""
echo "📋 To check logs:"
echo "  pm2 logs acoustic-frontend --lines 50"

