#!/bin/bash

# Optimized deployment script - excludes node_modules and uses rsync with progress
# Usage: ./deploy-optimized.sh

SERVER_USER="user1"
SERVER_IP="192.168.20.66"
SERVER_PATH="/var/www/acousticuz"
LOCAL_STANDALONE="apps/frontend/.next/standalone/apps/frontend"
LOCAL_PUBLIC="apps/frontend/public"

echo "🚀 Starting optimized deployment..."
echo "📦 Server: ${SERVER_USER}@${SERVER_IP}"
echo "📁 Target: ${SERVER_PATH}"
echo ""

# Step 1: Create directory structure on server
echo "📋 Step 1: Creating directory structure on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    sudo mkdir -p ${SERVER_PATH}/apps/frontend
    sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}
    echo '✅ Directory created'
" || {
    echo "❌ Failed to connect to server. Please check SSH connection."
    exit 1
}

# Step 2: Copy standalone files (excluding node_modules)
echo ""
echo "📋 Step 2: Copying application files (this may take a few minutes)..."
echo "   Excluding node_modules to speed up transfer..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next/cache' \
    ${LOCAL_STANDALONE}/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/

# Step 3: Copy public folder
echo ""
echo "📋 Step 3: Copying public folder..."
rsync -avz --progress \
    ${LOCAL_PUBLIC}/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/public/

# Step 4: Copy .next folder (needed for static files)
echo ""
echo "📋 Step 4: Copying .next static files..."
rsync -avz --progress \
    --include '.next/static/**' \
    --include '.next/server/**' \
    --exclude '.next/cache/**' \
    apps/frontend/.next/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/.next/

# Step 5: Install dependencies on server
echo ""
echo "📋 Step 5: Installing dependencies on server..."
echo "   This will install node_modules on the server (faster than copying)..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/apps/frontend
    if [ -f package.json ]; then
        echo 'Installing dependencies...'
        # Try npm first, then pnpm, then yarn
        if command -v pnpm &> /dev/null; then
            pnpm install --production --frozen-lockfile
        elif command -v npm &> /dev/null; then
            npm install --production
        elif command -v yarn &> /dev/null; then
            yarn install --production
        else
            echo '⚠️  No package manager found. Please install npm/pnpm/yarn on server.'
        fi
        echo '✅ Dependencies installed'
    else
        echo '⚠️  Warning: package.json not found'
    fi
"

# Step 6: Create .env file template
echo ""
echo "📋 Step 6: Setting up environment..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/apps/frontend
    if [ ! -f .env.production ]; then
        cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=https://acoustic.uz
EOF
        echo '✅ .env.production created'
    fi
"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "   1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "   2. Go to: cd ${SERVER_PATH}/apps/frontend"
echo "   3. Update .env.production with correct values"
echo "   4. Start: node server.js"
echo ""





