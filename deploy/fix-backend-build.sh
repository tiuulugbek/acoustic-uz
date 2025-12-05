#!/bin/bash

# Script to fix backend build issues
# Usage: ./fix-backend-build.sh

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing backend build issues..."

cd "$BACKEND_DIR"

# Check if storage.module.ts exists
if [ ! -f "src/media/storage/storage.module.ts" ]; then
    echo "❌ storage.module.ts not found!"
    echo "Creating storage.module.ts..."
    
    mkdir -p src/media/storage
    
    cat > src/media/storage/storage.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
EOF
    
    echo "✅ storage.module.ts created"
fi

# Check if storage.service.ts exists
if [ ! -f "src/media/storage/storage.service.ts" ]; then
    echo "❌ storage.service.ts not found!"
    echo "Please check the file exists or restore from git"
    exit 1
fi

# Clean build
echo "🧹 Cleaning build directory..."
rm -rf dist
rm -rf node_modules/.cache

# Build shared package first
echo "📦 Building shared package..."
cd "$PROJECT_DIR"
pnpm --filter @acoustic/shared build

# Build backend
echo "🏗️  Building backend..."
cd "$BACKEND_DIR"
pnpm build

echo "✅ Backend build complete!"
