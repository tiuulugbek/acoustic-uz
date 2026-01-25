#!/bin/bash

# Pull latest changes and rebuild frontend
# This script should be run on the server

set -e

echo "🔄 Pulling latest changes from git..."
cd /var/www/acoustic.uz
git pull origin main

echo "✅ Git pull completed"
echo ""
echo "📦 Next steps:"
echo "1. Rebuild frontend: bash deploy/optimized-build-frontend.sh"
echo "2. Rebuild admin: cd apps/admin && pnpm build"
echo "3. Restart backend: pm2 restart acoustic-backend"
echo ""
echo "Or run all at once:"
echo "  cd /var/www/acoustic.uz"
echo "  git pull origin main"
echo "  bash deploy/optimized-build-frontend.sh"
echo "  cd apps/admin && pnpm build && cd ../.."
echo "  pm2 restart acoustic-backend"

