#!/bin/bash
# Restart backend after migration

set -e

echo "🔄 Restarting backend after migration..."

# Restart backend
pm2 restart acoustic-backend

# Check status
echo "📋 Checking PM2 status..."
pm2 status

# Check logs
echo "📋 Recent backend logs:"
pm2 logs acoustic-backend --lines 20 --nostream

echo "✅ Backend restarted successfully!"

