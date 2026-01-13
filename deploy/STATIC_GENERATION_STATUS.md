# Static Generation Status (Hybrid Approach)

## 📊 Current Status

### ✅ Static sahifalar (ISR - Incremental Static Regeneration)

Bu sahifalar **build vaqtida** HTML sifatida yaratiladi va **cache'lanadi**. Keyin ma'lum vaqt o'tgach (revalidate) yangilanadi:

1. **Homepage (`/`)** 
   - `revalidate = 1800` (30 daqiqa)
   - Build vaqtida HTML yaratiladi
   - 30 daqiqadan keyin avtomatik yangilanadi

2. **Catalog (`/catalog`)**
   - `revalidate = 1800` (30 daqiqa)
   - Build vaqtida HTML yaratiladi

3. **Product Detail (`/products/[slug]`)**
   - `revalidate = 3600` (1 soat)
   - Har bir mahsulot uchun build vaqtida HTML yaratiladi
   - 1 soatdan keyin yangilanadi

4. **Service Detail (`/services/[slug]`)**
   - `revalidate = 300` (5 daqiqa)
   - Har bir xizmat uchun build vaqtida HTML yaratiladi

5. **Post Detail (`/posts/[slug]`)**
   - `revalidate = 7200` (2 soat)
   - Har bir maqola uchun build vaqtida HTML yaratiladi

### 🔄 Dynamic sahifalar (Server-Side Rendering)

Bu sahifalar **har safar** server-side render qilinadi (cache yo'q):

1. **Layout** (`/layout.tsx`)
   - `force-dynamic` - Locale detection uchun

2. **Branch Detail** (`/branches/[slug]`)
   - `force-dynamic` - Geolocation va real-time ma'lumotlar uchun

3. **Contact, About, FAQ, Patients, Children-hearing**
   - `force-dynamic` - Form va real-time ma'lumotlar uchun

4. **Posts List** (`/posts`)
   - `force-dynamic` - Filter va search uchun

5. **Services List** (`/services`)
   - `force-dynamic` - Filter uchun

6. **Catalog Category** (`/catalog/[slug]`)
   - `force-dynamic` - Filter va search uchun

7. **Doctors, Search, Feedback, Contacts**
   - `force-dynamic` - Real-time ma'lumotlar uchun

## 🎯 Build Output Analysis

Build paytida quyidagilar yaratiladi:

```
Route (app)                              Size     First Load JS
┌ ƒ /                                    3.85 kB         108 kB  ← Static (ISR)
├ ƒ /about                               1.8 kB          106 kB  ← Dynamic
├ ƒ /branches                            10.8 kB         115 kB  ← Dynamic
├ ƒ /branches/[slug]                     4.78 kB         109 kB  ← Dynamic
├ ƒ /catalog                             2.54 kB         106 kB  ← Static (ISR)
├ ƒ /catalog/[slug]                      4 kB            105 kB  ← Dynamic
├ ƒ /products/[slug]                     2.58 kB         114 kB  ← Static (ISR)
├ ƒ /services/[slug]                     2.15 kB         111 kB  ← Static (ISR)
├ ƒ /posts/[slug]                        1.82 kB         113 kB  ← Static (ISR)
└ ○ /sitemap.xml                         0 B                0 B  ← Static
```

**Belgilar:**
- `○` (Static) - Build vaqtida to'liq HTML yaratiladi, cache'lanadi
- `ƒ` (Dynamic) - Har safar server-side render qilinadi

## 📈 Performance Benefits

### Static sahifalar (ISR):
- ⚡ **Tez yuklanish** - HTML allaqachon tayyor
- 💾 **Kam server yuki** - Cache'lanadi
- 🔍 **SEO yaxshi** - HTML allaqachon mavjud
- 📊 **Analytics** - Build vaqtida ma'lumotlar olinadi

### Dynamic sahifalar:
- 🔄 **Real-time ma'lumotlar** - Har safar yangi ma'lumotlar
- 📍 **Geolocation** - Foydalanuvchi joylashuviga qarab
- 🔍 **Search va Filter** - Real-time natijalar
- 📝 **Formlar** - Real-time validation

## 🚀 Optimization Recommendations

### 1. Static sahifalarni ko'paytirish:

```typescript
// /about/page.tsx - Static qilish
export const revalidate = 3600; // 1 soat

// /faq/page.tsx - Static qilish  
export const revalidate = 3600; // 1 soat
```

### 2. Dynamic sahifalarni ISR'ga o'tkazish:

```typescript
// /branches/[slug]/page.tsx - ISR qilish
export const revalidate = 1800; // 30 daqiqa
// export const dynamic = 'force-dynamic'; // ← O'chirish
```

### 3. Build vaqtida static params generate qilish:

```typescript
// /products/[slug]/page.tsx
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}
```

## 📋 Current Build Output

Build paytida quyidagi sahifalar **static HTML** sifatida yaratiladi:

1. ✅ Homepage (`/`)
2. ✅ Catalog (`/catalog`)
3. ✅ Product pages (`/products/[slug]`) - build vaqtida barcha mahsulotlar uchun
4. ✅ Service pages (`/services/[slug]`) - build vaqtida barcha xizmatlar uchun
5. ✅ Post pages (`/posts/[slug]`) - build vaqtida barcha maqolalar uchun
6. ✅ Sitemap (`/sitemap.xml`)

Qolgan sahifalar **dynamic** - har safar server-side render qilinadi.

## 🔧 How to Check Static vs Dynamic

Serverda quyidagilarni tekshiring:

```bash
# Build output'ni ko'rish
cd /var/www/acoustic.uz/apps/frontend
ls -la .next/server/app/

# Static HTML fayllarni ko'rish
find .next/server/app -name "*.html" -type f

# Dynamic route'lar (server.js ichida)
grep -r "force-dynamic" src/app/
```

## 📊 Summary

**Static (ISR):** ~5 sahifa turi, lekin ko'p sonli sahifalar (barcha mahsulotlar, xizmatlar, maqolalar)
**Dynamic:** ~15 sahifa turi, real-time ma'lumotlar talab qiladi

**Hybrid approach ishlayapti:**
- Static sahifalar tez yuklanadi va SEO yaxshi
- Dynamic sahifalar real-time ma'lumotlar bilan ishlaydi
- ISR bilan static sahifalar avtomatik yangilanadi

