#!/bin/bash
# Backend dist folder permission'larini tuzatish

set -e

echo "🔧 Backend dist folder permission'larini tuzatish..."
echo ""

DIST_DIR="/var/www/acoustic.uz/apps/backend/dist"
SHARED_DIST_DIR="/var/www/acoustic.uz/packages/shared/dist"

# 1. Eski dist folder'ni o'chirish (agar mavjud bo'lsa)
if [ -d "$DIST_DIR" ]; then
    echo "📁 Eski dist folder'ni o'chirish..."
    rm -rf "$DIST_DIR"
    echo "   ✅ O'chirildi"
fi

# 2. Yangi dist folder yaratish
echo "📁 Yangi dist folder yaratish..."
mkdir -p "$DIST_DIR"
echo "   ✅ Yaratildi"

# 3. Permission'ni to'g'rilash
echo "🔐 Permission'ni to'g'rilash..."
chown -R acoustic:acoustic "$DIST_DIR" 2>/dev/null || chown -R nobody:nogroup "$DIST_DIR"
chmod -R 755 "$DIST_DIR"
echo "   ✅ Permission to'g'rilandi"

# 4. Shared package dist folder (agar mavjud bo'lsa)
if [ -d "$SHARED_DIST_DIR" ]; then
    echo "📦 Shared package dist folder permission'ni to'g'rilash..."
    chown -R acoustic:acoustic "$SHARED_DIST_DIR" 2>/dev/null || chown -R nobody:nogroup "$SHARED_DIST_DIR"
    chmod -R 755 "$SHARED_DIST_DIR"
    echo "   ✅ Permission to'g'rilandi"
fi

echo ""
echo "✅ Permission'lar tuzatildi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. cd /var/www/acoustic.uz"
echo "   2. pnpm --filter @acoustic/shared build"
echo "   3. npx prisma@5.22.0 generate --schema=./prisma/schema.prisma"
echo "   4. cd apps/backend && pnpm build"
echo "   5. pm2 restart acoustic-backend"
