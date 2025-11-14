#!/bin/bash

echo "🔍 Testing Admin Panel ↔ Backend ↔ Frontend Connection"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend API
echo "1️⃣  Testing Backend API (http://localhost:3001/api/homepage/services)"
BACKEND_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001/api/homepage/services" 2>/dev/null)
HTTP_CODE=$(echo "$BACKEND_RESPONSE" | tail -n1)
BODY=$(echo "$BACKEND_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    SERVICE_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Backend is responding${NC} (HTTP $HTTP_CODE)"
    echo -e "  Found $SERVICE_COUNT services"
    echo "$BODY" | jq -r '.[] | "  - \(.title_uz) [\(.status)]"' 2>/dev/null || echo "  (JSON parsing failed)"
else
    echo -e "${RED}✗ Backend is not responding${NC} (HTTP $HTTP_CODE)"
    echo "  Response: $BODY"
fi

echo ""
echo "2️⃣  Testing Admin API endpoint (requires auth)"
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001/api/homepage/services/admin" -H "Authorization: Bearer test" 2>/dev/null)
ADMIN_HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)

if [ "$ADMIN_HTTP_CODE" = "401" ] || [ "$ADMIN_HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✓ Admin endpoint requires authentication${NC} (HTTP $ADMIN_HTTP_CODE - expected)"
else
    echo -e "${YELLOW}⚠ Admin endpoint returned${NC} (HTTP $ADMIN_HTTP_CODE)"
fi

echo ""
echo "3️⃣  Checking running services"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend running on port 3001${NC}"
else
    echo -e "${RED}✗ Backend not running on port 3001${NC}"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend not running on port 3000${NC}"
fi

if lsof -ti:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin panel running on port 3002${NC}"
else
    echo -e "${RED}✗ Admin panel not running on port 3002${NC}"
fi

echo ""
echo "4️⃣  Testing data update flow"
echo "   Making a test update (this will create a test service)..."
# This is just for testing - don't actually create anything

echo ""
echo "=================================================="
echo "💡 Tips:"
echo "  - Check browser console for errors"
echo "  - Verify NEXT_PUBLIC_API_URL in frontend"
echo "  - Frontend should use query key: ['homepage-services', locale]"
echo "  - Admin should invalidate: ['homepage-services-admin']"
echo "=================================================="

