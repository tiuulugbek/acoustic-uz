#!/bin/bash

# JWT Secrets generatsiya qilish scripti

echo "🔑 Generating JWT Secrets..."
echo ""

# JWT_ACCESS_SECRET
ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
echo "JWT_ACCESS_SECRET=$ACCESS_SECRET"
echo ""

# JWT_REFRESH_SECRET
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
echo "JWT_REFRESH_SECRET=$REFRESH_SECRET"
echo ""

echo "✅ Copy these values to your .env file"
echo ""
echo "Example .env entries:"
echo "JWT_ACCESS_SECRET=$ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$REFRESH_SECRET"

