#!/bin/bash
# Check if admin build has correct API URL

set -e

ADMIN_DIST_DIR="/var/www/admins.acoustic.uz/dist"

echo "🔍 Checking admin build API URL..."

if [ ! -d "$ADMIN_DIST_DIR" ]; then
    echo "❌ Admin dist directory not found!"
    exit 1
fi

echo "📁 Checking build files..."
JS_FILE=$(find "$ADMIN_DIST_DIR" -name "*.js" -type f | head -1)

if [ -z "$JS_FILE" ]; then
    echo "❌ No JS files found in dist!"
    exit 1
fi

echo "📄 Checking file: $JS_FILE"
echo ""

# Check for localhost:3001
if grep -q "localhost:3001" "$JS_FILE"; then
    echo "❌ Found localhost:3001 in build file!"
    echo "📋 Occurrences:"
    grep -o "localhost:3001" "$JS_FILE" | wc -l
    echo ""
    echo "💡 This means the build was done without VITE_API_URL set correctly."
    echo "💡 Please rebuild with: bash deploy/deploy-admin-build.sh --rebuild"
else
    echo "✅ No localhost:3001 found in build file"
fi

# Check for api.acoustic.uz
if grep -q "api.acoustic.uz" "$JS_FILE"; then
    echo "✅ Found api.acoustic.uz in build file"
    echo "📋 Occurrences:"
    grep -o "api.acoustic.uz" "$JS_FILE" | wc -l
else
    echo "⚠️  No api.acoustic.uz found in build file"
fi

echo ""
echo "📅 Build file timestamp:"
stat -c "%y" "$JS_FILE" 2>/dev/null || stat -f "%Sm" "$JS_FILE" 2>/dev/null || echo "Unknown"

