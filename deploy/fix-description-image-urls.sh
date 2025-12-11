#!/bin/bash
# Fix product description image URLs (in description_uz and description_ru fields)
# These URLs might be in old date-based paths like /uploads/2024/07/

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing product description image URLs..."
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

# Step 2: Create Node.js script to fix description URLs
echo "📋 Step 2: Creating script to fix description URLs..."
cat > /tmp/fix-description-urls.js << 'NODE_SCRIPT'
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

async function fixDescriptionUrls() {
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
    const productsDir = path.join(uploadsDir, 'products');
    
    // Scan all files in products directory
    let allFiles = [];
    if (fs.existsSync(productsDir)) {
      allFiles = fs.readdirSync(productsDir).filter(f => {
        const ext = path.parse(f).ext.toLowerCase();
        return ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
      });
      console.log(`   Found ${allFiles.length} image files in products directory`);
    }
    
    let fixedCount = 0;
    let notFoundCount = 0;

    function fixImageUrlsInText(text) {
      if (!text) return text;
      
      // Find all image URLs in the text
      const urlRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp|gif)/gi;
      const matches = text.match(urlRegex);
      
      if (!matches) return text;
      
      let newText = text;
      let hasChanges = false;
      
      for (const oldUrl of matches) {
        try {
          const urlObj = new URL(oldUrl);
          const urlPath = urlObj.pathname;
          
          // Skip external URLs (not from a.acoustic.uz or acoustic.uz)
          const hostname = urlObj.hostname.toLowerCase();
          if (hostname && !hostname.includes('acoustic.uz') && !hostname.includes('localhost')) {
            // External URL - keep it as is
            console.log(`      ℹ️  External URL kept: ${hostname}`);
            continue;
          }
          
          // Extract filename from old path (e.g., /uploads/2024/07/itc90-300x269.png)
          const filename = path.basename(urlPath);
          const baseName = path.parse(filename).name;
          
          // Try to find the file in products directory
          // Be VERY strict - only accept exact or very close matches
          let foundFile = null;
          let bestScore = 0;
          
          const searchBaseName = baseName.toLowerCase();
          // Remove size suffix (e.g., -300x269)
          const cleanBaseName = searchBaseName.replace(/-\d+x\d+$/, '');
          
          // Score files by how well they match - stricter scoring
          for (const file of allFiles) {
            const fileBaseName = path.parse(file).name.toLowerCase();
            let score = 0;
            
            // Exact match gets highest score
            if (fileBaseName === searchBaseName || fileBaseName === cleanBaseName) {
              score = 100;
            }
            // File base name starts with clean base name (very strict)
            else if (fileBaseName.startsWith(cleanBaseName) && cleanBaseName.length > 8) {
              score = 90;
            }
            // Clean base name starts with file base name (very strict)
            else if (cleanBaseName.startsWith(fileBaseName) && fileBaseName.length > 8) {
              score = 85;
            }
            // File contains clean base name AND clean base name is long enough
            else if (fileBaseName.includes(cleanBaseName) && cleanBaseName.length > 10) {
              score = 80;
            }
            
            // Only accept matches with score >= 85 to avoid wrong matches
            // This is stricter than before to prevent wrong file assignments
            if (score >= 85 && score > bestScore) {
              foundFile = file;
              bestScore = score;
            }
          }
          
          if (foundFile && bestScore >= 85) {
            const newUrl = `https://a.acoustic.uz/uploads/products/${foundFile}`;
            newText = newText.replace(oldUrl, newUrl);
            hasChanges = true;
            console.log(`      Fixed: ${filename} → ${foundFile} (score: ${bestScore})`);
          } else {
            // File not found - check if it's an old date-based path
            if (urlPath.includes('/2024/') || urlPath.includes('/2023/')) {
              // Try to find file in old location first
              const oldPath = path.join(uploadsDir, urlPath.replace(/^\/uploads\//, ''));
              if (fs.existsSync(oldPath)) {
                // File exists in old location, keep original URL
                console.log(`      ⚠️  File exists in old location: ${urlPath} (keeping original)`);
              } else {
                // File doesn't exist - remove the image tag or comment it out
                // Remove <img> tag containing this URL
                const imgTagRegex = new RegExp(`<img[^>]*src=["']${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi');
                if (imgTagRegex.test(newText)) {
                  newText = newText.replace(imgTagRegex, '<!-- Image removed: file not found -->');
                  hasChanges = true;
                  console.log(`      🗑️  Removed broken image tag: ${filename}`);
                } else {
                  // If not in img tag, just replace the URL with comment
                  newText = newText.replace(oldUrl, '<!-- Image URL removed: file not found -->');
                  hasChanges = true;
                  console.log(`      🗑️  Removed broken URL: ${filename}`);
                }
                notFoundCount++;
              }
            } else {
              // Not an old path - keep original URL
              console.log(`      ⚠️  Not found: ${filename} (keeping original URL)`);
              notFoundCount++;
            }
          }
        } catch (e) {
          console.log(`      ❌ Error processing URL: ${oldUrl}`);
        }
      }
      
      return hasChanges ? newText : null;
    }

    for (const product of products) {
      let hasChanges = false;
      let newDescriptionUz = product.description_uz;
      let newDescriptionRu = product.description_ru;
      
      if (product.description_uz) {
        const fixedUz = fixImageUrlsInText(product.description_uz);
        if (fixedUz) {
          newDescriptionUz = fixedUz;
          hasChanges = true;
        }
      }
      
      if (product.description_ru) {
        const fixedRu = fixImageUrlsInText(product.description_ru);
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
    console.log(`⚠️  ${notFoundCount} URLs with missing files`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDescriptionUrls();

NODE_SCRIPT

echo "   ✅ Script created"
echo ""

# Step 3: Run the script
echo "📋 Step 3: Running script to fix description URLs..."
cd "$PROJECT_DIR"

if command -v pnpm >/dev/null 2>&1; then
    echo "   Using pnpm exec to run script..."
    if pnpm exec node /tmp/fix-description-urls.js; then
        echo "   ✅ URLs fixed"
    else
        echo "   ❌ Failed to fix URLs"
        exit 1
    fi
else
    if [ -d "$PROJECT_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$PROJECT_DIR/node_modules:$NODE_PATH"
    elif [ -d "$BACKEND_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$BACKEND_DIR/node_modules:$NODE_PATH"
    fi
    
    if node /tmp/fix-description-urls.js; then
        echo "   ✅ URLs fixed"
    else
        echo "   ❌ Failed to fix URLs"
        exit 1
    fi
fi

echo ""
echo "✅ Fix complete!"

# Cleanup
rm -f /tmp/fix-description-urls.js

