#!/bin/bash

# Server fayllarini tozalash scripti
# Bu script serverda git pull qilgandan keyin ortiqcha fayllarni o'chiradi

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/acoustic.uz"

echo -e "${BLUE}🧹 Server fayllarini tozalash...${NC}"
echo ""

cd "$PROJECT_DIR"

# 1. Git pull - barcha o'zgarishlarni olish (o'chirilgan fayllar ham)
echo -e "${BLUE}📋 Step 1: Git pull...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
}
echo -e "${GREEN}  ✅ Latest changes pulled${NC}"
echo ""

# 2. Git clean - tracked bo'lmagan fayllarni o'chirish
echo -e "${BLUE}📋 Step 2: Git clean (untracked files)...${NC}"
git clean -fd || true
echo -e "${GREEN}  ✅ Untracked files cleaned${NC}"
echo ""

# 3. .DS_Store fayllarini o'chirish (agar qolgan bo'lsa)
echo -e "${BLUE}📋 Step 3: Remove .DS_Store files...${NC}"
find . -name ".DS_Store" -type f ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true
echo -e "${GREEN}  ✅ .DS_Store files removed${NC}"
echo ""

# 4. Log fayllarini o'chirish
echo -e "${BLUE}📋 Step 4: Remove log files...${NC}"
find . -name "*.log" -type f ! -path "./node_modules/*" ! -path "./.git/*" ! -path "/var/log/*" -delete 2>/dev/null || true
echo -e "${GREEN}  ✅ Log files removed${NC}"
echo ""

# 5. Temporary fayllarni o'chirish
echo -e "${BLUE}📋 Step 5: Remove temporary files...${NC}"
find . -name "*.tmp" -type f ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true
find . -name "*.bak" -type f ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true
echo -e "${GREEN}  ✅ Temporary files removed${NC}"
echo ""

# 6. Git status ko'rsatish
echo -e "${BLUE}📋 Step 6: Git status...${NC}"
git status --short | head -20 || true
echo ""

echo -e "${GREEN}✅ Server cleanup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Qolgan .md fayllar:${NC}"
find . -name "*.md" -type f ! -path "./node_modules/*" ! -path "./.git/*" | sort
echo ""

