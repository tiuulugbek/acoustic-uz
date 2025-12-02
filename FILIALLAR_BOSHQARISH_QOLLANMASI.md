# Filiallar Ma'lumotlarini Boshqarish Qo'llanmasi

Bu hujjatda filiallar sahifasidagi barcha ma'lumotlar qayerda qo'shiladi, o'zgartiriladi yoki yangilanadi.

---

## 📍 FILIALLAR SAHIFASI MA'LUMOTLARI

### 1. **Filial Nomi va Manzili**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/branches` (Filiallar bo'limi)
- **Fayl:** `apps/admin/src/pages/Branches.tsx`

**Boshqariladigan maydonlar:**
- **Nomi (uz)** - `name_uz`
- **Nomi (ru)** - `name_ru`
- **Slug (URL)** - `slug` (avtomatik yaratiladi)
- **Manzil (uz)** - `address_uz`
- **Manzil (ru)** - `address_ru`

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. Nom va manzilni o'zgartiring
5. "Saqlash" tugmasini bosing

---

### 2. **Telefon Raqamlari**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/branches` (Filiallar bo'limi)
- **Fayl:** `apps/admin/src/pages/Branches.tsx`

**Boshqariladigan maydonlar:**
- **Asosiy telefon** - `phone` (majburiy)
- **Qo'shimcha telefonlar** - `phones[]` (array)

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. "Asosiy telefon" yoki "Qo'shimcha telefonlar" maydonlarini o'zgartiring
5. "Saqlash" tugmasini bosing

**Format:**
- Asosiy telefon: `+998 71 202 14 41`
- Qo'shimcha telefonlar: Har bir raqam alohida qatorga yoziladi

---

### 3. **Xarita (Map)**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/branches` (Filiallar bo'limi)
- **Fayl:** `apps/admin/src/pages/Branches.tsx`

**Boshqariladigan maydonlar:**
- **Xarita iframe** - `map_iframe` (HTML iframe kodi)
- **GPS koordinatalar** - `latitude` va `longitude` (ixtiyoriy)

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. "Xarita iframe" maydoniga Google Maps yoki boshqa xarita xizmatidan iframe kodini kiriting
5. Yoki "Kenglik (Latitude)" va "Uzunlik (Longitude)" maydonlariga GPS koordinatalarni kiriting
6. "Saqlash" tugmasini bosing

**Iframe kodini qayerdan olish:**
1. Google Maps'da filial manzilini toping
2. "Ulashish" tugmasini bosing
3. "Kodni o'rnatish" bo'limini tanlang
4. Iframe kodini nusxalab, admin panelga yuklang

**Misol:**
```html
<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
```

---

### 4. **Filial Rasmi**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/branches` (Filiallar bo'limi)
- **Fayl:** `apps/admin/src/pages/Branches.tsx`

**Boshqariladigan maydonlar:**
- **Rasm** - `imageId` (Media Library'dan tanlash yoki yangi yuklash)

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. "Rasm yuklash" tugmasini bosing yoki "Mavjud rasmni tanlash" bo'limidan rasmni tanlang
5. "Saqlash" tugmasini bosing

---

### 5. **3D Tour (Virtual Tour)**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/branches` (Filiallar bo'limi)
- **Fayl:** `apps/admin/src/pages/Branches.tsx`

**Boshqariladigan maydonlar:**
- **3D Tour iframe** - `tour3d_iframe` (HTML iframe kodi)

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. "3D Tour iframe" maydoniga Matterport, Kuula yoki boshqa 3D tour xizmatidan iframe kodini kiriting
5. "Saqlash" tugmasini bosing

**Misol:**
```html
<iframe src="https://my.matterport.com/show/?m=..." width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking"></iframe>
```

---

### 6. **Xizmatlar Ro'yxati**

**⚠️ MUHIM:** Hozirgi vaqtda xizmatlar ro'yxati **hardcoded** (kod ichida belgilangan) va admin panelda boshqarilmaydi.

**Hozirgi holat:**
- **Fayl:** `apps/frontend/src/app/branches/[slug]/page.tsx` (105-112 qatorlar)
- Barcha filiallar uchun bir xil xizmatlar ro'yxati ko'rsatiladi

**Qanday o'zgartirish (vaqtinchalik):**
1. `apps/frontend/src/app/branches/[slug]/page.tsx` faylini oching
2. 105-112 qatorlardagi `services` array'ini o'zgartiring
3. Frontend'ni qayta ishga tushiring

**Kelajakda:**
- Filiallar va Xizmatlar o'rtasida aloqa qo'shilishi kerak
- Har bir filial uchun alohida xizmatlar ro'yxati bo'lishi kerak
- Admin panelda filialga xizmatlar qo'shish/olib tashlash imkoniyati bo'lishi kerak

---

### 7. **Ish Vaqti (Working Hours)**

**⚠️ MUHIM:** Hozirgi vaqtda ish vaqti **hardcoded** (kod ichida belgilangan) va admin panelda boshqarilmaydi.

**Hozirgi holat:**
- **Fayl:** `apps/frontend/src/app/branches/[slug]/page.tsx` (370-380 qatorlar)
- Barcha filiallar uchun bir xil ish vaqti ko'rsatiladi:
  - Dushanba - Juma: 09:00-20:00
  - Shanba - Yakshanba: 09:00-18:00

**Qanday o'zgartirish (vaqtinchalik):**
1. `apps/frontend/src/app/branches/[slug]/page.tsx` faylini oching
2. 370-380 qatorlardagi ish vaqti matnini o'zgartiring
3. Frontend'ni qayta ishga tushiring

**Kelajakda:**
- `Branch` modeliga `workingHours` maydoni qo'shilishi kerak
- Admin panelda har bir filial uchun alohida ish vaqti belgilash imkoniyati bo'lishi kerak

---

### 8. **Navigatsiya Linklari (Yandex Navigator, Google Navigator)**

**Qayerda boshqariladi:**
- **Avtomatik yaratiladi** - `latitude` va `longitude` koordinatalariga asoslanib

**Qanday ishlaydi:**
- Agar filialda `latitude` va `longitude` koordinatalar bo'lsa, navigatsiya linklari avtomatik yaratiladi
- Yandex Navigator: `https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map`
- Google Navigator: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

**Qanday o'zgartirish:**
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni tanlang va "Tahrirlash" tugmasini bosing
4. "Kenglik (Latitude)" va "Uzunlik (Longitude)" maydonlariga GPS koordinatalarni kiriting
5. "Saqlash" tugmasini bosing

**GPS koordinatalarni qayerdan olish:**
1. Google Maps'da filial manzilini toping
2. Manzil ustiga bosing
3. Koordinatalarni ko'ring (masalan, 41.2973, 69.2050)

---

### 9. **Shifokorlar (Doctors)**

**Qayerda boshqariladi:**
- **Admin Panel:** `http://localhost:3002/doctors` (Mutaxassislar bo'limi)
- **Fayl:** `apps/admin/src/pages/Doctors.tsx`

**Qanday ishlaydi:**
- Filial sahifasida barcha shifokorlar ko'rsatiladi
- Har bir shifokor o'z sahifasiga link bilan ko'rsatiladi
- Shifokorlar filialga bog'lanmagan (barcha filiallar uchun bir xil)

**Kelajakda:**
- Shifokorlar va Filiallar o'rtasida aloqa qo'shilishi kerak
- Har bir shifokor ma'lum filialga bog'lanishi kerak
- Filial sahifasida faqat o'sha filialga tegishli shifokorlar ko'rsatilishi kerak

---

## 📊 MA'LUMOTLAR JADVALI

| # | Ma'lumot | Qayerda boshqariladi | Admin Panel | Status |
|---|----------|---------------------|-------------|--------|
| 1 | Filial nomi | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 2 | Manzil | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 3 | Telefon raqamlari | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 4 | Xarita | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 5 | Filial rasmi | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 6 | 3D Tour | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 7 | GPS koordinatalar | Admin Panel → Filiallar | ✅ | ✅ Ishlaydi |
| 8 | Xizmatlar ro'yxati | Kod ichida (hardcoded) | ❌ | ⚠️ Vaqtinchalik |
| 9 | Ish vaqti | Kod ichida (hardcoded) | ❌ | ⚠️ Vaqtinchalik |
| 10 | Shifokorlar | Admin Panel → Mutaxassislar | ✅ | ⚠️ Filialga bog'lanmagan |

---

## 🔧 ADMIN PANEL YO'RIQNOMASI

### Filial qo'shish:
1. Admin panelga kiring (`http://localhost:3002`)
2. "Filiallar" bo'limiga o'ting
3. "+ Yangi filial" tugmasini bosing
4. Barcha maydonlarni to'ldiring:
   - Nomi (uz va ru)
   - Manzil (uz va ru)
   - Telefon raqamlari
   - Xarita iframe (yoki GPS koordinatalar)
   - Rasm (ixtiyoriy)
   - 3D Tour iframe (ixtiyoriy)
5. "Saqlash" tugmasini bosing

### Filialni tahrirlash:
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni toping va "Tahrirlash" tugmasini bosing
4. Kerakli maydonlarni o'zgartiring
5. "Saqlash" tugmasini bosing

### Filialni o'chirish:
1. Admin panelga kiring
2. "Filiallar" bo'limiga o'ting
3. Filialni toping va "O'chirish" tugmasini bosing
4. Tasdiqlang

---

## 📝 MUHIM ESLATMALAR

1. **Slug avtomatik yaratiladi:** Agar slug bo'sh qoldirilsa, filial nomidan avtomatik yaratiladi
2. **Rasm yuklash:** Yangi rasm yuklash yoki Media Library'dan mavjud rasmni tanlash mumkin
3. **Xarita:** Iframe kod yoki GPS koordinatalar orqali xarita qo'shiladi
4. **Tartib:** Filiallar tartibini "Tartib" maydoni orqali boshqarish mumkin

---

**Oxirgi yangilanish:** 2024-yil








