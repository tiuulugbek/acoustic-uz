#!/bin/bash
# Migration va port muammosini tuzatish

set -e

echo "🔧 Migration va port muammosini tuzatish..."
echo ""

# 1. Barcha processlarni to'xtatish
echo "🛑 1. Barcha processlarni to'xtatish..."
pm2 stop all 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
sleep 3
echo "   ✅ Processlar to'xtatildi"
echo ""

# 2. Port 3001'ni tekshirish
echo "🔍 2. Port 3001'ni tekshirish..."
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3001 hali ham band, processlarni o'chirish..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "   ✅ Port 3001 bo'sh"
echo ""

# 3. Failed migration'ni tuzatish
echo "💾 3. Failed migration'ni tuzatish..."
sudo -u postgres psql -d acoustic <<EOF 2>/dev/null || true
-- Failed migration'ni o'chirish
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251126183947_add_tour3d_config_to_branch' 
AND finished_at IS NULL;
EOF
echo "   ✅ Failed migration o'chirildi"
echo ""

# 4. Migration'ni qayta qo'llash
echo "🔄 4. Migration'ni qayta qo'llash..."
cd /var/www/acoustic.uz
npx prisma@5.22.0 migrate resolve --applied 20251126183947_add_tour3d_config_to_branch --schema=./prisma/schema.prisma 2>/dev/null || true
echo "   ✅ Migration resolved"
echo ""

echo "✅ Migration va port muammosi tuzatildi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   cd /var/www/acoustic.uz"
echo "   npx prisma@5.22.0 migrate deploy --schema=./prisma/schema.prisma"
echo "   pm2 restart acoustic-backend"
echo "   pm2 logs acoustic-backend --lines 20"
