# Mahsulotlar Rasmlari va Media Materiallar Qo'llanmasi

Bu qo'llanmada mahsulotlar rasmlarini qanday joylash va JSON formatida qanday ko'rsatish kerakligi tushuntirilgan.

---

## Rasmlarni Joylash Variantlari

### Variant 1: Tashqi URL'lar (Tavsiya etiladi)

Agar rasmlar allaqachon internetda mavjud bo'lsa (masalan, CDN, Cloud Storage, yoki boshqa server), ularni to'g'ridan-to'g'ri URL sifatida ko'rsatishingiz mumkin.

**Afzalliklari:**
- Tez va oson
- Import script avtomatik Media kutubxonasiga qo'shadi
- Rasmlarni qo'lda yuklash shart emas

**JSON formatida:**
```json
{
  "galleryUrls": [
    "https://example.com/products/oticon-more-1-1.jpg",
    "https://example.com/products/oticon-more-1-2.jpg",
    "https://example.com/products/oticon-more-1-3.jpg"
  ],
  "thumbnailUrl": "https://example.com/products/oticon-more-1-thumb.jpg"
}
```

---

### Variant 2: Lokal Fayllar (Rasmlarni papkada saqlash)

Agar rasmlarni lokal papkada saqlasangiz, ularni import script yordamida yuklash mumkin.

**Qadamlar:**

1. **Rasmlarni papkaga joylashtirish:**
   ```
   /Users/tiuulugbek/acoustic-uz/products_images/
   ├── oticon-more-1-1.jpg
   ├── oticon-more-1-2.jpg
   ├── resound-key-1.jpg
   └── ...
   ```

2. **JSON formatida nisbiy yo'l ko'rsatish:**
   ```json
   {
     "galleryUrls": [
       "/products_images/oticon-more-1-1.jpg",
       "/products_images/oticon-more-1-2.jpg"
     ],
     "thumbnailUrl": "/products_images/oticon-more-1-1.jpg"
   }
   ```

3. **Import script rasmlarni avtomatik yuklaydi va Media kutubxonasiga qo'shadi**

---

### Variant 3: Admin Panel orqali yuklash (Keyinroq)

Agar rasmlarni keyinroq yuklamoqchi bo'lsangiz:

1. Admin panelga kiring: `http://localhost:3000/admin/media`
2. Rasmlarni yuklang
3. Har bir rasm uchun URL ni oling
4. JSON faylga qo'shing

---

## JSON Formatida Rasmlarni Ko'rsatish

### Asosiy Format

```json
{
  "galleryUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "thumbnailUrl": "https://example.com/image1.jpg"
}
```

### To'liq Misol

```json
{
  "name_uz": "Oticon More 1",
  "name_ru": "Oticon More 1",
  "slug": "oticon-more-1",
  "galleryUrls": [
    "https://cdn.example.com/products/oticon/more-1-front.jpg",
    "https://cdn.example.com/products/oticon/more-1-back.jpg",
    "https://cdn.example.com/products/oticon/more-1-side.jpg"
  ],
  "thumbnailUrl": "https://cdn.example.com/products/oticon/more-1-front.jpg"
}
```

---

## Rasmlar Naming Convention (Nomlash Qoidalari)

Rasmlarni nomlashda quyidagi qoidalarga rioya qiling:

### Format:
```
{brand-slug}-{product-slug}-{number}.{extension}
```

### Misollar:
- `oticon-more-1-1.jpg` - Oticon More 1, birinchi rasm
- `oticon-more-1-2.jpg` - Oticon More 1, ikkinchi rasm
- `resound-key-1.jpg` - ReSound Key, birinchi rasm
- `interacoustics-aa222-1.jpg` - Interacoustics AA222, birinchi rasm

### Qoidalar:
- Faqat lotin harflar, raqamlar va tire (`-`) ishlatilsin
- Bo'shliq o'rniga tire ishlatilsin
- Kichik harflar ishlatilsin
- Har bir mahsulot uchun ketma-ket raqamlar: `-1`, `-2`, `-3`, ...

---

## Rasmlar Turlari va Tavsiyalar

### 1. Asosiy Rasm (Thumbnail)
- **Tavsiya:** Birinchi rasm (`galleryUrls[0]`) yoki alohida `thumbnailUrl`
- **O'lcham:** 800x800px yoki undan katta (kvadrat)
- **Format:** JPG yoki PNG
- **Og'irlik:** 200KB dan kam

### 2. Galereya Rasmlari
- **Tavsiya:** 3-5 ta rasm
- **O'lcham:** 1200x1200px yoki undan katta
- **Format:** JPG (fotosuratlar uchun) yoki PNG (grafikalar uchun)
- **Og'irlik:** Har biri 500KB dan kam

### 3. Rasm Turlari (Tavsiya etiladi):
- **Old tomondan ko'rinish** (front view)
- **Orqa tomondan ko'rinish** (back view)
- **Yon tomondan ko'rinish** (side view)
- **Detallar** (close-up)
- **Qutida ko'rinish** (in box)

---

## Import Script Qanday Ishlaydi

Import script quyidagicha ishlaydi:

1. **URL'lar tekshiriladi:**
   - Agar URL to'liq bo'lsa (http:// yoki https://), u to'g'ridan-to'g'ri Media jadvaliga qo'shiladi
   - Agar URL nisbiy bo'lsa (/products_images/...), script uni lokal fayl sifatida yuklaydi

2. **Media yaratiladi:**
   - Har bir URL uchun Media yozuv yaratiladi
   - Agar Media allaqachon mavjud bo'lsa (URL bo'yicha), yangi yaratilmaydi

3. **Mahsulotga bog'lanadi:**
   - `galleryUrls` → `galleryIds` ga aylantiriladi
   - `thumbnailUrl` → `thumbnailId` ga aylantiriladi

---

## Rasmlar Papka Strukturasi (Tavsiya)

Agar rasmlarni lokal papkada saqlasangiz, quyidagi struktura tavsiya etiladi:

```
products_images/
├── oticon/
│   ├── more-1-1.jpg
│   ├── more-1-2.jpg
│   ├── more-2-1.jpg
│   └── ...
├── resound/
│   ├── key-1.jpg
│   ├── key-2.jpg
│   └── ...
├── signia/
│   └── ...
└── interacoustics/
    └── ...
```

**JSON formatida:**
```json
{
  "galleryUrls": [
    "/products_images/oticon/more-1-1.jpg",
    "/products_images/oticon/more-1-2.jpg"
  ]
}
```

---

## Rasmlar Formatlari va O'lchamlari

### Qo'llab-quvvatlanadigan formatlar:
- **JPG/JPEG** - Fotosuratlar uchun (tavsiya etiladi)
- **PNG** - Grafikalar va logotiplar uchun
- **WebP** - Zamonaviy format (tavsiya etiladi, lekin barcha brauzerlar qo'llab-quvvatlamaydi)

### Tavsiya etilgan o'lchamlar:
- **Thumbnail:** 800x800px
- **Galereya:** 1200x1200px yoki undan katta
- **Kenglik:** Kamida 800px
- **Balandlik:** Kamida 800px

### Og'irlik:
- **Thumbnail:** 200KB dan kam
- **Galereya rasmlari:** 500KB dan kam har biri

---

## Rasmlar Optimizatsiyasi

### 1. Rasmlarni siqish (Compression)
- JPG uchun: 80-90% sifat
- PNG uchun: PNG-optimizer ishlatilsin

### 2. Rasmlarni qayta o'lchash (Resize)
- Katta rasmlarni kerakli o'lchamga qisqartiring
- Aspekt nisbatini saqlang

### 3. Lazy Loading
- Frontend avtomatik lazy loading qo'llaydi
- Faqat kerakli rasmlar yuklanadi

---

## Misol JSON Fayl (Rasmlar bilan)

```json
[
  {
    "name_uz": "Oticon More 1",
    "name_ru": "Oticon More 1",
    "slug": "oticon-more-1",
    "brandName": "Oticon",
    "productType": "hearing-aids",
    "galleryUrls": [
      "https://cdn.example.com/products/oticon/more-1-front.jpg",
      "https://cdn.example.com/products/oticon/more-1-back.jpg",
      "https://cdn.example.com/products/oticon/more-1-side.jpg"
    ],
    "thumbnailUrl": "https://cdn.example.com/products/oticon/more-1-front.jpg",
    "description_uz": "Mahsulot tavsifi...",
    "description_ru": "Описание продукта...",
    "price": 1500000
  },
  {
    "name_uz": "ReSound Key 1",
    "name_ru": "ReSound Key 1",
    "slug": "resound-key-1",
    "brandName": "ReSound",
    "productType": "hearing-aids",
    "galleryUrls": [
      "/products_images/resound/key-1.jpg",
      "/products_images/resound/key-2.jpg"
    ],
    "thumbnailUrl": "/products_images/resound/key-1.jpg",
    "description_uz": "Mahsulot tavsifi...",
    "description_ru": "Описание продукта...",
    "price": 1200000
  }
]
```

---

## Xatoliklarni Oldini Olish

### 1. Rasmlar topilmaydi
- **Sabab:** URL noto'g'ri yoki fayl mavjud emas
- **Yechim:** URL'larni tekshiring va to'g'rilang

### 2. Rasmlar yuklanmaydi
- **Sabab:** Tashqi URL'lar bloklangan yoki mavjud emas
- **Yechim:** Rasmlarni lokal papkaga ko'chiring va nisbiy yo'l ishlating

### 3. Rasmlar juda katta
- **Sabab:** Rasmlar optimizatsiya qilinmagan
- **Yechim:** Rasmlarni siqing va qayta o'lchang

---

## Qo'shimcha Ma'lumotlar

### Media Kutubxonasi
- Barcha rasmlar Media kutubxonasida saqlanadi
- Admin panelda: `http://localhost:3000/admin/media`
- Har bir rasm uchun URL, alt text va boshqa ma'lumotlar saqlanadi

### Rasmlarni O'chirish
- Admin panel orqali rasmlarni o'chirish mumkin
- O'chirilgan rasmlar avtomatik Media jadvalidan ham o'chiriladi

### Rasmlarni Yangilash
- JSON faylni yangilab, import scriptni qayta ishga tushirish mumkin
- Mavjud rasmlar yangilanmaydi, faqat yangi rasmlar qo'shiladi

---

## Import Script Ishlatish

1. **JSON faylni tayyorlang** (rasmlar bilan)
2. **Rasmlarni joylashtiring** (tashqi URL yoki lokal papka)
3. **Import scriptni ishga tushiring:**
   ```bash
   npm run import:products products_update.json
   ```

---

**Oxirgi yangilanish:** 2024-yil
**Versiya:** 1.0


