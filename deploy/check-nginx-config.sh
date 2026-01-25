#!/bin/bash
# Check Nginx configuration for acoustic.uz

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔍 Checking Nginx configuration for acoustic.uz..."
echo ""

# Find acoustic.uz server block
echo "📋 acoustic.uz server block:"
grep -A 50 "server_name acoustic.uz" "$NGINX_CONFIG" | head -60 | sed 's/^/   /'
echo ""

# Check for location blocks
echo "📋 Location blocks in acoustic.uz:"
grep -A 10 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 5 "location" | sed 's/^/   /'
echo ""

# Check for proxy_pass
echo "📋 proxy_pass directives:"
grep -A 20 "server_name acoustic.uz" "$NGINX_CONFIG" | grep "proxy_pass" | sed 's/^/   /' || echo "   No proxy_pass found"
echo ""

# Check if it's using try_files (static files)
echo "📋 try_files directives:"
grep -A 20 "server_name acoustic.uz" "$NGINX_CONFIG" | grep "try_files" | sed 's/^/   /' || echo "   No try_files found"
echo ""

# Show full server block
echo "📋 Full server block for acoustic.uz:"
awk '/server_name acoustic.uz/,/^}/' "$NGINX_CONFIG" | sed 's/^/   /'

