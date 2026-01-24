# Hearing Test Yangilash - Digits-in-Noise Metodologiyasi

## ✅ Qilingan O'zgarishlar

### 1. Adaptive Testing Algorithm
- **Fayl**: `apps/frontend/src/utils/adaptive-test.ts`
- **Xususiyatlar**:
  - SNR (Signal-to-Noise Ratio) asosida adaptive testing
  - Reversal detection va step size reduction
  - SRT-50 (Speech Reception Threshold) hisoblash
  - 8 reversal'gacha test davom etadi

### 2. Speech-in-Noise Audio Service
- **Fayl**: `apps/frontend/src/services/audio-sin-service.ts`
- **Xususiyatlar**:
  - Speech (digits) va noise mixing
  - SNR-based audio mixing
  - Left/Right/Both ear support
  - White noise generation

### 3. Digits-in-Noise Test Komponenti
- **Fayl**: `apps/frontend/src/components/hearing-test/digits-in-noise-test.tsx`
- **Xususiyatlar**:
  - 3 ta raqam (triplet) format
  - Replay funksiyasi
  - Progress indicator
  - Adaptive algorithm integratsiyasi

### 4. Hearing Test Flow Yangilash
- **Fayl**: `apps/frontend/src/components/hearing-test/hearing-test.tsx`
- **O'zgarishlar**:
  - `testMethod` state qo'shildi ('frequency' yoki 'digits-in-noise')
  - Digits-in-Noise test integratsiyasi
  - SRT-50 based score calculation

### 5. Backend Schema Yangilash
- **Fayl**: `apps/backend/prisma/schema.prisma`
- **Yangi maydonlar**:
  - `testMethod` (String?, default: 'frequency')
  - `leftEarSRT`, `rightEarSRT`, `overallSRT` (Float?)
  - `leftEarSINResults`, `rightEarSINResults` (Json?)
  - `leftEarResults`, `rightEarResults` endi optional

### 6. Backend Service Yangilash
- **Fayl**: `apps/backend/src/hearing-test/hearing-test.service.ts`
- **Yangi metodlar**:
  - `calculateScoreFromSRT()` - SRT-50 dan score hisoblash
  - Digits-in-Noise test natijalarini qo'llab-quvvatlash

### 7. Test Results Komponenti Yangilash
- **Fayl**: `apps/frontend/src/components/hearing-test/test-results.tsx`
- **O'zgarishlar**:
  - SRT-50 ko'rsatish (Digits-in-Noise test uchun)
  - Test metodini ko'rsatish

### 8. Schema Validation Yangilash
- **Fayl**: `packages/shared/src/schemas/content.ts`
- **Yangi maydonlar**:
  - `testMethod`, `leftEarSRT`, `rightEarSRT`, `overallSRT`
  - `leftEarSINResults`, `rightEarSINResults`
  - `leftEarResults`, `rightEarResults` endi optional

## 🔧 Keyingi Qadamlar

### 1. Database Migration

```bash
cd /root/acoustic.uz/apps/backend

# Migration faylini bajarish
psql -U acoustic_user -d acousticwebdb -f prisma/migrations/add_digits_in_noise_test/migration.sql
```

Yoki manual SQL:

```sql
ALTER TABLE "HearingTest" 
ADD COLUMN IF NOT EXISTS "testMethod" TEXT DEFAULT 'frequency',
ADD COLUMN IF NOT EXISTS "leftEarSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "rightEarSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "overallSRT" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "leftEarSINResults" JSONB,
ADD COLUMN IF NOT EXISTS "rightEarSINResults" JSONB;

ALTER TABLE "HearingTest" 
ALTER COLUMN "leftEarResults" DROP NOT NULL,
ALTER COLUMN "rightEarResults" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "HearingTest_testMethod_idx" ON "HearingTest"("testMethod");
```

### 2. Permission Muammosini Hal Qilish

```bash
cd /root/acoustic.uz

# Root sifatida bajarish
chown -R root:root packages/shared/dist apps/backend/dist apps/frontend/.next
rm -rf packages/shared/dist apps/backend/dist apps/frontend/.next
```

### 3. Build Qilish

```bash
cd /root/acoustic.uz

# Shared package
pnpm --filter @acoustic/shared build

# Backend
pnpm --filter @acoustic/backend build

# Frontend
pnpm --filter @acoustic/frontend build
```

### 4. Prisma Client Generate

```bash
cd /root/acoustic.uz/apps/backend
pnpm prisma generate
```

## 📝 Eslatmalar

1. **Audio Fayllar**: Hozircha placeholder audio ishlatilmoqda. Production'da professional audio fayllar kerak:
   - `/assets/audio/digits/uz/` - O'zbek tili raqamlar
   - `/assets/audio/digits/ru/` - Rus tili raqamlar

2. **Test Metodologiyasi**: 
   - Default: `digits-in-noise` (yangi metod)
   - Eski metod: `frequency` (hali ham mavjud)

3. **SRT-50**: 
   - Lower SRT = better hearing
   - Range: -10 to 15 dB
   - Score: 0-100 (inverted)

4. **Adaptive Algorithm**:
   - Initial SNR: 0 dB
   - Step size: 2 dB → 1 dB → 0.5 dB
   - Stop after 8 reversals

## 🎯 Test Qilish

1. Database migration bajarish
2. Build qilish
3. Frontend va backend'ni ishga tushirish
4. `https://acoustic.uz/services/hearing-test` sahifasini ochish
5. Test o'tkazish va natijalarni tekshirish
