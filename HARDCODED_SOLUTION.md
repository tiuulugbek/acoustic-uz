# Hardcoded Narsalarni Hal Qilish Strategiyasi

## 🎯 Maqsad
Barcha hardcoded qiymatlar, matnlar va konstantalarni dinamik qilish va settings/admin panel orqali boshqarish.

## 📋 Reja

### 1. Settings'ga Yangi Field'lar Qo'shish

#### Prisma Schema'ga qo'shish kerak:
```prisma
model Setting {
  // ... mavjud field'lar
  
  // Yangi field'lar:
  siteName?: String?              // "Acoustic.uz"
  siteDescriptionUz?: String?     // "Eshitish markazi..."
  siteDescriptionRu?: String?     // "Центр слуха..."
  socialLinks?: Json?             // { facebook, instagram, youtube }
}
```

#### Social Links struktura:
```json
{
  "facebook": "https://www.facebook.com/acoustic.uz",
  "instagram": "https://www.instagram.com/acoustic.uz/",
  "youtube": "https://www.youtube.com/@acousticuz"
}
```

### 2. Matnlarni Locales'ga Ko'chirish

#### Hozirgi holat:
- ✅ Ba'zi matnlar `locales/uz.json` va `locales/ru.json` da
- ❌ Ko'p joylarda hali ham hardcoded: `locale === 'ru' ? '...' : '...'`

#### Yechim:
1. Barcha hardcoded matnlarni topish
2. `locales/uz.json` va `locales/ru.json` ga qo'shish
3. Kodda `t('key')` ishlatish

### 3. Fallback'larni Kamaytirish

#### Hozirgi holat:
```typescript
settings?.phonePrimary || '1385'  // Hardcoded fallback
```

#### Yechim:
```typescript
settings?.phonePrimary || settings?.phoneSecondary || ''  // Settings'dan olish
```

### 4. Site Name va URL'larni Settings'dan Olish

#### Hozirgi holat:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
const siteName = 'Acoustic.uz';  // Hardcoded
```

#### Yechim:
```typescript
const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
const siteName = settings?.siteName || 'Acoustic.uz';
```

## 🚀 Amalga Oshirish Qadamlar

### Qadam 1: Prisma Schema'ni Yangilash
1. `prisma/schema.prisma` ga yangi field'lar qo'shish
2. Migration yaratish: `npx prisma migrate dev --name add_site_settings`

### Qadam 2: Backend API'ni Yangilash
1. `SettingsDto` ga yangi field'lar qo'shish
2. Admin panel'da yangi field'lar uchun form qo'shish

### Qadam 3: Frontend'ni Yangilash
1. Barcha hardcoded matnlarni `locales/` ga ko'chirish
2. `getTranslation()` ishlatish
3. Settings'dan siteName, socialLinks olish
4. Fallback'larni kamaytirish

### Qadam 4: Admin Panel'ni Yangilash
1. Settings sahifasiga yangi field'lar qo'shish:
   - Site Name
   - Site Description (UZ/RU)
   - Social Media Links (Facebook, Instagram, YouTube)

## 📊 Prioritet

### Yuqori Prioritet:
1. ✅ **Telefon raqamlari** - Ko'p joylarda qilingan, fallback'larni kamaytirish
2. ⚠️ **Matnlar** - Locales'ga ko'chirish (100+ joy)
3. ⚠️ **Site Name** - Settings'ga ko'chirish (20+ joy)

### O'rtacha Prioritet:
4. ⚠️ **Social Media Links** - Settings'ga ko'chirish (1 joy)
5. ⚠️ **Site Description** - Settings'ga ko'chirish

### Past Prioritet:
6. ⚠️ **API/Site URL'lar** - Environment variable'lar yetarli (fallback'lar normal)

## 💡 Tavsiyalar

### 1. Bosqichma-bosqich
- Avval eng ko'p ishlatilgan narsalarni hal qilish
- Keyin kam ishlatilgan narsalarni

### 2. Test Qilish
- Har bir o'zgarishdan keyin test qilish
- Admin panel'dan o'zgartirib ko'rish

### 3. Backward Compatibility
- Eski kodlar ishlashini ta'minlash
- Fallback'larni saqlab qolish (lekin minimal)

## 🎯 Natija

Hal qilingandan keyin:
- ✅ Barcha matnlar locales'da
- ✅ Site name, description settings'da
- ✅ Social media links settings'da
- ✅ Minimal hardcoded qiymatlar
- ✅ Admin panel orqali barcha narsalarni boshqarish mumkin






