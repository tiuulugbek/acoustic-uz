# Alternative Cover O'rnatish

## ✅ Bajarilgan ishlar

1. **Prisma Schema yangilandi:**
   - Service modeliga `alternativeCoverId` maydoni qo'shildi
   - Media modeliga `ServiceAlternativeCover` relation qo'shildi

2. **Migration yaratildi:**
   - `apps/backend/prisma/migrations/20260123201511_add_alternative_cover_to_service/migration.sql`

3. **Shared Schema yangilandi:**
   - `serviceSchema`'ga `alternativeCoverId` qo'shildi

4. **Backend Service yangilandi:**
   - `alternativeCover` include qilindi (vaqtincha comment qilingan)
   - `create` va `update` metodlarida `alternativeCoverId` qo'llab-quvvatlanadi

5. **Frontend yangilandi:**
   - Alternative cover birinchi navbatda ishlatiladi
   - Agar alternative cover bo'lmasa, regular cover ishlatiladi
   - Agar cover bo'lmasa, category image ishlatiladi (fallback)

6. **Build qilindi:**
   - ✅ Shared package build qilindi
   - ✅ Frontend build qilindi (123M)
   - ✅ Backend build qilindi (alternativeCover vaqtincha comment qilingan)

## 📋 Keyingi qadamlar

### 1. Migration qo'llash

```bash
cd apps/backend
pnpm prisma migrate deploy
pnpm prisma generate
```

### 2. Backend'da alternativeCover'ni qayta yoqish

`apps/backend/src/services/services.service.ts` faylida comment'larni olib tashlash:

```typescript
// O'zgartirish:
include: { cover: true, category: true }, // alternativeCover will be available after migration

// Qayta:
include: { cover: true, alternativeCover: true, category: true },
```

Va:

```typescript
// O'zgartirish:
// alternativeCoverId: validated.alternativeCoverId ?? undefined, // Will be available after migration

// Qayta:
alternativeCoverId: validated.alternativeCoverId ?? undefined,
```

Va:

```typescript
// O'zgartirish:
// ...(validated.alternativeCoverId !== undefined ? { alternativeCoverId: validated.alternativeCoverId } : {}), // Will be available after migration

// Qayta:
...(validated.alternativeCoverId !== undefined ? { alternativeCoverId: validated.alternativeCoverId } : {}),
```

Keyin:

```bash
cd apps/backend
pnpm build
```

### 3. Build fayllarni ko'chirish

```bash
# Frontend
rsync -av --delete apps/frontend/.next/ /var/www/acoustic.uz/apps/frontend/.next/

# Backend
rsync -av --delete apps/backend/dist/ /var/www/acoustic.uz/apps/backend/dist/
```

## 🎯 Qanday ishlaydi

1. **Admin panelda:**
   - Service'ga alternativ rasm yuklash mumkin (`alternativeCoverId`)
   - Bu rasm asosiy rasm (`cover`) o'rniga ishlatiladi

2. **Frontend'da:**
   - Avval alternativ rasm (`alternativeCover`) ko'rsatiladi
   - Agar alternativ rasm bo'lmasa, asosiy rasm (`cover`) ishlatiladi
   - Agar rasm bo'lmasa, category rasm ishlatiladi (fallback)

3. **Rasm variantlari:**
   - `formats.large.url` (eng tiniqroq)
   - `formats.medium.url` (o'rtacha)
   - `url` (original)

## 📝 Eslatma

Migration qo'llashdan oldin backend build xatolik beradi, chunki Prisma Client'da `alternativeCover` relation mavjud emas. Migration qo'llagandan keyin Prisma Client yangilanadi va build muvaffaqiyatli bo'ladi.
