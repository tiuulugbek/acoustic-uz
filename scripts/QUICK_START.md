# 🚀 Migration Quick Start Guide

## Migration'ni ishga tushirish

### Variant 1: To'g'ridan-to'g'ri (Simple)

```bash
cd /root/acoustic.uz

# 1. Backup oling (majburiy!)
pg_dump -h localhost -U acoustic_user -d acousticwebdb > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Migration'ni ishga tushiring
PGPASSWORD='Acoustic##4114' psql -h localhost -U acoustic_user -d acousticwebdb -f scripts/migration-variant-a-add-numeric-id.sql
```

### Variant 2: Interaktiv Runner (Recommended)

```bash
cd /root/acoustic.uz
bash scripts/run-migration.sh
```

Bu script:
- ✅ Backup taklif qiladi
- ✅ Database connection test qiladi
- ✅ Migration variantini tanlash imkonini beradi
- ✅ Xatoliklarni tekshiradi

---

## ⚠️ XAVFSIZLIK

**Production'da migration'dan oldin backup oling!**

```bash
# Backup
pg_dump -h localhost -U acoustic_user -d acousticwebdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup hajmini tekshiring
ls -lh backup_*.sql
```

---

## 📋 Migration Variantlari

### Variant A: Add numeric_id (✅ RECOMMENDED)
- **File**: `scripts/migration-variant-a-add-numeric-id.sql`
- **Risk**: LOW
- **Downtime**: 0 daqiqa
- **Afzallik**: Eski ID saqlanadi, osongina rollback

### Variant B: Replace id (⚠️ HIGH RISK)
- **File**: `scripts/migration-variant-b-replace-id.sql`
- **Risk**: HIGH
- **Downtime**: 1-2 soat
- **Eslatma**: Production'da ishlatishdan oldin to'liq test qiling!

### Rollback
- **File**: `scripts/migration-variant-a-rollback.sql`
- **Eslatma**: Faqat Variant A uchun

---

## ✅ Migration'dan keyin

1. **Prisma Schema yangilang**:
   ```bash
   # Schema'ni ko'ring
   cat scripts/prisma-schema-update-example.prisma
   
   # Prisma generate
   cd /root/acoustic.uz
   npx prisma generate
   ```

2. **API kodini yangilang**:
   - Misol: `scripts/api-numeric-id-example.ts`

3. **Frontend kodini yangilang**:
   - API'dan `numeric_id` olish
   - URL'larda `numeric_id` ishlatish

---

## 🔍 Verification

Migration'dan keyin tekshirish:

```sql
-- Barcha jadvallarda numeric_id mavjudligini tekshirish
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND column_name = 'numeric_id'
ORDER BY table_name;

-- Unique constraint mavjudligini tekshirish
SELECT 
    table_name,
    constraint_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND constraint_name LIKE '%_numeric_id_unique'
ORDER BY table_name;
```

---

## 🆘 Muammo hal qilish

### Xatolik: "connection to server failed"
```bash
# PostgreSQL ishlamoqdamimi?
sudo systemctl status postgresql

# PostgreSQL'ni ishga tushiring
sudo systemctl start postgresql
```

### Xatolik: "role does not exist"
```bash
# To'g'ri user bilan ulanish
PGPASSWORD='Acoustic##4114' psql -h localhost -U acoustic_user -d acousticwebdb
```

### Xatolik: "permission denied"
```bash
# User ruxsatlarini tekshiring
sudo -u postgres psql -c "\du acoustic_user"
```

---

## 📞 Qo'shimcha ma'lumot

- **To'liq tahlil**: `scripts/migration-analysis-report.md`
- **API misollari**: `scripts/api-numeric-id-example.ts`
- **Prisma schema**: `scripts/prisma-schema-update-example.prisma`
