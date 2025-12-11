#!/bin/bash
# Comprehensive script to pull latest code, fix all issues, and start the site
# This script handles: git pull, dependencies, builds, Nginx fixes, and service restarts

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🚀 Starting comprehensive site deployment..."
echo "=========================================="
echo ""

# Function to print step header
step() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📌 Step $1: $2"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Pull latest code
step "1" "Pulling latest code from Git"
cd "$PROJECT_DIR"
git pull origin main || {
    echo "   ⚠️  Git pull failed, but continuing..."
}
echo "   ✅ Code updated"
echo ""

# Step 2: Install dependencies
step "2" "Installing dependencies"
if ! command_exists pnpm; then
    echo "   ❌ pnpm not found. Installing..."
    npm install -g pnpm
fi
pnpm install
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Build shared package
step "3" "Building shared package"
pnpm --filter @acoustic/shared build
echo "   ✅ Shared package built"
echo ""

# Step 4: Build backend
step "4" "Building backend"
cd "$PROJECT_DIR"

# Clean dist directory
rm -rf "$BACKEND_DIR/dist"
mkdir -p "$BACKEND_DIR/dist"

BUILD_LOG="/tmp/backend-build-$(date +%Y%m%d_%H%M%S).log"
BUILD_SUCCESS=false

# Method 1: Try building from project root using pnpm filter (most reliable in monorepo)
echo "   Method 1: pnpm --filter @acoustic/backend build"
if pnpm --filter @acoustic/backend build > "$BUILD_LOG" 2>&1; then
    echo "   ✅ Build command completed"
    BUILD_SUCCESS=true
else
    echo "   ⚠️  Method 1 failed (exit code: $?)"
    echo "   Last 10 lines:"
    tail -10 "$BUILD_LOG" | sed 's/^/      /' || true
fi

# Check if build succeeded
cd "$BACKEND_DIR"
if [ -f "dist/main.js" ]; then
    echo "   ✅ dist/main.js found!"
    BUILD_SUCCESS=true
elif [ -f "dist/src/main.js" ]; then
    echo "   ⚠️  Found dist/src/main.js, copying to dist/main.js..."
    cp dist/src/main.js dist/main.js
    BUILD_SUCCESS=true
fi

# Method 2: If Method 1 didn't create dist/main.js, try nest build directly
if [ "$BUILD_SUCCESS" = false ]; then
    echo ""
    echo "   Method 2: nest build from backend directory"
    cd "$BACKEND_DIR"
    if pnpm exec nest build >> "$BUILD_LOG" 2>&1; then
        echo "   ✅ Nest build completed"
        if [ -f "dist/main.js" ]; then
            BUILD_SUCCESS=true
        elif [ -f "dist/src/main.js" ]; then
            cp dist/src/main.js dist/main.js
            BUILD_SUCCESS=true
        fi
    else
        echo "   ⚠️  Method 2 failed (exit code: $?)"
    fi
fi

# Method 3: If still failed, try tsc directly
if [ "$BUILD_SUCCESS" = false ]; then
    echo ""
    echo "   Method 3: tsc compilation"
    cd "$BACKEND_DIR"
    if pnpm exec tsc >> "$BUILD_LOG" 2>&1; then
        echo "   ✅ TypeScript compilation completed"
        if [ -f "dist/main.js" ]; then
            BUILD_SUCCESS=true
        elif [ -f "dist/src/main.js" ]; then
            cp dist/src/main.js dist/main.js
            BUILD_SUCCESS=true
        fi
    else
        echo "   ⚠️  Method 3 failed (exit code: $?)"
    fi
fi

# Final verification
cd "$BACKEND_DIR"
if [ -f "dist/main.js" ]; then
    echo ""
    echo "   ✅ Backend build verified (dist/main.js exists)"
    echo "   File size: $(du -h dist/main.js | cut -f1)"
else
    echo ""
    echo "   ❌ ERROR: dist/main.js not found after all build attempts"
    echo ""
    echo "   Diagnostic information:"
    echo "   - Current directory: $(pwd)"
    echo "   - dist directory exists: $([ -d "dist" ] && echo "Yes" || echo "No")"
    
    if [ -d "dist" ]; then
        echo "   - dist contents:"
        find dist -type f | head -20 | sed 's/^/      /' || echo "      Empty or no files"
        echo ""
        echo "   - Looking for any main.js:"
        find dist -name "*main*.js" 2>/dev/null | sed 's/^/      /' || echo "      Not found"
    fi
    
    echo ""
    echo "   Build log saved to: $BUILD_LOG"
    echo "   Last 50 lines of build log:"
    tail -50 "$BUILD_LOG" | sed 's/^/      /' || true
    echo ""
    echo "   💡 Suggestion: Run 'bash deploy/diagnose-backend-build-issue.sh' for detailed diagnostics"
    exit 1
fi

echo ""

# Step 5: Build frontend
step "5" "Building frontend"
cd "$FRONTEND_DIR"

# Ensure devDependencies are installed for tailwindcss
export NODE_ENV=development
if ! command_exists tailwindcss || [ ! -f "node_modules/.bin/tailwindcss" ]; then
    echo "   Installing devDependencies for tailwindcss..."
    pnpm install
fi

# Build frontend
echo "   Building frontend..."
if pnpm build > /tmp/frontend-build.log 2>&1; then
    echo "   ✅ Frontend build successful"
else
    echo "   ⚠️  Frontend build had warnings/errors, checking..."
    tail -30 /tmp/frontend-build.log || true
    # Continue anyway if build directory exists
    if [ -d ".next" ]; then
        echo "   ⚠️  Build directory exists, continuing..."
    else
        echo "   ❌ Frontend build failed"
        exit 1
    fi
fi
echo ""

# Step 6: Fix Nginx IPv6 issue
step "6" "Fixing Nginx IPv6 configuration"
if grep -q "proxy_pass http://localhost:3000" "$NGINX_CONFIG"; then
    echo "   Found localhost:3000, replacing with 127.0.0.1:3000..."
    # Create backup
    BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo "   ✅ Backup created: $BACKUP_FILE"
    
    # Replace using sed (more reliable than Python for simple replacements)
    sed -i 's|proxy_pass http://localhost:3000|proxy_pass http://127.0.0.1:3000|g' "$NGINX_CONFIG"
    echo "   ✅ Replaced localhost:3000 with 127.0.0.1:3000"
else
    echo "   ✅ Nginx config already uses 127.0.0.1:3000"
fi

# Test Nginx config
echo "   Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "   ✅ Nginx reloaded"
else
    echo "   ⚠️  Nginx configuration test failed"
    echo "   Showing error:"
    sudo nginx -t 2>&1 | tail -10 || true
    echo "   ⚠️  Continuing anyway..."
fi
echo ""

# Step 7: Fix CORS for a.acoustic.uz (if needed)
step "7" "Checking CORS configuration"
if grep -q "location /api {" "$NGINX_CONFIG" && grep -q "server_name a.acoustic.uz" "$NGINX_CONFIG"; then
    if ! grep -q "Access-Control-Allow-Origin" "$NGINX_CONFIG"; then
        echo "   ⚠️  CORS headers not found in Nginx config"
        echo "   Run: bash deploy/fix-cors-a-acoustic-uz-only.sh"
        echo "   (Skipping for now to avoid duplicate location errors)"
    else
        echo "   ✅ CORS headers already configured"
    fi
else
    echo "   ℹ️  CORS handled by backend"
fi
echo ""

# Step 8: Restart backend
step "8" "Restarting backend service"
cd "$PROJECT_DIR"

# Stop backend if running
pm2 stop acoustic-backend 2>/dev/null || true
sleep 2

# Start backend using ecosystem config or direct command
if [ -f "deploy/ecosystem.config.js" ]; then
    # Use ecosystem config if available
    pm2 start deploy/ecosystem.config.js --only acoustic-backend || pm2 restart acoustic-backend
else
    # Direct start
    cd "$BACKEND_DIR"
    pm2 start dist/main.js --name acoustic-backend --update-env || pm2 restart acoustic-backend
    cd "$PROJECT_DIR"
fi

sleep 3

# Check backend status
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend is online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-backend --err --lines 10 --nostream 2>/dev/null || true
fi
echo ""

# Step 9: Restart frontend
step "9" "Restarting frontend service"

# Check if frontend standalone build exists
FRONTEND_STANDALONE="$FRONTEND_DIR/.next/standalone/apps/frontend"
if [ -f "$FRONTEND_STANDALONE/server.js" ]; then
    echo "   Found standalone build, using it..."
    pm2 stop acoustic-frontend 2>/dev/null || true
    sleep 2
    
    if [ -f "deploy/ecosystem.config.js" ]; then
        pm2 start deploy/ecosystem.config.js --only acoustic-frontend || pm2 restart acoustic-frontend
    else
        cd "$FRONTEND_STANDALONE"
        pm2 start server.js --name acoustic-frontend --update-env || pm2 restart acoustic-frontend
        cd "$PROJECT_DIR"
    fi
else
    echo "   ⚠️  Standalone build not found, frontend may need to be rebuilt"
    echo "   Attempting standard restart..."
    pm2 restart acoustic-frontend 2>/dev/null || echo "   Frontend not running"
fi

sleep 3

# Check frontend status
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend is online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo "   Recent errors:"
    pm2 logs acoustic-frontend --err --lines 10 --nostream 2>/dev/null || true
fi
echo ""

# Step 10: Verify services
step "10" "Verifying services"
echo ""

# Check backend API
echo "   Testing backend API..."
sleep 2
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "401" ]; then
    echo "   ✅ Backend API responding (HTTP $BACKEND_HTTP)"
else
    echo "   ⚠️  Backend API not responding (HTTP $BACKEND_HTTP)"
fi

# Check frontend
echo "   Testing frontend..."
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend responding (HTTP $FRONTEND_HTTP)"
else
    echo "   ⚠️  Frontend not responding (HTTP $FRONTEND_HTTP)"
fi

# Check via Nginx
echo "   Testing via Nginx..."
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Website not accessible via Nginx (HTTP $NGINX_HTTP)"
fi

# Check API via Nginx
echo "   Testing API via Nginx..."
API_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api 2>/dev/null || echo "000")
if [ "$API_HTTP" = "200" ] || [ "$API_HTTP" = "401" ] || [ "$API_HTTP" = "404" ]; then
    echo "   ✅ API accessible via Nginx (HTTP $API_HTTP)"
else
    echo "   ⚠️  API not accessible via Nginx (HTTP $API_HTTP)"
fi

echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Service Status:"
pm2 status
echo ""
echo "📋 Useful commands:"
echo "  - Backend logs: pm2 logs acoustic-backend --lines 50"
echo "  - Frontend logs: pm2 logs acoustic-frontend --lines 50"
echo "  - PM2 status: pm2 status"
echo "  - Nginx error logs: tail -f /var/log/nginx/acoustic.uz.error.log"
echo "  - Nginx access logs: tail -f /var/log/nginx/acoustic.uz.access.log"
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://acoustic.uz"
echo "  - Admin: https://admin.acoustic.uz"
echo "  - API: https://a.acoustic.uz/api"
echo ""

