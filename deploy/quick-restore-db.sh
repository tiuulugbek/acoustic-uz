#!/bin/bash

# Tezkor database restore (eng so'nggi dump faylini avtomatik topadi)

set -e

cd /var/www/news.acoustic.uz

echo "🗄️ Database restore qilish (tezkor rejim)..."

# 1. Eng so'nggi dump faylini topish
echo "📋 Dump faylini topish..."
DUMP_FILE=$(ls -t acoustic-dump-*.sql 2>/dev/null | head -1)

if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Dump fayli topilmadi!"
    echo "📋 Mavjud fayllar:"
    ls -lh acoustic-dump-*.sql 2>/dev/null || echo "   Hech qanday dump fayli topilmadi!"
    echo ""
    echo "💡 Local kompyuterdan dump faylini yuborish kerak:"
    echo "   ./deploy/migrate-database.sh"
    exit 1
fi

echo "✅ Dump fayli topildi: $DUMP_FILE"
ls -lh "$DUMP_FILE"

# 2. Database ma'lumotlarini .env dan olish
echo ""
echo "📋 Database ma'lumotlarini olish..."
if [ ! -f ".env" ]; then
    echo "❌ .env fayli topilmadi!"
    exit 1
fi

DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL topilmadi!"
    exit 1
fi

# PostgreSQL URL ni parse qilish
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*@[^:]*:\([^/]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

if [ -z "$DB_NAME" ]; then
    echo "❌ Database nomi topilmadi!"
    exit 1
fi

echo "   Database: $DB_NAME"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-5432}"
echo "   User: $DB_USER"

# 3. Mavjud bazani backup qilish
echo ""
echo "📦 Mavjud bazani backup qilish..."
BACKUP_FILE="acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
if PGPASSWORD="$DB_PASS" psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
    echo "📦 Backup yaratilmoqda..."
    PGPASSWORD="$DB_PASS" pg_dump -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-acl -f "$BACKUP_FILE" 2>/dev/null || {
        echo "⚠️ Backup xatosi, lekin davom etamiz..."
    }
    if [ -f "$BACKUP_FILE" ]; then
        echo "✅ Backup yaratildi: $BACKUP_FILE"
    fi
else
    echo "⚠️ Database mavjud emas yoki ulanish xatosi!"
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
PGPASSWORD="$DB_PASS" psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE" || {
    echo "❌ Database restore xatosi!"
    echo "💡 Tekshirish:"
    echo "   - Database paroli to'g'rimi?"
    echo "   - Database mavjudmi?"
    echo "   - Dump fayli to'g'rimi?"
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
cd /var/www/news.acoustic.uz
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


