# Mahsulotlarni Brand va Kategoriyalar bilan Yangilash

Bu script mavjud mahsulotlarni brand va kategoriyalar bilan yangilash uchun yaratilgan.

## Qanday Ishlatiladi?

### 1. JSON Fayl Tayyorlash

`products-to-import.json` faylida har bir mahsulot uchun quyidagi ma'lumotlar bo'lishi kerak:

```json
{
  "slug": "signia-run-p",
  "brandName": "Signia",
  "categoryName": "Eshitish moslamalari",
  "categorySlug": "hearing-aids",
  "catalogSlugs": ["hearing-aids", "signia"]
}
```

**Majburiy maydonlar:**
- `slug` - Mahsulot slug'i (majburiy)

**Ixtiyoriy maydonlar:**
- `brandName` - Brand nomi (agar yo'q bo'lsa, brand yaratiladi)
- `categoryName` - Kategoriya nomi (agar yo'q bo'lsa, kategoriya yaratiladi)
- `categorySlug` - Kategoriya slug'i (ixtiyoriy)
- `catalogSlugs` - Catalog slug'lari massivi (ixtiyoriy)
- `catalogIds` - Catalog ID'lari massivi (ixtiyoriy)

### 2. Scriptni Ishga Tushirish

```bash
pnpm run update:products:brand-category
```

Yoki to'g'ridan-to'g'ri:

```bash
pnpm --filter @acoustic/backend exec ts-node --transpile-only --project tsconfig.json ../../scripts/update-products-brand-category.ts
```

### 3. Natijalar

Script har bir mahsulotni:
- ✅ Brand'ni topadi yoki yaratadi
- ✅ Kategoriyani topadi yoki yaratadi
- ✅ Catalog'larni topadi va bog'laydi
- ✅ Faqat o'zgargan ma'lumotlarni yangilaydi

## Misol

```bash
$ pnpm run update:products:brand-category

=== Mahsulotlarni brand va kategoriyalar bilan yangilash ===

JSON fayl o'qilmoqda: /path/to/products-to-import.json
✅ 69 ta mahsulot topildi

[1/69] Mahsulot: signia-run-p
  ✓ Brand topildi: Signia (ID: clx...)
  ✓ Kategoriya topildi: Eshitish moslamalari (ID: cly...)
  ✓ 2 ta catalog qo'shildi
  ✅ Mahsulot yangilandi: Signia Run P

...

=== Natijalar ===
✅ Muvaffaqiyatli: 69 ta
⚠️  O'tkazib yuborilgan: 0 ta
❌ Xatoliklar: 0 ta
📊 Jami: 69 ta

✅ Yangilash yakunlandi
```

## Muhim Eslatmalar

1. **Slug majburiy**: Agar mahsulotda `slug` bo'lmasa, u o'tkazib yuboriladi.

2. **Brand'lar**: Agar brand mavjud bo'lmasa, avtomatik yaratiladi.

3. **Kategoriyalar**: Agar kategoriya mavjud bo'lmasa, avtomatik yaratiladi.

4. **Catalog'lar**: Faqat mavjud catalog'lar bog'lanadi. Agar catalog topilmasa, xatolik ko'rsatilmaydi.

5. **Yangilanish**: Faqat o'zgargan ma'lumotlar yangilanadi. Agar ma'lumotlar bir xil bo'lsa, yangilanish o'tkazilmaydi.

## JSON Fayl Formati

Minimal format (faqat brand):

```json
[
  {
    "slug": "signia-run-p",
    "brandName": "Signia"
  }
]
```

To'liq format (brand, kategoriya, catalog'lar):

```json
[
  {
    "slug": "signia-run-p",
    "brandName": "Signia",
    "categoryName": "Eshitish moslamalari",
    "categorySlug": "hearing-aids",
    "catalogSlugs": ["hearing-aids", "signia"]
  }
]
```

## Xatoliklar

Agar xatolik yuzaga kelsa:
- Script xatolikni ko'rsatadi va keyingi mahsulotga o'tadi
- Barcha mahsulotlar yangilanishi tugagach, natijalar ko'rsatiladi
- Muvaffaqiyatli, o'tkazib yuborilgan va xatoliklar soni alohida ko'rsatiladi
