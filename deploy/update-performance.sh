#!/bin/bash

# Script to update performance optimizations on server
# This script pulls latest changes and rebuilds frontend with optimized cache strategy

set -e

echo "🚀 Starting performance update..."

# Navigate to project directory
cd /var/www/news.acoustic.uz || exit 1

# Git pull
echo "📥 Pulling latest changes..."
git pull origin main

# Set environment variables
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# Build shared package
echo "🔨 Building shared package..."
pnpm --filter @acoustic/shared build

# Stop frontend PM2 process
echo "⏸️  Stopping frontend..."
pm2 stop acoustic-frontend || true

# Clean build
echo "🧹 Cleaning old build..."
rm -rf apps/frontend/.next

# Build frontend
echo "🔨 Building frontend..."
pnpm --filter @acoustic/frontend build

# Copy static files to standalone
echo "📦 Copying static files..."
mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
rm -rf apps/frontend/.next/standalone/apps/frontend/.next/static/*
cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/

# Copy map files
echo "🗺️  Copying map files..."
mkdir -p apps/frontend/.next/standalone/apps/frontend/public/maps
cp -r apps/frontend/public/maps/* apps/frontend/.next/standalone/apps/frontend/public/maps/ 2>/dev/null || true

# Set permissions
echo "🔐 Setting permissions..."
chown -R deploy:deploy apps/frontend/.next
chmod -R 755 apps/frontend/.next

# Restart PM2
echo "▶️  Restarting frontend..."
pm2 restart acoustic-frontend

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Test
echo "✅ Testing..."
curl -I https://news.acoustic.uz/_next/static/chunks/webpack.js | head -n 1

echo "🎉 Performance update completed successfully!"

