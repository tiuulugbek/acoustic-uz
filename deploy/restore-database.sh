#!/bin/bash

# Serverda database restore qilish

set -e

cd /var/www/news.acoustic.uz

echo "🗄️ Database restore qilish..."

# 1. Dump faylini topish
echo "📋 Dump faylini topish..."
DUMP_FILE="${1:-acoustic-dump-*.sql}"

if [ ! -f "$DUMP_FILE" ] && [ -f acoustic-dump-*.sql ]; then
    DUMP_FILE=$(ls -t acoustic-dump-*.sql | head -1)
fi

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Dump fayli topilmadi!"
    echo "📋 Mavjud dump fayllar:"
    ls -lh acoustic-dump-*.sql 2>/dev/null || echo "   Hech qanday dump fayli topilmadi!"
    exit 1
fi

echo "✅ Dump fayli topildi: $DUMP_FILE"
ls -lh "$DUMP_FILE"

# 2. Database ma'lumotlarini olish
echo ""
echo "📋 Database ma'lumotlarini olish..."
if [ -f ".env" ]; then
    DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$DB_URL" ]; then
        echo "✅ DATABASE_URL topildi!"
        # PostgreSQL URL ni parse qilish
        # Format: postgresql://user:password@host:port/database
        DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
        DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
        DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DB_URL" | sed -n 's|.*@[^:]*:\([^/]*\)/.*|\1|p')
        DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
        
        echo "   Database: $DB_NAME"
        echo "   Host: $DB_HOST"
        echo "   Port: ${DB_PORT:-5432}"
        echo "   User: $DB_USER"
    else
        echo "⚠️ DATABASE_URL topilmadi!"
        read -p "Database nomi (default: acoustic): " DB_NAME
        DB_NAME=${DB_NAME:-acoustic}
        read -p "Database user (default: acoustic): " DB_USER
        DB_USER=${DB_USER:-acoustic}
        read -sp "Database parol: " DB_PASS
        echo ""
        DB_HOST="localhost"
        DB_PORT="5432"
    fi
else
    echo "⚠️ .env fayli topilmadi!"
    read -p "Database nomi (default: acoustic): " DB_NAME
    DB_NAME=${DB_NAME:-acoustic}
    read -p "Database user (default: acoustic): " DB_USER
    DB_USER=${DB_USER:-acoustic}
    read -sp "Database parol: " DB_PASS
    echo ""
    DB_HOST="localhost"
    DB_PORT="5432"
fi

# 3. Backup olish (agar mavjud bo'lsa)
echo ""
echo "📋 Mavjud bazani backup qilish..."
BACKUP_FILE="acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
    echo "📦 Mavjud bazani backup qilish..."
    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-acl -f "$BACKUP_FILE" || {
        echo "⚠️ Backup xatosi, lekin davom etamiz..."
    }
    if [ -f "$BACKUP_FILE" ]; then
        echo "✅ Backup yaratildi: $BACKUP_FILE"
    fi
fi

# 4. Database ni restore qilish
echo ""
echo "🔄 Database ni restore qilish..."
echo "⚠️ Bu mavjud ma'lumotlarni o'chirib tashlaydi!"
read -p "Davom etasizmi? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Bekor qilindi!"
    exit 1
fi

echo "📦 Database restore qilinmoqda..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE" || {
    echo "❌ Database restore xatosi!"
    exit 1
}

echo "✅ Database restore qilindi!"

# 5. Prisma client ni yangilash
echo ""
echo "🔄 Prisma client ni yangilash..."
cd apps/backend
npx prisma@5.22.0 generate --schema=../../prisma/schema.prisma || {
    echo "⚠️ Prisma generate xatosi!"
}

# 6. Backend ni restart qilish
echo ""
echo "🔄 Backend ni restart qilish..."
pm2 restart acoustic-backend || {
    echo "⚠️ Backend restart xatosi!"
}

echo ""
echo "✅ Database restore yakunlandi!"
echo ""
echo "📋 Xulosa:"
echo "- Dump fayl: $DUMP_FILE"
if [ -f "$BACKUP_FILE" ]; then
    echo "- Backup fayl: $BACKUP_FILE"
fi
echo "- Database: $DB_NAME"
echo ""
echo "💡 Backend restart qilindi va yangi ma'lumotlar bilan ishlayapti!"


