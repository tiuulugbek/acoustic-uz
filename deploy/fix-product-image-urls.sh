#!/bin/bash
# Fix product image URLs in database to match actual file locations

set -e

PROJECT_DIR="/var/www/acoustic.uz"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

echo "🔧 Fixing product image URLs in database..."
echo ""

# Step 1: Check database connection
echo "📋 Step 1: Checking database connection..."
cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
    echo "   ❌ .env file not found"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "   ❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "   ✅ Database configuration found"
echo ""

# Step 2: Check actual file structure
echo "📋 Step 2: Checking actual file structure..."
if [ -d "$UPLOADS_DIR/products" ]; then
    PRODUCTS_COUNT=$(find "$UPLOADS_DIR/products" -type f | wc -l)
    echo "   ✅ Products directory exists with $PRODUCTS_COUNT files"
    
    # Sample files
    echo "   Sample files:"
    find "$UPLOADS_DIR/products" -type f | head -5 | sed 's|^.*uploads/|      /uploads/|' | sed 's/^/      /'
fi
echo ""

# Step 3: Load environment variables
echo "📋 Step 3: Loading environment variables..."
cd "$PROJECT_DIR"

# Check .env file location - try multiple locations
ENV_FILE=""
for POSSIBLE_ENV in \
    "$PROJECT_DIR/.env" \
    "$BACKEND_DIR/.env" \
    "$PROJECT_DIR/apps/backend/.env" \
    "$(dirname "$PROJECT_DIR")/.env"
do
    if [ -f "$POSSIBLE_ENV" ]; then
        ENV_FILE="$POSSIBLE_ENV"
        echo "   Found .env at: $ENV_FILE"
        break
    fi
done

if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
    echo "   ❌ .env file not found"
    echo "   Searched locations:"
    echo "      $PROJECT_DIR/.env"
    echo "      $BACKEND_DIR/.env"
    echo "      $PROJECT_DIR/apps/backend/.env"
    echo ""
    echo "   💡 Please create .env file with DATABASE_URL"
    exit 1
fi

echo "   ✅ Using .env file: $ENV_FILE"

# Load DATABASE_URL - handle different formats
# Support both DATABASE_URL=... and DATABASE_URL="..." formats
DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | cut -d'=' -f2- | sed 's/^["'\'']//' | sed 's/["'\'']$//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

if [ -z "$DATABASE_URL" ]; then
    echo "   ❌ DATABASE_URL not found in .env"
    echo "   File contents (first 10 lines with DATABASE):"
    grep -i "database" "$ENV_FILE" | head -5 | sed 's/^/      /' || echo "      No DATABASE found"
    exit 1
fi

export DATABASE_URL
echo "   ✅ DATABASE_URL loaded (first 20 chars: ${DATABASE_URL:0:20}...)"
echo ""

# Step 4: Create Node.js script to fix URLs
echo "📋 Step 4: Creating script to fix URLs..."
cat > /tmp/fix-product-urls.js << 'NODE_SCRIPT'
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Prisma Client will use DATABASE_URL from environment
const prisma = new PrismaClient();

async function fixProductUrls() {
  try {
    console.log('📋 Fetching all products...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        name_uz: true,
        galleryUrls: true,
      },
    });

    console.log(`   Found ${products.length} products`);
    console.log('');

    const uploadsDir = '/var/www/acoustic.uz/apps/backend/uploads';
    let fixedCount = 0;
    let notFoundCount = 0;

    for (const product of products) {
      if (!product.galleryUrls || product.galleryUrls.length === 0) {
        continue;
      }

      const newUrls = [];
      let hasChanges = false;

      for (const url of product.galleryUrls) {
        // Remove leading slash and /uploads/ prefix if present
        let cleanUrl = url.replace(/^\/+/, '').replace(/^uploads\//, '');
        
        // Extract filename
        const filename = path.basename(cleanUrl);
        
        // Try different possible locations
        const possiblePaths = [
          `products/${filename}`,           // Most likely location
          cleanUrl,                          // Original path
          `2024/07/${filename}`,            // Old location
          `2024/06/${filename}`,
          `2024/05/${filename}`,
          filename,                          // Root of uploads
        ];

        let foundPath = null;
        for (const possiblePath of possiblePaths) {
          const fullPath = path.join(uploadsDir, possiblePath);
          if (fs.existsSync(fullPath)) {
            foundPath = possiblePath;
            break;
          }
        }

        if (foundPath) {
          const newUrl = `/uploads/${foundPath}`;
          newUrls.push(newUrl);
          
          if (url !== newUrl) {
            hasChanges = true;
            console.log(`   Product: ${product.name_uz || product.slug}`);
            console.log(`     Old: ${url}`);
            console.log(`     New: ${newUrl}`);
          }
        } else {
          // File not found, keep original URL but log warning
          newUrls.push(url);
          notFoundCount++;
          console.log(`   ⚠️  File not found for: ${url} (product: ${product.slug})`);
          console.log(`      Searched for: ${filename}`);
        }
      }

      if (hasChanges && newUrls.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { galleryUrls: { set: newUrls } },
        });
        fixedCount++;
      }
    }

    console.log('');
    console.log(`✅ Fixed ${fixedCount} products`);
    console.log(`⚠️  ${notFoundCount} URLs with missing files`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductUrls();
NODE_SCRIPT

echo "   ✅ Script created"
echo ""

# Step 4: Run the script
echo "📋 Step 4: Running script to fix URLs..."
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules not found, installing dependencies..."
    cd "$PROJECT_DIR"
    pnpm install
    cd "$BACKEND_DIR"
fi

# Step 5: Run the script
echo "📋 Step 5: Running script to fix URLs..."
cd "$BACKEND_DIR"

# Ensure we're in the right directory with node_modules
if [ ! -d "node_modules" ] && [ -d "../../node_modules" ]; then
    cd ../..
fi

if node /tmp/fix-product-urls.js; then
    echo "   ✅ URLs fixed"
else
    echo "   ❌ Failed to fix URLs"
    echo "   Check error above"
    exit 1
fi
echo ""

# Step 5: Clean up
rm -f /tmp/fix-product-urls.js
echo "✅ Fix complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test a product page: https://acoustic.uz/products/[slug]"
echo "   2. Check if images are loading correctly"
echo "   3. If still issues, check Nginx logs: tail -f /var/log/nginx/a.acoustic.uz.error.log"

