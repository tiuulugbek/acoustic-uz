#!/bin/bash

# Script to find where backend is saving uploads

echo "🔍 Finding backend uploads directory..."
echo ""

# Check PM2 process working directory
echo "📋 PM2 process info:"
pm2 info acoustic-backend | grep -E "cwd|script path" || echo "PM2 info not available"

echo ""
echo "📋 Checking common upload locations:"

# Check various possible locations
LOCATIONS=(
    "/var/www/news.acoustic.uz/apps/backend/uploads"
    "/var/www/news.acoustic.uz/uploads"
    "$(pm2 describe acoustic-backend | grep 'cwd' | awk '{print $4}')/uploads"
)

for LOC in "${LOCATIONS[@]}"; do
    if [ -d "$LOC" ]; then
        echo "✅ Found: $LOC"
        echo "   Files: $(ls "$LOC" | wc -l)"
        echo "   Latest file: $(ls -t "$LOC"/*.webp 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'none')"
    else
        echo "❌ Not found: $LOC"
    fi
done

echo ""
echo "📋 Recent uploads (last 5 files):"
find /var/www/news.acoustic.uz -name "*.webp" -type f -mmin -60 2>/dev/null | head -5

