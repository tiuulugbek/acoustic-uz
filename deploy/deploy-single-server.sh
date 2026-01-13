#!/bin/bash
# Deploy to a single server by name

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/servers.conf"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <server_name>${NC}"
    echo ""
    echo "Available servers:"
    grep -v "^#" "$CONFIG_FILE" | grep -v "^$" | while IFS='|' read -r name host dir frontend backend admin; do
        echo "  - $name ($host)"
    done
    exit 1
fi

SERVER_NAME="$1"

# Find server config
SERVER_CONFIG=$(grep -v "^#" "$CONFIG_FILE" | grep -v "^$" | grep "^$SERVER_NAME|" || echo "")

if [ -z "$SERVER_CONFIG" ]; then
    echo -e "${RED}❌ Server '$SERVER_NAME' not found in $CONFIG_FILE${NC}"
    exit 1
fi

# Extract deploy_to_server function from deploy-all-servers.sh
deploy_to_server() {
    local server_config="$1"
    IFS='|' read -r name host dir frontend backend admin <<< "$server_config"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🚀 Deploying to: ${GREEN}$name${NC} ($host)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check SSH connection
    echo -e "${YELLOW}📡 Checking SSH connection...${NC}"
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes root@$host "echo 'Connected'" 2>/dev/null; then
        echo -e "${RED}❌ Cannot connect to $host via SSH${NC}"
        echo -e "${YELLOW}💡 Make sure SSH key is set up: ssh-copy-id root@$host${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ SSH connection OK${NC}"
    
    # Run deployment on remote server
    echo -e "${YELLOW}📥 Running deployment on remote server...${NC}"
    
    ssh root@$host bash <<EOF
set -e

PROJECT_DIR="$dir"
cd "\$PROJECT_DIR" || exit 1

echo "📋 Current directory: \$(pwd)"
echo "📋 Git status:"
git status --short || echo "⚠️  Git status failed"

echo ""
echo "📥 Pulling latest code..."
git pull origin main || {
    echo "⚠️  Git pull failed, trying with reset..."
    git fetch origin main
    git reset --hard origin/main
}

echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install

echo ""
echo "🏗️  Building shared package..."
pnpm --filter @acoustic/shared build || {
    echo "❌ Shared build failed"
    exit 1
}

echo ""
echo "🏗️  Building backend..."
cd apps/backend
pnpm build || {
    echo "❌ Backend build failed"
    exit 1
}
cd "\$PROJECT_DIR"

echo ""
echo "🏗️  Building frontend..."
cd apps/frontend
pnpm build || {
    echo "❌ Frontend build failed"
    exit 1
}
cd "\$PROJECT_DIR"

echo ""
echo "🏗️  Building admin panel..."
cd apps/admin
pnpm build || {
    echo "❌ Admin build failed"
    exit 1
}
cd "\$PROJECT_DIR"

echo ""
echo "🔄 Restarting PM2 processes..."
pm2 restart all || {
    echo "⚠️  PM2 restart failed, trying start..."
    pm2 start ecosystem.config.js || pm2 start deploy/ecosystem.config.js
}

echo ""
echo "📋 PM2 status:"
pm2 list

echo ""
echo "✅ Deployment complete on $host"
EOF

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Successfully deployed to $name ($host)${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ Deployment failed for $name ($host)${NC}"
        return 1
    fi
}

deploy_to_server "$SERVER_CONFIG"

