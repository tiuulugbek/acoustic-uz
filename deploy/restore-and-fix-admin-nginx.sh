#!/bin/bash
# Restore backup and properly fix admin Nginx config

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
ADMIN_DIR="/var/www/admin.acoustic.uz"

echo "🔧 Restoring backup and fixing admin panel Nginx configuration..."
echo ""

# Step 1: Find and restore backup
echo "📋 Step 1: Finding backup..."
BACKUP_FILES=$(ls -t "$NGINX_CONFIG".backup.* 2>/dev/null | head -5)
if [ -n "$BACKUP_FILES" ]; then
    echo "   Available backups:"
    echo "$BACKUP_FILES" | nl -w 2 -s '. ' | sed 's/^/      /'
    echo ""
    
    # Use the most recent backup
    BACKUP_FILE=$(echo "$BACKUP_FILES" | head -1)
    echo "   Using most recent backup: $BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$NGINX_CONFIG"
        echo "   ✅ Backup restored"
    else
        echo "   ⚠️  Backup file not found, continuing with current config"
    fi
else
    echo "   ⚠️  No backup found, continuing with current config"
    echo "   💡 If you want to restore manually, look for:"
    echo "      ls -lt $NGINX_CONFIG.backup.*"
fi
echo ""

# Step 2: Check if admin block exists
echo "📋 Step 2: Checking current configuration..."
if grep -q "server_name admin.acoustic.uz" "$NGINX_CONFIG" 2>/dev/null; then
    echo "   ✅ Admin server block found"
    
    # Check if it's in the right place (inside http block)
    if nginx -t 2>&1 | grep -q "server.*directive is not allowed"; then
        echo "   ❌ Admin block is in wrong place, removing..."
        # Remove admin blocks
        python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        lines = f.readlines()
    
    # Remove lines between "server_name admin.acoustic.uz" and matching closing brace
    new_lines = []
    skip = False
    brace_count = 0
    
    for i, line in enumerate(lines):
        if 'server_name admin.acoustic.uz' in line:
            skip = True
            brace_count = 0
            continue
        
        if skip:
            brace_count += line.count('{') - line.count('}')
            if brace_count < 0:  # Closing brace found
                skip = False
            continue
        
        new_lines.append(line)
    
    with open(config_file, 'w') as f:
        f.writelines(new_lines)
    
    print("   ✅ Admin blocks removed")
    sys.exit(0)
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT
    fi
else
    echo "   ℹ️  Admin server block not found (will add)"
fi
echo ""

# Step 3: Find the right place to add admin block (after other server blocks, before HTTP redirects)
echo "📋 Step 3: Adding admin server block..."
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
    
    # Find the last server block before HTTP redirects
    # Look for "server_name a.acoustic.uz" block and add after it
    insert_pos = -1
    
    for i in range(len(lines)):
        if 'server_name a.acoustic.uz' in lines[i]:
            # Find the closing brace of this server block
            brace_count = 0
            for j in range(i, len(lines)):
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count < 0:  # Found closing brace
                    insert_pos = j + 1
                    break
            break
    
    # If not found, find the last server block before HTTP redirects
    if insert_pos == -1:
        for i in range(len(lines) - 1, -1, -1):
            if 'server {' in lines[i] and 'server_name' in ''.join(lines[i:i+5]):
                # Find closing brace
                brace_count = 0
                for j in range(i, len(lines)):
                    brace_count += lines[j].count('{') - lines[j].count('}')
                    if brace_count < 0:
                        insert_pos = j + 1
                        break
                break
    
    if insert_pos == -1:
        # Add before HTTP redirects
        for i in range(len(lines)):
            if 'HTTP to HTTPS redirect' in lines[i] or ('server_name' in lines[i] and 'return 301' in ''.join(lines[i:i+3])):
                insert_pos = i
                break
    
    if insert_pos == -1:
        insert_pos = len(lines) - 1
    
    admin_block = '''# Admin Panel (admin.acoustic.uz)
server {
    server_name admin.acoustic.uz;

    # Logs
    access_log /var/log/nginx/admin.acoustic.uz.access.log;
    error_log /var/log/nginx/admin.acoustic.uz.error.log;

    root /var/www/admin.acoustic.uz;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # No-cache headers for version.json
    location = /version.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }

    # No-cache headers for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }

    # Main location block - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/admin.acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.acoustic.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

'''
    
    lines.insert(insert_pos, admin_block)
    
    with open(config_file, 'w') as f:
        f.writelines(lines)
    
    print(f"   ✅ Admin server block added at line {insert_pos + 1}")
    sys.exit(0)
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "   ❌ Failed to add admin block"
    exit 1
fi
echo ""

# Step 4: Verify Nginx config
echo "📋 Step 4: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo ""
    echo "   💡 Please check the configuration manually:"
    echo "      nginx -t"
    echo "      cat $NGINX_CONFIG | grep -A 5 'admin.acoustic.uz'"
    exit 1
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

ADMIN_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_HTTPS" = "200" ]; then
    echo "   ✅ Admin panel HTTPS accessible (HTTP $ADMIN_HTTPS)"
else
    echo "   ⚠️  Admin panel HTTPS not accessible (HTTP $ADMIN_HTTPS)"
fi

ADMIN_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/login 2>/dev/null || echo "000")
if [ "$ADMIN_LOGIN" = "200" ]; then
    echo "   ✅ Admin panel login accessible (HTTP $ADMIN_LOGIN)"
else
    echo "   ⚠️  Admin panel login not accessible (HTTP $ADMIN_LOGIN)"
    echo "   Check Nginx logs: tail -20 /var/log/nginx/admin.acoustic.uz.error.log"
fi

echo ""
echo "✅ Fix complete!"

