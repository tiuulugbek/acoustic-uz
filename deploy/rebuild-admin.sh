#!/bin/bash
# Rebuild admin frontend

set -e

echo "🔨 Rebuilding admin frontend..."

cd /var/www/news.acoustic.uz

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build admin
echo "🏗️  Building admin..."
cd apps/admin
npm install
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
    echo "✅ Admin build successful!"
    echo "📁 Build files:"
    ls -la dist/ | head -10
else
    echo "❌ Admin build failed!"
    exit 1
fi

echo "✅ Admin rebuild complete!"

