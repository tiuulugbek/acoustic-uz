#!/bin/bash

# Database restore scriptini parol muammosini hal qilish

set -e

cd /var/www/news.acoustic.uz

echo "🗄️ Database restore qilish (parol muammosini hal qilish)..."

# 1. Dump faylini topish
echo "📋 Dump faylini topish..."
DUMP_FILE=$(ls -t acoustic-dump-*.sql 2>/dev/null | head -1)

if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Dump fayli topilmadi!"
    ls -lh acoustic-dump-*.sql 2>/dev/null || echo "   Hech qanday dump fayli topilmadi!"
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

# PostgreSQL URL ni parse qilish (to'g'ri format)
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*@[^:]*:\([^/]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

# Agar parol bo'sh bo'lsa, qo'lda so'rash
if [ -z "$DB_PASS" ]; then
    echo "⚠️ Parol .env dan topilmadi!"
    read -sp "Database parolini kiriting: " DB_PASS
    echo ""
fi

if [ -z "$DB_NAME" ]; then
    DB_NAME="acoustic"
fi
if [ -z "$DB_USER" ]; then
    DB_USER="acoustic"
fi
if [ -z "$DB_HOST" ]; then
    DB_HOST="localhost"
fi
if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
fi

echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"

# 3. Database ulanishini test qilish
echo ""
echo "🧪 Database ulanishini test qilish..."
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
    echo "✅ Database ulanish muvaffaqiyatli!"
else
    echo "❌ Database ulanish xatosi!"
    echo ""
    echo "💡 Qo'shimcha tekshirish:"
    echo "   1. Parolni to'g'ri kiriting:"
    read -sp "   Database parol: " DB_PASS
    echo ""
    
    # Qayta test qilish
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
        echo "✅ Database ulanish muvaffaqiyatli!"
    else
        echo "❌ Hali ham ulanish xatosi!"
        echo ""
        echo "💡 PostgreSQL parolini o'zgartirish:"
        echo "   sudo -u postgres psql"
        echo "   ALTER USER acoustic WITH PASSWORD 'yangi_parol';"
        exit 1
    fi
fi

# 4. Mavjud bazani backup qilish
echo ""
echo "📦 Mavjud bazani backup qilish..."
BACKUP_FILE="acoustic-backup-$(date +%Y%m%d-%H%M%S).sql"
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
    echo "📦 Backup yaratilmoqda..."
    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-acl -f "$BACKUP_FILE" 2>/dev/null || {
        echo "⚠️ Backup xatosi, lekin davom etamiz..."
    }
    if [ -f "$BACKUP_FILE" ]; then
        echo "✅ Backup yaratildi: $BACKUP_FILE"
    fi
fi

# 5. Database ni restore qilish
echo ""
echo "🔄 Database ni restore qilish..."
echo "⚠️ Bu mavjud ma'lumotlarni o'chirib tashlaydi!"
read -p "Davom etasizmi? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Bekor qilindi!"
    exit 1
fi

echo "📦 Database restore qilinmoqda..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE" || {
    echo "❌ Database restore xatosi!"
    echo ""
    echo "💡 Muammo bo'lishi mumkin:"
    echo "   - Dump fayli buzilgan"
    echo "   - Database permissions muammosi"
    echo "   - PostgreSQL versiyasi mos kelmaydi"
    exit 1
}

echo "✅ Database restore qilindi!"

# 6. Prisma client ni yangilash
echo ""
echo "🔄 Prisma client ni yangilash..."
cd apps/backend
npx prisma@5.22.0 generate --schema=../../prisma/schema.prisma || {
    echo "⚠️ Prisma generate xatosi!"
}

# 7. Backend ni restart qilish
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


