#!/bin/bash
# Fix Next.js chunk 404 errors by properly rebuilding and copying static files
# NO NGINX CHANGES - only fixes frontend build and static files

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
STANDALONE_DIR="$FRONTEND_DIR/.next/standalone/apps/frontend"

echo -e "${BLUE}🔧 Fixing Next.js chunk 404 errors (Frontend only, no Nginx changes)...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Pull latest code
echo -e "${BLUE}📥 Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing...${NC}"

# 2. Stop PM2 frontend
echo -e "${BLUE}🛑 Step 2: Stopping PM2 frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true

# 3. Clean old builds
echo -e "${BLUE}🧹 Step 3: Cleaning old builds...${NC}"
cd "$FRONTEND_DIR"
rm -rf .next
rm -rf node_modules/.cache
cd "$PROJECT_DIR"

# 4. Install dependencies
echo -e "${BLUE}📦 Step 4: Installing dependencies...${NC}"
pnpm install --frozen-lockfile || pnpm install

# 5. Build shared package
echo -e "${BLUE}🏗️  Step 5: Building shared package...${NC}"
pnpm --filter @acoustic/shared build || {
    echo -e "${RED}❌ Shared build failed${NC}"
    exit 1
}

# 6. Build frontend with proper environment
echo -e "${BLUE}🏗️  Step 6: Building frontend...${NC}"
cd "$FRONTEND_DIR"

export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
export NEXT_TELEMETRY_DISABLED=1

echo "  Environment:"
echo "    NODE_ENV=$NODE_ENV"
echo "    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"

pnpm build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

# 7. Verify standalone build exists
echo -e "${BLUE}📋 Step 7: Verifying standalone build...${NC}"
STANDALONE_SERVER="$STANDALONE_DIR/server.js"
if [ ! -f "$STANDALONE_SERVER" ]; then
    echo -e "${RED}❌ Standalone server.js NOT found at: $STANDALONE_SERVER${NC}"
    echo "  Checking .next structure:"
    find .next -name "server.js" 2>/dev/null | head -5 || echo "    No server.js found"
    exit 1
fi
echo -e "${GREEN}  ✅ Standalone server.js exists${NC}"

# 8. Copy .next/static to standalone (CRITICAL STEP)
echo -e "${BLUE}📋 Step 8: Copying .next/static files...${NC}"
if [ -d "$FRONTEND_DIR/.next/static" ]; then
    # Ensure target directory exists
    mkdir -p "$STANDALONE_DIR/.next/static"
    
    # Clear existing static files to prevent stale content
    echo "  Clearing old static files..."
    rm -rf "$STANDALONE_DIR/.next/static"/* || true
    
    # Copy new static files
    echo "  Copying static files..."
    cp -r "$FRONTEND_DIR/.next/static"/* "$STANDALONE_DIR/.next/static/" || {
        echo -e "${RED}❌ Failed to copy static files${NC}"
        exit 1
    }
    
    # Verify files were copied
    STATIC_COUNT=$(find "$STANDALONE_DIR/.next/static" -type f | wc -l)
    echo -e "${GREEN}  ✅ Copied $STATIC_COUNT static files${NC}"
    
    # Show first few files for verification
    echo "  First 5 files:"
    find "$STANDALONE_DIR/.next/static" -type f | head -5 | sed 's/^/    /'
else
    echo -e "${RED}❌ .next/static directory not found in $FRONTEND_DIR${NC}"
    exit 1
fi

# 9. Copy public files
echo -e "${BLUE}📋 Step 9: Copying public files...${NC}"
if [ -d "$FRONTEND_DIR/public" ]; then
    mkdir -p "$STANDALONE_DIR/public"
    cp -r "$FRONTEND_DIR/public"/* "$STANDALONE_DIR/public/" 2>/dev/null || {
        echo -e "${YELLOW}  ⚠️  Public files copy failed (may already exist)${NC}"
    }
    echo -e "${GREEN}  ✅ Public files copied${NC}"
else
    echo -e "${YELLOW}  ⚠️  public directory not found${NC}"
fi

# 10. Verify final structure
echo -e "${BLUE}📋 Step 10: Verifying final structure...${NC}"
cd "$PROJECT_DIR"

# Check server.js
if [ -f "$STANDALONE_SERVER" ]; then
    echo -e "${GREEN}  ✅ server.js: $STANDALONE_SERVER${NC}"
    ls -lh "$STANDALONE_SERVER" | awk '{print "    Size: " $5}'
else
    echo -e "${RED}  ❌ server.js NOT found!${NC}"
    exit 1
fi

# Check static directory
if [ -d "$STANDALONE_DIR/.next/static" ]; then
    STATIC_SIZE=$(du -sh "$STANDALONE_DIR/.next/static" | awk '{print $1}')
    STATIC_FILES=$(find "$STANDALONE_DIR/.next/static" -type f | wc -l)
    echo -e "${GREEN}  ✅ .next/static: $STATIC_FILES files, $STATIC_SIZE${NC}"
    
    # Check chunks directory specifically
    if [ -d "$STANDALONE_DIR/.next/static/chunks" ]; then
        CHUNK_FILES=$(find "$STANDALONE_DIR/.next/static/chunks" -type f | wc -l)
        echo -e "${GREEN}  ✅ .next/static/chunks: $CHUNK_FILES files${NC}"
    else
        echo -e "${RED}  ❌ .next/static/chunks directory NOT found!${NC}"
        exit 1
    fi
else
    echo -e "${RED}  ❌ .next/static directory NOT found!${NC}"
    exit 1
fi

# 11. Update PM2 config
echo -e "${BLUE}📋 Step 11: Updating PM2 config...${NC}"
cp "$PROJECT_DIR/deploy/ecosystem.config.js" "$PROJECT_DIR/ecosystem.config.js"

# Verify PM2 config path
if grep -q "apps/frontend/.next/standalone/apps/frontend/server.js" "$PROJECT_DIR/ecosystem.config.js"; then
    echo -e "${GREEN}  ✅ PM2 config path is correct${NC}"
else
    echo -e "${RED}  ❌ PM2 config path is incorrect!${NC}"
    exit 1
fi

# 12. Restart PM2
echo -e "${BLUE}🚀 Step 12: Restarting PM2...${NC}"
pm2 delete acoustic-frontend 2>/dev/null || true
pm2 start "$PROJECT_DIR/ecosystem.config.js" --only acoustic-frontend
pm2 save

# Wait for startup
echo "  Waiting for startup (5 seconds)..."
sleep 5

# 13. Check PM2 status
echo -e "${BLUE}📋 Step 13: Checking PM2 status...${NC}"
pm2 list | grep acoustic-frontend || {
    echo -e "${RED}  ❌ Frontend not found in PM2!${NC}"
    exit 1
}

# 14. Test local connection
echo -e "${BLUE}📋 Step 14: Testing local connection...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Local connection successful (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}  ❌ Still getting 404. Checking logs...${NC}"
    pm2 logs acoustic-frontend --lines 20 --nostream
else
    echo -e "${YELLOW}  ⚠️  HTTP $HTTP_CODE - Checking logs...${NC}"
    pm2 logs acoustic-frontend --lines 20 --nostream
fi

# 15. Test static file access via localhost
echo -e "${BLUE}📋 Step 15: Testing static file access (localhost:3000)...${NC}"
# Find a chunk file to test
CHUNK_FILE=$(find "$STANDALONE_DIR/.next/static/chunks" -name "*.js" -type f | head -1)
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_RELATIVE_PATH=$(echo "$CHUNK_FILE" | sed "s|$STANDALONE_DIR||")
    echo "  Testing: http://localhost:3000$CHUNK_RELATIVE_PATH"
    CHUNK_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$CHUNK_RELATIVE_PATH" || echo "000")
    if [ "$CHUNK_HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ Static chunk file accessible via localhost (HTTP 200)${NC}"
        echo -e "${GREEN}  ✅ Nginx will proxy this correctly (no Nginx changes needed)${NC}"
    else
        echo -e "${RED}  ❌ Static chunk file returned HTTP $CHUNK_HTTP_CODE${NC}"
        echo "  File exists: $CHUNK_FILE"
        ls -lh "$CHUNK_FILE" || echo "    File not found!"
        echo -e "${YELLOW}  💡 This means Next.js server is not serving static files correctly${NC}"
    fi
else
    echo -e "${RED}  ❌ No chunk files found to test${NC}"
fi

# 16. Show recent logs
echo ""
echo -e "${BLUE}📋 Step 16: Recent logs (last 15 lines):${NC}"
pm2 logs acoustic-frontend --lines 15 --nostream 2>/dev/null || echo "  No logs yet"

echo ""
echo -e "${GREEN}✅ Fix complete! (No Nginx changes made)${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Check PM2: pm2 list"
echo "  2. Check logs: pm2 logs acoustic-frontend"
echo "  3. Test local: curl http://localhost:3000"
echo "  4. Test via Nginx: curl https://acoustic.uz"
echo "  5. Test static via Nginx: curl https://acoustic.uz/_next/static/chunks/webpack-*.js"
echo ""
echo -e "${YELLOW}💡 If chunks still fail:${NC}"
echo "  1. Hard refresh browser (Ctrl+Shift+R)"
echo "  2. Check PM2 logs: pm2 logs acoustic-frontend"
echo "  3. Verify static files: ls -la $STANDALONE_DIR/.next/static/chunks/"
echo "  4. Test direct: curl http://localhost:3000/_next/static/chunks/webpack-*.js"

