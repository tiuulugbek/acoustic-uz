#!/bin/bash

# Soddalashtirilgan Deployment Script
# Frontend va Admin panelni local'da build qilib, serverga yuklaydi
# Backend serverda to'g'ridan-to'g'ri ishga tushiriladi

set -e  # Xatolik bo'lsa to'xtatish

SERVER_USER="user1"
SERVER_IP="192.168.20.66"
SERVER_PATH="/var/www/acousticuz"

echo "🚀 Soddalashtirilgan Deployment boshlandi..."
echo "📦 Server: ${SERVER_USER}@${SERVER_IP}"
echo "📁 Target: ${SERVER_PATH}"
echo ""

# 1. Frontend Build
echo "📋 Step 1: Frontend build qilish..."
cd apps/frontend
pnpm build
cd ../..

# 2. Admin Panel Build
echo ""
echo "📋 Step 2: Admin Panel build qilish..."
cd apps/admin
pnpm build
cd ../..

# 3. Frontend'ni serverga yuklash
echo ""
echo "📋 Step 3: Frontend'ni serverga yuklash..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next/cache' \
    apps/frontend/.next/standalone/apps/frontend/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/

rsync -avz --progress \
    apps/frontend/.next/static/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/.next/static/

rsync -avz --progress \
    apps/frontend/public/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/public/

# 4. Admin Panel'ni serverga yuklash
echo ""
echo "📋 Step 4: Admin Panel'ni serverga yuklash..."
rsync -avz --progress \
    apps/admin/dist/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/admin/

# 5. Backend'ni serverga yuklash (faqat dist va kerakli fayllar)
echo ""
echo "📋 Step 5: Backend'ni serverga yuklash..."
cd apps/backend
pnpm build
cd ../..

rsync -avz --progress \
    --exclude 'node_modules' \
    apps/backend/dist/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/dist/

rsync -avz --progress \
    apps/backend/package.json \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/

rsync -avz --progress \
    prisma/ \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/prisma/

# 6. Serverda dependencies o'rnatish va restart
echo ""
echo "📋 Step 6: Serverda dependencies o'rnatish va restart..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/acousticuz

# Backend dependencies
cd backend
npm install --production
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Frontend dependencies (agar kerak bo'lsa)
cd ../apps/frontend
npm install --production || true

# Process'larni restart qilish
pkill -f "node dist/main.js" || true
pkill -f "node server.js" || true
sleep 2

# Backendni ishga tushirish
cd /var/www/acousticuz/backend
nohup node dist/main.js > backend.log 2>&1 &

# Frontendni ishga tushirish
cd /var/www/acousticuz/apps/frontend
nohup node server.js > frontend.log 2>&1 &

echo "✅ Barcha servislar qayta ishga tushirildi"
ENDSSH

echo ""
echo "✅ Deployment muvaffaqiyatli yakunlandi!"
echo ""
echo "📝 Tekshirish:"
echo "   - Frontend: http://${SERVER_IP}:3000"
echo "   - Backend API: http://${SERVER_IP}:3001/api"
echo "   - Swagger Docs: http://${SERVER_IP}:3001/api/docs"

