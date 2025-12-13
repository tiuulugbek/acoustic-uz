#!/bin/bash

# Fix children-hearing chunk loading error
# Bu script frontend'ni rebuild qiladi va chunk xatolarini tuzatadi

set -e

echo "🔧 Fixing children-hearing chunk loading error"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project directory
if [ ! -f "apps/frontend/package.json" ]; then
    echo -e "${RED}❌ Error: apps/frontend/package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

FRONTEND_DIR="apps/frontend"
BUILD_DIR="$FRONTEND_DIR/.next"

echo "1️⃣ Stopping frontend PM2 process..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "acoustic-frontend"; then
        pm2 stop acoustic-frontend
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend PM2 process not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not found${NC}"
fi

echo ""
echo "2️⃣ Cleaning old build..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}✅ Old build directory removed${NC}"
else
    echo -e "${YELLOW}⚠️  Build directory not found (will be created)${NC}"
fi

# Also clean cache
if [ -d "$FRONTEND_DIR/.next/cache" ]; then
    rm -rf "$FRONTEND_DIR/.next/cache"
    echo -e "${GREEN}✅ Cache directory removed${NC}"
fi

echo ""
echo "3️⃣ Installing dependencies..."
cd "$FRONTEND_DIR"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "4️⃣ Building frontend..."
# Set environment variables for build
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
export NODE_ENV="production"

pnpm exec next build

if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build failed: .next directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

echo ""
echo "5️⃣ Checking children-hearing chunk..."
# Check if children-hearing chunk exists
CHUNK_FOUND=false
if [ -d ".next/static/chunks/app/children-hearing" ]; then
    echo -e "${GREEN}✅ children-hearing chunk directory found${NC}"
    ls -la ".next/static/chunks/app/children-hearing/" | head -5
    CHUNK_FOUND=true
fi

# Also check in the main chunks directory
if find .next/static/chunks -name "*children-hearing*" -o -name "*children_hearing*" 2>/dev/null | head -1 | grep -q .; then
    echo -e "${GREEN}✅ children-hearing chunk files found${NC}"
    find .next/static/chunks -name "*children-hearing*" -o -name "*children_hearing*" 2>/dev/null | head -5
    CHUNK_FOUND=true
fi

if [ "$CHUNK_FOUND" = false ]; then
    echo -e "${YELLOW}⚠️  children-hearing chunk not found in expected location${NC}"
    echo "Checking all chunks..."
    find .next/static/chunks -type f -name "*.js" | grep -i "children\|hearing" | head -10
fi

echo ""
echo "6️⃣ Starting frontend..."
cd ../..
if command -v pm2 &> /dev/null; then
    pm2 restart acoustic-frontend || pm2 start acoustic-frontend
    echo -e "${GREEN}✅ Frontend started${NC}"
    
    # Wait a bit for startup
    sleep 3
    
    # Check status
    pm2 status acoustic-frontend
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please start frontend manually${NC}"
fi

echo ""
echo "7️⃣ Checking nginx configuration..."
if [ -f "/etc/nginx/sites-available/acoustic.uz" ]; then
    echo "Checking nginx config for chunk handling..."
    if grep -q "_next/static" /etc/nginx/sites-available/acoustic.uz; then
        echo -e "${GREEN}✅ Nginx config includes _next/static handling${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx config may need _next/static handling${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx config file not found${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Fix complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Visit: https://acoustic.uz/children-hearing"
echo "3. Check browser console for errors"
echo ""
echo "If error persists, check:"
echo "  - Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Frontend logs: pm2 logs acoustic-frontend"
echo "  - Verify chunk files exist in .next/static/chunks"
echo ""

