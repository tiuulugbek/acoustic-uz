# Filiallar Sahifasi Sidebar Ma'lumotlari Boshqarish Qo'llanmasi

Bu qo'llanmada Filiallar sahifasidagi sidebar ma'lumotlarini qayerdan boshqarish mumkinligi ko'rsatilgan.

---

## 📍 FILIAL DETAIL SAHIFASI (`/branches/[slug]`)

### Sidebar'da ko'rsatiladigan ma'lumotlar:

#### 1. **Table of Contents (Mundarija)**
- **Qayerda:** `apps/frontend/src/app/branches/[slug]/page.tsx` (270-290 qatorlar)
- **Boshqarish:** Kod ichida yaratilgan
- **Qanday o'zgartirish:**
  ```typescript
  const tocSections = [
    { id: 'services', label: locale === 'ru' ? 'Услуги' : 'Xizmatlar' },
    { id: 'doctors', label: locale === 'ru' ? 'Врачи' : 'Shifokorlar' },
    ...(branch.tour3d_iframe ? [{ id: 'tour3d', label: locale === 'ru' ? '3D Тур' : '3D Tour' }] : []),
    { id: 'location', label: locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish' },
  ];
  ```
- **Eslatma:** Bu bo'lim avtomatik ravishda sahifadagi bo'limlarga bog'langan

---

#### 2. **Address (Manzil)**
- **Qayerda:** `apps/frontend/src/app/branches/[slug]/page.tsx` (292-301 qatorlar)
- **Boshqarish:** Admin Panel → Filiallar → Filialni tahrirlash → "Manzil (uz)" va "Manzil (ru)" maydonlari
- **Database:** `Branch.address_uz` va `Branch.address_ru`
- **Qanday o'zgartirish:**
  1. Admin panelga kiring (`http://localhost:3002`)
  2. "Filiallar" bo'limiga o'ting
  3. Filialni tanlang va "Tahrirlash" tugmasini bosing
  4. "Manzil (uz)" va "Manzil (ru)" maydonlarini o'zgartiring
  5. "Saqlash" tugmasini bosing

---

#### 3. **Phones (Telefonlar)**
- **Qayerda:** `apps/frontend/src/app/branches/[slug]/page.tsx` (303-330 qatorlar)
- **Boshqarish:** Admin Panel → Filiallar → Filialni tahrirlash → "Asosiy telefon" va "Qo'shimcha telefonlar" maydonlari
- **Database:** `Branch.phone` va `Branch.phones` (array)
- **Qanday o'zgartirish:**
  1. Admin panelga kiring
  2. "Filiallar" bo'limiga o'ting
  3. Filialni tanlang va "Tahrirlash" tugmasini bosing
  4. "Asosiy telefon" maydonini o'zgartiring
  5. "Qo'shimcha telefonlar" maydoniga har bir telefonni alohida qatorga yozing
  6. "Saqlash" tugmasini bosing

---

#### 4. **Navigation Links (Navigatsiya havolalari)**
- **Qayerda:** `apps/frontend/src/app/branches/[slug]/page.tsx` (332-363 qatorlar)
- **Boshqarish:** Kod ichida avtomatik yaratiladi
- **Qanday ishlaydi:**
  - Yandex Navigator: `branch.latitude` va `branch.longitude` dan yaratiladi
  - Google Navigator: `branch.latitude` va `branch.longitude` dan yaratiladi
- **Qanday o'zgartirish:**
  - Agar `latitude` va `longitude` koordinatalarini o'zgartirmoqchi bo'lsangiz:
    1. Admin Panel → Filiallar → Filialni tahrirlash
    2. "Kenglik (Latitude)" va "Uzunlik (Longitude)" maydonlarini o'zgartiring
    3. "Saqlash" tugmasini bosing
  - Agar navigatsiya linklarini o'zgartirmoqchi bo'lsangiz:
    - `apps/frontend/src/app/branches/[slug]/page.tsx` faylida 88-94 qatorlarni o'zgartiring

---

#### 5. **Working Hours (Ish vaqti)**
- **Qayerda:** `apps/frontend/src/app/branches/[slug]/page.tsx` (365-384 qatorlar)
- **Boshqarish:** **Hozircha hardcoded** kod ichida
- **Qanday o'zgartirish:**
  ```typescript
  <div className="space-y-1 text-sm text-muted-foreground">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-brand-primary" />
      <span suppressHydrationWarning>
        {locale === 'ru' ? 'Понедельник - Пятница' : 'Dushanba - Juma'}: 09:00-20:00
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-brand-primary" />
      <span suppressHydrationWarning>
        {locale === 'ru' ? 'Суббота - Воскресенье' : 'Shanba - Yakshanba'}: 09:00-18:00
      </span>
    </div>
  </div>
  ```
- **Kelajakda:** Database'ga `Branch.workingHours` maydoni qo'shish mumkin

---

## 📋 FILIALLAR RO'YXATI SAHIFASI (`/branches`)

### Sidebar'da ko'rsatiladigan ma'lumotlar:

#### 1. **Useful Articles (Foydali maqolalar)**
- **Qayerda:** `apps/frontend/src/app/branches/page-content.tsx` (115+ qatorlar)
- **Boshqarish:** Admin Panel → Maqolalar
- **Database:** `Post` modeli (`postType: 'article'`)
- **Qanday o'zgartirish:**
  1. Admin panelga kiring
  2. "Maqolalar" bo'limiga o'ting
  3. Maqolani yarating yoki tahrirlash
  4. Maqola turini "Maqola" qilib belgilang
  5. Status'ni "Nashr etilgan" qilib belgilang
  6. Sidebar'da avtomatik ko'rinadi

---

## 🔧 UMUMIY BOSHQARISH

### Admin Panel orqali boshqariladigan ma'lumotlar:

1. **Filial nomi** (`name_uz`, `name_ru`)
2. **Manzil** (`address_uz`, `address_ru`)
3. **Telefonlar** (`phone`, `phones`)
4. **Koordinatalar** (`latitude`, `longitude`)
5. **Xarita iframe** (`map_iframe`)
6. **3D Tour iframe** (`tour3d_iframe`)
7. **Rasm** (`imageId`)
8. **Tartib** (`order`)

### Kod ichida hardcoded ma'lumotlar:

1. **Working Hours (Ish vaqti)** - hozircha hardcoded
2. **Services List (Xizmatlar ro'yxati)** - hozircha hardcoded
3. **Table of Contents** - avtomatik yaratiladi
4. **Navigation Links** - avtomatik yaratiladi

---

## 📝 KELAJAKDA QO'SHILADIGAN FUNKSIYALAR

### 1. Working Hours'ni Database'ga qo'shish:

**Schema o'zgarishi:**
```prisma
model Branch {
  // ... existing fields
  workingHours_uz String? // Masalan: "Dushanba - Juma: 09:00-20:00\nShanba - Yakshanba: 09:00-18:00"
  workingHours_ru String? // Masalan: "Понедельник - Пятница: 09:00-20:00\nСуббота - Воскресенье: 09:00-18:00"
}
```

**Admin Panel:**
- Filiallar → Filialni tahrirlash → "Ish vaqti (uz)" va "Ish vaqti (ru)" maydonlari

**Frontend:**
- `apps/frontend/src/app/branches/[slug]/page.tsx` faylida hardcoded qismni `branch.workingHours_uz/ru` bilan almashtirish

---

### 2. Services List'ni Database'ga qo'shish:

**Schema o'zgarishi:**
```prisma
model Branch {
  // ... existing fields
  services String[] // Service ID'lari array'i
}
```

**Yoki alohida BranchService modeli:**
```prisma
model BranchService {
  id String @id @default(cuid())
  branchId String
  branch Branch @relation(fields: [branchId], references: [id])
  serviceId String
  service Service @relation(fields: [serviceId], references: [id])
  order Int @default(0)
}
```

**Admin Panel:**
- Filiallar → Filialni tahrirlash → "Xizmatlar" bo'limi (checkbox yoki transfer component)

**Frontend:**
- `apps/frontend/src/app/branches/[slug]/page.tsx` faylida hardcoded services list'ni `branch.services` bilan almashtirish

---

## 🎯 XULOSA

### Hozirgi holat:

✅ **Admin Panel orqali boshqariladi:**
- Filial nomi
- Manzil
- Telefonlar
- Koordinatalar
- Xarita iframe
- 3D Tour iframe
- Rasm

❌ **Kod ichida hardcoded:**
- Working Hours (Ish vaqti)
- Services List (Xizmatlar ro'yxati)

### Tavsiya:

1. **Working Hours** ni Database'ga qo'shish
2. **Services List** ni Database'ga qo'shish yoki Service modeliga bog'lash
3. Barcha ma'lumotlarni Admin Panel orqali boshqarish imkoniyatini yaratish

---

**Oxirgi yangilanish:** 2024-yil







