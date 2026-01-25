#!/bin/bash
# Rebuild admin frontend

set -e

echo "🔨 Rebuilding admin frontend..."

cd /var/www/news.acoustic.uz

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# Install dependencies using pnpm (for workspace support)
echo "📦 Installing dependencies..."
pnpm install

# Build admin using pnpm
echo "🏗️  Building admin..."
pnpm --filter @acoustic/admin build

# Check if build succeeded
if [ -d "apps/admin/dist" ]; then
    echo "✅ Admin build successful!"
    echo "📁 Build files:"
    ls -la apps/admin/dist/ | head -10
else
    echo "❌ Admin build failed!"
    exit 1
fi

echo "✅ Admin rebuild complete!"

