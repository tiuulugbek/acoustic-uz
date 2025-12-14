#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Restart Backend After Prisma Update${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo -e "${BLUE}Restarting backend...${NC}"
pm2 restart acoustic-backend

echo ""
echo -e "${GREEN}✅ Backend restarted!${NC}"
echo ""
echo -e "${BLUE}📋 Check backend status:${NC}"
pm2 status acoustic-backend
