#!/bin/bash
# Script to check if an uploaded image file exists and is accessible

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Checking Uploaded Image              ${NC}"
echo -e "${BLUE}=======================================${NC}"

UPLOADS_DIR="/var/www/acoustic.uz/apps/backend/uploads"
FILENAME="${1:-2025-12-14-1765702038107-blob-gqn0t9.webp}"

echo ""
echo -e "${BLUE}Checking file: $FILENAME${NC}"
echo ""

# 1. Check if file exists locally
echo -e "${BLUE}1️⃣ Checking if file exists locally...${NC}"
FILEPATH="$UPLOADS_DIR/$FILENAME"
if [ -f "$FILEPATH" ]; then
    echo -e "${GREEN}✅ File exists: $FILEPATH${NC}"
    ls -lh "$FILEPATH"
    echo ""
    echo "File permissions:"
    stat -c "%A %U:%G %n" "$FILEPATH"
else
    echo -e "${RED}❌ File does NOT exist: $FILEPATH${NC}"
    echo ""
    echo "Recent files in uploads directory:"
    ls -lht "$UPLOADS_DIR" | head -10
fi

# 2. Check file via HTTP
echo ""
echo -e "${BLUE}2️⃣ Checking file via HTTP...${NC}"
URL="https://a.acoustic.uz/uploads/$FILENAME"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")
CONTENT_TYPE=$(curl -s -I "$URL" | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r' || echo "unknown")
CONTENT_LENGTH=$(curl -s -I "$URL" | grep -i "content-length" | cut -d' ' -f2 | tr -d '\r' || echo "unknown")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ File is accessible via HTTP (200 OK)${NC}"
    echo "   Content-Type: $CONTENT_TYPE"
    echo "   Content-Length: $CONTENT_LENGTH bytes"
else
    echo -e "${RED}❌ File is NOT accessible via HTTP (HTTP $HTTP_CODE)${NC}"
    echo "   URL: $URL"
    echo ""
    echo "Response headers:"
    curl -s -I "$URL" | head -10
fi

# 3. Check Nginx error log
echo ""
echo -e "${BLUE}3️⃣ Checking Nginx error log...${NC}"
ERROR_LOG="/var/log/nginx/a.acoustic.uz.error.log"
if [ -f "$ERROR_LOG" ]; then
    echo "Recent errors related to this file:"
    grep -i "$FILENAME" "$ERROR_LOG" | tail -5 || echo "No errors found for this file"
else
    echo -e "${YELLOW}⚠️  Error log not found: $ERROR_LOG${NC}"
fi

# 4. Check backend logs
echo ""
echo -e "${BLUE}4️⃣ Checking backend logs...${NC}"
echo "Recent upload-related logs:"
pm2 logs acoustic-backend --lines 20 --nostream | grep -i "upload\|storage\|$FILENAME" | tail -10 || echo "No upload logs found"

echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}✅ Check Complete!                     ${NC}"
echo -e "${BLUE}=======================================${NC}"

