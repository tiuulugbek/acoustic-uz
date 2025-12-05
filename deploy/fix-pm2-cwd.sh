#!/bin/bash
# Fix PM2 working directory for Next.js standalone build
# This ensures Next.js server can find static files in .next/static

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"
FRONTEND_STANDALONE_DIR="$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend"

echo -e "${BLUE}🔧 Fixing PM2 working directory for Next.js standalone build...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Check if standalone directory exists
echo -e "${BLUE}📋 Step 1: Checking standalone directory...${NC}"
if [ -d "$FRONTEND_STANDALONE_DIR" ]; then
    echo -e "${GREEN}  ✅ Standalone directory exists: $FRONTEND_STANDALONE_DIR${NC}"
    
    # Check server.js
    if [ -f "$FRONTEND_STANDALONE_DIR/server.js" ]; then
        echo -e "${GREEN}  ✅ server.js exists${NC}"
    else
        echo -e "${RED}  ❌ server.js NOT found${NC}"
        exit 1
    fi
    
    # Check .next/static
    if [ -d "$FRONTEND_STANDALONE_DIR/.next/static" ]; then
        STATIC_COUNT=$(find "$FRONTEND_STANDALONE_DIR/.next/static" -type f | wc -l)
        echo -e "${GREEN}  ✅ .next/static exists with $STATIC_COUNT files${NC}"
    else
        echo -e "${RED}  ❌ .next/static NOT found${NC}"
        exit 1
    fi
else
    echo -e "${RED}  ❌ Standalone directory NOT found: $FRONTEND_STANDALONE_DIR${NC}"
    exit 1
fi

# 2. Stop PM2 frontend
echo -e "${BLUE}📋 Step 2: Stopping PM2 frontend...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true

# 3. Update ecosystem.config.js
echo -e "${BLUE}📋 Step 3: Updating ecosystem.config.js...${NC}"
cp "$PROJECT_DIR/deploy/ecosystem.config.js" "$PROJECT_DIR/ecosystem.config.js"

# Verify the config
if grep -q "cwd: '/var/www/acoustic.uz/apps/frontend/.next/standalone/apps/frontend'" "$PROJECT_DIR/ecosystem.config.js"; then
    echo -e "${GREEN}  ✅ ecosystem.config.js updated correctly${NC}"
else
    echo -e "${RED}  ❌ ecosystem.config.js not updated correctly${NC}"
    echo "  Please check the file manually"
    exit 1
fi

# 4. Start PM2 with new config
echo -e "${BLUE}📋 Step 4: Starting PM2 with new config...${NC}"
pm2 start "$PROJECT_DIR/ecosystem.config.js" --only acoustic-frontend
pm2 save

# Wait for startup
echo "  Waiting for startup (5 seconds)..."
sleep 5

# 5. Check PM2 status
echo -e "${BLUE}📋 Step 5: Checking PM2 status...${NC}"
pm2 list | grep acoustic-frontend || {
    echo -e "${RED}  ❌ Frontend not found in PM2!${NC}"
    exit 1
}

# Get PM2 info
PM2_CWD=$(pm2 jlist 2>/dev/null | grep -A 20 '"name":"acoustic-frontend"' | grep '"pm_cwd"' | cut -d'"' -f4 || echo "")
if [ -n "$PM2_CWD" ]; then
    echo "  PM2 working directory: $PM2_CWD"
    if [ "$PM2_CWD" = "$FRONTEND_STANDALONE_DIR" ]; then
        echo -e "${GREEN}  ✅ PM2 working directory is correct${NC}"
    else
        echo -e "${YELLOW}  ⚠️  PM2 working directory is different${NC}"
        echo "  Expected: $FRONTEND_STANDALONE_DIR"
        echo "  Actual: $PM2_CWD"
    fi
fi

# 6. Test static file access
echo -e "${BLUE}📋 Step 6: Testing static file access...${NC}"
# Find a chunk file to test
CHUNK_FILE=$(find "$FRONTEND_STANDALONE_DIR/.next/static/chunks" -name "*.js" -type f | head -1)
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_RELATIVE_PATH=$(echo "$CHUNK_FILE" | sed "s|$FRONTEND_STANDALONE_DIR||")
    echo "  Testing: http://localhost:3000$CHUNK_RELATIVE_PATH"
    
    CHUNK_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$CHUNK_RELATIVE_PATH" || echo "000")
    if [ "$CHUNK_HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ Static chunk file accessible (HTTP 200)${NC}"
    else
        echo -e "${RED}  ❌ Static chunk file returned HTTP $CHUNK_HTTP_CODE${NC}"
        echo -e "${YELLOW}  💡 Check PM2 logs: pm2 logs acoustic-frontend${NC}"
    fi
else
    echo -e "${RED}  ❌ No chunk files found to test${NC}"
fi

# 7. Test main page
echo -e "${BLUE}📋 Step 7: Testing main page...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}  ✅ Main page accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}  ❌ Main page returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}✅ Fix complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  PM2 working directory: $FRONTEND_STANDALONE_DIR"
echo "  Server.js: $FRONTEND_STANDALONE_DIR/server.js"
echo "  Static files: $FRONTEND_STANDALONE_DIR/.next/static"
echo ""
echo -e "${YELLOW}💡 If static files still fail:${NC}"
echo "  1. Check PM2 logs: pm2 logs acoustic-frontend"
echo "  2. Verify PM2 cwd: pm2 jlist | grep acoustic-frontend"
echo "  3. Test direct: curl http://localhost:3000/_next/static/chunks/webpack-*.js"

