#!/bin/bash
# Start Prisma Studio on server with SSH tunnel

set -e

cd /var/www/news.acoustic.uz

echo "🚀 Starting Prisma Studio..."
echo "📋 To access Prisma Studio, run this command on your local machine:"
echo ""
echo "ssh -L 5555:localhost:5555 root@your-server-ip"
echo ""
echo "Then open http://localhost:5555 in your browser"
echo ""
echo "Press Ctrl+C to stop Prisma Studio"
echo ""

# Start Prisma Studio
npx prisma studio --port 5555 --browser none

