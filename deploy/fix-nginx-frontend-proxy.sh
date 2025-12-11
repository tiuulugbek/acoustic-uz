#!/bin/bash
# Fix Nginx frontend proxy configuration

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing Nginx frontend proxy configuration..."
echo ""

# Step 1: Backup
echo "📋 Step 1: Creating backup..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 2: Check current config
echo "📋 Step 2: Current proxy_pass configuration..."
grep -A 10 "server_name acoustic.uz" "$NGINX_CONFIG" | grep -A 5 "location /" | head -10 || true
echo ""

# Step 3: Fix proxy_pass
echo "📋 Step 3: Fixing proxy_pass..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Find acoustic.uz server block and fix proxy_pass
    # Replace localhost:3000 with 127.0.0.1:3000
    # Replace [::1]:3000 with 127.0.0.1:3000
    
    # Pattern to match proxy_pass in acoustic.uz server block
    # We need to be careful to only match within the acoustic.uz server block
    lines = content.split('\n')
    in_acoustic_server = False
    in_location = False
    modified = False
    
    new_lines = []
    for i, line in enumerate(lines):
        if 'server_name acoustic.uz' in line or 'server_name www.acoustic.uz' in line:
            in_acoustic_server = True
            new_lines.append(line)
        elif in_acoustic_server and line.strip().startswith('server {'):
            if i > 0 and 'server_name' not in lines[i-1]:
                in_acoustic_server = False
            new_lines.append(line)
        elif in_acoustic_server and line.strip().startswith('location /'):
            in_location = True
            new_lines.append(line)
        elif in_acoustic_server and in_location and 'proxy_pass' in line:
            # Fix proxy_pass
            if 'localhost:3000' in line or '[::1]:3000' in line:
                new_line = re.sub(r'http://(localhost|\[::1\]):3000', 'http://127.0.0.1:3000', line)
                new_lines.append(new_line)
                modified = True
                print(f"   Fixed line {i+1}: {line.strip()} -> {new_line.strip()}")
            else:
                new_lines.append(line)
        elif in_acoustic_server and line.strip() == '}':
            in_location = False
            if i > 0 and 'location' in lines[i-1]:
                in_acoustic_server = False
            new_lines.append(line)
        else:
            new_lines.append(line)
    
    if modified:
        with open(config_file, 'w') as f:
            f.write('\n'.join(new_lines))
        print("   ✅ Configuration updated")
        sys.exit(0)
    else:
        print("   ℹ️  No changes needed (proxy_pass already correct)")
        sys.exit(0)
        
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    # Step 4: Test Nginx config
    echo "📋 Step 4: Testing Nginx configuration..."
    if nginx -t 2>&1; then
        echo "   ✅ Nginx configuration is valid"
        echo ""
        
        # Step 5: Reload Nginx
        echo "📋 Step 5: Reloading Nginx..."
        systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
        echo "   ✅ Nginx reloaded"
        echo ""
        
        # Step 6: Verify
        echo "📋 Step 6: Verifying..."
        sleep 2
        NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://acoustic.uz/ 2>/dev/null || echo "000")
        if [ "$NGINX_HTTP" = "200" ]; then
            echo "   ✅ Website accessible via Nginx (HTTP $NGINX_HTTP)"
        else
            echo "   ⚠️  Website still not accessible (HTTP $NGINX_HTTP)"
            echo "   Check: pm2 logs acoustic-frontend"
        fi
    else
        echo "   ❌ Nginx configuration test failed"
        echo "   Restoring backup..."
        cp "$BACKUP_FILE" "$NGINX_CONFIG"
        echo "   ✅ Backup restored"
    fi
else
    echo "   ❌ Failed to update configuration"
fi

echo ""
echo "✅ Fix complete!"
