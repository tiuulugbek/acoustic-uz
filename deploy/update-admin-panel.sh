#!/bin/bash

# Script to update admin panel on server
# This script builds admin panel and copies dist files to Nginx directory

set -e

echo "🚀 Starting admin panel update..."

# Navigate to project directory
cd /var/www/news.acoustic.uz || exit 1

# Git pull (optional - if you want latest changes)
# git pull origin main

# Set environment variables
export NODE_ENV=production

# Build admin panel
echo "🔨 Building admin panel..."
pnpm --filter @acoustic/admin build

# Copy dist files to Nginx directory
echo "📦 Copying dist files to /var/www/admins.acoustic.uz/dist..."
mkdir -p /var/www/admins.acoustic.uz/dist
rm -rf /var/www/admins.acoustic.uz/dist/*
cp -r apps/admin/dist/* /var/www/admins.acoustic.uz/dist/

# Set permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/admins.acoustic.uz/dist
chmod -R 755 /var/www/admins.acoustic.uz/dist

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Admin panel update completed successfully!"
echo "🌐 Admin panel should now be available at https://admins.acoustic.uz"
echo "💡 Don't forget to hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R) to clear cache!"

