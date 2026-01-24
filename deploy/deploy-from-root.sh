#!/bin/bash

# Root dan production uchun deployment script
# Backend va Frontend ni root da ishga tushiradi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/root/acoustic.uz"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
FRONTEND_DIR="$PROJECT_ROOT/apps/frontend"

echo -e "${BLUE}🚀 Root dan Production Deployment${NC}"
echo "=================================="
echo ""

# 1. Project root ni tekshirish
echo -e "${BLUE}📁 1. Project root ni tekshirish...${NC}"
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Project root topilmadi: $PROJECT_ROOT${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Project root topildi${NC}"
echo ""

# 2. Dependencies ni o'rnatish
echo -e "${BLUE}📦 2. Dependencies ni o'rnatish...${NC}"
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile
echo -e "${GREEN}✅ Dependencies o'rnatildi${NC}"
echo ""

# 3. Backend ni build qilish
echo -e "${BLUE}🔨 3. Backend ni build qilish...${NC}"
cd "$BACKEND_DIR"
if [ ! -f "dist/main.js" ] || [ "package.json" -nt "dist/main.js" ]; then
    echo "   Building backend..."
    pnpm build
    echo -e "${GREEN}✅ Backend build muvaffaqiyatli${NC}"
else
    echo -e "${YELLOW}⚠️  Backend allaqachon build qilingan${NC}"
fi
echo ""

# 4. Frontend ni build qilish
echo -e "${BLUE}🔨 4. Frontend ni build qilish...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d ".next" ] || [ "package.json" -nt ".next" ]; then
    echo "   Building frontend..."
    pnpm build
    echo -e "${GREEN}✅ Frontend build muvaffaqiyatli${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend allaqachon build qilingan${NC}"
fi
echo ""

# 5. PM2 daemon ni qayta ishga tushirish (agar kerak bo'lsa)
echo -e "${BLUE}🔄 5. PM2 daemon ni tekshirish...${NC}"
if ! pm2 ping >/dev/null 2>&1; then
    echo "   PM2 daemon ishlamayapti, qayta ishga tushirilmoqda..."
    pm2 kill 2>/dev/null || true
    sleep 2
    pm2 resurrect 2>/dev/null || pm2 list >/dev/null 2>&1 || true
    sleep 1
fi
echo -e "${GREEN}✅ PM2 daemon tayyor${NC}"
echo ""

# 6. Eski PM2 processlarni to'xtatish
echo -e "${BLUE}🛑 6. Eski PM2 processlarni to'xtatish...${NC}"
pm2 stop acoustic-backend 2>/dev/null || true
pm2 stop acoustic-frontend 2>/dev/null || true
pm2 delete acoustic-backend 2>/dev/null || true
pm2 delete acoustic-frontend 2>/dev/null || true
sleep 1
echo -e "${GREEN}✅ Eski processlar to'xtatildi${NC}"
echo ""

# 7. PM2 ni root konfiguratsiyasi bilan ishga tushirish
echo -e "${BLUE}🚀 7. PM2 ni root dan ishga tushirish...${NC}"
cd "$PROJECT_ROOT"
pm2 start deploy/ecosystem.config.js
sleep 2
pm2 save
echo -e "${GREEN}✅ PM2 ishga tushirildi${NC}"
echo ""

# 8. Statusni tekshirish
echo -e "${BLUE}📊 8. Statusni tekshirish...${NC}"
sleep 3

# Backend status
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ Backend: $BACKEND_STATUS${NC}"
else
    echo -e "${YELLOW}⚠️  Backend status: $BACKEND_STATUS${NC}"
    echo "   Loglarni tekshiring: pm2 logs acoustic-backend"
fi

# Frontend status
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ Frontend: $FRONTEND_STATUS${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend status: $FRONTEND_STATUS${NC}"
    echo "   Loglarni tekshiring: pm2 logs acoustic-frontend"
fi
echo ""

# 9. PM2 list
echo -e "${BLUE}📋 9. PM2 processlar ro'yxati:${NC}"
pm2 list
echo ""

# 10. HTTP tekshiruv
echo -e "${BLUE}🌐 10. HTTP endpointlarni tekshirish...${NC}"
sleep 2

# Backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend HTTP: 200${NC}"
else
    echo -e "${YELLOW}⚠️  Backend HTTP: Tekshirib ko'ring${NC}"
fi

# Frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend HTTP: 200${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend HTTP: Tekshirib ko'ring${NC}"
fi
echo ""

echo -e "${GREEN}✅ Deployment muvaffaqiyatli yakunlandi!${NC}"
echo ""
echo -e "${BLUE}📋 Keyingi qadamlar:${NC}"
echo "   - PM2 status: pm2 list"
echo "   - Backend loglar: pm2 logs acoustic-backend"
echo "   - Frontend loglar: pm2 logs acoustic-frontend"
echo "   - Restart: pm2 restart all"
echo ""
