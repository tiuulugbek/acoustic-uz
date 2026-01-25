#!/bin/bash

# ============================================
# Migration Script Runner
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 PostgreSQL ID Migration Script${NC}"
echo ""

# 1. DATABASE_URL ni topish
if [ -f "$PROJECT_ROOT/apps/backend/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/apps/backend/.env" | grep -E '^DATABASE_URL=' | xargs)
fi

# 2. DATABASE_URL tekshirish
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL topilmadi, default qiymat ishlatilmoqda...${NC}"
    DATABASE_URL="postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb"
fi

echo -e "${GREEN}📊 Database:${NC} ${DATABASE_URL:0:60}..."
echo ""

# 3. Backup taklif qilish
echo -e "${YELLOW}⚠️  XAVFSIZLIK: Production'da migration'dan oldin backup oling!${NC}"
read -p "Backup olishni xohlaysizmi? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_FILE="$PROJECT_ROOT/backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${GREEN}💾 Backup yaratilmoqda: $BACKUP_FILE${NC}"
    
    # DATABASE_URL ni parse qilish
    DB_URL_FOR_PGDUMP=$(echo "$DATABASE_URL" | sed 's/%23/#/g')
    
    if pg_dump "$DB_URL_FOR_PGDUMP" > "$BACKUP_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Backup yaratildi: $BACKUP_FILE${NC}"
        echo ""
    else
        echo -e "${RED}❌ Backup yaratishda xatolik!${NC}"
        read -p "Davom etishni xohlaysizmi? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# 4. Migration variantini tanlash
echo ""
echo -e "${GREEN}Migration variantini tanlang:${NC}"
echo "  1) Variant A: Add numeric_id (RECOMMENDED - Zero downtime, minimal risk)"
echo "  2) Variant B: Replace id (HIGH RISK - Full replacement)"
echo "  3) Rollback Variant A (Remove numeric_id)"
read -p "Tanlov (1/2/3): " -n 1 -r
echo ""

case $REPLY in
    1)
        MIGRATION_FILE="$SCRIPT_DIR/migration-variant-a-add-numeric-id.sql"
        MIGRATION_NAME="Variant A (Add numeric_id)"
        ;;
    2)
        MIGRATION_FILE="$SCRIPT_DIR/migration-variant-b-replace-id.sql"
        MIGRATION_NAME="Variant B (Replace id)"
        echo -e "${RED}⚠️  E'TIBOR: Variant B yuqori risk! Production'da ishlatishdan oldin to'liq test qiling!${NC}"
        read -p "Davom etishni tasdiqlaysizmi? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo "Migration bekor qilindi."
            exit 0
        fi
        ;;
    3)
        MIGRATION_FILE="$SCRIPT_DIR/migration-variant-a-rollback.sql"
        MIGRATION_NAME="Rollback Variant A"
        ;;
    *)
        echo -e "${RED}❌ Noto'g'ri tanlov!${NC}"
        exit 1
        ;;
esac

# 5. Migration faylini tekshirish
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration fayl topilmadi: $MIGRATION_FILE${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}📄 Migration: $MIGRATION_NAME${NC}"
echo -e "${GREEN}📁 File: $MIGRATION_FILE${NC}"
echo ""

# 6. Database connection test
echo -e "${YELLOW}🔍 Database connection test...${NC}"
DB_URL_FOR_PSQL=$(echo "$DATABASE_URL" | sed 's/%23/#/g')

if PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p' | sed 's|%23|#|g') \
   psql "$DB_URL_FOR_PSQL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo "   Please check DATABASE_URL and PostgreSQL service status."
    exit 1
fi

# 7. Migration'ni ishga tushirish
echo ""
echo -e "${YELLOW}🚀 Migration ishga tushmoqda...${NC}"
echo ""

# DATABASE_URL ni psql uchun to'g'rilash
DB_URL_FOR_PSQL=$(echo "$DATABASE_URL" | sed 's/%23/#/g')

if PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p' | sed 's|%23|#|g') \
   psql "$DB_URL_FOR_PSQL" -f "$MIGRATION_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Migration muvaffaqiyatli yakunlandi!${NC}"
    echo ""
    echo -e "${GREEN}📋 Keyingi qadamlar:${NC}"
    echo "  1. Prisma schema'ni yangilang (scripts/prisma-schema-update-example.prisma)"
    echo "  2. npx prisma generate"
    echo "  3. API kodini yangilang (scripts/api-numeric-id-example.ts)"
    echo "  4. Frontend kodini yangilang"
else
    echo ""
    echo -e "${RED}❌ Migration xatolik bilan yakunlandi!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Yechim:${NC}"
    echo "  - Database log'larni tekshiring"
    echo "  - Agar backup olingan bo'lsa, rollback qiling"
    echo "  - Migration script'ni qayta ko'rib chiqing"
    exit 1
fi
