#!/bin/bash

# Prisma muammosini hal qilish

set -e

echo "🔧 Fixing Prisma issues..."

cd /var/www/news.acoustic.uz

# 1. Node.js versiyasini tekshirish
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "Node.js version: $(node -v)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version is too old. Please upgrade to Node.js 20+"
    echo "Run: sudo ./deploy/upgrade-node.sh"
    exit 1
fi

# 2. Prisma versiyasini tekshirish
echo "📋 Checking Prisma version..."
PRISMA_VERSION=$(grep '"prisma"' package.json | head -1 | grep -oP '\d+\.\d+\.\d+' || echo "not found")
echo "Prisma version in package.json: $PRISMA_VERSION"

# 3. Local Prisma ishlatish (pnpm dlx o'rniga)
echo "📦 Using local Prisma..."
cd apps/backend

# Prisma ni lokal o'rnatish
pnpm add -D prisma@5.22.0 --save-exact || echo "Prisma already installed"

# Migrations ishlatish (lokal Prisma bilan)
npx prisma migrate deploy --schema=../../prisma/schema.prisma || npx prisma migrate dev --schema=../../prisma/schema.prisma

cd ../..

echo "✅ Prisma fixed!"


