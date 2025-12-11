#!/bin/bash

# Check a.acoustic.uz server block configuration
CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔍 Checking a.acoustic.uz server block configuration..."
echo ""

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

# Extract a.acoustic.uz server block
echo "📋 a.acoustic.uz server block:"
echo "---"
grep -A 100 "server_name a.acoustic.uz" "$CONFIG_FILE" | grep -B 2 -A 100 "server_name\|location\|listen" | head -80
echo "---"

echo ""
echo "🔍 Searching for /api location..."
if grep -A 20 "server_name a.acoustic.uz" "$CONFIG_FILE" | grep -q "location /api"; then
    echo "   ✅ Found /api location block:"
    grep -A 20 "server_name a.acoustic.uz" "$CONFIG_FILE" | grep -A 20 "location /api"
else
    echo "   ❌ /api location block NOT found"
    echo ""
    echo "📋 All location blocks in a.acoustic.uz:"
    grep -A 100 "server_name a.acoustic.uz" "$CONFIG_FILE" | grep "location"
fi

