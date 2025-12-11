#!/bin/bash
# Write clean Nginx configuration for acoustic.uz ONLY
# This script ONLY modifies acoustic.uz server block, other domains are not affected

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Writing clean Nginx configuration for acoustic.uz..."
echo ""

# Check if config file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ ERROR: Config file not found: $NGINX_CONFIG"
    exit 1
fi

# Create backup
echo "📋 Creating backup..."
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Use Python to safely replace ONLY acoustic.uz server block
echo "🔧 Updating acoustic.uz server block..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Find acoustic.uz server block (with SSL)
    # Pattern: server block that has "server_name acoustic.uz" and "listen 443 ssl"
    pattern = r'(server\s*\{[^}]*server_name\s+acoustic\.uz[^}]*listen\s+443\s+ssl[^}]*\{[^}]*\}[^}]*\})'
    
    # Clean acoustic.uz server block
    clean_block = '''server {
    server_name acoustic.uz www.acoustic.uz;

    # Logs
    access_log /var/log/nginx/acoustic.uz.access.log;
    error_log  /var/log/nginx/acoustic.uz.error.log;

    # Frontend proxy - MUST use 127.0.0.1:3000 (not localhost to avoid IPv6 issues)
    location / {
        proxy_pass http://127.0.0.1:3000;
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

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/acoustic.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}'''
    
    # Try to find and replace
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, clean_block, content, flags=re.DOTALL)
        print("   ✅ Replaced acoustic.uz server block")
    else:
        # If not found, try simpler pattern
        pattern2 = r'(server\s*\{[^}]*server_name\s+acoustic\.uz[^}]*\})'
        if re.search(pattern2, content, re.DOTALL):
            new_content = re.sub(pattern2, clean_block, content, flags=re.DOTALL)
            print("   ✅ Replaced acoustic.uz server block (simpler pattern)")
        else:
            # If still not found, append before HTTP redirect block
            redirect_pattern = r'(server\s*\{[^}]*listen\s+80[^}]*server_name\s+acoustic\.uz[^}]*\})'
            if re.search(redirect_pattern, content):
                new_content = re.sub(redirect_pattern, clean_block + '\n\n' + r'\1', content, flags=re.DOTALL)
                print("   ✅ Added acoustic.uz server block before HTTP redirect")
            else:
                print("   ⚠️  Could not find acoustic.uz server block, appending at end")
                new_content = content + '\n\n' + clean_block
    
    # Write back
    with open(config_file, 'w') as f:
        f.write(new_content)
    
    print("   ✅ Configuration updated")
    
except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    print(traceback.format_exc())
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Failed to update config"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

# Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo "📋 Restoring backup..."
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

# Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
if sudo systemctl reload nginx; then
    echo "   ✅ Nginx reloaded successfully"
else
    echo "   ❌ Failed to reload Nginx"
    exit 1
fi

# Verify
echo ""
echo "📋 Verifying configuration..."
echo "   acoustic.uz server block:"
grep -A 30 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 25 "location /" | head -30 | sed 's/^/      /' || echo "      Not found"

echo ""
echo "🧪 Testing frontend..."
sleep 2
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
if [ "$NGINX_HTTP" = "200" ]; then
    echo "   ✅ Frontend accessible via Nginx (HTTP $NGINX_HTTP)"
else
    echo "   ⚠️  Frontend not accessible (HTTP $NGINX_HTTP)"
    echo "   Recent errors:"
    sudo tail -3 /var/log/nginx/acoustic.uz.error.log 2>/dev/null | sed 's/^/      /' || true
fi

echo ""
echo "✅ Configuration update complete!"
echo ""
echo "📋 Note: Only acoustic.uz server block was modified."
echo "   Other domains (a.acoustic.uz, admin.acoustic.uz) were not affected."

