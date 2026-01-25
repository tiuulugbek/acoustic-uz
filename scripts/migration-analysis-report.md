# PostgreSQL ID Migration Analysis Report

## 📊 Database Schema Analysis

### Current State
- **Total Tables**: 34 jadval
- **ID Type**: `TEXT` (Prisma `cuid()` - harf+raqam kombinatsiyasi)
- **Foreign Keys**: 26 ta FK bog'lanish
- **Most Referenced Table**: `Media` (15 ta FK unga qarab)
- **Complex Tables**: 
  - `Post` (3 FK)
  - `Setting` (3 FK)
  - `Service` (2 FK)
  - `Product` (2 FK)

### Foreign Key Dependencies
```
FK to Media.id           → 15 jadval
FK to ProductCategory.id → 2 jadval
FK to ServiceCategory.id → 2 jadval
FK to Post.id            → 1 jadval
FK to Brand.id            → 1 jadval
FK to Product.id          → 1 jadval
FK to Role.id             → 1 jadval
FK to PostCategory.id     → 1 jadval
FK to Catalog.id          → 1 jadval
FK to Doctor.id           → 1 jadval
```

---

## 🎯 Migration Strategy Comparison

### Variant A: Add `numeric_id` (✅ **RECOMMENDED**)

#### Strategiya
- Eski `id` (text/cuid) **saqlanadi**
- Yangi `numeric_id` (bigserial) **qo'shiladi**
- API'da `numeric_id` ishlatiladi, ichkarida uuid qoladi

#### Afzalliklari ✅
1. **Minimal Risk** - eski ID saqlanadi, ma'lumot yo'qolmaydi
2. **Zero Downtime** - jadval struktura o'zgarmaydi, faqat yangi column qo'shiladi
3. **Easy Rollback** - `numeric_id` column'ni o'chirish mumkin
4. **Gradual Migration** - API'ni bosqichma-bosqich yangilash mumkin
5. **Backward Compatible** - eski kod ishlashda davom etadi

#### Kamchiliklari ⚠️
1. **Storage Overhead** - ikkita ID maydoni (minimal, ~8 bytes per row)
2. **Code Changes** - API'da `numeric_id` ishlatish uchun kod o'zgarishi kerak
3. **Mapping Logic** - UUID'ga convert qilish uchun mapping kerak (lekin bu minimal)

#### Migration Time
- **Estimated**: 5-10 daqiqa (barcha jadvallar uchun)
- **Downtime**: **0 daqiqa** (zero downtime)

#### Risk Level
- **LOW** ⭐⭐☆☆☆

---

### Variant B: Full Replacement (⚠️ **HIGH RISK**)

#### Strategiya
- Barcha FK'larni numeric ga ko'chirish
- Eski `id` o'rniga yangi numeric PK qilish
- Mapping table (old_id -> new_id) yaratish

#### Afzalliklari ✅
1. **Single ID Field** - bitta ID maydoni (storage tejash)
2. **Fully Numeric** - API uchun to'liq qulay

#### Kamchiliklari ❌
1. **YUQORI RISK** - ma'lumot yo'qolishi mumkin
2. **Uzoq Downtime** - minimal 1-2 soat (katta jadvallar uchun)
3. **Complex Migration** - 26 ta FK'ni yangilash kerak
4. **Mapping Table** - old_id -> new_id mapping kerak
5. **Complex Rollback** - qaytarish juda murakkab
6. **FK Update Complexity** - har bir FK column uchun mapping'dan new_id topish kerak

#### Migration Time
- **Estimated**: 1-2 soat (katta jadvallar uchun)
- **Downtime**: **1-2 soat** (yoki undan ko'p)

#### Risk Level
- **HIGH** ⭐⭐⭐⭐⭐

---

## 🏆 Recommendation: **Variant A**

### Asosiy sabablar:
1. **Production Safety** - minimal risk, ma'lumot yo'qolmaydi
2. **Zero Downtime** - production'da ishlamay qolmaydi
3. **Easy Rollback** - agar muammo bo'lsa, osongina qaytarish mumkin
4. **Gradual Migration** - API'ni bosqichma-bosqich yangilash mumkin

### Implementation Plan (Variant A):

#### Step 1: Database Migration
```bash
psql $DATABASE_URL -f scripts/migration-variant-a-add-numeric-id.sql
```

#### Step 2: Prisma Schema Update
```prisma
model Product {
  id        String   @id @default(cuid())
  numericId BigInt?  @unique @default(autoincrement()) @map("numeric_id")
  // ... qolgan maydonlar
}
```

#### Step 3: API Changes
- API endpoints'da `numeric_id` qabul qilish
- Ichkarida UUID'ga convert qilish (mapping table yoki JOIN)
- Yoki to'g'ridan-to'g'ri `numeric_id` bilan ishlash

#### Step 4: Frontend Changes
- API'dan `numeric_id` olish va ishlatish
- URL'larda `numeric_id` ishlatish (masalan: `/products/123`)

---

## 📝 Migration Scripts

### Variant A Script
- **File**: `scripts/migration-variant-a-add-numeric-id.sql`
- **Features**:
  - Safety checks (numeric_id mavjud emasligini tekshirish)
  - Transaction-based (rollback mumkin)
  - Automatic for all tables
  - Verification after migration

### Variant B Script
- **File**: `scripts/migration-variant-b-replace-id.sql`
- **Status**: ⚠️ **INCOMPLETE** - FK update qismi manual yoki alohida script kerak
- **Warning**: Production'da ishlatishdan oldin to'liq test qiling!

---

## 🔍 Verification Queries

### Check numeric_id after migration (Variant A):
```sql
-- Barcha jadvallarda numeric_id mavjudligini tekshirish
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
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

### Check data integrity:
```sql
-- Har bir jadvalda nechta row bor
SELECT 
    'Product' as table_name,
    COUNT(*) as total_rows,
    COUNT(numeric_id) as rows_with_numeric_id
FROM "Product"
UNION ALL
SELECT 'Media', COUNT(*), COUNT(numeric_id) FROM "Media"
-- ... boshqa jadvallar
ORDER BY table_name;
```

---

## 🚨 Risk Mitigation

### Before Migration:
1. **Full Backup** - `pg_dump` orqali backup oling
2. **Test Environment** - avval test DB'da sinab ko'ring
3. **Maintenance Window** - production'da maintenance window belgilang (Variant A uchun kerak emas)

### During Migration:
1. **Transaction** - barcha o'zgarishlar transaction ichida
2. **Verification** - har bir bosqichdan keyin tekshirish
3. **Monitoring** - application log'larni kuzatish

### After Migration:
1. **Data Verification** - ma'lumotlar to'g'riligini tekshirish
2. **Performance Check** - query performance'ni tekshirish
3. **Rollback Plan** - agar muammo bo'lsa, rollback rejasi

---

## 📊 Storage Impact

### Variant A:
- **Per Row**: +8 bytes (BIGINT)
- **Total (estimated)**: ~1-2 MB (34 jadval, har birida o'rtacha 1000 row bo'lsa)
- **Impact**: Minimal

### Variant B:
- **Storage Savings**: ~8 bytes per row (eski TEXT id o'rniga BIGINT)
- **Mapping Tables**: +~16 bytes per row (old_id TEXT + new_id BIGINT)
- **Net Impact**: Minimal yoki salbiy (mapping table overhead)

---

## ✅ Final Recommendation

**Variant A ni tanlash tavsiya etiladi** quyidagi sabablarga ko'ra:

1. ✅ **Production Safety** - minimal risk
2. ✅ **Zero Downtime** - ishlamay qolmaydi
3. ✅ **Easy Rollback** - osongina qaytarish mumkin
4. ✅ **Gradual Migration** - bosqichma-bosqich yangilash mumkin
5. ✅ **Backward Compatible** - eski kod ishlashda davom etadi

**Variant B** faqat quyidagi holatlarda tavsiya etiladi:
- Storage juda muhim bo'lsa (lekin bu hozirgi holatda emas)
- To'liq numeric ID mutlaqo zarur bo'lsa
- Downtime qabul qilinadigan bo'lsa
- To'liq test qilingan bo'lsa

---

## 📞 Next Steps

1. **Review** - bu report'ni ko'rib chiqing
2. **Test** - test DB'da Variant A'ni sinab ko'ring
3. **Backup** - production backup oling
4. **Schedule** - migration vaqtini belgilang (Variant A uchun istalgan vaqt)
5. **Execute** - migration script'ni ishga tushiring
6. **Verify** - ma'lumotlarni tekshiring
7. **Update Code** - API va Frontend kodini yangilang
