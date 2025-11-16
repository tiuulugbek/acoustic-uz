#!/bin/bash

# Test script to verify frontend behavior when backend is down
# This script tests graceful degradation

set -e

echo "🧪 Testing Frontend Behavior When Backend is Down"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
BACKEND_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001/api}"
echo "📍 Checking backend at: $BACKEND_URL"

if curl -s -f --connect-timeout 2 "$BACKEND_URL/banners" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is currently running${NC}"
    echo ""
    echo "⚠️  To test backend failure behavior:"
    echo "   1. Stop the backend server (Ctrl+C or kill process)"
    echo "   2. Run this script again to verify frontend still works"
    echo ""
    read -p "Press Enter to continue testing with backend running, or Ctrl+C to stop backend first..."
else
    echo -e "${YELLOW}⚠️  Backend is NOT running (this is expected for this test)${NC}"
    echo ""
fi

echo "🧪 Testing Frontend Endpoints..."
echo ""

# Test homepage
echo "1️⃣  Testing Homepage: http://localhost:3000"
if curl -s -f --connect-timeout 2 "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Homepage loads${NC}"
else
    echo -e "   ${RED}❌ Homepage failed (is frontend running?)${NC}"
    exit 1
fi

# Test catalog page
echo "2️⃣  Testing Catalog: http://localhost:3000/catalog"
if curl -s -f --connect-timeout 2 "http://localhost:3000/catalog" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Catalog page loads${NC}"
else
    echo -e "   ${RED}❌ Catalog page failed${NC}"
fi

# Test product page (should show fallback)
echo "3️⃣  Testing Product Page: http://localhost:3000/products/test-product"
if curl -s -f --connect-timeout 2 "http://localhost:3000/products/test-product" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Product page loads (should show fallback message)${NC}"
else
    echo -e "   ${RED}❌ Product page failed${NC}"
fi

# Test service page (should show fallback)
echo "4️⃣  Testing Service Page: http://localhost:3000/services/test-service"
if curl -s -f --connect-timeout 2 "http://localhost:3000/services/test-service" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Service page loads (should show fallback message)${NC}"
else
    echo -e "   ${RED}❌ Service page failed${NC}"
fi

echo ""
echo "✅ Frontend Behavior Test Complete!"
echo ""
echo "📋 Manual Testing Checklist:"
echo ""
echo "When backend is DOWN, verify:"
echo "  ✅ Homepage shows all sections with fallback content"
echo "  ✅ Catalog page shows default categories"
echo "  ✅ Product pages show 'Product not found' message"
echo "  ✅ Service pages show 'Service not found' message"
echo "  ✅ Menu navigation works"
echo "  ✅ Language switcher works"
echo "  ✅ No JavaScript errors in browser console"
echo "  ✅ Console shows API warnings (not errors)"
echo ""
echo "When backend comes BACK ONLINE:"
echo "  ✅ Data automatically refreshes (within 3 seconds for homepage)"
echo "  ✅ Fallback content is replaced with real data"
echo "  ✅ No page reload required"
echo ""

