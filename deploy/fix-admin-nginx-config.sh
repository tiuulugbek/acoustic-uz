#!/bin/bash
# Fix admin panel Nginx configuration

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo "🔧 Fixing admin panel Nginx configuration..."
echo ""

# Step 1: Check admin panel files
echo "📋 Step 1: Checking admin panel files..."
if [ -d "$ADMIN_DIR" ]; then
    echo "   ✅ Admin directory exists: $ADMIN_DIR"
    if [ -f "$ADMIN_DIR/index.html" ]; then
        echo "   ✅ index.html exists"
        ls -lh "$ADMIN_DIR/index.html" | awk '{print "    Size: " $5}'
    else
        echo "   ❌ index.html NOT found!"
        exit 1
    fi
    
    echo "   Files in admin directory:"
    ls -la "$ADMIN_DIR" | head -10 | sed 's/^/      /'
else
    echo "   ❌ Admin directory NOT found: $ADMIN_DIR"
    exit 1
fi
echo ""

# Step 2: Check current Nginx config
echo "📋 Step 2: Checking current Nginx configuration..."
if grep -q "server_name admin.acoustic.uz" "$NGINX_CONFIG" 2>/dev/null; then
    echo "   ✅ Admin server block found"
    grep -A 5 "server_name admin.acoustic.uz" "$NGINX_CONFIG" | head -10 | sed 's/^/      /'
else
    echo "   ❌ Admin server block NOT found!"
    echo "   Adding admin server block..."
    
    # Backup
    BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo "   ✅ Backup created: $BACKUP_FILE"
    
    # Add admin server block
    python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        lines = f.readlines()
    
    # Check if admin block already exists
    content_str = ''.join(lines)
    if 'server_name admin.acoustic.uz' in content_str:
        print("   Admin block already exists")
        sys.exit(0)
    
    # Find the last server block and add after it
    # Look for the last closing brace of a server block before the final closing brace
    admin_block = '''# Admin Panel (admin.acoustic.uz)
server {
    listen 80;
    listen [::]:80;
    server_name admin.acoustic.uz;

    access_log /var/log/nginx/admin.acoustic.uz.access.log;
    error_log /var/log/nginx/admin.acoustic.uz.error.log;

    root /var/www/admin.acoustic.uz;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
'''
    
    # Find the last server block closing brace (before the final http block closing brace)
    # Count braces to find the right place
    brace_count = 0
    insert_pos = -1
    
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i]
        brace_count += line.count('}') - line.count('{')
        
        # If we're at brace_count == 1, we're inside http block but outside server blocks
        # Look for the last server block closing brace
        if brace_count == 1 and '}' in line and 'server' in lines[max(0, i-5):i+1]:
            # Check if this is a server block closing
            # Look backwards for server keyword
            for j in range(max(0, i-20), i):
                if 'server {' in lines[j] or 'server{' in lines[j]:
                    insert_pos = i + 1
                    break
            if insert_pos != -1:
                break
    
    # If we didn't find a good position, add before the last closing brace
    if insert_pos == -1:
        # Find the last closing brace
        for i in range(len(lines) - 1, -1, -1):
            if '}' in lines[i]:
                insert_pos = i
                break
    
    if insert_pos == -1:
        insert_pos = len(lines) - 1
    
    # Insert the admin block
    lines.insert(insert_pos, admin_block + '\n')
    
    with open(config_file, 'w') as f:
        f.writelines(lines)
    
    print("   ✅ Admin server block added")
    sys.exit(0)
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT
fi
echo ""

# Step 3: Verify Nginx config
echo "📋 Step 3: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 4: Check SSL certificate
echo "📋 Step 4: Checking SSL certificate..."
if [ -f "/etc/letsencrypt/live/admin.acoustic.uz/fullchain.pem" ]; then
    echo "   ✅ SSL certificate exists"
    
    # Check if HTTPS server block exists
    if grep -q "listen 443 ssl" "$NGINX_CONFIG" | grep -q "admin.acoustic.uz"; then
        echo "   ✅ HTTPS server block exists"
    else
        echo "   ⚠️  HTTPS server block missing, adding..."
        
        # Add HTTPS server block
        python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Check if HTTPS admin block already exists
if 'listen 443 ssl' in content and 'server_name admin.acoustic.uz' in content:
    # Check if they're in the same block
    lines = content.split('\n')
    in_admin_https = False
    for i, line in enumerate(lines):
        if 'server_name admin.acoustic.uz' in line:
            # Check next few lines for SSL
            for j in range(i, min(i+10, len(lines))):
                if 'listen 443 ssl' in lines[j]:
                    print("   HTTPS admin block already exists")
                    exit(0)
    
    # Add HTTPS block
    https_block = '''
# Admin Panel HTTPS (admin.acoustic.uz)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.acoustic.uz;

    ssl_certificate /etc/letsencrypt/live/admin.acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.acoustic.uz/privkey.pem;

    access_log /var/log/nginx/admin.acoustic.uz.access.log;
    error_log /var/log/nginx/admin.acoustic.uz.error.log;

    root /var/www/admin.acoustic.uz;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
'''
    
    # Find HTTP admin block and add HTTPS after it
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)
        
        # If this is the end of HTTP admin block, add HTTPS block
        if 'server_name admin.acoustic.uz' in line:
            # Check if next block is closing brace
            j = i + 1
            brace_count = 0
            while j < len(lines):
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count < 0:  # Closing brace found
                    # Insert HTTPS block before closing brace
                    new_lines.append(https_block)
                    break
                j += 1
        
        i += 1
    
    content = '\n'.join(new_lines)
    
    with open(config_file, 'w') as f:
        f.write(content)
    
    print("   ✅ HTTPS server block added")
PYTHON_SCRIPT
    fi
else
    echo "   ⚠️  SSL certificate not found"
    echo "   💡 Run: certbot --nginx -d admin.acoustic.uz"
fi
echo ""

# Step 5: Reload Nginx
echo "📋 Step 5: Reloading Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 6: Verify
echo "📋 Step 6: Verifying admin panel..."
sleep 3

# Test HTTP
ADMIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_HTTP" = "200" ]; then
    echo "   ✅ Admin panel HTTP accessible (HTTP $ADMIN_HTTP)"
else
    echo "   ⚠️  Admin panel HTTP not accessible (HTTP $ADMIN_HTTP)"
fi

# Test HTTPS
ADMIN_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_HTTPS" = "200" ]; then
    echo "   ✅ Admin panel HTTPS accessible (HTTP $ADMIN_HTTPS)"
else
    echo "   ⚠️  Admin panel HTTPS not accessible (HTTP $ADMIN_HTTPS)"
fi

# Test login
ADMIN_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/login 2>/dev/null || echo "000")
if [ "$ADMIN_LOGIN" = "200" ]; then
    echo "   ✅ Admin panel login accessible (HTTP $ADMIN_LOGIN)"
else
    echo "   ⚠️  Admin panel login not accessible (HTTP $ADMIN_LOGIN)"
    echo "   Check Nginx logs: tail -20 /var/log/nginx/admin.acoustic.uz.error.log"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📋 Admin panel URLs:"
echo "  - HTTP: http://admin.acoustic.uz/"
echo "  - HTTPS: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"
echo ""
echo "💡 If still not working:"
echo "  1. Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log"
echo "  2. Verify files: ls -la /var/www/admin.acoustic.uz/"
echo "  3. Test locally: curl -I http://admin.acoustic.uz/"

