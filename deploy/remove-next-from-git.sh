#!/bin/bash
# Remove .next directory from git tracking
# This script ensures .next is not tracked in git

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/acoustic.uz"

echo -e "${BLUE}🧹 Removing .next from git tracking...${NC}"
echo ""

cd "$PROJECT_DIR"

# Check if .next is tracked in git
NEXT_FILES=$(git ls-files | grep -E "^apps/(frontend|admin)/\.next" || true)

if [ -z "$NEXT_FILES" ]; then
    echo -e "${GREEN}✅ .next is not tracked in git${NC}"
    echo ""
    echo "No action needed. .next directory is already ignored."
    exit 0
fi

echo -e "${YELLOW}⚠️  Found .next files in git:${NC}"
echo "$NEXT_FILES" | head -10
echo ""

# Remove from git tracking
echo -e "${BLUE}Removing from git tracking...${NC}"
git rm -r --cached apps/frontend/.next 2>/dev/null || true
git rm -r --cached apps/admin/.next 2>/dev/null || true

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${GREEN}✅ No changes to commit (already removed)${NC}"
else
    echo -e "${BLUE}Committing changes...${NC}"
    git commit -m "chore: Remove .next directories from git tracking" || {
        echo -e "${YELLOW}⚠️  Commit failed (may need manual commit)${NC}"
    }
fi

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo -e "${BLUE}📋 Verification:${NC}"
echo "  Checking .gitignore..."
if grep -q "^\.next/" .gitignore; then
    echo -e "${GREEN}  ✅ .next/ is in .gitignore${NC}"
else
    echo -e "${YELLOW}  ⚠️  .next/ is NOT in .gitignore (should be added)${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Run: bash deploy/clean-and-build-frontend.sh"
echo "  2. This will build frontend without tracking .next in git"

