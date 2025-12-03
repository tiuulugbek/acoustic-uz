#!/bin/bash
# Check admin build files in detail

set -e

echo "🔍 Checking admin build files in detail..."

cd /var/www/news.acoustic.uz

# Check if dist directory exists
if [ ! -d "apps/admin/dist" ]; then
    echo "❌ Admin dist directory not found!"
    exit 1
fi

# Find JavaScript file
JS_FILE=$(find apps/admin/dist -name "*.js" -type f | head -1)

if [ -z "$JS_FILE" ]; then
    echo "❌ JavaScript file not found!"
    exit 1
fi

echo "📁 JavaScript file: $JS_FILE"
echo ""

# Check for handleAmoCRMAuthorize function
echo "🔍 Checking for handleAmoCRMAuthorize function..."
if grep -q "handleAmoCRMAuthorize\|STARTING OAuth redirect" "$JS_FILE"; then
    echo "✅ handleAmoCRMAuthorize function found!"
    echo ""
    echo "📋 Function content (first 500 chars):"
    grep -o "STARTING OAuth redirect.*window.location.replace[^}]*" "$JS_FILE" | head -c 500
    echo ""
    echo ""
else
    echo "❌ handleAmoCRMAuthorize function NOT found!"
fi

# Check for window.location.replace
echo ""
echo "🔍 Checking for window.location.replace..."
if grep -q "window.location.replace" "$JS_FILE"; then
    echo "✅ window.location.replace found!"
    echo ""
    echo "📋 Context (first 200 chars):"
    grep -o ".{0,100}window.location.replace.{0,100}" "$JS_FILE" | head -c 200
    echo ""
    echo ""
else
    echo "❌ window.location.replace NOT found!"
fi

# Check for fetch requests to amocrm
echo ""
echo "🔍 Checking for fetch requests to amocrm..."
if grep -q "fetch.*amocrm\|request.*amocrm" "$JS_FILE"; then
    echo "⚠️  Fetch requests to amocrm found!"
    echo ""
    echo "📋 Context (first 200 chars):"
    grep -o ".{0,100}fetch.*amocrm.{0,100}\|.{0,100}request.*amocrm.{0,100}" "$JS_FILE" | head -c 200
    echo ""
    echo ""
else
    echo "✅ No fetch requests to amocrm found!"
fi

# Check for getAmoCRMAuthUrl
echo ""
echo "🔍 Checking for getAmoCRMAuthUrl calls..."
if grep -q "getAmoCRMAuthUrl" "$JS_FILE" | grep -v "DEPRECATED\|Do not use"; then
    echo "⚠️  getAmoCRMAuthUrl calls found!"
    echo ""
    echo "📋 Context (first 200 chars):"
    grep -o ".{0,100}getAmoCRMAuthUrl.{0,100}" "$JS_FILE" | head -c 200
    echo ""
    echo ""
else
    echo "✅ No getAmoCRMAuthUrl calls found!"
fi

echo ""
echo "✅ Check complete!"

