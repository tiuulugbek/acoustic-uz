# Backend O'chib Qolsa Sahifalar Qanday Ishlaydi?

## 📊 Sahifalar Tasnifi

### ✅ Static Sahifalar (ISR) - Backend O'chib Qolsa Ham Ishlaydi

Bu sahifalar **build vaqtida** HTML sifatida yaratilgan va **cache'da saqlanadi**:

1. **Homepage (`/`)** 
   - `revalidate = 1800` (30 daqiqa)
   - ✅ **Backend o'chib qolsa ham ishlaydi** (cache'dan serve qilinadi)
   - ⚠️ 30 daqiqadan keyin yangilashda muammo bo'ladi

2. **Catalog (`/catalog`)**
   - `revalidate = 1800` (30 daqiqa)
   - ✅ **Backend o'chib qolsa ham ishlaydi** (cache'dan serve qilinadi)

3. **Product Detail (`/products/[slug]`)**
   - `revalidate = 3600` (1 soat)
   - ✅ **Backend o'chib qolsa ham ishlaydi** (cache'dan serve qilinadi)
   - ⚠️ 1 soatdan keyin yangilashda muammo bo'ladi

4. **Service Detail (`/services/[slug]`)**
   - `revalidate = 300` (5 daqiqa)
   - ✅ **Backend o'chib qolsa ham ishlaydi** (cache'dan serve qilinadi)
   - ⚠️ 5 daqiqadan keyin yangilashda muammo bo'ladi

5. **Post Detail (`/posts/[slug]`)**
   - `revalidate = 7200` (2 soat)
   - ✅ **Backend o'chib qolsa ham ishlaydi** (cache'dan serve qilinadi)
   - ⚠️ 2 soatdan keyin yangilashda muammo bo'ladi

**Xulosa:** Bu sahifalar **build vaqtida** HTML sifatida yaratilgan bo'lsa, backend o'chib qolsa ham **cache'dan serve qilinadi** va ishlaydi!

### ⚠️ Dynamic Sahifalar - Backend O'chib Qolsa Fallback UI Ko'rsatadi

Bu sahifalar **har safar** server-side render qilinadi, lekin **error handling** bilan:

1. **Layout (`/layout.tsx`)**
   - `force-dynamic`
   - ✅ **Backend o'chib qolsa ham ishlaydi** (fallback UI)
   - ⚠️ Menu va settings bo'lmaydi

2. **Branch Detail (`/branches/[slug]`)**
   - `force-dynamic`
   - ✅ **Backend o'chib qolsa ham ishlaydi** (fallback UI)
   - ⚠️ Branch ma'lumotlari bo'lmaydi

3. **Contact, About, FAQ, Patients, Children-hearing**
   - `force-dynamic`
   - ✅ **Backend o'chib qolsa ham ishlaydi** (fallback UI)
   - ⚠️ Dynamic kontent bo'lmaydi

4. **Posts List (`/posts`)**
   - `force-dynamic`
   - ✅ **Backend o'chib qolsa ham ishlaydi** (bo'sh ro'yxat)
   - ⚠️ Maqolalar ko'rinmaydi

**Xulosa:** Bu sahifalar **error handling** bilan yozilgan, backend o'chib qolsa ham **sahifa ochiladi**, lekin **ma'lumotlar bo'lmaydi** yoki **fallback UI** ko'rsatiladi.

## 🔍 Qanday Ishlaydi?

### 1. Static Sahifalar (ISR)

```typescript
// Build vaqtida HTML yaratiladi
export const revalidate = 3600; // 1 soat

// Backend o'chib qolsa:
// ✅ Cache'dan eski HTML serve qilinadi
// ✅ Sahifa ochiladi va ishlaydi
// ⚠️ Yangi ma'lumotlar bo'lmaydi
```

### 2. Dynamic Sahifalar (Error Handling)

```typescript
// api-server.ts
async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage?: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // Backend o'chib qolsa fallback qaytaradi
    return fallback;
  }
}

// Sahifada
const product = await getProductBySlug(slug, locale);
// Backend o'chib qolsa: product = null

if (!product) {
  // Fallback UI ko'rsatiladi
  return <div>Mahsulot topilmadi</div>;
}
```

## 📋 Xulosa

### ✅ Backend O'chib Qolsa Ham Ishlaydigan Sahifalar:

1. **Static sahifalar (ISR)** - Cache'dan serve qilinadi
   - Homepage
   - Catalog
   - Product Detail (build vaqtida yaratilgan)
   - Service Detail (build vaqtida yaratilgan)
   - Post Detail (build vaqtida yaratilgan)

2. **Dynamic sahifalar** - Fallback UI ko'rsatadi
   - Layout (menu bo'lmaydi)
   - Branch Detail (ma'lumotlar bo'lmaydi)
   - Contact, About, FAQ (kontent bo'lmaydi)
   - Posts List (bo'sh ro'yxat)

### ⚠️ Cheklovlar:

1. **Static sahifalar:**
   - Revalidate vaqti o'tsa, yangilashda muammo bo'ladi
   - Yangi ma'lumotlar ko'rinmaydi
   - Eski ma'lumotlar ko'rsatiladi

2. **Dynamic sahifalar:**
   - Sahifa ochiladi, lekin ma'lumotlar bo'lmaydi
   - Fallback UI ko'rsatiladi
   - Formlar ishlamaydi (backend kerak)

## 🧪 Test Qilish

### Backend'ni O'chirib Test Qilish:

```bash
# Backend'ni to'xtatish
pm2 stop acoustic-backend

# Static sahifalarni test qilish
curl https://acoustic.uz/                    # Homepage
curl https://acoustic.uz/catalog             # Catalog
curl https://acoustic.uz/products/oticon-own-itc  # Product (build vaqtida yaratilgan)

# Dynamic sahifalarni test qilish
curl https://acoustic.uz/branches/fargona    # Branch (fallback UI)
curl https://acoustic.uz/contact             # Contact (fallback UI)
```

### Kutilgan Natijalar:

1. **Static sahifalar:** ✅ HTML qaytaradi (cache'dan)
2. **Dynamic sahifalar:** ✅ HTML qaytaradi (fallback UI bilan)

## 💡 Tavsiyalar

1. **Monitoring:** Backend status'ni kuzatish
2. **Alerting:** Backend o'chib qolsa bildirish
3. **Fallback:** Static sahifalarni ko'proq qilish
4. **Cache:** ISR revalidate vaqtini uzaytirish

## 🎯 Xulosa

**Ha, backend o'chib qolsa ham ba'zi sahifalar ishlaydi!**

- ✅ **Static sahifalar (ISR)** - Cache'dan serve qilinadi
- ✅ **Dynamic sahifalar** - Fallback UI ko'rsatiladi
- ⚠️ **Cheklovlar** - Yangi ma'lumotlar bo'lmaydi

**Eng yaxshi yondashuv:** Static sahifalarni ko'proq qilish va ISR revalidate vaqtini uzaytirish!

