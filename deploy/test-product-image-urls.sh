#!/bin/bash
# Test product image URLs from backend API

set -e

PROJECT_DIR="/var/www/acoustic.uz"
BACKEND_URL="http://127.0.0.1:3001"

echo "🔍 Testing product image URLs..."
echo ""

# Step 1: Check backend is running
echo "📋 Step 1: Checking backend..."
if pm2 list | grep -q "acoustic-backend.*online"; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    exit 1
fi
echo ""

# Step 2: Get a product from API
echo "📋 Step 2: Getting product from API..."
PRODUCT_RESPONSE=$(curl -s "$BACKEND_URL/api/products?limit=1" 2>/dev/null || echo "")

if [ -z "$PRODUCT_RESPONSE" ]; then
    echo "   ❌ Failed to get products from API"
    exit 1
fi

# Extract first product slug
PRODUCT_SLUG=$(echo "$PRODUCT_RESPONSE" | grep -o '"slug":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PRODUCT_SLUG" ]; then
    echo "   ⚠️  No products found"
    exit 0
fi

echo "   ✅ Found product: $PRODUCT_SLUG"
echo ""

# Step 3: Get product details
echo "📋 Step 3: Getting product details..."
PRODUCT_DETAILS=$(curl -s "$BACKEND_URL/api/products/slug/$PRODUCT_SLUG" 2>/dev/null || echo "")

if [ -z "$PRODUCT_DETAILS" ]; then
    echo "   ❌ Failed to get product details"
    exit 1
fi

# Extract galleryUrls
echo "   Product galleryUrls:"
echo "$PRODUCT_DETAILS" | grep -o '"galleryUrls":\[[^\]]*\]' | sed 's/^/      /' || echo "      No galleryUrls found"

# Extract individual URLs
echo ""
echo "   Individual image URLs:"
echo "$PRODUCT_DETAILS" | grep -o '"/uploads/[^"]*"' | head -5 | sed 's/^/      /' || echo "      No /uploads/ URLs found"
echo ""

# Step 4: Test URLs
echo "📋 Step 4: Testing image URLs..."
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"

# Extract URLs and test them
echo "$PRODUCT_DETAILS" | grep -o '"/uploads/[^"]*"' | head -5 | while read -r URL; do
    # Remove quotes
    CLEAN_URL=$(echo "$URL" | tr -d '"')
    
    # Remove /uploads/ prefix to get relative path
    RELATIVE_PATH="${CLEAN_URL#/uploads/}"
    
    echo "   Testing: $CLEAN_URL"
    echo "   Relative path: $RELATIVE_PATH"
    
    # Check if file exists
    if [ -f "$UPLOADS_DIR/$RELATIVE_PATH" ]; then
        echo "      ✅ File exists: $UPLOADS_DIR/$RELATIVE_PATH"
    else
        echo "      ❌ File NOT found: $UPLOADS_DIR/$RELATIVE_PATH"
        
        # Try to find similar files
        FILENAME=$(basename "$RELATIVE_PATH")
        echo "      Searching for: $FILENAME"
        find "$UPLOADS_DIR" -name "*$(basename "$FILENAME" .webp)*" -o -name "*$(basename "$FILENAME" .jpg)*" 2>/dev/null | head -3 | sed 's/^/         /' || echo "         Not found"
    fi
    
    # Test HTTP URL
    HTTP_URL="https://a.acoustic.uz$CLEAN_URL"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HTTP_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "      ✅ HTTP accessible: $HTTP_URL (HTTP $HTTP_CODE)"
    else
        echo "      ❌ HTTP not accessible: $HTTP_URL (HTTP $HTTP_CODE)"
    fi
    echo ""
done

echo "✅ Test complete!"
echo ""
echo "💡 Summary:"
echo "   - Check if URLs in database match actual file locations"
echo "   - If URLs are wrong, update them in database or fix backend storage service"

