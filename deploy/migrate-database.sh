#!/bin/bash

# Local bazani serverga ko'chirish

set -e

echo "🗄️ Local bazani serverga ko'chirish..."

# 1. Local database dump olish
echo "📋 Local database dump olish..."
LOCAL_DB_NAME="acoustic"
LOCAL_DB_USER="acoustic"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-acoustic123}"
LOCAL_DB_HOST="${LOCAL_DB_HOST:-localhost}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"

DUMP_FILE="acoustic-dump-$(date +%Y%m%d-%H%M%S).sql"

echo "📦 Database dump yaratilmoqda..."
PGPASSWORD="$LOCAL_DB_PASSWORD" pg_dump -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" --clean --if-exists --no-owner --no-acl -f "$DUMP_FILE" || {
    echo "❌ Database dump xatosi!"
    exit 1
}

echo "✅ Database dump yaratildi: $DUMP_FILE"
ls -lh "$DUMP_FILE"

# 2. Serverga yuborish
echo ""
echo "📤 Serverga yuborish..."
read -p "Server IP yoki hostname: " SERVER_HOST
read -p "Server user (default: root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}
read -p "Server path (default: /var/www/news.acoustic.uz): " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-/var/www/news.acoustic.uz}

echo "📤 Faylni serverga ko'chirish..."
scp "$DUMP_FILE" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/" || {
    echo "❌ Serverga yuborish xatosi!"
    exit 1
}

echo "✅ Fayl serverga yuborildi!"

# 3. Serverda restore qilish
echo ""
echo "🔄 Serverda restore qilish..."
echo "Serverda quyidagi buyruqlarni bajaring:"
echo ""
echo "cd $SERVER_PATH"
echo "sudo -u postgres psql -d acoustic < $DUMP_FILE"
echo ""
echo "Yoki:"
echo "export PGPASSWORD='SERVER_DB_PASSWORD'"
echo "psql -h localhost -U acoustic -d acoustic < $DUMP_FILE"
echo ""
echo "⚠️ Eslatma: Serverda database parolini bilishingiz kerak!"

