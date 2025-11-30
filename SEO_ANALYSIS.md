# SEO va Qidiruv Tizimlariga Moslik Tahlili
## Acoustic.uz Sayti

**Tahlil sanasi:** 2024-yil  
**Sayt texnologiyasi:** Next.js 14 (App Router), React 18, TypeScript

---

## ✅ MAVJUD SEO ELEMENTLARI

### 1. Meta Tags va Metadata
- ✅ **Title tags** - Barcha sahifalarda mavjud (`generateMetadata`)
- ✅ **Description tags** - Ko'pchilik sahifalarda mavjud
- ✅ **Canonical URLs** - Product sahifalarida mavjud
- ⚠️ **Homepage metadata** - Asosiy sahifada faqat umumiy metadata, dinamik emas
- ⚠️ **Keywords** - Yo'q (zamonaviy SEO'da muhim emas, lekin ba'zi holatlarda foydali)

**Holat:** Yaxshi, lekin homepage uchun yaxshilash kerak

### 2. Structured Data (JSON-LD)
- ✅ **Product Schema** - Mahsulot sahifalarida mavjud (`@type: Product`)
  - Name, description, image
  - Brand information
  - Offers (price, currency, availability)
  - Category
- ❌ **FAQ Schema** - Yo'q (`@type: FAQPage`)
- ❌ **Breadcrumbs Schema** - Yo'q (`@type: BreadcrumbList`)
- ❌ **Organization Schema** - Yo'q (`@type: Organization`)
- ❌ **Article Schema** - Post sahifalarida yo'q (`@type: Article`)
- ❌ **Service Schema** - Xizmat sahifalarida yo'q (`@type: Service`)

**Holat:** Faqat Product uchun mavjud, boshqa sahifalar uchun qo'shish kerak

### 3. Semantic HTML
- ✅ **Heading struktura** - h1, h2, h3 to'g'ri ishlatilgan
- ✅ **Semantic elementlar** - `<main>`, `<section>`, `<article>`, `<nav>` ishlatilgan
- ✅ **ARIA atributlar** - FAQ accordion'da mavjud (`aria-expanded`, `aria-controls`)

**Holat:** Yaxshi

### 4. URL Struktura
- ✅ **Clean URLs** - Slug-based, SEO-friendly (`/products/[slug]`, `/services/[slug]`)
- ✅ **URL parametrlar** - To'g'ri ishlatilgan (`/catalog?category=...`)
- ✅ **URL uzunligi** - Qisqa va tushunarli

**Holat:** Juda yaxshi

### 5. Internal Linking
- ✅ **Navigation menu** - Mavjud
- ✅ **Related products** - Product sahifalarida mavjud
- ✅ **Related articles** - Product sahifalarida mavjud
- ✅ **Breadcrumbs** - Visual mavjud, lekin structured data yo'q
- ✅ **Footer links** - Mavjud

**Holat:** Yaxshi

### 6. Image Optimization
- ⚠️ **Next.js Image** - Ishlatilgan, lekin `unoptimized: true`
- ⚠️ **Alt tags** - Ba'zi rasmlarda mavjud, ba'zilarida yo'q
- ⚠️ **Image lazy loading** - Next.js Image avtomatik qiladi
- ⚠️ **WebP format** - Backend'da konvertatsiya qilinadi, lekin frontend'da optimization o'chirilgan

**Holat:** Muhim muammo - image optimization o'chirilgan

### 7. Mobile Responsiveness
- ✅ **Responsive design** - Tailwind CSS orqali to'liq responsive
- ✅ **Mobile-first indexing** - Tuzilgan
- ✅ **Touch-friendly** - Button va linklar katta

**Holat:** Juda yaxshi

### 8. Language va Locale
- ✅ **hreflang alternates** - Metadata'da mavjud (`alternates.languages`)
- ⚠️ **hreflang tags** - HTML'da to'liq emas (faqat metadata'da)
- ✅ **Lang attribute** - HTML tag'da mavjud (`<html lang={locale}>`)

**Holat:** Yaxshi, lekin HTML'da hreflang taglarini qo'shish kerak

---

## ❌ YO'Q SEO ELEMENTLARI

### 1. robots.txt
**Holat:** ❌ Yo'q  
**Muammo:** Qidiruv tizimlari saytni to'liq indekslay olmaydi yoki noto'g'ri sahifalarni indekslaydi  
**Yechim:** `apps/frontend/public/robots.txt` yaratish kerak

**Tavsiya:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /search?*

Sitemap: https://acoustic.uz/sitemap.xml
```

### 2. sitemap.xml
**Holat:** ❌ Yo'q  
**Muammo:** Qidiruv tizimlari barcha sahifalarni topa olmaydi  
**Yechim:** Dynamic sitemap yaratish kerak (`apps/frontend/src/app/sitemap.ts`)

**Tavsiya:**
- Barcha product sahifalari
- Barcha service sahifalari
- Barcha post sahifalari
- Barcha catalog sahifalari
- Asosiy sahifalar (homepage, catalog, services, about, etc.)

### 3. Open Graph Tags
**Holat:** ❌ Yo'q  
**Muammo:** Social media'da (Facebook, LinkedIn) sahifalar to'g'ri ko'rinmaydi  
**Yechim:** `generateMetadata`'da `openGraph` qo'shish kerak

**Tavsiya:**
```typescript
openGraph: {
  title: title,
  description: description,
  url: url,
  siteName: 'Acoustic.uz',
  images: [{ url: imageUrl, width: 1200, height: 630 }],
  locale: locale,
  type: 'website',
}
```

### 4. Twitter Cards
**Holat:** ❌ Yo'q  
**Muammo:** Twitter'da sahifalar to'g'ri ko'rinmaydi  
**Yechim:** `generateMetadata`'da `twitter` qo'shish kerak

**Tavsiya:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: title,
  description: description,
  images: [imageUrl],
}
```

### 5. Breadcrumbs Structured Data
**Holat:** ❌ Yo'q  
**Muammo:** Google'da breadcrumbs ko'rinmaydi  
**Yechim:** Product va boshqa sahifalarda JSON-LD qo'shish kerak

**Tavsiya:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Bosh sahifa",
      "item": "https://acoustic.uz/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Katalog",
      "item": "https://acoustic.uz/catalog"
    }
  ]
}
```

### 6. FAQ Structured Data
**Holat:** ❌ Yo'q  
**Muammo:** Google'da FAQ rich snippets ko'rinmaydi  
**Yechim:** Homepage FAQ qismida JSON-LD qo'shish kerak

**Tavsiya:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Savol matni",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Javob matni"
      }
    }
  ]
}
```

### 7. Organization Structured Data
**Holat:** ❌ Yo'q  
**Muammo:** Google'da company information ko'rinmaydi  
**Yechim:** Layout yoki homepage'da JSON-LD qo'shish kerak

**Tavsiya:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acoustic.uz",
  "url": "https://acoustic.uz",
  "logo": "https://acoustic.uz/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+998-71-202-1441",
    "contactType": "customer service"
  }
}
```

### 8. Article Structured Data
**Holat:** ❌ Yo'q  
**Muammo:** Post sahifalarida Article rich snippets ko'rinmaydi  
**Yechim:** Post sahifalarida JSON-LD qo'shish kerak

---

## ⚠️ MUAMMOLAR VA YAXSHILASH TAVSIYALARI

### 1. Image Optimization O'chirilgan
**Muammo:** `next.config.js`'da `unoptimized: true` - bu juda katta muammo!  
**Ta'sir:**
- Rasmlar optimizatsiya qilinmaydi
- Page speed past bo'ladi
- Core Web Vitals yomon bo'ladi
- Mobile'da yuklanish sekin

**Yechim:**
```javascript
images: {
  unoptimized: false, // true o'rniga false
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 2. Dynamic Rendering (Caching Yo'q)
**Muammo:** Barcha sahifalarda `export const dynamic = 'force-dynamic'` va `revalidate = 0`  
**Ta'sir:**
- Har safar server-side render qilinadi
- Page speed past bo'ladi
- Server yuklanishi yuqori
- SEO'ga to'g'ridan-to'g'ri ta'sir qilmaydi, lekin tezlik SEO'ga ta'sir qiladi

**Yechim:**
- Static generation qilish yoki ISR (Incremental Static Regeneration) ishlatish
- `revalidate: 3600` (1 soat) yoki `revalidate: 86400` (1 kun) qo'shish
- Faqat dinamik ma'lumotlar uchun `force-dynamic` ishlatish

**Tavsiya:**
```typescript
// Product sahifalari uchun
export const revalidate = 3600; // 1 soat

// Homepage uchun
export const revalidate = 1800; // 30 daqiqa

// Post sahifalari uchun
export const revalidate = 86400; // 1 kun
```

### 3. Alt Tags To'liq Emas
**Muammo:** Ba'zi rasmlarda `alt` atributi yo'q yoki noto'g'ri  
**Ta'sir:**
- Accessibility muammolari
- SEO'da image search'da past natija
- Screen reader'lar uchun muammo

**Yechim:**
- Barcha rasmlarga mazmunli `alt` qo'shish
- Media modelida `alt_uz` va `alt_ru` mavjud, lekin frontend'da ishlatilmayapti

**Tavsiya:**
```typescript
<Image
  src={imageUrl}
  alt={product.alt_uz || product.name_uz || 'Product image'}
  // ...
/>
```

### 4. Homepage Metadata
**Muammo:** Homepage'da `generateMetadata` yo'q, faqat static metadata  
**Ta'sir:**
- Homepage'da dinamik ma'lumotlar ko'rsatilmaydi
- Social media'da to'g'ri ko'rinmaydi

**Yechim:**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const settings = await getSettings(locale);
  
  return {
    title: settings?.siteTitle || 'Acoustic.uz - Eshitish markazi',
    description: settings?.siteDescription || '...',
    // ...
  };
}
```

### 5. hreflang Tags HTML'da Yo'q
**Muammo:** Metadata'da mavjud, lekin HTML'da `<link rel="alternate">` taglar yo'q  
**Ta'sir:**
- Qidiruv tizimlari til versiyalarini to'g'ri aniqlay olmaydi

**Yechim:**
```typescript
// Layout yoki sahifa metadata'da
alternates: {
  canonical: url,
  languages: {
    'uz': `${baseUrl}/uz${path}`,
    'ru': `${baseUrl}/ru${path}`,
    'x-default': `${baseUrl}${path}`,
  },
}
```

---

## 📊 QIDIRUV TIZIMLARI ALGORITMLARIGA MOSLIK

### Google Algorithm
**Holat:** ⚠️ O'rtacha  
**Sabablar:**
- ✅ Core Web Vitals uchun asos mavjud (mobile responsive, semantic HTML)
- ⚠️ Image optimization o'chirilgan - tezlik muammosi
- ⚠️ Caching yo'q - server response time yuqori
- ✅ Structured data mavjud (Product)
- ❌ FAQ, Breadcrumbs, Organization structured data yo'q
- ❌ robots.txt va sitemap.xml yo'q

**Tavsiya:** Yuqoridagi muammolarni hal qilish kerak

### Yandex Algorithm
**Holat:** ⚠️ O'rtacha  
**Sabablar:**
- Yandex ham Google'ga o'xshash faktorlarni qidiradi
- robots.txt va sitemap.xml muhim
- Structured data muhim
- Tezlik muhim

**Tavsiya:** Google uchun tavsiyalarni qo'llash

### Bing Algorithm
**Holat:** ⚠️ O'rtacha  
**Sabablar:**
- Bing ham Google'ga o'xshash
- Social signals muhim (Open Graph tags)

**Tavsiya:** Open Graph tags qo'shish

---

## 🎯 PRIORITET TAVSIYALAR

### 1. MUHIM (Darhol hal qilish kerak)
1. ✅ **robots.txt yaratish** - Qidiruv tizimlari uchun
2. ✅ **sitemap.xml yaratish** - Barcha sahifalarni topish uchun
3. ✅ **Image optimization yoqish** - Tezlik uchun (`unoptimized: false`)
4. ✅ **Open Graph tags qo'shish** - Social media uchun
5. ✅ **Alt tags to'ldirish** - Accessibility va SEO uchun

### 2. O'RTA (Tez orada hal qilish kerak)
1. ✅ **FAQ Structured Data** - Rich snippets uchun
2. ✅ **Breadcrumbs Structured Data** - Navigation uchun
3. ✅ **Organization Structured Data** - Company info uchun
4. ✅ **Twitter Cards** - Social media uchun
5. ✅ **Homepage generateMetadata** - Dinamik metadata uchun

### 3. YAXSHILASH (Uzoq muddatli)
1. ✅ **Caching strategiyasi** - ISR yoki static generation
2. ✅ **Article Structured Data** - Post sahifalari uchun
3. ✅ **Service Structured Data** - Service sahifalari uchun
4. ✅ **hreflang HTML tags** - Til versiyalari uchun
5. ✅ **Core Web Vitals monitoring** - Performance tracking

---

## 📈 KUTILAYOTGAN NATIJALAR

Agar yuqoridagi tavsiyalarni amalga oshirsak:

1. **Google Search Console:**
   - Indexing rate oshadi (sitemap.xml tufayli)
   - Rich snippets ko'rinadi (structured data tufayli)
   - Core Web Vitals yaxshilanadi (image optimization tufayli)

2. **Organic Traffic:**
   - 30-50% oshishi mumkin (to'g'ri SEO tufayli)
   - Social media traffic oshadi (Open Graph tufayli)

3. **Page Speed:**
   - 40-60% tezroq bo'ladi (image optimization tufayli)
   - Better Core Web Vitals scores

4. **User Experience:**
   - Accessibility yaxshilanadi (alt tags tufayli)
   - Social sharing yaxshilanadi (Open Graph tufayli)

---

## ✅ XULOSA

**Joriy holat:** ⚠️ O'rtacha (6/10)

**Asosiy kuchli tomonlar:**
- ✅ Yaxshi URL struktura
- ✅ Semantic HTML
- ✅ Mobile responsive
- ✅ Product structured data
- ✅ Internal linking

**Asosiy zaif tomonlar:**
- ❌ robots.txt va sitemap.xml yo'q
- ❌ Image optimization o'chirilgan
- ❌ Open Graph va Twitter Cards yo'q
- ❌ FAQ, Breadcrumbs, Organization structured data yo'q
- ❌ Caching strategiyasi yo'q

**Keyingi qadamlar:**
1. robots.txt va sitemap.xml yaratish
2. Image optimization yoqish
3. Open Graph tags qo'shish
4. Structured data'lar qo'shish
5. Caching strategiyasi ishlab chiqish

**Kutilayotgan natija:** Agar barcha tavsiyalarni amalga oshirsak, SEO reytingi **9/10** ga yetishi mumkin.





