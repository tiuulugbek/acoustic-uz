#!/bin/bash

# Quick fix script for build issues

set -e

echo "🔧 Fixing build issues..."

cd /var/www/news.acoustic.uz

# 1. Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 2. Build shared package first
echo "📦 Building shared package..."
pnpm --filter @acoustic/shared build

# 3. Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm db:generate

# 4. Run migrations
echo "🗄️  Running migrations..."
cd apps/backend
pnpm db:migrate:deploy || pnpm db:migrate
cd ../..

# 5. Build backend
echo "🔨 Building backend..."
pnpm --filter @acoustic/backend build

# 6. Build frontend
echo "🔨 Building frontend..."
pnpm --filter @acoustic/frontend build

# 7. Build admin
echo "🔨 Building admin..."
pnpm --filter @acoustic/admin build

echo "✅ Build fixed!"


