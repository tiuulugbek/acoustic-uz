# Analytics va Statistikalar Sozlash Qo'llanmasi

## Umumiy ma'lumot

Bu qo'llanma sayt statistikalarini olish uchun analytics integratsiyasini sozlash haqida ma'lumot beradi.

## Qo'llab-quvvatlanadigan Analytics Platformalar

1. **Google Analytics 4 (GA4)** - Eng mashhur va keng qo'llaniladi
2. **Yandex Metrika** - O'zbekistonda ham mashhur

## Qanday Statistikalar Olinadi?

### 1. Asosiy Statistikalar
- **Sahifa ko'rishlar** (Page Views) - Qaysi sahifalar ko'rilgani
- **Foydalanuvchilar soni** - Kunlik, haftalik, oylik tashrif buyuruvchilar
- **Sessiyalar** - Har bir foydalanuvchi necha marta tashrif buyurgani
- **Vaqt** - Sahifada qancha vaqt o'tkazilgani

### 2. Qurilma va Texnik Ma'lumotlar
- **Qurilma turi** - Desktop, Tablet, Mobile
- **Operatsion tizim** - Windows, macOS, iOS, Android, Linux
- **Brauzer** - Chrome, Safari, Firefox, Edge, Yandex
- **Ekran o'lchami** - Width x Height
- **Touch device** - Touch qo'llab-quvvatlash yoki yo'qligi

### 3. Geografik Ma'lumotlar
- **Mamlakat** - Qaysi mamlakatdan tashrif buyurilgani
- **Shahar** - Qaysi shahardan tashrif buyurilgani
- **IP manzil** - IP manzil (anonymized)

### 4. Trafik Manbalari
- **Organic Search** - Google, Yandex kabi qidiruv tizimlaridan
- **Direct** - To'g'ridan-to'g'ri kirish
- **Referral** - Boshqa saytlardan kelganlar
- **Social** - Ijtimoiy tarmoqlardan kelganlar

### 5. Maxsus Eventlar (Custom Events)
- **Button clicks** - Tugmalar bosilishi
- **Form submissions** - Formalar to'ldirilishi
- **Phone clicks** - Telefon raqamlariga bosilishi
- **External links** - Tashqi linklarga bosilishi
- **Product views** - Mahsulot sahifalarini ko'rish
- **Branch views** - Filial sahifalarini ko'rish
- **Geolocation usage** - Geolocation funksiyasidan foydalanish
- **Search** - Qidiruv amallari

## Sozlash Qadamlari

### 1. Google Analytics 4 (GA4) Sozlash

1. [Google Analytics](https://analytics.google.com/) ga kiring
2. Yangi property yarating (yoki mavjud property'ni tanlang)
3. **Measurement ID** ni oling (masalan: `G-XXXXXXXXXX`)
4. Admin panelda **Settings > Analytics** bo'limiga kiring
5. **Google Analytics ID** maydoniga Measurement ID ni kiriting
6. **Analytics yoqilgan** checkbox'ni belgilang
7. **Saqlash** tugmasini bosing

### 2. Yandex Metrika Sozlash

1. [Yandex Metrika](https://metrika.yandex.ru/) ga kiring
2. Yangi counter yarating (yoki mavjud counter'ni tanlang)
3. **Counter ID** ni oling (masalan: `12345678`)
4. Admin panelda **Settings > Analytics** bo'limiga kiring
5. **Yandex Metrika ID** maydoniga Counter ID ni kiriting
6. **Analytics yoqilgan** checkbox'ni belgilang
7. **Saqlash** tugmasini bosing

### 3. Admin Panelda Sozlash

1. Admin panelga kiring
2. **Settings** bo'limiga o'ting
3. **Analytics** tab'ini tanlang
4. Quyidagi maydonlarni to'ldiring:
   - **Analytics yoqilgan** - Analytics'ni yoqish/ochirish
   - **Google Analytics ID** - GA4 Measurement ID (masalan: `G-XXXXXXXXXX`)
   - **Yandex Metrika ID** - Yandex Metrika Counter ID (masalan: `12345678`)
5. **Saqlash** tugmasini bosing

## Kodda Event Tracking

### Button Click Tracking

```typescript
import { trackButtonClick } from '@/lib/analytics';

// Button onClick handler'da
const handleClick = () => {
  trackButtonClick('Contact Form Submit', '/contact');
  // ... boshqa kod
};
```

### Form Submission Tracking

```typescript
import { trackFormSubmit } from '@/lib/analytics';

// Form submit handler'da
const handleSubmit = async (values) => {
  try {
    await submitForm(values);
    trackFormSubmit('Contact Form', true); // success
  } catch (error) {
    trackFormSubmit('Contact Form', false); // error
  }
};
```

### Phone Click Tracking

```typescript
import { trackPhoneClick } from '@/lib/analytics';

// Phone link onClick handler'da
const handlePhoneClick = (phone: string) => {
  trackPhoneClick(phone, window.location.pathname);
  window.location.href = `tel:${phone}`;
};
```

### Product View Tracking

```typescript
import { trackProductView } from '@/lib/analytics';

// Product page'da
useEffect(() => {
  if (product) {
    trackProductView(product.slug, product.name);
  }
}, [product]);
```

### Branch View Tracking

```typescript
import { trackBranchView } from '@/lib/analytics';

// Branch page'da
useEffect(() => {
  if (branch) {
    trackBranchView(branch.slug, branch.name);
  }
}, [branch]);
```

### Geolocation Tracking

```typescript
import { trackGeolocationUsed } from '@/lib/analytics';

// Geolocation success handler'da
navigator.geolocation.getCurrentPosition(
  (position) => {
    trackGeolocationUsed(true);
    // ... boshqa kod
  },
  (error) => {
    trackGeolocationUsed(false, error.message);
  }
);
```

## Statistikalarni Ko'rish

### Google Analytics 4

1. [Google Analytics](https://analytics.google.com/) ga kiring
2. Property'ni tanlang
3. **Reports** bo'limiga o'ting
4. Quyidagi statistikalarni ko'rishingiz mumkin:
   - **Realtime** - Real vaqtda tashrif buyuruvchilar
   - **Life cycle** - Foydalanuvchi hayot sikli
   - **User** - Foydalanuvchilar haqida ma'lumot
   - **Events** - Maxsus eventlar
   - **Conversions** - Konversiyalar

### Yandex Metrika

1. [Yandex Metrika](https://metrika.yandex.ru/) ga kiring
2. Counter'ni tanlang
3. Quyidagi statistikalarni ko'rishingiz mumkin:
   - **Overview** - Umumiy ko'rinish
   - **Visitors** - Tashrif buyuruvchilar
   - **Traffic sources** - Trafik manbalari
   - **Content** - Kontent statistikasi
   - **Technology** - Texnik ma'lumotlar
   - **Goals** - Maqsadlar va konversiyalar

## Privacy va GDPR

- Barcha analytics platformalar GDPR va privacy qonunlariga rioya qiladi
- IP manzillar anonymize qilinadi
- Foydalanuvchilar haqida shaxsiy ma'lumotlar to'planmaydi
- Cookie'lar faqat analytics uchun ishlatiladi

## Yordam va Qo'llab-quvvatlash

Agar muammo yuzaga kelsa:

1. Browser console'ni oching (F12)
2. `[Analytics]` loglarini tekshiring
3. Analytics platformalarining dashboard'larida tekshiring
4. Admin panelda analytics sozlamalarini qayta tekshiring

## Muhim Eslatmalar

- Analytics faqat HTTPS protokoli orqali ishlaydi (localhost bundan mustasno)
- Analytics'ni yoqishdan oldin, foydalanuvchilar haqida ma'lumotlar to'planmasligiga ishonch hosil qiling
- Analytics'ni test qilish uchun, real vaqtda (Realtime) ko'rinishidan foydalaning
- Event tracking'ni to'g'ri ishlatish uchun, har bir event'ga mantiqiy nom berish kerak

