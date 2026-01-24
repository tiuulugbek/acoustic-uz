#!/bin/bash
# Hammasini production'ga ko'chirish va ishlaydigan qilish

set -e

echo "🚀 Production'ga to'liq ko'chirish va sozlash..."
echo ""

DEV_DIR="/root/acoustic.uz"
PROD_DIR="/var/www/acoustic.uz"
BACKUP_DIR="/var/www/acoustic.uz.backup.$(date +%Y%m%d_%H%M%S)"

# 1. Backup
echo "💾 1. Production backup qilish..."
if [ -d "$PROD_DIR" ]; then
    echo "   Backup: $BACKUP_DIR"
    mkdir -p "$(dirname $BACKUP_DIR)"
    cp -r "$PROD_DIR" "$BACKUP_DIR" 2>/dev/null || true
    echo "   ✅ Backup yaratildi"
fi
echo ""

# 2. Eski processlarni to'xtatish
echo "🛑 2. Eski processlarni to'xtatish..."
pkill -f "nest start --watch" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
sleep 2
echo "   ✅ Processlar to'xtatildi"
echo ""

# 3. Kodlarni ko'chirish
echo "📦 3. Kodlarni ko'chirish..."
rsync -av --delete \
  "$DEV_DIR/" \
  "$PROD_DIR/" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='backups' \
  --exclude='.cache'

echo "   ✅ Kodlar ko'chirildi"
echo ""

# 4. Permission'lar
echo "🔐 4. Permission'larni to'g'rilash..."
chown -R acoustic:acoustic "$PROD_DIR" 2>/dev/null || chown -R nobody:nogroup "$PROD_DIR"
find "$PROD_DIR" -type d -exec chmod 755 {} \;
find "$PROD_DIR" -type f -exec chmod 644 {} \;
find "$PROD_DIR" -name "*.sh" -exec chmod +x {} \;
echo "   ✅ Permission'lar to'g'rilandi"
echo ""

# 5. .env faylini saqlash (agar mavjud bo'lsa)
if [ -f "$PROD_DIR/.env" ]; then
    echo "📝 5. .env faylini saqlash..."
    cp "$PROD_DIR/.env" "$PROD_DIR/.env.backup" 2>/dev/null || true
    echo "   ✅ .env saqlandi"
else
    echo "📝 5. .env faylini yaratish..."
    if [ -f "$PROD_DIR/.env.example" ]; then
        cp "$PROD_DIR/.env.example" "$PROD_DIR/.env"
        chown acoustic:acoustic "$PROD_DIR/.env" 2>/dev/null || chown nobody:nogroup "$PROD_DIR/.env"
        chmod 600 "$PROD_DIR/.env"
        echo "   ✅ .env yaratildi"
    fi
fi
echo ""

# 6. Database muammosini tuzatish
echo "💾 6. Database muammosini tuzatish..."
if [ -f "/root/acoustic.uz/deploy/fix-database-auth.sh" ]; then
    bash /root/acoustic.uz/deploy/fix-database-auth.sh
fi
echo ""

echo "✅ Ko'chirish yakunlandi!"
echo ""
echo "📋 Keyingi qadamlarni acoustic user sifatida bajarish kerak:"
echo ""
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
echo ""
echo "   # 1. Shared package build"
echo "   pnpm --filter @acoustic/shared build"
echo ""
echo "   # 2. Prisma generate"
echo "   npx prisma@5.22.0 generate --schema=./prisma/schema.prisma"
echo ""
echo "   # 3. Migration qo'llash (agar kerak bo'lsa)"
echo "   npx prisma@5.22.0 migrate deploy --schema=./prisma/schema.prisma"
echo ""
echo "   # 4. Backend build"
echo "   cd apps/backend"
echo "   pnpm build"
echo ""
echo "   # 5. Frontend build (agar kerak bo'lsa)"
echo "   cd ../frontend"
echo "   pnpm build"
echo ""
echo "   # 6. Restart"
echo "   pm2 restart all"
echo ""
echo "📁 Backup: $BACKUP_DIR"
