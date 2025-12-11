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
cd "$PROJECT_DIR"

# First, find .env file
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
    echo "   Searched:"
    echo "      $PROJECT_DIR/.env"
    echo "      $BACKEND_DIR/.env"
    echo "      $PROJECT_DIR/apps/backend/.env"
    echo ""
    echo "   Current directory: $(pwd)"
    echo "   PROJECT_DIR: $PROJECT_DIR"
    echo "   BACKEND_DIR: $BACKEND_DIR"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" "$ENV_FILE"; then
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

# Step 3: Load environment variables (ENV_FILE already found in Step 1)
echo "📋 Step 3: Loading environment variables..."
echo "   Using .env file: $ENV_FILE"

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
// Add node_modules to require path
const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Try to find @prisma/client in common locations
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

    for (const product of products) {
      const newUrls = [];
      let hasChanges = false;
      
      // If galleryUrls is empty or null, try to find files by slug
      if (!product.galleryUrls || product.galleryUrls.length === 0) {
        // Find files that match this product slug
        const slugLower = product.slug.toLowerCase();
        const matchingFiles = allFiles.filter(file => {
          const fileLower = file.toLowerCase();
          const fileBaseName = path.parse(file).name.toLowerCase();
          
          // Check if file name contains product slug or vice versa
          return fileBaseName.includes(slugLower) || 
                 slugLower.includes(fileBaseName.split('-')[0]) ||
                 fileBaseName.startsWith(slugLower) ||
                 fileBaseName.startsWith(slugLower.replace(/-/g, '_'));
        });
        
        if (matchingFiles.length > 0) {
          // Use the first matching file (or all if multiple)
          for (const file of matchingFiles.slice(0, 3)) { // Max 3 images per product
            newUrls.push(`/uploads/products/${file}`);
          }
          hasChanges = true;
          console.log(`   ✅ Found ${matchingFiles.length} file(s) for: ${product.slug}`);
          matchingFiles.forEach(f => console.log(`      - ${f}`));
        } else {
          notFoundCount++;
          console.log(`   ⚠️  No files found for: ${product.slug}`);
        }
      } else {
        // Process existing URLs
        for (const url of product.galleryUrls) {
        // Remove leading slash and /uploads/ prefix if present
        let cleanUrl = url.replace(/^\/+/, '').replace(/^uploads\//, '');
        
        // Extract filename and base name (without extension)
        const filename = path.basename(cleanUrl);
        const baseName = path.parse(filename).name;
        const ext = path.parse(filename).ext.toLowerCase();
        
        // Try different extensions (.jpg, .jpeg, .png, .webp)
        const extensions = [ext, '.webp', '.jpg', '.jpeg', '.png'];
        
        // Try different possible locations
        const possibleBasePaths = [
          `products/${baseName}`,           // Most likely location
          cleanUrl.replace(/\.(jpg|jpeg|png|webp)$/i, ''),  // Original path without extension
          `2024/07/${baseName}`,            // Old location
          `2024/06/${baseName}`,
          `2024/05/${baseName}`,
          `2024/04/${baseName}`,
          `2024/03/${baseName}`,
          `2024/02/${baseName}`,
          `2024/01/${baseName}`,
          `2023/12/${baseName}`,
          baseName,                          // Root of uploads
        ];

        let foundPath = null;
        for (const basePath of possibleBasePaths) {
          for (const extTry of extensions) {
            const testPath = `${basePath}${extTry}`;
            const fullPath = path.join(uploadsDir, testPath);
            if (fs.existsSync(fullPath)) {
              foundPath = testPath;
              break;
            }
          }
          if (foundPath) break;
        }
        
        // Also try case-insensitive search in products directory
        if (!foundPath && fs.existsSync(path.join(uploadsDir, 'products'))) {
          const productsDir = path.join(uploadsDir, 'products');
          const files = fs.readdirSync(productsDir);
          const filenameLower = filename.toLowerCase();
          const baseNameLower = baseName.toLowerCase();
          
          for (const file of files) {
            const fileLower = file.toLowerCase();
            const fileBaseName = path.parse(file).name.toLowerCase();
            if (fileLower === filenameLower || fileBaseName === baseNameLower) {
              foundPath = `products/${file}`;
              break;
            }
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
          // File not found - try to find by product slug
          const slugBasedPaths = [
            `products/${product.slug}.webp`,
            `products/${product.slug}.jpg`,
            `products/${product.slug}.png`,
            `products/${product.slug}-${baseName}.webp`,
            `products/${product.slug}-${baseName}.jpg`,
          ];
          
          let slugFoundPath = null;
          for (const slugPath of slugBasedPaths) {
            const fullPath = path.join(uploadsDir, slugPath);
            if (fs.existsSync(fullPath)) {
              slugFoundPath = slugPath;
              break;
            }
          }
          
          if (slugFoundPath) {
            const newUrl = `/uploads/${slugFoundPath}`;
            newUrls.push(newUrl);
            hasChanges = true;
            console.log(`   ✅ Found by slug: ${product.slug}`);
            console.log(`     Old: ${url}`);
            console.log(`     New: ${newUrl}`);
          } else {
            // File not found, keep original URL but log warning
            newUrls.push(url);
            notFoundCount++;
            console.log(`   ⚠️  File not found for: ${url} (product: ${product.slug})`);
            console.log(`      Searched for: ${filename}`);
          }
        }
      }

      // If we found URLs (either from existing or by slug), update the product
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
cd "$PROJECT_DIR"

# Use pnpm exec to ensure Prisma Client is available
# Or use node with NODE_PATH set
if command -v pnpm >/dev/null 2>&1; then
    echo "   Using pnpm exec to run script..."
    if pnpm exec node /tmp/fix-product-urls.js; then
        echo "   ✅ URLs fixed"
    else
        echo "   ❌ Failed to fix URLs"
        echo "   Check error above"
        exit 1
    fi
else
    # Fallback: try to find node_modules and set NODE_PATH
    if [ -d "$PROJECT_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$PROJECT_DIR/node_modules:$NODE_PATH"
        echo "   Using NODE_PATH: $NODE_PATH"
    elif [ -d "$BACKEND_DIR/node_modules/@prisma/client" ]; then
        export NODE_PATH="$BACKEND_DIR/node_modules:$NODE_PATH"
        echo "   Using NODE_PATH: $NODE_PATH"
    else
        echo "   ❌ @prisma/client not found in node_modules"
        echo "   Installing dependencies..."
        pnpm install
        export NODE_PATH="$PROJECT_DIR/node_modules:$NODE_PATH"
    fi
    
    if node /tmp/fix-product-urls.js; then
        echo "   ✅ URLs fixed"
    else
        echo "   ❌ Failed to fix URLs"
        echo "   Check error above"
        exit 1
    fi
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

