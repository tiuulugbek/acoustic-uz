#!/bin/bash
# Local'da build qilib, server'ga yuklash va restart qilish

set -e

APP=${1:-all}  # backend, frontend, yoki all (default: all)

echo "🚀 Local build va deploy: $APP"
echo ""

LOCAL_DIR="/root/acoustic.uz"
PROD_DIR="/var/www/acoustic.uz"

cd "$LOCAL_DIR"

# 1. Shared package build (agar kerak bo'lsa)
if [ "$APP" = "backend" ] || [ "$APP" = "all" ]; then
    echo "📦 1. Shared package build..."
    pnpm --filter @acoustic/shared build
    echo "   ✅ Shared package build"
    echo ""
fi

# 2. Backend build
if [ "$APP" = "backend" ] || [ "$APP" = "all" ]; then
    echo "🔨 2. Backend build..."
    cd apps/backend
    pnpm build
    cd ../..
    echo "   ✅ Backend build"
    echo ""
fi

# 3. Frontend build
if [ "$APP" = "frontend" ] || [ "$APP" = "all" ]; then
    echo "🔨 3. Frontend build..."
    cd apps/frontend
    pnpm build
    cd ../..
    echo "   ✅ Frontend build"
    echo ""
fi

# 4. Build fayllarni server'ga yuklash
echo "📤 4. Build fayllarni server'ga yuklash..."
bash "$LOCAL_DIR/deploy/upload-build.sh" "$APP"
echo ""

echo "✅ Build va yuklash yakunlandi!"
echo ""
echo "📋 Keyingi qadam - Restart qilish:"
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
if [ "$APP" = "backend" ]; then
    echo "   pm2 restart acoustic-backend"
elif [ "$APP" = "frontend" ]; then
    echo "   pm2 restart acoustic-frontend"
else
    echo "   pm2 restart all"
fi
