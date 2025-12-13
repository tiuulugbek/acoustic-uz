#!/bin/bash

# Next.js Cache Cleanup Script
# Bu script Next.js cache va build fayllarni tozalaydi

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Next.js Cache Cleanup${NC}"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

APP_DIR="/var/www/acoustic.uz"
FRONTEND_DIR="$APP_DIR/apps/frontend"
NEXT_DIR="$FRONTEND_DIR/.next"

# Check if .next directory exists
if [ ! -d "$NEXT_DIR" ]; then
    echo -e "${YELLOW}⚠️  .next directory not found: $NEXT_DIR${NC}"
    exit 1
fi

# Show current disk usage
echo -e "${BLUE}📊 Current Disk Usage:${NC}"
echo ""
du -sh "$NEXT_DIR" 2>/dev/null || echo "Cannot read directory"
du -sh "$NEXT_DIR/cache" 2>/dev/null || echo "Cache directory not found"
du -sh "$NEXT_DIR/server/app" 2>/dev/null || echo "Server app directory not found"
echo ""

# Ask for confirmation
read -p "Do you want to clean Next.js cache? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Cleanup cancelled${NC}"
    exit 0
fi

# Stop frontend PM2 process
echo ""
echo -e "${BLUE}1️⃣ Stopping frontend PM2 process...${NC}"
pm2 stop acoustic-frontend 2>/dev/null || echo "Frontend process not running"
echo -e "${GREEN}✅ Frontend stopped${NC}"

# Backup important files (if needed)
echo ""
echo -e "${BLUE}2️⃣ Creating backup...${NC}"
BACKUP_DIR="/tmp/nextjs-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup only server/app (HTML files)
if [ -d "$NEXT_DIR/server/app" ]; then
    echo "Backing up server/app directory..."
    cp -r "$NEXT_DIR/server/app" "$BACKUP_DIR/" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"

# Clean cache directory
echo ""
echo -e "${BLUE}3️⃣ Cleaning cache directory...${NC}"
if [ -d "$NEXT_DIR/cache" ]; then
    rm -rf "$NEXT_DIR/cache"
    echo -e "${GREEN}✅ Cache cleaned${NC}"
else
    echo -e "${YELLOW}⚠️  Cache directory not found${NC}"
fi

# Clean other temporary directories
echo ""
echo -e "${BLUE}4️⃣ Cleaning temporary directories...${NC}"

# Clean .next/cache (if exists)
[ -d "$NEXT_DIR/cache" ] && rm -rf "$NEXT_DIR/cache" && echo "✅ Cache cleaned"

# Clean .next/server/chunks (old chunks)
[ -d "$NEXT_DIR/server/chunks" ] && rm -rf "$NEXT_DIR/server/chunks" && echo "✅ Old chunks cleaned"

# Clean .next/trace (build traces)
[ -d "$NEXT_DIR/trace" ] && rm -rf "$NEXT_DIR/trace" && echo "✅ Build traces cleaned"

# Show disk usage after cleanup
echo ""
echo -e "${BLUE}📊 Disk Usage After Cleanup:${NC}"
echo ""
du -sh "$NEXT_DIR" 2>/dev/null || echo "Cannot read directory"
du -sh "$NEXT_DIR/cache" 2>/dev/null || echo "Cache directory cleaned"
du -sh "$NEXT_DIR/server/app" 2>/dev/null || echo "Server app directory not found"
echo ""

# Ask if rebuild is needed
echo ""
read -p "Do you want to rebuild frontend? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}5️⃣ Rebuilding frontend...${NC}"
    cd "$FRONTEND_DIR"
    
    # Set environment variables
    export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
    export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"
    
    # Build
    sudo -u acoustic pnpm exec next build
    
    echo -e "${GREEN}✅ Frontend rebuilt${NC}"
    
    # Restart PM2
    echo ""
    echo -e "${BLUE}6️⃣ Restarting frontend...${NC}"
    pm2 restart acoustic-frontend
    echo -e "${GREEN}✅ Frontend restarted${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Rebuild skipped. Please rebuild manually:${NC}"
    echo "   cd $FRONTEND_DIR"
    echo "   pnpm exec next build"
    echo "   pm2 restart acoustic-frontend"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Cache cleanup completed!${NC}"
echo ""
echo "📋 Summary:"
echo "   - Cache directory cleaned"
echo "   - Backup created: $BACKUP_DIR"
echo "   - Frontend rebuilt (if selected)"
echo ""
echo "💡 Tip: Run this script monthly to keep disk usage low"
echo ""

