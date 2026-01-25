#!/bin/bash
# Clean git repository before push - remove build artifacts and unnecessary files
# This script ensures only source code is tracked in git

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"

echo -e "${BLUE}🧹 Cleaning git repository before push...${NC}"
echo ""

cd "$PROJECT_DIR"

# 1. Remove .next directories from git tracking
echo -e "${BLUE}📋 Step 1: Removing .next directories from git...${NC}"
if git ls-files | grep -q "^apps/.*/\.next"; then
    echo "  Found .next files in git, removing..."
    git rm -r --cached apps/*/.next 2>/dev/null || true
    git rm -r --cached apps/*/*/.next 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed .next directories${NC}"
else
    echo -e "${GREEN}  ✅ .next directories are not tracked${NC}"
fi

# 2. Remove dist directories from git tracking
echo -e "${BLUE}📋 Step 2: Removing dist directories from git...${NC}"
if git ls-files | grep -q "^apps/.*/dist\|^packages/.*/dist"; then
    echo "  Found dist files in git, removing..."
    git rm -r --cached apps/*/dist 2>/dev/null || true
    git rm -r --cached packages/*/dist 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed dist directories${NC}"
else
    echo -e "${GREEN}  ✅ dist directories are not tracked${NC}"
fi

# 3. Remove build directories from git tracking
echo -e "${BLUE}📋 Step 3: Removing build directories from git...${NC}"
if git ls-files | grep -q "^apps/.*/build\|^packages/.*/build"; then
    echo "  Found build files in git, removing..."
    git rm -r --cached apps/*/build 2>/dev/null || true
    git rm -r --cached packages/*/build 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed build directories${NC}"
else
    echo -e "${GREEN}  ✅ build directories are not tracked${NC}"
fi

# 4. Remove out directories (Next.js static export)
echo -e "${BLUE}📋 Step 4: Removing out directories from git...${NC}"
if git ls-files | grep -q "^apps/.*/out"; then
    echo "  Found out files in git, removing..."
    git rm -r --cached apps/*/out 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed out directories${NC}"
else
    echo -e "${GREEN}  ✅ out directories are not tracked${NC}"
fi

# 5. Remove node_modules if accidentally tracked
echo -e "${BLUE}📋 Step 5: Checking for node_modules in git...${NC}"
if git ls-files | grep -q "node_modules"; then
    echo -e "${YELLOW}  ⚠️  Found node_modules in git! Removing...${NC}"
    git rm -r --cached node_modules 2>/dev/null || true
    git rm -r --cached apps/*/node_modules 2>/dev/null || true
    git rm -r --cached packages/*/node_modules 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed node_modules${NC}"
else
    echo -e "${GREEN}  ✅ node_modules are not tracked${NC}"
fi

# 6. Remove .turbo cache
echo -e "${BLUE}📋 Step 6: Removing .turbo cache from git...${NC}"
if git ls-files | grep -q "^\.turbo"; then
    echo "  Found .turbo files in git, removing..."
    git rm -r --cached .turbo 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed .turbo cache${NC}"
else
    echo -e "${GREEN}  ✅ .turbo cache is not tracked${NC}"
fi

# 7. Remove TypeScript build info files
echo -e "${BLUE}📋 Step 7: Removing TypeScript build info files...${NC}"
TSBUILDINFO_FILES=$(git ls-files | grep "\.tsbuildinfo$" || true)
if [ -n "$TSBUILDINFO_FILES" ]; then
    echo "  Found TypeScript build info files, removing..."
    git rm --cached **/*.tsbuildinfo 2>/dev/null || true
    echo -e "${GREEN}  ✅ Removed TypeScript build info files${NC}"
else
    echo -e "${GREEN}  ✅ TypeScript build info files are not tracked${NC}"
fi

# 8. Check for changes to commit
echo -e "${BLUE}📋 Step 8: Checking for changes...${NC}"
if git diff --cached --quiet; then
    echo -e "${GREEN}  ✅ No changes to commit${NC}"
else
    echo -e "${YELLOW}  ⚠️  Found changes to commit${NC}"
    echo "  Run: git commit -m 'chore: Remove build artifacts from git tracking'"
fi

# 9. Show repository size
echo ""
echo -e "${BLUE}📋 Repository size:${NC}"
REPO_SIZE=$(du -sh .git 2>/dev/null | awk '{print $1}' || echo "unknown")
echo "  Git repository: $REPO_SIZE"

echo ""
echo -e "${GREEN}✅ Git cleanup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Review changes: git status"
echo "  2. Commit if needed: git commit -m 'chore: Remove build artifacts'"
echo "  3. Push: git push origin main"

