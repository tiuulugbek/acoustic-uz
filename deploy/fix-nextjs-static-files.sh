#!/bin/bash
# Fix Next.js static files 404 error
# This ensures static files are properly served by Next.js standalone server

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

echo -e "${BLUE}🔧 Fixing Next.js static files 404 error...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Check if static files exist
echo -e "${BLUE}📋 Step 1: Checking static files...${NC}"
STATIC_DIR="$STANDALONE_DIR/.next/static"
if [ -d "$STATIC_DIR" ]; then
    STATIC_COUNT=$(find "$STATIC_DIR" -type f | wc -l)
    STATIC_SIZE=$(du -sh "$STATIC_DIR" | awk '{print $1}')
    echo -e "${GREEN}  ✅ Static directory exists: $STATIC_DIR${NC}"
    echo "  Files: $STATIC_COUNT"
    echo "  Size: $STATIC_SIZE"
    
    # Check chunks directory
    if [ -d "$STATIC_DIR/chunks" ]; then
        CHUNK_COUNT=$(find "$STATIC_DIR/chunks" -type f | wc -l)
        echo -e "${GREEN}  ✅ Chunks directory exists: $STATIC_DIR/chunks${NC}"
        echo "  Chunk files: $CHUNK_COUNT"
        
        # Show first few chunk files
        echo "  First 5 chunk files:"
        find "$STATIC_DIR/chunks" -type f -name "*.js" | head -5 | sed 's/^/    /'
    else
        echo -e "${RED}  ❌ Chunks directory NOT found: $STATIC_DIR/chunks${NC}"
    fi
else
    echo -e "${RED}  ❌ Static directory NOT found: $STATIC_DIR${NC}"
    echo "  This means static files were not copied correctly!"
    exit 1
fi

# 2. Check if server.js exists
echo -e "${BLUE}📋 Step 2: Checking server.js...${NC}"
SERVER_JS="$STANDALONE_DIR/server.js"
if [ -f "$SERVER_JS" ]; then
    echo -e "${GREEN}  ✅ server.js exists: $SERVER_JS${NC}"
    ls -lh "$SERVER_JS" | awk '{print "    Size: " $5}'
else
    echo -e "${RED}  ❌ server.js NOT found: $SERVER_JS${NC}"
    exit 1
fi

# 3. Check PM2 working directory
echo -e "${BLUE}📋 Step 3: Checking PM2 configuration...${NC}"
PM2_INFO=$(pm2 jlist | jq -r '.[] | select(.name == "acoustic-frontend") | {cwd: .pm2_env.pm_cwd, script: .pm2_env.pm_exec_path}')

if [ -n "$PM2_INFO" ]; then
    PM2_CWD=$(echo "$PM2_INFO" | jq -r '.cwd')
    PM2_SCRIPT=$(echo "$PM2_INFO" | jq -r '.script')
    echo "  PM2 working directory: $PM2_CWD"
    echo "  PM2 script: $PM2_SCRIPT"
    
    # Check if PM2 is running from correct directory
    if [ "$PM2_CWD" != "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}  ⚠️  PM2 working directory is different from project directory${NC}"
        echo "  Expected: $PROJECT_DIR"
        echo "  Actual: $PM2_CWD"
    fi
    
    # Check if server.js path is correct
    EXPECTED_SERVER_JS="$PROJECT_DIR/apps/frontend/.next/standalone/apps/frontend/server.js"
    if [ "$PM2_SCRIPT" != "$EXPECTED_SERVER_JS" ]; then
        echo -e "${YELLOW}  ⚠️  PM2 script path might be incorrect${NC}"
        echo "  Expected: $EXPECTED_SERVER_JS"
        echo "  Actual: $PM2_SCRIPT"
    fi
else
    echo -e "${RED}  ❌ PM2 process 'acoustic-frontend' not found${NC}"
fi

# 4. Verify static files are accessible from server.js location
echo -e "${BLUE}📋 Step 4: Verifying static files path from server.js...${NC}"
# From server.js location, static files should be at: .next/static
# Server.js is at: apps/frontend/.next/standalone/apps/frontend/server.js
# Static files should be at: apps/frontend/.next/standalone/apps/frontend/.next/static

RELATIVE_STATIC_PATH=".next/static"
FULL_STATIC_PATH="$STANDALONE_DIR/$RELATIVE_STATIC_PATH"

if [ -d "$FULL_STATIC_PATH" ]; then
    echo -e "${GREEN}  ✅ Static files accessible from server.js location${NC}"
    echo "  Path: $FULL_STATIC_PATH"
else
    echo -e "${RED}  ❌ Static files NOT accessible from server.js location${NC}"
    echo "  Expected: $FULL_STATIC_PATH"
    echo "  This is the problem! Static files need to be at this location."
    
    # Try to create symlink or copy
    echo -e "${YELLOW}  💡 Attempting to fix by ensuring static files are in correct location...${NC}"
    
    # Check if static files exist in build directory
    BUILD_STATIC_DIR="$FRONTEND_DIR/.next/static"
    if [ -d "$BUILD_STATIC_DIR" ]; then
        echo "  Found static files in build directory: $BUILD_STATIC_DIR"
        
        # Ensure target directory exists
        mkdir -p "$STANDALONE_DIR/.next"
        
        # Copy static files if they don't exist
        if [ ! -d "$FULL_STATIC_PATH" ]; then
            echo "  Copying static files to correct location..."
            cp -r "$BUILD_STATIC_DIR" "$FULL_STATIC_PATH" || {
                echo -e "${RED}  ❌ Failed to copy static files${NC}"
                exit 1
            }
            echo -e "${GREEN}  ✅ Static files copied to correct location${NC}"
        else
            echo "  Static files already exist in correct location"
        fi
    else
        echo -e "${RED}  ❌ Build static directory not found: $BUILD_STATIC_DIR${NC}"
        echo "  Need to rebuild frontend!"
        exit 1
    fi
fi

# 5. Test static file access
echo -e "${BLUE}📋 Step 5: Testing static file access...${NC}"
# Find a chunk file to test
CHUNK_FILE=$(find "$STATIC_DIR/chunks" -name "*.js" -type f | head -1)
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_RELATIVE_PATH=$(echo "$CHUNK_FILE" | sed "s|$STANDALONE_DIR||")
    echo "  Testing: http://localhost:3000$CHUNK_RELATIVE_PATH"
    
    # Wait a bit for server to be ready
    sleep 2
    
    CHUNK_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$CHUNK_RELATIVE_PATH" || echo "000")
    if [ "$CHUNK_HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ Static chunk file accessible (HTTP 200)${NC}"
    else
        echo -e "${RED}  ❌ Static chunk file returned HTTP $CHUNK_HTTP_CODE${NC}"
        echo -e "${YELLOW}  💡 This might be a Next.js server configuration issue${NC}"
        echo "  Next.js standalone server should automatically serve static files from .next/static"
        echo "  If this fails, the server might need to be restarted"
    fi
else
    echo -e "${RED}  ❌ No chunk files found to test${NC}"
fi

# 6. Restart PM2 to ensure changes take effect
echo -e "${BLUE}📋 Step 6: Restarting PM2...${NC}"
pm2 restart acoustic-frontend || {
    echo -e "${YELLOW}  ⚠️  PM2 restart failed, trying start...${NC}"
    pm2 start "$PROJECT_DIR/ecosystem.config.js" --only acoustic-frontend
}

# Wait for startup
echo "  Waiting for startup (5 seconds)..."
sleep 5

# 7. Test again after restart
echo -e "${BLUE}📋 Step 7: Testing static file access after restart...${NC}"
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$CHUNK_RELATIVE_PATH" || echo "000")
    if [ "$CHUNK_HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ Static chunk file accessible after restart (HTTP 200)${NC}"
    else
        echo -e "${RED}  ❌ Static chunk file still returns HTTP $CHUNK_HTTP_CODE${NC}"
        echo -e "${YELLOW}  💡 Check PM2 logs: pm2 logs acoustic-frontend${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Fix complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "  Static files location: $STATIC_DIR"
echo "  Server.js location: $SERVER_JS"
echo "  PM2 process: acoustic-frontend"
echo ""
echo -e "${YELLOW}💡 If static files still fail:${NC}"
echo "  1. Check PM2 logs: pm2 logs acoustic-frontend"
echo "  2. Verify static files exist: ls -la $STATIC_DIR/chunks/"
echo "  3. Test direct access: curl http://localhost:3000/_next/static/chunks/webpack-*.js"
echo "  4. Check Next.js server configuration"

