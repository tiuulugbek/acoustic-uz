#!/bin/bash

# Backend deployment script
# Usage: ./deploy-backend.sh

SERVER_USER="user1"
SERVER_IP="192.168.20.66"
SERVER_PATH="/var/www/acousticuz"
LOCAL_BACKEND="apps/backend"

echo "🚀 Starting backend deployment..."
echo "📦 Server: ${SERVER_USER}@${SERVER_IP}"
echo "📁 Target: ${SERVER_PATH}/backend"
echo ""

# Step 1: Check if dist folder exists
if [ ! -d "${LOCAL_BACKEND}/dist" ]; then
    echo "❌ Error: Backend not built. Building now..."
    cd ${LOCAL_BACKEND}
    pnpm build || npm run build
    cd ../..
fi

echo "✅ Backend build found"
echo ""

# Step 2: Create directory structure on server
echo "📋 Step 1: Creating directory structure on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    sudo mkdir -p ${SERVER_PATH}/backend
    sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}/backend
    echo '✅ Directory created'
" || {
    echo "❌ Failed to connect. Please run manually:"
    echo "   ssh ${SERVER_USER}@${SERVER_IP} 'sudo mkdir -p ${SERVER_PATH}/backend && sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}/backend'"
    exit 1
}

# Step 3: Copy dist folder
echo ""
echo "📋 Step 2: Copying dist folder..."
rsync -avz --progress \
    --exclude 'node_modules' \
    ${LOCAL_BACKEND}/dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/dist/

# Step 4: Copy package.json (without workspace dependencies)
echo ""
echo "📋 Step 3: Copying package.json..."
# Create a server-compatible package.json
cat > /tmp/backend-package.json << 'PKGEOF'
{
  "name": "@acoustic/backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/main.js"
  },
  "dependencies": {
    "@nestjs/axios": "^3.1.3",
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.1.17",
    "@prisma/client": "^5.22.0",
    "axios": "^1.6.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "node-telegram-bot-api": "^0.64.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  }
}
PKGEOF

scp /tmp/backend-package.json ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/package.json

# Step 5: Copy prisma schema and migrations
echo ""
echo "📋 Step 4: Copying Prisma files..."
rsync -avz --progress \
    prisma/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/prisma/

# Step 6: Create .env file template
echo ""
echo "📋 Step 5: Creating .env file template..."
echo "⚠️  Please update .env file on server with correct database credentials"
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/backend
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# Database
DATABASE_URL=\"postgresql://user:password@localhost:5432/acoustic?schema=public\"

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key-change-this

# CORS
CORS_ORIGIN=http://192.168.20.66:3000

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# AmoCRM (optional)
AMOCRM_CLIENT_ID=
AMOCRM_CLIENT_SECRET=
AMOCRM_REDIRECT_URI=
AMOCRM_SUBDOMAIN=
EOF
        echo '✅ .env file created - PLEASE UPDATE WITH CORRECT VALUES'
    else
        echo '⚠️  .env file already exists'
    fi
"

# Step 7: Install dependencies
echo ""
echo "📋 Step 6: Installing dependencies on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/backend
    npm install --production || pnpm install --production
"

# Step 8: Generate Prisma Client
echo ""
echo "📋 Step 7: Generating Prisma Client..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH}/backend
    npx prisma generate --schema=./prisma/schema.prisma
"

echo ""
echo "✅ Backend deployment completed!"
echo ""
echo "📝 Next steps:"
echo "   1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "   2. Update .env file: cd ${SERVER_PATH}/backend && nano .env"
echo "   3. Run migrations: cd ${SERVER_PATH}/backend && npx prisma migrate deploy --schema=./prisma/schema.prisma"
echo "   4. Start backend: cd ${SERVER_PATH}/backend && node dist/main.js"
echo ""

