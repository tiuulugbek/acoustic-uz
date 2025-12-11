# SEO Strategiyasi va Implementatsiya Rejasi

## 📊 Hozirgi SEO Holati

### ✅ Mavjud SEO Elementlar:
1. **Metadata Generation** - Products, Posts, Services sahifalarida
2. **Open Graph Tags** - Products va Posts sahifalarida
3. **Twitter Cards** - Products va Posts sahifalarida
4. **JSON-LD Structured Data** - Products va Organization uchun
5. **Canonical URLs** - Products va Posts sahifalarida
6. **Robots.txt** - Mavjud va to'g'ri konfiguratsiya qilingan
7. **Favicon Support** - Settings dan olinadi
8. **Breadcrumbs** - UI da ko'rsatiladi (lekin structured data yo'q)

### ❌ Yetishmayotgan SEO Elementlar:
1. **Sitemap.xml** - Next.js 14 da `sitemap.ts` fayli yo'q
2. **Breadcrumbs Structured Data** - Faqat products uchun bor
3. **Article Structured Data** - Posts sahifalarida yo'q
4. **FAQ Structured Data** - FAQ sahifasida yo'q
5. **LocalBusiness Structured Data** - Branches sahifalarida yo'q
6. **Canonical URLs** - Barcha sahifalar uchun emas (patients, children-hearing, catalog, etc.)
7. **Open Graph** - Barcha sahifalar uchun emas
8. **hreflang Tags** - To'liq implementatsiya yo'q
9. **Image Alt Tags** - Barcha rasmlarda tekshirilmagan
10. **Internal Linking** - Strategiya yo'q
11. **Page Speed Optimization** - Tekshirilmagan

---

## 🎯 SEO Yaxshilashlar Rejasi

### 1. **Sitemap.xml Yaratish** (PRIORITY: HIGH)

**Maqsad:** Barcha sahifalarni Google va boshqa qidiruv tizimlariga ko'rsatish

**Qilish kerak:**
- `apps/frontend/src/app/sitemap.ts` yaratish
- Barcha sahifalarni qo'shish:
  - Static pages (home, catalog, branches, contact, etc.)
  - Dynamic pages (products, posts, services, branches)
  - Locale alternates (uz/ru)

**Faydalar:**
- Google indexing tezlashtirish
- Barcha sahifalarni topish osonlashadi
- Locale alternates to'g'ri ko'rsatiladi

---

### 2. **Structured Data (JSON-LD) Kengaytirish** (PRIORITY: HIGH)

#### 2.1. Article Structured Data (Posts)
**Qayerda:** `apps/frontend/src/app/posts/[slug]/page.tsx`

**Qo'shish kerak:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article title",
  "image": "cover image",
  "datePublished": "publishAt",
  "dateModified": "updatedAt",
  "author": {
    "@type": "Person",
    "name": "author name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Acoustic.uz",
    "logo": "logo URL"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "post URL"
  }
}
```

#### 2.2. BreadcrumbList Structured Data
**Qayerda:** Barcha sahifalar (products, posts, services, catalog, etc.)

**Qo'shish kerak:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://acoustic.uz"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "https://acoustic.uz/category"
    }
  ]
}
```

#### 2.3. FAQ Structured Data
**Qayerda:** FAQ sahifasi

**Qo'shish kerak:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

#### 2.4. LocalBusiness Structured Data
**Qayerda:** Branches sahifalari

**Qo'shish kerak:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Branch name",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "address",
    "addressLocality": "city",
    "addressCountry": "UZ"
  },
  "telephone": "phone",
  "image": "branch image"
}
```

#### 2.5. Product Structured Data (Yaxshilash)
**Qayerda:** `apps/frontend/src/app/products/[slug]/page.tsx`

**Qo'shish kerak:**
- `aggregateRating` (agar rating bo'lsa)
- `offers` (narx va availability)
- `brand` to'liq ma'lumotlari

---

### 3. **Metadata va Open Graph Kengaytirish** (PRIORITY: HIGH)

**Qilish kerak:**
- Barcha sahifalar uchun `generateMetadata`:
  - `/patients` - Canonical, Open Graph, Twitter Cards
  - `/children-hearing` - Canonical, Open Graph, Twitter Cards
  - `/catalog` - Canonical, Open Graph, Twitter Cards
  - `/branches` - Canonical, Open Graph, Twitter Cards
  - `/contact` - Canonical, Open Graph, Twitter Cards
  - `/faq` - Canonical, Open Graph, Twitter Cards

**Format:**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Page Title — Acoustic.uz",
    description: "Page description",
    alternates: {
      canonical: "https://acoustic.uz/page",
      languages: {
        uz: "https://acoustic.uz/uz/page",
        ru: "https://acoustic.uz/ru/page",
        'x-default': "https://acoustic.uz/page",
      },
    },
    openGraph: {
      title: "Page Title",
      description: "Page description",
      url: "https://acoustic.uz/page",
      siteName: "Acoustic.uz",
      images: [{ url: "image URL", width: 1200, height: 630 }],
      locale: "uz_UZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Page Title",
      description: "Page description",
      images: ["image URL"],
    },
  };
}
```

---

### 4. **hreflang Tags To'liq Implementatsiya** (PRIORITY: MEDIUM)

**Maqsad:** Har bir sahifada to'g'ri locale alternates ko'rsatish

**Qilish kerak:**
- Har bir sahifada `alternates.languages` qo'shish
- Locale detection to'g'ri ishlashini ta'minlash
- Default locale belgilash (`x-default`)

**Format:**
```typescript
alternates: {
  languages: {
    uz: "https://acoustic.uz/uz/page",
    ru: "https://acoustic.uz/ru/page",
    'x-default': "https://acoustic.uz/page",
  },
}
```

---

### 5. **Image Optimization va Alt Tags** (PRIORITY: MEDIUM)

**Maqsad:** Barcha rasmlarda to'g'ri alt text va optimization

**Qilish kerak:**
- Barcha `<Image>` komponentlarida `alt` tekshirish
- Alt textlar mazmunli va descriptive bo'lishi kerak
- Image optimization (Next.js Image component ishlatilmoqda ✅)
- Lazy loading (Next.js avtomatik qiladi ✅)

**Tekshirish kerak:**
- Products images - alt text mavjudmi?
- Posts cover images - alt text mavjudmi?
- Category images - alt text mavjudmi?
- Branch images - alt text mavjudmi?

---

### 6. **Internal Linking Strategiyasi** (PRIORITY: MEDIUM)

**Maqsad:** Sahifalar orasida to'g'ri internal linking

**Qilish kerak:**
- Related posts/products ko'rsatish
- Category pages ga linklar
- Breadcrumbs da linklar
- Footer da muhim sahifalarga linklar
- Sidebar da related content

**Strategiya:**
- Har bir post/product da related content
- Category pages da barcha items
- Homepage da muhim sahifalarga linklar

---

### 7. **Page Speed Optimization** (PRIORITY: MEDIUM)

**Maqsad:** Sahifa yuklanish tezligini yaxshilash

**Qilish kerak:**
- Image optimization (Next.js Image ✅)
- Code splitting (Next.js avtomatik ✅)
- Font optimization
- CSS minification (Next.js avtomatik ✅)
- JavaScript minification (Next.js avtomatik ✅)
- Lazy loading (Next.js avtomatik ✅)

**Tekshirish kerak:**
- Google PageSpeed Insights
- Lighthouse scores
- Core Web Vitals

---

### 8. **Content Optimization** (PRIORITY: LOW)

**Maqsad:** Kontentni SEO uchun optimallashtirish

**Qilish kerak:**
- Title tags - 50-60 belgi
- Meta descriptions - 150-160 belgi
- H1 tags - har bir sahifada bitta
- H2-H6 tags - to'g'ri ierarxiya
- Keyword research va optimization
- Content length - maqolalar uchun 300+ so'z

---

### 9. **Technical SEO** (PRIORITY: LOW)

**Maqsad:** Texnik SEO muammolarini hal qilish

**Qilish kerak:**
- 404 errors tekshirish
- Broken links tekshirish
- Redirects to'g'riligini tekshirish
- SSL sertifikat (mavjud ✅)
- Mobile-friendly (mavjud ✅)
- XML sitemap (yaratish kerak)

---

## 📋 Implementatsiya Tartibi

### Phase 1: Critical SEO (1-2 kun)
1. ✅ Sitemap.xml yaratish
2. ✅ Article Structured Data (Posts)
3. ✅ BreadcrumbList Structured Data (barcha sahifalar)
4. ✅ Metadata va Open Graph (barcha sahifalar)

### Phase 2: Important SEO (2-3 kun)
5. ✅ FAQ Structured Data
6. ✅ LocalBusiness Structured Data (Branches)
7. ✅ hreflang Tags to'liq implementatsiya
8. ✅ Image Alt Tags tekshirish va yaxshilash

### Phase 3: Optimization (1-2 kun)
9. ✅ Internal Linking strategiyasi
10. ✅ Page Speed Optimization
11. ✅ Content Optimization
12. ✅ Technical SEO tekshirish

---

## 🛠️ Qo'shimcha Vositalar

### SEO Tekshirish:
- Google Search Console
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- Schema.org Validator
- Open Graph Debugger (Facebook)
- Twitter Card Validator

### Monitoring:
- Google Analytics
- Google Search Console
- Page Speed monitoring
- Core Web Vitals tracking

---

## 📈 Kutilayotgan Natijalar

1. **Google Indexing:** Barcha sahifalar tezroq indexlanadi
2. **Rich Snippets:** Structured data tufayli rich results ko'rsatiladi
3. **Click-Through Rate:** Yaxshi metadata CTR ni oshiradi
4. **Search Rankings:** SEO optimizatsiyasi ranking ni yaxshilaydi
5. **User Experience:** Tez yuklanish va to'g'ri navigation UX ni yaxshilaydi

---

## ✅ Keyingi Qadamlar

1. **Sitemap.ts yaratish** - Eng muhim va tez natija beradi
2. **Structured Data qo'shish** - Rich snippets uchun
3. **Metadata kengaytirish** - Barcha sahifalar uchun
4. **Testing va Monitoring** - Google Search Console da tekshirish

