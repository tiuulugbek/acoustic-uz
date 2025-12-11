#!/bin/bash
# Fix admin panel Nginx configuration - Safe version

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
    else
        echo "   ❌ index.html NOT found!"
        exit 1
    fi
else
    echo "   ❌ Admin directory NOT found: $ADMIN_DIR"
    exit 1
fi
echo ""

# Step 2: Check if admin block already exists
echo "📋 Step 2: Checking current Nginx configuration..."
if grep -q "server_name admin.acoustic.uz" "$NGINX_CONFIG" 2>/dev/null; then
    echo "   ✅ Admin server block found"
    echo "   Checking if it's correct..."
    
    # Check if root is correct
    if grep -A 10 "server_name admin.acoustic.uz" "$NGINX_CONFIG" | grep -q "root /var/www/admin.acoustic.uz"; then
        echo "   ✅ Root path is correct"
    else
        echo "   ⚠️  Root path might be incorrect"
    fi
    
    # Check if try_files exists
    if grep -A 20 "server_name admin.acoustic.uz" "$NGINX_CONFIG" | grep -q "try_files.*index.html"; then
        echo "   ✅ SPA routing configured"
    else
        echo "   ⚠️  SPA routing might be missing"
    fi
else
    echo "   ❌ Admin server block NOT found!"
    echo "   We'll add it manually..."
    echo ""
    echo "   Please add the following server block to $NGINX_CONFIG:"
    echo ""
    cat << 'EOF'
# Admin Panel (admin.acoustic.uz)
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
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
    }
}

# Admin Panel HTTPS (admin.acoustic.uz)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.acoustic.uz;

    ssl_certificate /etc/letsencrypt/live/admin.acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.acoustic.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
    }
}

# HTTP to HTTPS redirect for admin
server {
    listen 80;
    listen [::]:80;
    server_name admin.acoustic.uz;
    return 301 https://admin.acoustic.uz$request_uri;
}
EOF
    echo ""
    echo "   After adding, run: nginx -t && systemctl reload nginx"
    exit 0
fi
echo ""

# Step 3: Verify Nginx config
echo "📋 Step 3: Verifying Nginx configuration..."
if nginx -t 2>&1; then
    echo "   ✅ Nginx configuration is valid"
else
    echo "   ❌ Nginx configuration test failed"
    echo ""
    echo "   💡 If you see errors, check the configuration file:"
    echo "      $NGINX_CONFIG"
    echo ""
    echo "   💡 To restore backup:"
    echo "      cp $NGINX_CONFIG.backup.* $NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 4: Reload Nginx
echo "📋 Step 4: Reloading Nginx..."
if nginx -t 2>&1; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    echo "   ✅ Nginx reloaded"
else
    echo "   ❌ Nginx configuration test failed"
    exit 1
fi
echo ""

# Step 5: Verify
echo "📋 Step 5: Verifying admin panel..."
sleep 3

ADMIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://admin.acoustic.uz/ 2>/dev/null || echo "000")
if [ "$ADMIN_HTTP" = "200" ] || [ "$ADMIN_HTTP" = "301" ]; then
    echo "   ✅ Admin panel HTTP accessible (HTTP $ADMIN_HTTP)"
else
    echo "   ⚠️  Admin panel HTTP not accessible (HTTP $ADMIN_HTTP)"
fi

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
echo ""
echo "📋 Admin panel URLs:"
echo "  - HTTP: http://admin.acoustic.uz/"
echo "  - HTTPS: https://admin.acoustic.uz/"
echo "  - Login: https://admin.acoustic.uz/login"

