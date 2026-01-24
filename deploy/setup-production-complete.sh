#!/bin/bash
# Hammasini production'ga o'tkazish va ishlaydigan qilish

set -e

echo "🚀 Production'ga to'liq o'tkazish..."
echo ""

DEV_DIR="/root/acoustic.uz"
PROD_DIR="/var/www/acoustic.uz"
BACKUP_DIR="/var/www/acoustic.uz.backup.$(date +%Y%m%d_%H%M%S)"

# 1. Backup
echo "💾 1. Production backup..."
if [ -d "$PROD_DIR" ]; then
    echo "   Backup: $BACKUP_DIR"
    mkdir -p "$(dirname $BACKUP_DIR)"
    cp -r "$PROD_DIR" "$BACKUP_DIR" 2>/dev/null || true
    echo "   ✅ Backup yaratildi"
fi
echo ""

# 2. Barcha processlarni to'xtatish
echo "🛑 2. Barcha processlarni to'xtatish..."
pm2 stop all 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
pkill -f "nest" 2>/dev/null || true
sleep 3
echo "   ✅ Processlar to'xtatildi"
echo ""

# 3. Portlarni tozalash
echo "🔍 3. Portlarni tozalash..."
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2
echo "   ✅ Portlar tozalandi"
echo ""

# 4. Kodlarni ko'chirish
echo "📦 4. Kodlarni ko'chirish..."
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
  --exclude='.cache' \
  --exclude='.turbo'

echo "   ✅ Kodlar ko'chirildi"
echo ""

# 5. Permission'lar
echo "🔐 5. Permission'larni to'g'rilash..."
chown -R acoustic:acoustic "$PROD_DIR" 2>/dev/null || chown -R nobody:nogroup "$PROD_DIR"
find "$PROD_DIR" -type d -exec chmod 755 {} \; 2>/dev/null || true
find "$PROD_DIR" -type f -exec chmod 644 {} \; 2>/dev/null || true
find "$PROD_DIR" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
echo "   ✅ Permission'lar to'g'rilandi"
echo ""

# 6. .env faylini saqlash
if [ -f "$PROD_DIR/.env" ]; then
    echo "📝 6. .env faylini saqlash..."
    cp "$PROD_DIR/.env" "$PROD_DIR/.env.backup" 2>/dev/null || true
    chown acoustic:acoustic "$PROD_DIR/.env" 2>/dev/null || chown nobody:nogroup "$PROD_DIR/.env"
    chmod 600 "$PROD_DIR/.env" 2>/dev/null || true
    echo "   ✅ .env saqlandi"
else
    if [ -f "$PROD_DIR/.env.example" ]; then
        cp "$PROD_DIR/.env.example" "$PROD_DIR/.env"
        chown acoustic:acoustic "$PROD_DIR/.env" 2>/dev/null || chown nobody:nogroup "$PROD_DIR/.env"
        chmod 600 "$PROD_DIR/.env" 2>/dev/null || true
        echo "   ✅ .env yaratildi"
    fi
fi
echo ""

# 7. Database muammosini tuzatish
echo "💾 7. Database muammosini tuzatish..."
if [ -f "/root/acoustic.uz/deploy/fix-database-auth.sh" ]; then
    bash /root/acoustic.uz/deploy/fix-database-auth.sh 2>/dev/null || true
fi
echo ""

echo "✅ Production'ga o'tkazish yakunlandi!"
echo ""
echo "📋 Keyingi qadamlarni acoustic user sifatida bajarish kerak:"
echo ""
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
echo "   ./deploy/build-all.sh"
echo ""
echo "📁 Backup: $BACKUP_DIR"
