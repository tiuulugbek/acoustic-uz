#!/bin/bash
# Tezkor backend yangilanish skripti
# /root/acoustic.uz dan /var/www/acoustic.uz ga kodlarni ko'chirish va build qilish

set -e

echo "🔄 Backend'ni yangilash..."
echo ""

SOURCE_DIR="/root/acoustic.uz/apps/backend"
TARGET_DIR="/var/www/acoustic.uz/apps/backend"

# 1. Kodlarni ko'chirish
echo "📦 Kodlarni ko'chirish: $SOURCE_DIR -> $TARGET_DIR"
rsync -av --delete \
  "$SOURCE_DIR/" \
  "$TARGET_DIR/" \
  --exclude='dist' \
  --exclude='node_modules' \
  --exclude='.git'

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

# Backend'ni build qilish
cd "$TARGET_DIR"
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
pm2 restart acoustic-backend || pm2 start deploy/ecosystem.config.js --only acoustic-backend

sleep 3

# 4. Tekshirish
echo "🔍 Tekshirish..."
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
    echo "   Loglarni tekshiring: pm2 logs acoustic-backend"
fi

BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "404" ]; then
    echo "   ✅ Backend HTTP $BACKEND_HTTP (ishlayapti)"
else
    echo "   ⚠️  Backend HTTP $BACKEND_HTTP"
fi

echo ""
echo "✅ Backend yangilandi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   - Loglarni tekshirish: pm2 logs acoustic-backend"
