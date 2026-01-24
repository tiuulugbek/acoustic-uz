#!/bin/bash
# Tezkor frontend yangilanish skripti
# /root/acoustic.uz dan /var/www/acoustic.uz ga kodlarni ko'chirish va build qilish

set -e

echo "🔄 Frontend'ni yangilash..."
echo ""

SOURCE_DIR="/root/acoustic.uz/apps/frontend"
TARGET_DIR="/var/www/acoustic.uz/apps/frontend"

# 1. Kodlarni ko'chirish
echo "📦 Kodlarni ko'chirish: $SOURCE_DIR -> $TARGET_DIR"
rsync -av --delete \
  "$SOURCE_DIR/" \
  "$TARGET_DIR/" \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache'

echo "   ✅ Kodlar ko'chirildi"
echo ""

# 2. Build qilish
echo "🔨 Build qilish..."
cd "$TARGET_DIR"

# Shared package'ni build qilish (agar kerak bo'lsa)
cd /var/www/acoustic.uz
if [ ! -d "packages/shared/dist" ]; then
    echo "   📦 Shared package'ni build qilish..."
    pnpm --filter @acoustic/shared build
fi

# Frontend'ni build qilish
cd "$TARGET_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api"
export NEXT_PUBLIC_SITE_URL="https://acoustic.uz"

echo "   🔨 pnpm build ishga tushirilmoqda..."
if pnpm build; then
    echo "   ✅ Build muvaffaqiyatli"
else
    echo "   ❌ Build xatolik bilan tugadi"
    exit 1
fi
echo ""

# 3. PM2'ni restart qilish
echo "🔄 PM2'ni restart qilish..."
pm2 restart acoustic-frontend || pm2 start deploy/ecosystem.config.js --only acoustic-frontend

sleep 3

# 4. Tekshirish
echo "🔍 Tekshirish..."
FRONTEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-frontend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$FRONTEND_STATUS" = "online" ]; then
    echo "   ✅ Frontend online"
else
    echo "   ⚠️  Frontend status: $FRONTEND_STATUS"
    echo "   Loglarni tekshiring: pm2 logs acoustic-frontend"
fi

FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "   ✅ Frontend HTTP $FRONTEND_HTTP"
else
    echo "   ⚠️  Frontend HTTP $FRONTEND_HTTP"
fi

echo ""
echo "✅ Frontend yangilandi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   - Browser'da cache'ni tozalash (Ctrl+Shift+R)"
echo "   - Loglarni tekshirish: pm2 logs acoustic-frontend"
