# Rasmlar O'lchamlari va Vazifalari

Bu hujjatda loyihadagi barcha rasm joylashadigan joylar, ularning o'lchamlari va vazifalari ko'rsatilgan.

## 🎯 UMUMIY QOIDALAR

### ⚠️ MUHIM PRINSIPLAR:

1. **Bitta rasm hamma joyda ishlatiladi:**
   - Har bir rasm turi uchun bitta asosiy rasm mavjud
   - Bu rasm hamma joyda (bosh sahifa, katalog, mahsulot sahifasi, va boshqalar) bir xil sifatida ko'rsatiladi
   - Responsive bo'lib, ekran kengligiga moslashadi

2. **Nisbati hamma joyda bir xil:**
   - Har bir rasm turi uchun standart nisbat belgilanadi
   - Bu nisbat hamma joyda (bosh sahifa, katalog, mahsulot sahifasi, va boshqalar) bir xil qoladi
   - Responsive o'lchamlar o'zgarganda ham nisbat saqlanadi

3. **Responsive dizayn:**
   - Barcha rasmlar ekran kengligiga moslashadi
   - Desktop, tablet va mobile uchun optimal ko'rinish ta'minlanadi
   - `next/image` komponenti orqali avtomatik optimallashtiriladi

---

## 🏠 FRONTEND - BOSH SAHIFA (`apps/frontend/src/app/page.tsx`)

### 1. **Hero Slider (Banner Rasmlari)**
- **Joylashuvi:** Bosh sahifa yuqori qismi
- **O'lchami:** To'liq ekran kengligi (100vw)
- **Nisbati:** 16:9 yoki 21:9 (responsive)
- **Vazifasi:** Asosiy reklama slaydlari, mahsulot yoki xizmatlarni targ'ib qilish
- **Format:** JPG/PNG, optimallashtirilgan
- **Maxsus:** `HeroSlider` komponenti orqali boshqariladi
- **Manba:** `Banner` modelidan (`imageId`)

---

### 2. **Xizmatlar Rasmlari (Services Images)**
- **Joylashuvi:** 
  - **Bosh sahifa:** "Xizmatlar" bo'limi (`/`)
  - **Xizmatlar sahifasi:** Xizmatlar ro'yxati (`/services/[slug]`)
- **O'lchami:** 
  - Desktop: 25vw (4 ta ustun)
  - Tablet: 50vw (2 ta ustun)
  - Mobile: 100vw (1 ta ustun)
- **Nisbati:** 4:3 (`aspect-[4/3]`) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Xizmatlar kartalarida ko'rsatiladigan rasmlar
- **Format:** JPG/PNG
- **Manba:** 
  - **Bosh sahifa:** `HomepageService.image` yoki `Service.cover` (fallback)
  - **Xizmatlar sahifasi:** `Service.cover`
- **⚠️ MUHIM:** Bitta rasm (`Service.cover`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (4:3) qoladi.

---

### 3. **Eshitish Moslamalari Rasmlari (Hearing Aids)**
- **Joylashuvi:** Bosh sahifadagi "Eshitish apparatlari" bo'limi
- **O'lchami:** 
  - Rasm: 112px × 80px (w-28 × h-20)
  - Kartalar: 3 ta ustun (grid-cols-3)
- **Nisbati:** ~1.4:1
- **Vazifasi:** Mahsulot kartalarida kichik rasm ko'rsatish
- **Format:** JPG/PNG
- **Manba:** `HomepageHearingAid` modelidan (`imageId`) yoki `Catalog` modelidan

---

### 4. **Interacoustics Carousel Rasmlari**
- **Joylashuvi:** Bosh sahifadagi Interacoustics carousel
- **O'lchami:** 
  - Desktop: ~300px × 300px
  - Responsive: ekran kengligiga moslashadi
- **Nisbati:** 1:1 (square)
- **Vazifasi:** Interacoustics mahsulotlarini ko'rsatish
- **Format:** JPG/PNG
- **Manba:** `Showcase` modelidan (`productMetadata.homepageImageId`)

---

## 📦 FRONTEND - MAHSULOT SAHIFASI (`apps/frontend/src/app/products/[slug]/page.tsx`)

### 5. **Asosiy Mahsulot Rasmi (Main Product Image)**
- **Joylashuvi:** 
  - **Mahsulot sahifasi:** Chap tomon (`/products/[slug]`)
  - **Katalog sahifasi:** Mahsulot kartalarida (`/catalog`)
  - **Bosh sahifa:** Interacoustics carousel (`/`)
- **O'lchami:** 
  - Desktop: 400px × 400px (mahsulot sahifasi)
  - Desktop: 33vw × 33vw (katalog)
  - Responsive: ekran kengligiga moslashadi
- **Nisbati:** 1:1 (square, `aspect-square`) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Mahsulotning asosiy rasmini ko'rsatish
- **Format:** JPG/PNG, `object-contain` bilan
- **Padding:** 32px (p-8) mahsulot sahifasida, 16px (p-4) katalogda
- **Manba:** `Product.galleryUrls[0]` yoki `Product.thumbnailUrl` - **BITTA RASM HAMMA JOYDA**
- **⚠️ MUHIM:** Bitta rasm (`Product.galleryUrls[0]`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (1:1) qoladi.

---

### 6. **Mahsulot Galereyasi (Product Gallery Thumbnails)**
- **Joylashuvi:** Asosiy rasm ostida, 4 ta kichik rasm
- **O'lchami:** Har biri ~100px × 100px (grid-cols-4)
- **Nisbati:** 1:1 (square)
- **Vazifasi:** Qo'shimcha mahsulot rasmlarini ko'rsatish
- **Format:** JPG/PNG
- **Padding:** 8px (p-2)
- **Manba:** `Product.galleryUrls[1-4]`

---

### 7. **Foydali Maqolalar Rasmlari (Useful Articles)**
- **Joylashuvi:** 
  - **Mahsulot sahifasi:** O'ng sidebar (`/products/[slug]`)
  - **Katalog sahifasi:** Sidebar (`/catalog`)
  - **Maqolalar sahifasi:** Maqola ro'yxati (`/posts`)
- **O'lchami:** 64px × 64px (h-16 × w-16) - **HAMMA JOYDA BIR XIL**
- **Nisbati:** 1:1 (square) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Maqolalar ro'yxatida kichik rasm ko'rsatish
- **Format:** JPG/PNG
- **Manba:** `Post.coverId` (Media modelidan) - **BITTA RASM HAMMA JOYDA**
- **⚠️ MUHIM:** Bitta rasm (`Post.coverId`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (1:1) qoladi.

---

## 📋 FRONTEND - KATALOG SAHIFASI (`apps/frontend/src/app/catalog/page.tsx`)

### 8. **Katalog Hero Rasmi (Catalog Hero Image)**
- **Joylashuvi:** Katalog sahifasining yuqori qismi
- **O'lchami:** 
  - Desktop: 100vw (to'liq kenglik)
  - Balandlik: 256px (mobile) yoki 320px (desktop)
- **Nisbati:** ~3:1 yoki 4:1
- **Vazifasi:** Katalog bo'limining banner rasmi
- **Format:** JPG/PNG, `object-cover`
- **Fallback:** Agar rasm yo'q bo'lsa, matn ko'rsatiladi
- **Manba:** `Setting.catalogHeroImageId` (Settings modelidan)

---

### 9. **Katalog Mahsulot Rasmlari (Catalog Product Images)**
- **Joylashuvi:** 
  - **Katalog sahifasi:** Mahsulot kartalarida (`/catalog`)
  - **Mahsulot sahifasi:** Asosiy rasm (`/products/[slug]`)
  - **Bosh sahifa:** Interacoustics carousel (`/`)
- **O'lchami:** 
  - Desktop: 33vw (3 ta ustun)
  - Tablet: 50vw (2 ta ustun)
  - Mobile: 100vw (1 ta ustun)
- **Nisbati:** 1:1 (square, `aspect-square`) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Katalogdagi mahsulot rasmlarini ko'rsatish
- **Format:** JPG/PNG, `object-contain`
- **Padding:** 16px (p-4)
- **Manba:** `Product.galleryUrls[0]` yoki `Product.thumbnailUrl` - **BITTA RASM HAMMA JOYDA**
- **⚠️ MUHIM:** Bitta rasm (`Product.galleryUrls[0]`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (1:1) qoladi.

---

### 10. **Katalog Sidebar Maqolalar Rasmlari**
- **Joylashuvi:** 
  - **Katalog sahifasi:** Sidebar (`/catalog`)
  - **Mahsulot sahifasi:** Sidebar (`/products/[slug]`)
  - **Maqolalar sahifasi:** Maqola ro'yxati (`/posts`)
- **O'lchami:** 64px × 64px (h-16 × w-16) - **HAMMA JOYDA BIR XIL**
- **Nisbati:** 1:1 (square) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Foydali maqolalar ro'yxatida kichik rasm
- **Format:** JPG/PNG
- **Manba:** `Post.coverId` - **BITTA RASM HAMMA JOYDA**
- **⚠️ MUHIM:** Bitta rasm (`Post.coverId`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (1:1) qoladi.

---

## 🎨 FRONTEND - HEADER (`apps/frontend/src/components/site-header.tsx`)

### 11. **Logo Rasmi**
- **Joylashuvi:** Sayt headerining chap tomonida
- **O'lchami:** 
  - Kenglik: 120px (max)
  - Balandlik: 40px (max)
- **Nisbati:** ~3:1 (flexible)
- **Vazifasi:** Sayt logotipini ko'rsatish
- **Format:** PNG/SVG (shaffof fon bilan)
- **Manba:** `Setting.logoId` (Settings modelidan)
- **Fallback:** Agar logo yo'q bo'lsa, "Acoustic" matni ko'rsatiladi

---

## 📝 FRONTEND - MAQOLALAR SAHIFASI (`apps/frontend/src/app/posts/[slug]/page.tsx`)

### 12. **Maqola Cover Rasmi**
- **Joylashuvi:** 
  - **Maqola sahifasi:** Yuqori qism (`/posts/[slug]`)
  - **Maqolalar ro'yxati:** Maqola kartalarida (`/posts`)
- **O'lchami:** 
  - Desktop: 100vw (to'liq kenglik)
  - Balandlik: 400px - 600px (responsive)
- **Nisbati:** 16:9 (`aspect-video`) - **HAMMA JOYDA BIR XIL**
- **Vazifasi:** Maqolaning asosiy rasmini ko'rsatish
- **Format:** JPG/PNG, `object-cover`
- **Manba:** `Post.coverId` - **BITTA RASM HAMMA JOYDA**
- **⚠️ MUHIM:** Bitta rasm (`Post.coverId`) hamma joyda ishlatiladi. Responsive bo'lib, nisbati hamma joyda bir xil (16:9) qoladi.

---

## 🎛️ ADMIN PANEL - RASMLAR

### 13. **Media Library Thumbnails**
- **Joylashuvi:** Admin panel - Media Library sahifasi
- **O'lchami:** 
  - Grid: 150px × 150px (har bir rasm)
  - Responsive: ekran kengligiga moslashadi
- **Nisbati:** 1:1 (square)
- **Vazifasi:** Media kutubxonasida rasmlarni ko'rsatish va tanlash
- **Format:** Barcha formatlar (JPG, PNG, GIF, SVG)
- **Manba:** `Media` modelidan

---

### 14. **Banner Rasmlari (Admin)**
- **Joylashuvi:** Admin panel - Banners sahifasi
- **O'lchami:** 
  - Jadvalda: 60px × 60px
  - Preview: 200px × 200px (max)
- **Nisbati:** 1:1 (jadvalda), original (preview)
- **Vazifasi:** Banner rasmlarini ko'rsatish va tahrirlash
- **Format:** JPG/PNG
- **Manba:** `Banner.imageId`

---

### 15. **Mahsulot Rasmlari (Admin)**
- **Joylashuvi:** Admin panel - Products sahifasi
- **O'lchami:** 
  - Jadvalda: 60px × 60px
  - Preview: 200px × 200px (max)
- **Nisbati:** 1:1 (jadvalda), original (preview)
- **Vazifasi:** Mahsulot rasmlarini ko'rsatish va tahrirlash
- **Format:** JPG/PNG
- **Manba:** `Product.thumbnailId` yoki `Product.galleryIds`

---

### 16. **Maqola Cover Rasmlari (Admin)**
- **Joylashuvi:** Admin panel - Posts sahifasi
- **O'lchami:** 
  - Jadvalda: 60px × 60px
  - Preview: 200px × 200px (max)
- **Nisbati:** 1:1 (jadvalda), original (preview)
- **Vazifasi:** Maqola rasmlarini ko'rsatish va tahrirlash
- **Format:** JPG/PNG
- **Manba:** `Post.coverId`

---

### 17. **Brend Logolari (Admin)**
- **Joylashuvi:** Admin panel - Brands sahifasi
- **O'lchami:** 
  - Jadvalda: 64px × 32px
  - Preview: 200px × 100px (max)
- **Nisbati:** 2:1 (flexible)
- **Vazifasi:** Brend logolarini ko'rsatish va tahrirlash
- **Format:** PNG/SVG (shaffof fon bilan)
- **Manba:** `Brand.logoId`

---

### 18. **Settings Rasmlari (Admin)**
- **Joylashuvi:** Admin panel - Settings sahifasi
- **O'lchami:** 
  - Catalog Hero: 200px × 200px (max preview)
  - Logo: 100px × 100px (max preview)
- **Nisbati:** Original (preview)
- **Vazifasi:** Global sozlamalar rasmlarini ko'rsatish va tahrirlash
- **Format:** JPG/PNG (catalog hero), PNG/SVG (logo)
- **Manba:** `Setting.catalogHeroImageId`, `Setting.logoId`

---

## 📊 RASMLAR O'LCHAMLARI JADVALI

| # | Rasm Turi | Joylashuvi | O'lchami | Nisbati | Format | Manba |
|---|-----------|------------|----------|---------|--------|-------|
| 1 | Hero Slider | Bosh sahifa | 100vw × ~500px | 16:9 | JPG/PNG | Banner.imageId |
| 2 | Xizmatlar | Bosh sahifa + Xizmatlar sahifasi | 25vw × ~188px | 4:3 | JPG/PNG | Service.cover (bitta rasm hamma joyda) |
| 3 | Eshitish Moslamalari | Bosh sahifa | 112px × 80px | 1.4:1 | JPG/PNG | HomepageHearingAid.imageId |
| 4 | Interacoustics | Bosh sahifa | ~300px × 300px | 1:1 | JPG/PNG | Showcase.productMetadata |
| 5 | Asosiy Mahsulot | Mahsulot + Katalog + Bosh sahifa | 400px × 400px | 1:1 | JPG/PNG | Product.galleryUrls[0] (bitta rasm hamma joyda) |
| 6 | Galereya | Mahsulot sahifasi | ~100px × 100px | 1:1 | JPG/PNG | Product.galleryUrls[1-4] |
| 7 | Maqola (Sidebar) | Mahsulot + Katalog + Maqolalar | 64px × 64px | 1:1 | JPG/PNG | Post.coverId (bitta rasm hamma joyda) |
| 8 | Katalog Hero | Katalog sahifasi | 100vw × 320px | 3:1 | JPG/PNG | Setting.catalogHeroImageId |
| 9 | Katalog Mahsulot | Katalog + Mahsulot + Bosh sahifa | 33vw × 33vw | 1:1 | JPG/PNG | Product.galleryUrls[0] (bitta rasm hamma joyda) |
| 10 | Maqola (Katalog) | Katalog + Mahsulot + Maqolalar | 64px × 64px | 1:1 | JPG/PNG | Post.coverId (bitta rasm hamma joyda) |
| 11 | Logo | Header | 120px × 40px | 3:1 | PNG/SVG | Setting.logoId |
| 12 | Maqola Cover | Maqola sahifasi + Maqolalar ro'yxati | 100vw × 500px | 16:9 | JPG/PNG | Post.coverId (bitta rasm hamma joyda) |
| 13 | Media Thumbnail | Admin | 150px × 150px | 1:1 | Barcha | Media |
| 14 | Banner (Admin) | Admin | 60px × 60px | 1:1 | JPG/PNG | Banner.imageId |
| 15 | Mahsulot (Admin) | Admin | 60px × 60px | 1:1 | JPG/PNG | Product.thumbnailId |
| 16 | Maqola (Admin) | Admin | 60px × 60px | 1:1 | JPG/PNG | Post.coverId |
| 17 | Brend Logo | Admin | 64px × 32px | 2:1 | PNG/SVG | Brand.logoId |
| 18 | Settings | Admin | 200px × 200px | Original | JPG/PNG | Setting.*ImageId |

---

## 💡 TAVSIYALAR

### Optimal Rasm O'lchamlari:

1. **Hero Slider:** 1920px × 1080px (Full HD, 16:9)
2. **Xizmatlar:** 800px × 600px (4:3) - **HAMMA JOYDA BIR XIL**
3. **Mahsulot Rasmlari:** 800px × 800px (square, 1:1)
4. **Katalog Hero:** 1920px × 640px (3:1)
5. **Logo:** 240px × 80px (2x retina uchun, 3:1)
6. **Maqola Cover:** 1920px × 1080px (16:9, aspect-video)
7. **Thumbnails:** 300px × 300px (square, 1:1)

### Formatlar:
- **Rasmlar:** JPG (fotosuratlar), PNG (shaffof fon kerak bo'lsa)
- **Logolar:** PNG/SVG (vektor)
- **Ikonkalar:** SVG (vektor)

### Responsive va Nisbatlar:

**Standart Nisbatlar (hamma joyda bir xil):**
- **Xizmatlar:** `aspect-[4/3]` (800×600px) - Bosh sahifa va Xizmatlar sahifasida bir xil
- **Mahsulotlar:** `aspect-square` (1:1) - Katalog, Mahsulot sahifasi va Bosh sahifada bir xil
- **Maqolalar (Cover):** `aspect-video` (16:9) - Maqola sahifasi va Maqolalar ro'yxatida bir xil
- **Maqolalar (Thumbnail):** `aspect-square` (1:1) - Sidebar va ro'yxatlarda bir xil
- **Thumbnails:** `aspect-square` (1:1) - Barcha kichik rasmlarda bir xil

**Responsive Qoidalar:**
- Barcha rasmlar `next/image` komponenti orqali optimallashtiriladi
- Lazy loading qo'llaniladi (priority bo'lmagan rasmlar uchun)
- Responsive images (`sizes` prop) ishlatiladi
- `object-fit` sozlamalari:
  - `object-cover` - Hero, banner, kategoriya rasmlari uchun
  - `object-contain` - Mahsulot rasmlari uchun (to'liq ko'rinish)

### ⚠️ MUHIM E'LON:

**Bitta rasm hamma joyda ishlatiladi (BARCHA RASMLAR UCHUN):**

1. **Xizmatlar:** 
   - `Service.cover` - Bosh sahifa va Xizmatlar sahifasida bir xil
   - Nisbati: `aspect-[4/3]` (800×600px) - hamma joyda bir xil
   - **Tavsiya:** 800px × 600px o'lchamda rasm yuklang

2. **Mahsulotlar:**
   - `Product.galleryUrls[0]` yoki `Product.thumbnailUrl` - Katalog, Mahsulot sahifasi va Bosh sahifada bir xil
   - Nisbati: `aspect-square` (1:1) - hamma joyda bir xil
   - **Tavsiya:** 800px × 800px o'lchamda rasm yuklang

3. **Maqolalar (Cover):**
   - `Post.coverId` - Maqola sahifasi va Maqolalar ro'yxatida bir xil
   - Nisbati: `aspect-video` (16:9) - hamma joyda bir xil
   - **Tavsiya:** 1920px × 1080px o'lchamda rasm yuklang

4. **Maqolalar (Thumbnail):**
   - `Post.coverId` - Sidebar va ro'yxatlarda bir xil
   - Nisbati: `aspect-square` (1:1) - hamma joyda bir xil
   - **Tavsiya:** 300px × 300px o'lchamda rasm yuklang

**Umumiy qoida:**
- Har bir rasm turi uchun bitta asosiy rasm mavjud
- Bu rasm hamma joyda bir xil sifatida ko'rsatiladi
- Nisbati hamma joyda bir xil qoladi
- Responsive bo'lib, ekran kengligiga moslashadi

---

## 📁 RASMLAR JOYLASHUVI

Barcha rasmlar quyidagi joyda saqlanadi:
- **Lokal:** `uploads/products/`, `uploads/media/`
- **Backend:** `http://localhost:3001/uploads/`
- **Frontend:** `http://localhost:3000` (Next.js Image optimization orqali)

---

**Oxirgi yangilanish:** 2024-yil

