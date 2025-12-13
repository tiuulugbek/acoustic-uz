#!/bin/bash

# Analytics Deployment Verification Script
# Bu script analytics integratsiyasining to'g'ri deploy qilinganini tekshiradi

set -e

echo "🔍 Analytics Deployment Verification"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: prisma/schema.prisma not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

echo "1️⃣ Checking Prisma schema..."
if grep -q "googleAnalyticsId" prisma/schema.prisma && grep -q "yandexMetrikaId" prisma/schema.prisma; then
    echo -e "${GREEN}✅ Analytics fields found in Prisma schema${NC}"
else
    echo -e "${RED}❌ Analytics fields NOT found in Prisma schema${NC}"
    exit 1
fi

echo ""
echo "2️⃣ Checking database migration..."
# Check if migration was applied
if command -v psql &> /dev/null; then
    echo "Checking database connection..."
    # Try to check if columns exist (this requires DATABASE_URL)
    if [ -n "$DATABASE_URL" ]; then
        echo "DATABASE_URL is set, checking columns..."
        # Note: This is a basic check, actual verification should be done manually
        echo -e "${YELLOW}⚠️  Please verify manually: SELECT column_name FROM information_schema.columns WHERE table_name='Setting' AND column_name IN ('googleAnalyticsId', 'yandexMetrikaId');${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL not set. Please verify manually that migration was applied.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql not found. Please verify manually that migration was applied.${NC}"
fi

echo ""
echo "3️⃣ Checking backend files..."
if grep -q "googleAnalyticsId" apps/backend/src/settings/settings.service.ts && grep -q "yandexMetrikaId" apps/backend/src/settings/settings.service.ts; then
    echo -e "${GREEN}✅ Backend settings service updated${NC}"
else
    echo -e "${RED}❌ Backend settings service NOT updated${NC}"
    exit 1
fi

echo ""
echo "4️⃣ Checking frontend analytics files..."
if [ -f "apps/frontend/src/lib/analytics.ts" ] && [ -f "apps/frontend/src/components/analytics-provider.tsx" ]; then
    echo -e "${GREEN}✅ Frontend analytics files found${NC}"
else
    echo -e "${RED}❌ Frontend analytics files NOT found${NC}"
    exit 1
fi

echo ""
echo "5️⃣ Checking admin panel files..."
if grep -q "googleAnalyticsId" apps/admin/src/lib/api.ts && grep -q "yandexMetrikaId" apps/admin/src/lib/api.ts; then
    echo -e "${GREEN}✅ Admin panel API updated${NC}"
else
    echo -e "${RED}❌ Admin panel API NOT updated${NC}"
    exit 1
fi

if grep -q "Analytics va statistikalar" apps/admin/src/pages/Settings.tsx; then
    echo -e "${GREEN}✅ Admin panel Settings page updated${NC}"
else
    echo -e "${RED}❌ Admin panel Settings page NOT updated${NC}"
    exit 1
fi

echo ""
echo "6️⃣ Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "acoustic-backend"; then
        BACKEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="acoustic-backend") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$BACKEND_STATUS" = "online" ]; then
            echo -e "${GREEN}✅ Backend is running (PM2 status: $BACKEND_STATUS)${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend PM2 status: $BACKEND_STATUS${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Backend PM2 process not found${NC}"
    fi
    
    if pm2 list | grep -q "acoustic-frontend"; then
        FRONTEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="acoustic-frontend") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$FRONTEND_STATUS" = "online" ]; then
            echo -e "${GREEN}✅ Frontend is running (PM2 status: $FRONTEND_STATUS)${NC}"
        else
            echo -e "${YELLOW}⚠️  Frontend PM2 status: $FRONTEND_STATUS${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Frontend PM2 process not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please check processes manually.${NC}"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ File verification complete!${NC}"
echo ""
echo "📋 Next steps to verify:"
echo ""
echo "1. Check database migration:"
echo "   psql \$DATABASE_URL -c \"SELECT column_name FROM information_schema.columns WHERE table_name='Setting' AND column_name IN ('googleAnalyticsId', 'yandexMetrikaId');\""
echo ""
echo "2. Test admin panel:"
echo "   - Login to admin panel"
echo "   - Go to Settings > Analytics"
echo "   - Verify Analytics tab is visible"
echo "   - Try enabling analytics and entering IDs"
echo ""
echo "3. Test frontend:"
echo "   - Open browser console (F12)"
echo "   - Check for '[Analytics]' logs"
echo "   - Visit a product page and check for '[Analytics] Product view tracked'"
echo "   - Visit a branch page and check for '[Analytics] Branch view tracked'"
echo "   - Click a phone number and check for '[Analytics] Phone click tracked'"
echo ""
echo "4. Verify analytics platforms:"
echo "   - Google Analytics: Check Real-time reports"
echo "   - Yandex Metrika: Check Real-time visitors"
echo ""

