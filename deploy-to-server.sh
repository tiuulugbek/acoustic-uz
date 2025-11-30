#!/bin/bash

# Deploy script for acoustic-uz frontend
# Usage: ./deploy-to-server.sh

SERVER_USER="user1"
SERVER_IP="192.168.20.66"
SERVER_PATH="/var/www/acousticuz"
LOCAL_STANDALONE="apps/frontend/.next/standalone"
LOCAL_PUBLIC="apps/frontend/public"

echo "🚀 Starting deployment to server..."
echo "📦 Server: ${SERVER_USER}@${SERVER_IP}"
echo "📁 Target: ${SERVER_PATH}"
echo ""

# Step 1: Check if standalone build exists
if [ ! -d "${LOCAL_STANDALONE}" ]; then
    echo "❌ Error: Standalone build not found at ${LOCAL_STANDALONE}"
    echo "   Please run: cd apps/frontend && NODE_ENV=production pnpm build"
    exit 1
fi

echo "✅ Standalone build found"
echo ""

# Step 2: Create backup on server (if exists)
echo "📋 Step 1: Creating backup on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    if [ -d ${SERVER_PATH} ]; then
        echo 'Creating backup...'
        sudo cp -r ${SERVER_PATH} ${SERVER_PATH}.backup.\$(date +%Y%m%d_%H%M%S) || true
        echo 'Backup created'
    else
        echo 'No existing deployment found'
    fi
"

# Step 3: Create directory structure on server
echo ""
echo "📋 Step 2: Creating directory structure on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    sudo mkdir -p ${SERVER_PATH}
    sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}
    echo 'Directory structure created'
"

# Step 4: Copy standalone build
echo ""
echo "📋 Step 3: Copying standalone build to server..."
echo "   This may take a few minutes..."
rsync -avz --progress \
    --exclude 'node_modules' \
    ${LOCAL_STANDALONE}/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# Step 5: Copy public folder
echo ""
echo "📋 Step 4: Copying public folder to server..."
rsync -avz --progress \
    ${LOCAL_PUBLIC}/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/apps/frontend/public/

# Step 6: Install dependencies on server
echo ""
echo "📋 Step 5: Installing dependencies on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/apps/frontend
    if [ -f package.json ]; then
        echo 'Installing production dependencies...'
        npm install --production || pnpm install --production || yarn install --production
        echo 'Dependencies installed'
    else
        echo '⚠️  Warning: package.json not found'
    fi
"

# Step 7: Set up environment variables
echo ""
echo "📋 Step 6: Setting up environment variables..."
echo "   Please check .env file on server manually"
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/apps/frontend
    if [ ! -f .env ]; then
        echo 'Creating .env file template...'
        cat > .env << 'EOF'
# Next.js Environment Variables
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=https://acoustic.uz
EOF
        echo '.env file created - please update with correct values'
    else
        echo '.env file already exists'
    fi
"

# Step 8: Create systemd service (optional)
echo ""
echo "📋 Step 7: Setup instructions..."
echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "   1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "   2. Go to deployment: cd ${SERVER_PATH}/apps/frontend"
echo "   3. Update .env file with correct values"
echo "   4. Start application:"
echo "      - Using PM2: pm2 start server.js --name acoustic-frontend"
echo "      - Using systemd: sudo systemctl start acoustic-frontend"
echo "      - Direct: node server.js"
echo ""
echo "🌐 Application will be available at: http://${SERVER_IP}:3000"
echo ""





