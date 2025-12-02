#!/bin/bash

# Comprehensive script to fix image display issues

set -e

PROJECT_DIR="/var/www/news.acoustic.uz"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing image display issues..."
echo ""

cd "$PROJECT_DIR"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Fix uploads symlink and permissions
echo "🔗 Fixing uploads symlink..."
bash deploy/fix-uploads-permissions.sh

# 3. Restart backend
echo "🔄 Restarting backend..."
pm2 restart acoustic-backend

# 4. Rebuild frontend
echo "🏗️  Rebuilding frontend..."
bash deploy/fix-frontend-chunks.sh

# 5. Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Image fixes complete!"
echo ""
echo "📋 Test URLs:"
echo "   https://api.acoustic.uz/uploads/ (should return directory listing or 403)"
echo "   https://news.acoustic.uz/ (should show images)"
echo ""
echo "📋 Check logs:"
echo "   pm2 logs acoustic-backend --lines 20"
echo "   pm2 logs acoustic-frontend --lines 20"

