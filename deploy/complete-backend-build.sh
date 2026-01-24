#!/bin/bash
# To'liq backend build jarayoni

set -e

echo "🚀 Backend build jarayoni boshlanmoqda..."
echo ""

PROJECT_DIR="/var/www/acoustic.uz"
cd "$PROJECT_DIR" || exit 1

echo "📂 Hozirgi katalog: $(pwd)"
echo ""

# 1. Shared package build
echo "📦 1. Shared package build qilish..."
if pnpm --filter @acoustic/shared build; then
    echo "   ✅ Shared package build muvaffaqiyatli"
else
    echo "   ❌ Shared package build xatolik"
    exit 1
fi
echo ""

# 2. Prisma generate
echo "🔧 2. Prisma Client generate qilish..."
if npx prisma@5.22.0 generate --schema=./prisma/schema.prisma; then
    echo "   ✅ Prisma Client generate muvaffaqiyatli"
else
    echo "   ❌ Prisma Client generate xatolik"
    exit 1
fi
echo ""

# 3. Backend build
echo "🔨 3. Backend build qilish..."
cd apps/backend
if pnpm build; then
    echo "   ✅ Backend build muvaffaqiyatli"
else
    echo "   ❌ Backend build xatolik"
    exit 1
fi
echo ""

# 4. PM2 restart
echo "🔄 4. PM2'ni restart qilish..."
if pm2 restart acoustic-backend; then
    echo "   ✅ PM2 restart muvaffaqiyatli"
else
    echo "   ⚠️  PM2 restart xatolik (yoki process mavjud emas)"
fi
echo ""

# 5. Tekshirish
echo "🔍 5. Tekshirish..."
sleep 3
BACKEND_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"acoustic-backend"[^}]*"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 || echo "unknown")
if [ "$BACKEND_STATUS" = "online" ]; then
    echo "   ✅ Backend online"
else
    echo "   ⚠️  Backend status: $BACKEND_STATUS"
fi

BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HTTP" = "200" ] || [ "$BACKEND_HTTP" = "404" ]; then
    echo "   ✅ Backend HTTP $BACKEND_HTTP (ishlayapti)"
else
    echo "   ⚠️  Backend HTTP $BACKEND_HTTP"
fi

echo ""
echo "✅ Backend build jarayoni yakunlandi!"
echo ""
echo "📋 Loglarni ko'rish:"
echo "   pm2 logs acoustic-backend --lines 50"
