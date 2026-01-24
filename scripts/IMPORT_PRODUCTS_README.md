# Mahsulotlarni Import Qilish Qo'llanmasi

Bu script eshitish moslamalari (hearing aids) ma'lumotlarini JSON fayldan bazaga import qilish uchun yaratilgan.

## Qanday Ishlatiladi?

### 1. JSON Fayl Tayyorlash

`products-to-import.json` faylini tayyorlang. Har bir mahsulot quyidagi formatda bo'lishi kerak:

```json
{
  "name_uz": "Oticon Siya 2 CIC",
  "name_ru": "Oticon Siya 2 CIC",
  "slug": "oticon-siya-2-cic",
  "description_uz": "Mahsulot tavsifi o'zbek tilida...",
  "description_ru": "Mahsulot tavsifi rus tilida...",
  "price": null,
  "productType": "hearing-aids",
  "brandName": "Oticon",
  "intro_uz": "Qisqa kirish matni...",
  "intro_ru": "Краткое введение...",
  "features_uz": ["Xususiyat 1", "Xususiyat 2"],
  "features_ru": ["Особенность 1", "Особенность 2"],
  "benefits_uz": ["Afzallik 1", "Afzallik 2"],
  "benefits_ru": ["Преимущество 1", "Преимущество 2"],
  "tech_uz": "Texnik ma'lumot...",
  "tech_ru": "Техническая информация...",
  "specsText": "Texnik xususiyatlar jadvali...",
  "galleryUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "audience": ["adults", "elderly"],
  "formFactors": ["CIC"],
  "signalProcessing": "digital",
  "powerLevel": "powerful",
  "hearingLossLevels": ["mild", "moderate"],
  "smartphoneCompatibility": ["iOS", "Android"],
  "paymentOptions": ["cash", "installment"],
  "availabilityStatus": "in-stock",
  "tinnitusSupport": false
}
```

### 2. Scriptni Ishga Tushirish

```bash
pnpm run import:products
```

Yoki to'g'ridan-to'g'ri:

```bash
pnpm --filter @acoustic/backend exec ts-node --transpile-only --project tsconfig.json ../../scripts/import-products.ts
```

### 3. Natijalar

Script har bir mahsulotni:
- ✅ Brand'ni topadi yoki yaratadi
- ✅ Rasmlarni Media jadvaliga qo'shadi (URL'lar saqlanadi)
- ✅ Mahsulotni yaratadi va rasmlarni bog'laydi
- ✅ Catalog'larni bog'laydi (agar `catalogIds` berilgan bo'lsa)

## Muhim Eslatmalar

1. **Rasmlar**: Script rasmlarni URL'dan yuklab olmaydi, faqat URL'larni Media jadvaliga saqlaydi. Agar rasmlarni yuklab olish kerak bo'lsa, alohida script yozish kerak.

2. **Brand'lar**: Agar brand mavjud bo'lmasa, avtomatik yaratiladi.

3. **Slug'lar**: Agar slug allaqachon mavjud bo'lsa, avtomatik raqam qo'shiladi (masalan: `slug-1`, `slug-2`).

4. **Rasmlar**: Agar rasm URL'i allaqachon Media jadvalida bo'lsa, yangi Media yaratilmaydi, mavjud ID ishlatiladi.

## Xatoliklar

Agar xatolik yuzaga kelsa:
- Script xatolikni ko'rsatadi va keyingi mahsulotga o'tadi
- Barcha mahsulotlar import qilinishi tugagach, natijalar ko'rsatiladi
- Muvaffaqiyatli va xatoliklar soni alohida ko'rsatiladi

## Misol

```bash
$ pnpm run import:products

=== Mahsulotlarni import qilish ===

JSON fayl o'qilmoqda: /path/to/products-to-import.json
✅ 69 ta mahsulot topildi

[1/69] Mahsulot: Oticon Siya 2 CIC
  ✓ Brand topildi: Oticon
  Rasmlarni yuklash... (1 ta)
  ✓ Rasm qo'shildi: opn_cic.jpg
  ✓ Rasm qo'shildi: thumbnail.jpg
  ✅ Mahsulot muvaffaqiyatli yaratildi: Oticon Siya 2 CIC (ID: clx...)

...

=== Natijalar ===
✅ Muvaffaqiyatli: 69 ta
❌ Xatoliklar: 0 ta
📊 Jami: 69 ta

✅ Import yakunlandi
```

## Qo'shimcha Ma'lumot

- Script `products-to-import.json` faylini loyiha ildizidan qidiradi
- Barcha mahsulotlar `published` status bilan yaratiladi
- Rasmlar Media jadvaliga saqlanadi va mahsulotga bog'lanadi
