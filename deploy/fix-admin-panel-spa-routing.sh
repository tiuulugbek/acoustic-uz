#!/bin/bash
# Fix admin panel SPA routing in Nginx

set -e

NGINX_CONFIG="/etc/nginx/sites-available/acoustic-uz.conf"

echo "🔧 Fixing admin panel SPA routing..."
echo ""

# Step 1: Backup
echo "📋 Step 1: Creating backup..."
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 2: Check current config
echo "📋 Step 2: Current admin panel configuration..."
grep -A 30 "server_name admin.acoustic.uz" "$NGINX_CONFIG" | head -35 || true
echo ""

# Step 3: Fix SPA routing
echo "📋 Step 3: Fixing SPA routing..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

try:
    with open(config_file, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Find admin.acoustic.uz server block and fix location / block
    lines = content.split('\n')
    in_admin_server = False
    in_location_root = False
    modified = False
    
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Detect admin server block start
        if 'server_name admin.acoustic.uz' in line:
            in_admin_server = True
            new_lines.append(line)
            i += 1
            continue
        
        # Detect end of admin server block
        if in_admin_server and line.strip() == '}' and i > 0:
            # Check if this is closing the server block (not a location block)
            # Count opening braces before this line
            open_braces = 0
            for j in range(i):
                open_braces += lines[j].count('{') - lines[j].count('}')
            if open_braces == 1:  # Only server block is open
                in_admin_server = False
                in_location_root = False
        
        # Detect location / block in admin server
        if in_admin_server and 'location /' in line and '{' in line:
            in_location_root = True
            new_lines.append(line)
            i += 1
            continue
        
        # Inside location / block, replace try_files if needed
        if in_admin_server and in_location_root:
            if 'try_files' in line:
                # Replace with correct SPA routing
                if 'try_files $uri $uri/ /index.html;' not in line:
                    new_lines.append('        try_files $uri $uri/ /index.html;')
                    modified = True
                    print(f"   Fixed line {i+1}: {line.strip()} -> try_files $uri $uri/ /index.html;")
                else:
                    new_lines.append(line)
            elif line.strip() == '}' and in_location_root:
                # End of location block - check if try_files exists
                # Look back to see if try_files was already added
                has_try_files = False
                for j in range(len(new_lines) - 1, -1, -1):
                    if 'try_files' in new_lines[j]:
                        has_try_files = True
                        break
                    if 'location /' in new_lines[j]:
                        break
                
                if not has_try_files:
                    new_lines.append('        try_files $uri $uri/ /index.html;')
                    modified = True
                    print(f"   Added try_files before closing location block at line {i+1}")
                
                new_lines.append(line)
                in_location_root = False
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
        
        i += 1
    
    if modified:
        with open(config_file, 'w') as f:
            f.write('\n'.join(new_lines))
        print("   ✅ Configuration updated")
        sys.exit(0)
    else:
        print("   ℹ️  No changes needed (SPA routing already correct)")
        sys.exit(0)
        
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
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
        echo "📋 Step 6: Verifying admin panel..."
        sleep 2
        
        # Test root
        ADMIN_ROOT=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/ 2>/dev/null || echo "000")
        if [ "$ADMIN_ROOT" = "200" ]; then
            echo "   ✅ Admin panel root accessible (HTTP $ADMIN_ROOT)"
        else
            echo "   ⚠️  Admin panel root not accessible (HTTP $ADMIN_ROOT)"
        fi
        
        # Test login
        ADMIN_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" https://admin.acoustic.uz/login 2>/dev/null || echo "000")
        if [ "$ADMIN_LOGIN" = "200" ]; then
            echo "   ✅ Admin panel login accessible (HTTP $ADMIN_LOGIN)"
        else
            echo "   ⚠️  Admin panel login not accessible (HTTP $ADMIN_LOGIN)"
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
echo ""
echo "📋 Admin panel URLs:"
echo "  - Root: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"
echo ""
echo "💡 If still not working:"
echo "  1. Check Nginx logs: tail -f /var/log/nginx/admin.acoustic.uz.error.log"
echo "  2. Verify files exist: ls -la /var/www/admin.acoustic.uz/"
echo "  3. Check index.html: cat /var/www/admin.acoustic.uz/index.html | head -5"

