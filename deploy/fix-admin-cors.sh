#!/bin/bash
# Fix admin panel CORS issues

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing admin panel CORS issues..."
echo ""

# Step 1: Check backend environment variables
echo "📋 Step 1: Checking backend CORS configuration..."
cd "$BACKEND_DIR"

if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check CORS_ORIGIN
    if grep -q "CORS_ORIGIN" .env; then
        echo "   Current CORS_ORIGIN:"
        grep "CORS_ORIGIN" .env | sed 's/^/      /'
    else
        echo "   ⚠️  CORS_ORIGIN not found in .env"
    fi
else
    echo "   ⚠️  .env file not found"
fi
echo ""

# Step 2: Update CORS_ORIGIN in backend .env
echo "📋 Step 2: Updating CORS_ORIGIN..."
cd "$BACKEND_DIR"

# Backup .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "   ✅ .env backed up"
fi

# Add or update CORS_ORIGIN
if [ -f ".env" ]; then
    # Remove old CORS_ORIGIN line
    sed -i '/^CORS_ORIGIN=/d' .env
    
    # Add new CORS_ORIGIN
    echo "" >> .env
    echo "# CORS origins - allow admin panel and frontend" >> .env
    echo "CORS_ORIGIN=https://admin.acoustic.uz,https://acoustic.uz,https://www.acoustic.uz" >> .env
    echo "   ✅ CORS_ORIGIN updated"
    
    echo "   New CORS_ORIGIN:"
    grep "CORS_ORIGIN" .env | sed 's/^/      /'
else
    echo "   Creating .env file..."
    cat > .env << 'EOF'
# CORS origins - allow admin panel and frontend
CORS_ORIGIN=https://admin.acoustic.uz,https://acoustic.uz,https://www.acoustic.uz
EOF
    echo "   ✅ .env file created"
fi
echo ""

# Step 3: Restart backend
echo "📋 Step 3: Restarting backend..."
cd "$PROJECT_DIR"

# Check if backend is running with PM2
if pm2 list | grep -q "acoustic-backend"; then
    echo "   Restarting backend with PM2..."
    pm2 restart acoustic-backend
    sleep 3
    
    # Check backend status
    if pm2 list | grep -q "acoustic-backend.*online"; then
        echo "   ✅ Backend restarted successfully"
    else
        echo "   ⚠️  Backend might not be running, check: pm2 logs acoustic-backend"
    fi
else
    echo "   ⚠️  Backend not found in PM2, please restart manually"
fi
echo ""

# Step 4: Verify CORS
echo "📋 Step 4: Verifying CORS configuration..."
sleep 2

# Test CORS preflight request
CORS_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS \
    -H "Origin: https://admin.acoustic.uz" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: authorization,content-type" \
    https://a.acoustic.uz/api/auth/me 2>/dev/null || echo "000")

if [ "$CORS_TEST" = "204" ] || [ "$CORS_TEST" = "200" ]; then
    echo "   ✅ CORS preflight request successful (HTTP $CORS_TEST)"
else
    echo "   ⚠️  CORS preflight request failed (HTTP $CORS_TEST)"
fi
echo ""

# Step 5: Check backend logs
echo "📋 Step 5: Checking backend logs..."
if pm2 list | grep -q "acoustic-backend"; then
    echo "   Last 5 lines of backend logs:"
    pm2 logs acoustic-backend --lines 5 --nostream 2>/dev/null | tail -5 | sed 's/^/      /' || echo "      (no logs)"
fi
echo ""

echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check admin panel: https://admin.acoustic.uz"
echo "  2. If still CORS errors, check backend logs: pm2 logs acoustic-backend"
echo "  3. Verify CORS_ORIGIN: cat $BACKEND_DIR/.env | grep CORS_ORIGIN"
echo ""
echo "💡 If backend doesn't restart automatically:"
echo "   pm2 restart acoustic-backend"

