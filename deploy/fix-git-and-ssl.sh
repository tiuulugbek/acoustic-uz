#!/bin/bash

# Script to fix git conflicts and then rebuild frontend with SSL redirect fixes

set -e

echo "🔧 Fixing git conflicts and SSL redirect error..."

# Navigate to project directory
cd /var/www/news.acoustic.uz || exit 1

# Stash local changes
echo "📦 Stashing local changes..."
git stash || echo "No changes to stash"

# Remove untracked files (backup files)
echo "🧹 Removing untracked backup files..."
rm -f acoustic-dump-*.sql
rm -f public-*.tar.gz
rm -f uploads-*.tar.gz

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main || {
    echo "⚠️  Git pull failed. Continuing with existing code..."
}

# Export environment variables for build
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# Build shared package first
echo "📦 Building shared package..."
cd /var/www/news.acoustic.uz
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared package build failed!"
    exit 1
}

# Stop frontend
echo "🛑 Stopping frontend..."
pm2 stop acoustic-frontend || echo "Frontend not running"

# Remove old build
echo "🧹 Cleaning old build..."
rm -rf apps/frontend/.next

# Build frontend
echo "🏗️  Building frontend..."
cd /var/www/news.acoustic.uz
pnpm --filter @acoustic/frontend build || {
    echo "❌ Frontend build failed!"
    exit 1
}

# Copy static files to standalone directory
echo "📋 Copying static files..."
mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
rm -rf apps/frontend/.next/standalone/apps/frontend/.next/static/*
cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/ || {
    echo "⚠️  Static files copy failed, but continuing..."
}

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R deploy:deploy apps/frontend/.next
sudo chmod -R 755 apps/frontend/.next

# Restart frontend
echo "🚀 Restarting frontend..."
pm2 restart acoustic-frontend || pm2 start ecosystem.config.js --only acoustic-frontend

# Wait a moment
sleep 2

# Check status
echo "✅ Checking PM2 status..."
pm2 status

echo ""
echo "✨ Done! Frontend has been rebuilt with SSL redirect fixes."
echo "🌐 Test the site at: https://news.acoustic.uz"
echo ""
echo "If you still see SSL errors, check:"
echo "  1. Nginx configuration for correct Host headers"
echo "  2. Browser cache (try incognito mode)"
echo "  3. PM2 logs: pm2 logs acoustic-frontend"

