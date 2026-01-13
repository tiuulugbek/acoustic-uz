#!/bin/bash
# Remove broken image URLs from product descriptions
# This script removes image tags with broken URLs (404 files)

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Removing broken image URLs from product descriptions..."
echo ""

# Step 1: Check database connection
echo "📋 Step 1: Checking database connection..."
cd "$PROJECT_DIR"

# Find .env file
ENV_FILE=""
for POSSIBLE_ENV in \
    "$PROJECT_DIR/.env" \
    "$BACKEND_DIR/.env" \
    "$PROJECT_DIR/apps/backend/.env"
do
    if [ -f "$POSSIBLE_ENV" ]; then
        ENV_FILE="$POSSIBLE_ENV"
        echo "   ✅ Found .env file: $ENV_FILE"
        break
    fi
done

if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
    echo "   ❌ .env file not found"
    exit 1
fi

# Load DATABASE_URL
export $(grep "^DATABASE_URL=" "$ENV_FILE" | xargs)
if [ -z "$DATABASE_URL" ]; then
    echo "   ❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "   ✅ Database configuration found"
echo ""

# Step 2: Create Node.js script to remove broken URLs
echo "📋 Step 2: Creating script to remove broken URLs..."
cat > /tmp/remove-broken-urls.js << 'NODE_SCRIPT'
// Add node_modules to require path
const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

const possiblePaths = [
  '/var/www/acoustic.uz/node_modules',
  '/var/www/acoustic.uz/apps/backend/node_modules',
  process.cwd() + '/node_modules',
  process.cwd() + '/../../node_modules',
];

let prismaPath = null;
for (const possiblePath of possiblePaths) {
  try {
    const testPath = path.join(possiblePath, '@prisma/client');
    require.resolve(testPath);
    prismaPath = possiblePath;
    break;
  } catch (e) {
    // Continue searching
  }
}

if (prismaPath) {
  Module.prototype.require = function(id) {
    if (id === '@prisma/client' || id.startsWith('@prisma/')) {
      try {
        return originalRequire.call(this, path.join(prismaPath, id));
      } catch (e) {
        return originalRequire.call(this, id);
      }
    }
    return originalRequire.call(this, id);
  };
}

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function removeBrokenUrls() {
  try {
    console.log('📋 Fetching all products...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        name_uz: true,
        description_uz: true,
        description_ru: true,
      },
    });

    console.log(`   Found ${products.length} products`);
    console.log('');

    const uploadsDir = '/var/www/acoustic.uz/apps/backend/uploads';
    
    let fixedCount = 0;
    let removedCount = 0;

    function removeBrokenImageUrls(text) {
      if (!text) return text;
      
      // Find all image URLs in the text
      const urlRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp|gif)/gi;
      const matches = text.match(urlRegex);
      
      if (!matches) return text;
      
      let newText = text;
      let hasChanges = false;
      
      for (const url of matches) {
        try {
          const urlObj = new URL(url);
          const urlPath = urlObj.pathname;
          const hostname = urlObj.hostname.toLowerCase();
          
          // Skip external URLs
          if (hostname && !hostname.includes('acoustic.uz') && !hostname.includes('localhost')) {
            continue;
          }
          
          // Check if it's a local URL
          if (hostname.includes('acoustic.uz') || hostname.includes('localhost')) {
            // Extract file path
            let filePath = urlPath.replace(/^\/uploads\//, '');
            const fullPath = path.join(uploadsDir, filePath);
            
            // Check if file exists
            if (!fs.existsSync(fullPath)) {
              // File doesn't exist - remove the image tag
              const filename = path.basename(urlPath);
              
              // Remove <img> tag containing this URL
              const imgTagRegex = new RegExp(`<img[^>]*src=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi');
              if (imgTagRegex.test(newText)) {
                newText = newText.replace(imgTagRegex, '');
                hasChanges = true;
                removedCount++;
                console.log(`      🗑️  Removed broken image: ${filename}`);
              }
            }
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
      
      return hasChanges ? newText : null;
    }

    for (const product of products) {
      let hasChanges = false;
      let newDescriptionUz = product.description_uz;
      let newDescriptionRu = product.description_ru;
      
      if (product.description_uz) {
        const fixedUz = removeBrokenImageUrls(product.description_uz);
        if (fixedUz) {
          newDescriptionUz = fixedUz;
          hasChanges = true;
        }
      }
      
      if (product.description_ru) {
        const fixedRu = removeBrokenImageUrls(product.description_ru);
        if (fixedRu) {
          newDescriptionRu = fixedRu;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description_uz: newDescriptionUz,
            description_ru: newDescriptionRu,
          },
        });
        fixedCount++;
        console.log(`   ✅ Fixed: ${product.name_uz || product.slug}`);
      }
    }

    console.log('');
    console.log(`✅ Fixed ${fixedCount} products`);
    console.log(`🗑️  Removed ${removedCount} broken image tags`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeBrokenUrls();

NODE_SCRIPT

echo "   ✅ Script created"
echo ""

# Step 3: Run the script
echo "📋 Step 3: Running script to remove broken URLs..."
cd "$PROJECT_DIR"

if command -v pnpm >/dev/null 2>&1; then
    echo "   Using pnpm exec to run script..."
    if pnpm exec node /tmp/remove-broken-urls.js; then
        echo "   ✅ URLs removed"
    else
        echo "   ❌ Failed to remove URLs"
        exit 1
    fi
else
    if [ -d "$PROJECT_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$PROJECT_DIR/node_modules:$NODE_PATH"
    elif [ -d "$BACKEND_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$BACKEND_DIR/node_modules:$NODE_PATH"
    fi
    
    if node /tmp/remove-broken-urls.js; then
        echo "   ✅ URLs removed"
    else
        echo "   ❌ Failed to remove URLs"
        exit 1
    fi
fi

echo ""
echo "✅ Fix complete!"

# Cleanup
rm -f /tmp/remove-broken-urls.js

