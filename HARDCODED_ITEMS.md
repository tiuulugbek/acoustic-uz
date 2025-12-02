# Frontend'dagi Hardcoded Narsalar

## 📞 Telefon Raqamlari

### 1. `apps/frontend/src/lib/api-server.ts` (fallback)
```typescript
phonePrimary: '1385',
phoneSecondary: '+998 71 202 14 41',
```

### 2. `apps/frontend/src/components/site-header.tsx`
```typescript
// Fallback qiymatlar
settings?.phonePrimary || '1385'
settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'
href="tel:+998712021441"
<Phone size={16} /> 1385
```

### 3. `apps/frontend/src/app/page.tsx`
```typescript
phoneNumber={settingsData?.phonePrimary || '1385'}
phoneLink={settingsData?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}
```

### 4. `apps/frontend/src/components/homepage/hero-slider.tsx`
```typescript
phoneNumber = '1385'
phoneLink = '+998712021441'
```

### 5. `apps/frontend/src/app/layout.tsx`
```typescript
const phonePrimary = settings?.phonePrimary || '+998-71-202-1441';
```

## 🌐 URL'lar va Domain'lar

### 1. API Base URL (ko'p joylarda)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

**Joylashuvi:**
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/catalog/page.tsx`
- `apps/frontend/src/app/branches/page-content.tsx`
- `apps/frontend/src/app/branches/[slug]/page.tsx`
- `apps/frontend/src/app/services/[slug]/page.tsx`
- `apps/frontend/src/components/sidebar.tsx`

### 2. Site Base URL
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
```

**Joylashuvi:**
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/app/products/[slug]/page.tsx`
- `apps/frontend/src/app/posts/[slug]/page.tsx`
- `apps/frontend/src/app/services/[slug]/page.tsx`
- `apps/frontend/src/app/catalog/[slug]/page.tsx`
- `apps/frontend/src/app/catalog/page.tsx`
- `apps/frontend/src/app/sitemap.ts`

### 3. Site Name
```typescript
'Acoustic.uz'
```

**Joylashuvi:**
- Ko'p joylarda metadata, title, description'da

## 📝 Hardcoded Matnlar

### 1. Locale tekshiruvlari (ko'p joylarda)
```typescript
locale === 'ru' ? 'Главная' : 'Bosh sahifa'
locale === 'ru' ? 'Услуги' : 'Xizmatlar'
locale === 'ru' ? 'Каталог' : 'Katalog'
```

**Muammo:** Ba'zi joylarda `locales/uz.json` va `locales/ru.json` ishlatilgan, ba'zilarida esa to'g'ridan-to'g'ri hardcoded.

**Joylashuvi:**
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/catalog/[slug]/page.tsx`
- `apps/frontend/src/app/services/[slug]/page.tsx`
- `apps/frontend/src/app/posts/[slug]/page.tsx`
- `apps/frontend/src/components/site-header.tsx`
- va boshqa ko'p joylar

### 2. Placeholder SVG'lar
```typescript
const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`;
```

**Joylashuvi:**
- `apps/frontend/src/app/products/[slug]/page.tsx`
- `apps/frontend/src/app/catalog/[slug]/page.tsx`

## 🔗 Social Media Linklar

### `apps/frontend/src/app/layout.tsx`
```typescript
'https://www.facebook.com/acoustic.uz',
'https://www.instagram.com/acoustic.uz/',
'https://www.youtube.com/@acousticuz',
```

## 📱 Telefon Mask

### `apps/frontend/src/components/appointment-form.tsx`
```typescript
// Phone number mask function for Uzbekistan (+998)
if (cleanDigits.length === 0) return '+998 ';
if (cleanDigits.length <= 2) return `+998 ${cleanDigits}`;
// ...
const [phone, setPhone] = useState('+998 ');
placeholder="+998 90 123 45 67"
```

## 🗺️ Map URL'lar

### `apps/frontend/src/app/branches/[slug]/page.tsx`
```typescript
`https://yandex.com/maps/?pt=${branch.longitude},${branch.latitude}&z=16&l=map`
`https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`
`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}&hl=${locale === 'ru' ? 'ru' : 'uz'}&z=16&output=embed`
```

## 📊 Xulosa

### Eng ko'p ishlatilgan hardcoded qiymatlar:
1. **Telefon raqamlari** - 10+ joyda
2. **API Base URL** - 7+ joyda
3. **Site Base URL** - 8+ joyda
4. **Locale matnlari** - 100+ joyda (ba'zilari JSON'da, ba'zilari hardcoded)
5. **Site Name** - 20+ joyda

### Tavsiyalar:
1. ✅ Telefon raqamlarini `settings` dan olish (ko'p joylarda qilingan)
2. ⚠️ API va Site URL'larni environment variable'lar orqali boshqarish (qilingan, lekin fallback'lar hardcoded)
3. ⚠️ Barcha matnlarni `locales/uz.json` va `locales/ru.json` ga ko'chirish
4. ⚠️ Site name'ni settings'ga ko'chirish
5. ⚠️ Social media linklarini settings'ga ko'chirish






