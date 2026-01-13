#!/bin/bash
# Script to monitor image upload process in real-time

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Monitoring Image Upload Process     ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${YELLOW}📋 Instructions:${NC}"
echo "   1. Keep this script running"
echo "   2. Upload an image in admin panel"
echo "   3. Watch for upload logs below"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop monitoring${NC}"
echo ""

UPLOADS_DIR="/var/www/acoustic.uz/apps/backend/uploads"

# Monitor backend logs for upload-related messages
echo -e "${BLUE}Monitoring backend logs for upload activity...${NC}"
echo ""

# Clear previous logs and start fresh monitoring
pm2 logs acoustic-backend --lines 0 --nostream > /dev/null 2>&1 || true

# Monitor logs in real-time
pm2 logs acoustic-backend --lines 0 | grep --line-buffered -i "upload\|storage\|media\|file\|writing\|written" | while read -r line; do
    # Highlight important messages
    if echo "$line" | grep -qi "writing file to\|file written successfully\|upload complete"; then
        echo -e "${GREEN}✅ $line${NC}"
    elif echo "$line" | grep -qi "error\|failed\|exception"; then
        echo -e "${RED}❌ $line${NC}"
    elif echo "$line" | grep -qi "storage\|upload"; then
        echo -e "${BLUE}📤 $line${NC}"
    else
        echo "$line"
    fi
done

