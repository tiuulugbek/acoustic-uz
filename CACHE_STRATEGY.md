# Cache Strategiyasi - Backend Yongan va Yonmagan Holatlar

## Maqsad
Frontend'ni backend yongan va yonmagan holatlarda ham optimal ishlashini ta'minlash.

## Ishlash Prinsipi

### 1. Backend Yongan Holatda

#### Cache Yangi (revalidate vaqti o'tmagan)
```
Frontend so'rovi → unstable_cache → Cache'dan o'qadi → Tez javob
```
- Backend'ga so'rov yuborilmaydi
- Tez javob (cache'dan o'qish)
- Minimal yuklanish

#### Cache Eskirgan (revalidate vaqti o'tgan)
```
Frontend so'rovi → unstable_cache → Eski cache'ni qaytaradi (tez)
                                    ↓ (background)
                                    Backend'dan yangilashga harakat
                                    ↓
                                    Cache yangilanadi
```
- Avval eski cache qaytariladi (tez javob)
- Background'da yangilashga harakat qiladi
- Keyingi so'rovda yangi ma'lumot qaytariladi

### 2. Backend Yonmagan Holatda

#### Cache Mavjud
```
Frontend so'rovi → unstable_cache → Cache'dan o'qadi → Eski ma'lumotlar
```
- Cache'dan o'qadi (eski ma'lumotlar)
- Sahifa ishlaydi (xato bermaydi)
- Foydalanuvchi ma'lumotlarni ko'radi

#### Cache Bo'sh
```
Frontend so'rovi → unstable_cache → Fallback qaytaradi → Bo'sh ma'lumotlar
```
- Fallback qaytaradi (bo'sh ma'lumotlar)
- Sahifa ishlaydi (xato bermaydi)
- Foydalanuvchi "Ma'lumotlar tez orada qo'shiladi" ko'radi

## Texnik Detallar

### `unstable_cache` Ishlashi

```typescript
const cachedApiCall = unstable_cache(
  async () => {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      // Backend down - return fallback
      // unstable_cache will use stale cache if available
      return fallback;
    }
  },
  [cacheKey],
  {
    revalidate: 1800, // 30 minutes
    tags: [cacheKey],
  }
);
```

### `unstable_cache` Xususiyatlari

1. **Stale-While-Revalidate**: Cache eskirgan bo'lsa ham, avval eski cache'ni qaytaradi, keyin background'da yangilaydi
2. **Error Handling**: Funksiya xato qaytarsa, stale cache'dan o'qishga harakat qiladi
3. **Automatic Revalidation**: `revalidate` vaqti o'tgandan keyin avtomatik yangilaydi

## Revalidate Vaqti

- **Homepage**: 30 daqiqa (1800 soniya)
- **Products**: 1 soat (3600 soniya)
- **Services**: 1 soat (3600 soniya)
- **Posts**: 2 soat (7200 soniya)

## Afzalliklari

1. ✅ **Tez ishlaydi**: Cache'dan o'qish tez
2. ✅ **Backend down bo'lsa ham ishlaydi**: Cache'dan o'qadi
3. ✅ **Minimal yuklanish**: Backend'ga faqat cache eskirganda so'rov
4. ✅ **Xato bermaydi**: Fallback har doim mavjud
5. ✅ **Yangilanish**: Background'da avtomatik yangilanadi

## Cheklovlari

1. ⚠️ **Eski ma'lumotlar**: Backend down bo'lsa, eski cache ko'rsatiladi
2. ⚠️ **Birinchi yuklanish**: Cache bo'sh bo'lsa, fallback ko'rsatiladi
3. ⚠️ **Revalidate vaqti**: Ma'lumotlar revalidate vaqti o'tguncha yangilanmaydi

## Yaxshilashlar

1. **Cache Warming**: Server start bo'lganda cache'ni to'ldirish
2. **Manual Invalidation**: Admin panel orqali cache'ni yangilash
3. **Cache Monitoring**: Cache holatini kuzatish
4. **Adaptive Revalidation**: Backend yuklanishiga qarab revalidate vaqtini o'zgartirish

