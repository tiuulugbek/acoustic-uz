#!/bin/bash
# Check admin build files and their content

set -e

echo "🔍 Checking admin build files..."

cd /var/www/news.acoustic.uz

# Check if dist directory exists
if [ ! -d "apps/admin/dist" ]; then
    echo "❌ Admin dist directory not found!"
    exit 1
fi

# Check build timestamp
echo "📅 Build timestamp:"
stat -c "%y" apps/admin/dist/index.html 2>/dev/null || stat -f "%Sm" apps/admin/dist/index.html 2>/dev/null || echo "Cannot get timestamp"

# Check if JavaScript files contain our debug logs
echo ""
echo "🔍 Checking for debug logs in build files..."
if grep -r "STARTING OAuth redirect" apps/admin/dist/ 2>/dev/null; then
    echo "✅ Debug logs found in build files!"
else
    echo "❌ Debug logs NOT found in build files!"
    echo "   This means the build is outdated."
fi

# Check if JavaScript files contain window.location.replace
echo ""
echo "🔍 Checking for window.location.replace in build files..."
if grep -r "window.location.replace" apps/admin/dist/ 2>/dev/null; then
    echo "✅ window.location.replace found in build files!"
else
    echo "❌ window.location.replace NOT found in build files!"
    echo "   This means the build is outdated."
fi

# Check if JavaScript files contain getAmoCRMAuthUrl (should NOT be there)
echo ""
echo "🔍 Checking for deprecated getAmoCRMAuthUrl in build files..."
if grep -r "getAmoCRMAuthUrl" apps/admin/dist/ 2>/dev/null | grep -v "DEPRECATED\|Do not use"; then
    echo "⚠️  getAmoCRMAuthUrl found in build files (might be deprecated comment)"
else
    echo "✅ getAmoCRMAuthUrl NOT found in build files (or only in comments)"
fi

# List JavaScript files
echo ""
echo "📁 JavaScript files in dist:"
find apps/admin/dist -name "*.js" -type f | head -5

echo ""
echo "✅ Check complete!"

