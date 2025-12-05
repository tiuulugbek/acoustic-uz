#!/bin/bash

# Manually fix Nginx config for backend API
# Usage: ./fix-nginx-config-manually.sh

set -e

echo "🔧 Manually fixing Nginx config..."
echo ""

CONFIG_FILE="/etc/nginx/sites-available/acoustic-uz.conf"

# 1. Backup
echo "📋 Step 1: Backing up config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
echo "  ✅ Backup created"
echo ""

# 2. Find and fix a.acoustic.uz server block
echo "📋 Step 2: Fixing a.acoustic.uz server block..."

# Create a temporary file with the correct config
TEMP_CONFIG=$(mktemp)

# Copy everything before a.acoustic.uz server block
sed -n '1,/server_name a.acoustic.uz/p' "$CONFIG_FILE" | head -n -1 > "$TEMP_CONFIG"

# Add the correct a.acoustic.uz server block
cat >> "$TEMP_CONFIG" << 'EOF'
# Acoustic.uz - Backend API (a.acoustic.uz)
server {
    server_name a.acoustic.uz;

    # Logs
    access_log /var/log/nginx/a.acoustic.uz.access.log;
    error_log /var/log/nginx/a.acoustic.uz.error.log;

    client_max_body_size 50M;
    client_body_timeout 60s;

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001/api;
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

    # Uploads static files
    location /uploads {
        alias /var/www/acoustic.uz/apps/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Max-Age 3600 always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Swagger docs
    location /api/docs {
        proxy_pass http://localhost:3001/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/a.acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/a.acoustic.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
EOF

# Find where a.acoustic.uz server block ends and copy the rest
# This is tricky, so we'll use a different approach
# Let's just replace the problematic section

# Better approach: use Python or a more robust method
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/acoustic-uz.conf"

with open(config_file, 'r') as f:
    content = f.read()

# Find a.acoustic.uz server block
pattern = r'(# Acoustic\.uz - Backend API \(a\.acoustic\.uz\).*?listen 443 ssl http2;)'
match = re.search(pattern, content, re.DOTALL)

if match:
    # Replace with correct config
    replacement = '''# Acoustic.uz - Backend API (a.acoustic.uz)
server {
    server_name a.acoustic.uz;

    # Logs
    access_log /var/log/nginx/a.acoustic.uz.access.log;
    error_log /var/log/nginx/a.acoustic.uz.error.log;

    client_max_body_size 50M;
    client_body_timeout 60s;

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001/api;
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

    # Uploads static files
    location /uploads {
        alias /var/www/acoustic.uz/apps/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Max-Age 3600 always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Max-Age 3600 always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Swagger docs
    location /api/docs {
        proxy_pass http://localhost:3001/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/a.acoustic.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/a.acoustic.uz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}'''
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(config_file, 'w') as f:
        f.write(content)
    
    print("✅ Config fixed")
else:
    print("❌ Could not find a.acoustic.uz server block")
PYTHON_SCRIPT

echo ""

# 3. Test config
echo "📋 Step 3: Testing Nginx config..."
if nginx -t; then
    echo "  ✅ Config is valid"
else
    echo "  ❌ Config still has errors!"
    echo "  Restoring backup..."
    cp "$CONFIG_FILE.backup."* "$CONFIG_FILE" 2>/dev/null || true
    exit 1
fi
echo ""

# 4. Reload Nginx
echo "📋 Step 4: Reloading Nginx..."
systemctl reload nginx
echo "  ✅ Nginx reloaded"
echo ""

# 5. Test backend API
echo "📋 Step 5: Testing backend API..."
sleep 2
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://a.acoustic.uz/api || echo "000")
echo "  HTTPS /api: $API_CODE"

if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
    echo "  ✅ Backend API is responding"
else
    echo "  ⚠️  Backend API response: $API_CODE"
fi
echo ""

echo "✅ Fix complete!"

