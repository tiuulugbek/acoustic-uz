#!/bin/bash
# Production'ni to'liq sozlash va ishlaydigan qilish

set -e

echo "🚀 Production'ni to'liq sozlash..."
echo ""

PROD_DIR="/var/www/acoustic.uz"

# 1. Permission'larni to'g'rilash
echo "🔐 1. Permission'larni to'g'rilash..."
chown -R acoustic:acoustic "$PROD_DIR" 2>/dev/null || true
find "$PROD_DIR" -type d -exec chmod 755 {} \; 2>/dev/null || true
find "$PROD_DIR" -type f -exec chmod 644 {} \; 2>/dev/null || true
find "$PROD_DIR" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
chmod 600 "$PROD_DIR/.env" 2>/dev/null || true
echo "   ✅ Permission'lar to'g'rilandi"
echo ""

# 2. Dist folder'larni tozalash va yaratish
echo "📁 2. Dist folder'larni tayyorlash..."
rm -rf "$PROD_DIR/apps/backend/dist" 2>/dev/null || true
rm -rf "$PROD_DIR/apps/frontend/.next" 2>/dev/null || true
rm -rf "$PROD_DIR/packages/shared/dist" 2>/dev/null || true

mkdir -p "$PROD_DIR/apps/backend/dist"
mkdir -p "$PROD_DIR/packages/shared/dist"
chown -R acoustic:acoustic "$PROD_DIR/apps/backend/dist" 2>/dev/null || true
chown -R acoustic:acoustic "$PROD_DIR/packages/shared/dist" 2>/dev/null || true
echo "   ✅ Dist folder'lar tayyorlandi"
echo ""

# 3. Database muammosini tuzatish
echo "💾 3. Database muammosini tuzatish..."
if [ -f "/root/acoustic.uz/deploy/fix-database-auth.sh" ]; then
    bash /root/acoustic.uz/deploy/fix-database-auth.sh 2>/dev/null || true
fi
echo ""

echo "✅ Production sozlandi!"
echo ""
echo "📋 Keyingi qadamlarni acoustic user sifatida bajarish kerak:"
echo ""
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
echo ""
echo "   # 1. Shared package build"
echo "   pnpm --filter @acoustic/shared build"
echo ""
echo "   # 2. Prisma generate"
echo "   npx prisma@5.22.0 generate --schema=./prisma/schema.prisma"
echo ""
echo "   # 3. Migration qo'llash"
echo "   npx prisma@5.22.0 migrate deploy --schema=./prisma/schema.prisma"
echo ""
echo "   # 4. Backend build"
echo "   cd apps/backend"
echo "   pnpm build"
echo ""
echo "   # 5. Restart"
echo "   pm2 restart acoustic-backend"
echo ""
echo "   # 6. Tekshirish"
echo "   pm2 logs acoustic-backend --lines 20"
