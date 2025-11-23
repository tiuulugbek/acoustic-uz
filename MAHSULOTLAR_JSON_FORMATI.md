# Mahsulotlar JSON Format Qo'llanmasi

Bu qo'llanmada mahsulotlar ma'lumotlarini JSON formatida qanday tayyorlash kerakligi ko'rsatilgan.

---

## JSON Fayl Strukturasi

JSON fayl array bo'lishi kerak, har bir element bitta mahsulotni ifodalaydi:

```json
[
  {
    "name_uz": "Mahsulot nomi (o'zbekcha)",
    "name_ru": "Название продукта (на русском)",
    "slug": "mahsulot-slug",
    "description_uz": "Mahsulot tavsifi o'zbekcha",
    "description_ru": "Описание продукта на русском",
    "price": 1500000,
    "productType": "hearing-aids",
    "brandName": "Oticon",
    "intro_uz": "Qisqacha kirish matni (uz)",
    "intro_ru": "Краткое введение (ru)",
    "features_uz": ["Xususiyat 1", "Xususiyat 2"],
    "features_ru": ["Характеристика 1", "Характеристика 2"],
    "benefits_uz": ["Afzallik 1", "Afzallik 2"],
    "benefits_ru": ["Преимущество 1", "Преимущество 2"],
    "tech_uz": "Texnologiya tavsifi (uz)",
    "tech_ru": "Описание технологии (ru)",
    "fittingRange_uz": "Sozlash diapazoni (uz)",
    "fittingRange_ru": "Диапазон настройки (ru)",
    "specsText": "Texnik xususiyatlar matni",
    "galleryUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "thumbnailUrl": "https://example.com/image1.jpg",
    "audience": ["adults", "elderly"],
    "formFactors": ["BTE"],
    "signalProcessing": "digital",
    "powerLevel": "powerful",
    "hearingLossLevels": ["I", "II"],
    "smartphoneCompatibility": ["iphone", "android"],
    "tinnitusSupport": true,
    "paymentOptions": ["cash", "installment"],
    "availabilityStatus": "in-stock",
    "status": "published"
  }
]
```

---

## Maydonlar Tafsilotlari

### Majburiy Maydonlar (Required)

| Maydon | Turi | Tavsif | Misol |
|--------|------|--------|-------|
| `name_uz` | string | Mahsulot nomi (o'zbekcha) | "Oticon More 1" |
| `name_ru` | string | Mahsulot nomi (ruscha) | "Oticon More 1" |
| `slug` | string | URL uchun slug (lotin harflar, tire bilan) | "oticon-more-1" |
| `productType` | string | Mahsulot turi | "hearing-aids", "interacoustics", "accessories" |
| `brandName` | string | Brend nomi | "Oticon", "ReSound", "Signia", "Interacoustics" |

### Ixtiyoriy Maydonlar (Optional)

#### Tavsiflar

| Maydon | Turi | Tavsif |
|--------|------|--------|
| `description_uz` | string | To'liq tavsif (o'zbekcha) |
| `description_ru` | string | To'liq tavsif (ruscha) |
| `intro_uz` | string | Qisqacha kirish matni (o'zbekcha) |
| `intro_ru` | string | Qisqacha kirish matni (ruscha) |

#### Xususiyatlar va Afzalliklar

| Maydon | Turi | Tavsif |
|--------|------|--------|
| `features_uz` | string[] | Xususiyatlar ro'yxati (o'zbekcha) |
| `features_ru` | string[] | Xususiyatlar ro'yxati (ruscha) |
| `benefits_uz` | string[] | Afzalliklar ro'yxati (o'zbekcha) |
| `benefits_ru` | string[] | Afzalliklar ro'yxati (ruscha) |

#### Texnik Ma'lumotlar

| Maydon | Turi | Tavsif |
|--------|------|--------|
| `tech_uz` | string | Texnologiya tavsifi (o'zbekcha) - HTML yoki oddiy matn |
| `tech_ru` | string | Texnologiya tavsifi (ruscha) - HTML yoki oddiy matn |
| `fittingRange_uz` | string | Sozlash diapazoni (o'zbekcha) |
| `fittingRange_ru` | string | Диапазон настройки (ruscha) |
| `specsText` | string | Texnik xususiyatlar matni (HTML jadval yoki oddiy matn) |

#### Rasmlar

| Maydon | Turi | Tavsif |
|--------|------|--------|
| `galleryUrls` | string[] | Galereya rasmlari URL'lari ro'yxati (majburiy emas) |
| `thumbnailUrl` | string | Asosiy rasm URL'i (ixtiyoriy, agar ko'rsatilmasa `galleryUrls[0]` ishlatiladi) |

**Eslatma:** Agar `galleryUrls` yoki `thumbnailUrl` tashqi URL bo'lsa (http:// yoki https://), import script rasmlarni avtomatik yuklab, lokal papkaga saqlaydi va Media kutubxonasiga qo'shadi.

#### Filtrlar va Xususiyatlar

| Maydon | Turi | Qabul qilinadigan qiymatlar |
|--------|------|---------------------------|
| `audience` | string[] | `["children", "adults", "elderly"]` |
| `formFactors` | string[] | `["BTE", "miniRITE", "ITC", "CIC"]` |
| `signalProcessing` | string | `"digital"` yoki `"digital-trimmer"` |
| `powerLevel` | string | `"powerful"`, `"super-powerful"`, `"medium"` |
| `hearingLossLevels` | string[] | `["I", "II", "III", "IV"]` |
| `smartphoneCompatibility` | string[] | `["iphone", "android"]` |
| `tinnitusSupport` | boolean | `true` yoki `false` |
| `paymentOptions` | string[] | `["cash", "installment", "credit"]` |
| `availabilityStatus` | string | `"in-stock"`, `"preorder"`, `"out-of-stock"` |

#### Boshqa

| Maydon | Turi | Tavsif |
|--------|------|--------|
| `price` | number | Narx (so'm) |
| `stock` | number | Ombor soni |
| `status` | string | `"published"`, `"draft"`, `"archived"` |

---

## Misol JSON Fayl

```json
[
  {
    "name_uz": "Oticon More 1",
    "name_ru": "Oticon More 1",
    "slug": "oticon-more-1",
    "description_uz": "Oticon More 1 - bu eng so'nggi texnologiyalar bilan yaratilgan eshitish apparati.",
    "description_ru": "Oticon More 1 - это слуховой аппарат, созданный с использованием новейших технологий.",
    "price": 1500000,
    "productType": "hearing-aids",
    "brandName": "Oticon",
    "intro_uz": "Ko'rinmas dizayn va yuqori sifat",
    "intro_ru": "Невидимый дизайн и высокое качество",
    "features_uz": [
      "Ko'rinmas dizayn",
      "Bluetooth ulanishi",
      "Shovqinni kamaytirish"
    ],
    "features_ru": [
      "Невидимый дизайн",
      "Bluetooth подключение",
      "Подавление шума"
    ],
    "benefits_uz": [
      "Qulay foydalanish",
      "Uzoq muddatli ishlash"
    ],
    "benefits_ru": [
      "Удобное использование",
      "Долгосрочная работа"
    ],
    "tech_uz": "Deep Neural Network texnologiyasi",
    "tech_ru": "Технология Deep Neural Network",
    "fittingRange_uz": "20-80 dB",
    "fittingRange_ru": "20-80 дБ",
    "specsText": "<table><tr><td>Chastota diapazoni</td><td>125-8000 Hz</td></tr></table>",
    "galleryUrls": [
      "https://example.com/oticon-more-1-1.jpg",
      "https://example.com/oticon-more-1-2.jpg"
    ],
    "thumbnailUrl": "https://example.com/oticon-more-1-1.jpg",
    "audience": ["adults", "elderly"],
    "formFactors": ["BTE"],
    "signalProcessing": "digital",
    "powerLevel": "powerful",
    "hearingLossLevels": ["I", "II", "III"],
    "smartphoneCompatibility": ["iphone", "android"],
    "tinnitusSupport": true,
    "paymentOptions": ["cash", "installment"],
    "availabilityStatus": "in-stock",
    "status": "published"
  },
  {
    "name_uz": "Interacoustics AA222",
    "name_ru": "Interacoustics AA222",
    "slug": "interacoustics-aa222",
    "description_uz": "Audiometr uskunasi",
    "description_ru": "Аудиометрическое оборудование",
    "productType": "interacoustics",
    "brandName": "Interacoustics",
    "galleryUrls": [
      "https://example.com/aa222.jpg"
    ],
    "status": "published"
  }
]
```

---

## Muhim Eslatmalar

### 1. Slug Qoidalari
- Faqat lotin harflar, raqamlar va tire (`-`) ishlatilsin
- Bo'shliq o'rniga tire ishlatilsin
- Kichik harflar ishlatilsin
- Misol: `"oticon-more-1"`, `"interacoustics-aa222"`

### 2. BrandName
- Brend nomi to'g'ri yozilishi kerak:
  - `"Oticon"` (O harfi katta)
  - `"ReSound"` (R va S katta)
  - `"Signia"` (S katta)
  - `"Interacoustics"` (I katta)
- Agar brend mavjud bo'lmasa, avtomatik yaratiladi

### 3. ProductType
- `"hearing-aids"` - Eshitish moslamalari
- `"interacoustics"` - Interacoustics mahsulotlari
- `"accessories"` - Aksessuarlar

### 4. Rasmlar
- `galleryUrls` - array bo'lishi kerak
- URL'lar to'liq bo'lishi kerak (http:// yoki https:// bilan boshlanishi kerak)
- Yoki nisbiy yo'l (`/images/product.jpg`)

### 5. HTML Matnlar
- `description_uz`, `description_ru`, `tech_uz`, `tech_ru`, `specsText` - HTML formatida bo'lishi mumkin
- HTML jadvallar `<table>`, `<tr>`, `<td>` teglari bilan yozilishi kerak

### 6. Array Maydonlar
- `features_uz`, `features_ru`, `benefits_uz`, `benefits_ru` - array bo'lishi kerak
- Har bir element alohida string
- Bo'sh array bo'lishi mumkin: `[]`

### 7. Status
- `"published"` - nashr etilgan (ko'rsatiladi)
- `"draft"` - qoralama (ko'rsatilmaydi)
- `"archived"` - arxiv (ko'rsatilmaydi)

---

## Import Qilish

JSON faylni tayyorlaganingizdan keyin:

1. Faylni `products_update.json` nomi bilan saqlang
2. Import script yoziladi va ishga tushiriladi
3. Barcha mahsulotlar yangilanadi

---

## Qo'shimcha Ma'lumotlar

- Agar `slug` takrorlansa, mavjud mahsulot yangilanadi
- Agar `brandName` mavjud bo'lmasa, yangi brend yaratiladi
- `galleryUrls` bo'yicha rasmlar avtomatik yuklanadi va Media kutubxonasiga qo'shiladi
- Agar `thumbnailUrl` ko'rsatilsa, u asosiy rasm sifatida saqlanadi
- Agar `thumbnailUrl` ko'rsatilmasa, `galleryUrls[0]` thumbnail sifatida ishlatiladi

---

## Rasmlarni Yuklab Olish

### Avtomatik Yuklab Olish

Import script tashqi URL'lardan (http:// yoki https://) rasmlarni avtomatik yuklab oladi:

1. **Rasmlar yuklanadi:** `uploads/products/` papkasiga
2. **Media yaratiladi:** Har bir rasm Media kutubxonasiga qo'shiladi
3. **Mahsulotga bog'lanadi:** `galleryIds` va `thumbnailId` sifatida

### Qanday Ishlatish

```bash
npm run import:products:with-images products_update.json
```

### Misol JSON Fayl

Misol JSON fayl: `products_example.json`

---

**Oxirgi yangilanish:** 2024-yil
**Versiya:** 1.1

