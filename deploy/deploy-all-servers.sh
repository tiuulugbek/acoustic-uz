#!/bin/bash
# Deploy to all configured servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/servers.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse server config
parse_server_config() {
    local line="$1"
    IFS='|' read -r name host dir frontend backend admin <<< "$line"
    echo "$name|$host|$dir|$frontend|$backend|$admin"
}

# Deploy to a single server
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

# Main deployment function
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🚀 Multi-Server Deployment${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Config file not found: $CONFIG_FILE${NC}"
        echo -e "${YELLOW}💡 Create servers.conf file with server configurations${NC}"
        exit 1
    fi
    
    # Read servers from config (skip comments and empty lines)
    servers=()
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        
        servers+=("$line")
    done < "$CONFIG_FILE"
    
    if [ ${#servers[@]} -eq 0 ]; then
        echo -e "${RED}❌ No servers configured in $CONFIG_FILE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📋 Found ${#servers[@]} server(s) to deploy:${NC}"
    for server in "${servers[@]}"; do
        IFS='|' read -r name host dir frontend backend admin <<< "$server"
        echo "   - $name ($host)"
    done
    
    echo ""
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 0
    fi
    
    # Deploy to each server
    failed_servers=()
    successful_servers=()
    
    for server in "${servers[@]}"; do
        IFS='|' read -r name host dir frontend backend admin <<< "$server"
        
        if deploy_to_server "$server"; then
            successful_servers+=("$name")
        else
            failed_servers+=("$name")
        fi
        
        # Small delay between servers
        sleep 2
    done
    
    # Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📊 Deployment Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ ${#successful_servers[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ Successful deployments (${#successful_servers[@]}):${NC}"
        for server in "${successful_servers[@]}"; do
            echo "   - $server"
        done
    fi
    
    if [ ${#failed_servers[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ Failed deployments (${#failed_servers[@]}):${NC}"
        for server in "${failed_servers[@]}"; do
            echo "   - $server"
        done
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ All deployments completed successfully!${NC}"
}

# Run main function
main

