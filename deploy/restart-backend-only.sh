#!/bin/bash
# Restart backend only (to apply /uploads/ fix)

set -e

PROJECT_DIR="/var/www/acoustic.uz"

echo "🔄 Restarting backend to apply /uploads/ fix..."
echo ""

cd "$PROJECT_DIR" || exit 1

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# 2. Build shared package
echo "📦 Building shared package..."
pnpm --filter @acoustic/shared build || echo "⚠️  Shared build failed, continuing..."

# 3. Build backend
echo "🏗️  Building backend..."
cd apps/backend
pnpm build || {
    echo "❌ Backend build failed!"
    exit 1
}
cd "$PROJECT_DIR"

# 4. Restart PM2
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend || {
    echo "⚠️  PM2 restart failed, trying start..."
    pm2 start ecosystem.config.js --only acoustic-backend
}

# 5. Wait a bit for startup
sleep 3

# 6. Check status
echo ""
echo "📋 Backend status:"
pm2 list | grep acoustic-backend || echo "   ⚠️  Backend not found in PM2"

# 7. Test /uploads endpoint
echo ""
echo "📋 Testing /uploads endpoint..."
TEST_FILE="2025-12-04-1764833768750-blob-rbrw6k.webp"

# Test via backend directly
BACKEND_URL="http://localhost:3001/uploads/$TEST_FILE"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend serves /uploads/ correctly (HTTP 200)"
    echo "   🔗 Direct backend: $BACKEND_URL"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  File not found via backend (HTTP 404)"
    echo "   💡 Check if file exists: ls -lh $PROJECT_DIR/apps/backend/uploads/$TEST_FILE"
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

# Test via Nginx (a.acoustic.uz)
NGINX_URL="https://a.acoustic.uz/uploads/$TEST_FILE"
NGINX_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$NGINX_URL" 2>/dev/null || echo "000")

if [ "$NGINX_CODE" = "200" ]; then
    echo "   ✅ Nginx serves /uploads/ correctly (HTTP 200)"
    echo "   🔗 Via Nginx: $NGINX_URL"
elif [ "$NGINX_CODE" = "404" ]; then
    echo "   ⚠️  Nginx returns 404 (HTTP 404)"
    echo "   💡 Nginx might need /uploads location block pointing to backend"
elif [ "$NGINX_CODE" = "502" ] || [ "$NGINX_CODE" = "503" ]; then
    echo "   ⚠️  Nginx can't reach backend (HTTP $NGINX_CODE)"
    echo "   💡 Check if backend is running: pm2 logs acoustic-backend --lines 10"
else
    echo "   ⚠️  Unexpected Nginx response (HTTP $NGINX_CODE)"
fi

echo ""
echo "✅ Backend restart complete!"
echo ""
echo "🔍 Check logs: pm2 logs acoustic-backend --lines 20"

