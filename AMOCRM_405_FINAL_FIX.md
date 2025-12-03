# AmoCRM 405 Xatosini Hal Qilish - Final Yechim

## Muammo

Browser console'da hali ham 405 xatosi chiqmoqda:
```
GET https://acousticcrm.amocrm.ru/oauth2/authorize?... net::ERR_HTTP_RESPONSE_CODE_FAILURE 405 (Method Not Allowed)
```

## Sabab

Frontend hali ham eski kod bilan ishlayapti yoki browser cache'da eski kod bor.

## Yechim

### 1. Frontend'ni Rebuild Qilish

**Serverda:**

```bash
cd /var/www/news.acoustic.uz
git pull origin main

# Frontend'ni rebuild qilish
cd apps/admin
npm run build

# Yoki bitta script bilan
bash deploy/rebuild-admin.sh
```

### 2. Browser Cache'ni Tozalash

1. **Hard Refresh:**
   - **Chrome/Edge:** Ctrl+Shift+R (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Firefox:** Ctrl+F5 (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Safari:** Cmd+Option+R (Mac)

2. **Yoki incognito/private mode'da ochib ko'ring**

3. **Yoki browser cache'ni to'liq tozalang:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data

### 3. Kod O'zgarishlari

**Frontend (`Settings.tsx`):**
- ❌ `getAmoCRMAuthUrl()` - o'chirildi
- ✅ `window.location.href = '/api/amocrm/authorize'` - to'g'ridan-to'g'ri browser redirect

**Backend (`amocrm.controller.ts`):**
- ✅ `res.redirect(authUrl)` - to'g'ridan-to'g'ri redirect

## Tekshirish

1. **Browser console'ni oching** (F12)
2. **Network tab'ni oching**
3. **"AmoCRM'ga ulanish" tugmasini bosing**
4. **Quyidagilarni tekshiring:**
   - `/api/amocrm/authorize` so'rovi yuborilishi kerak
   - Keyin 302 redirect AmoCRM'ga
   - **405 xatosi chiqmasligi kerak**

## Agar Hali Ham Muammo Bo'lsa

### 1. Backend Log'larni Tekshirish

```bash
pm2 logs acoustic-backend --lines 50 | grep -i "amocrm"
```

### 2. Frontend Build'ni Tekshirish

```bash
# Admin build fayllarini tekshirish
ls -la apps/admin/dist/

# Yoki rebuild qilish
cd apps/admin
npm run build
```

### 3. Browser DevTools'da Tekshirish

1. **Network tab'ni oching**
2. **"Preserve log" ni yoqing**
3. **"AmoCRM'ga ulanish" tugmasini bosing**
4. **Qaysi so'rovlar yuborilayotganini ko'ring:**
   - Agar `/api/amocrm/authorize` so'rovi yuborilsa → Backend redirect qilishi kerak
   - Agar to'g'ridan-to'g'ri AmoCRM URL'ga so'rov yuborilsa → Frontend hali ham eski kod bilan ishlayapti

## Xulosa

**POST so'rovi yuborish noto'g'ri** - OAuth endpoint'i faqat GET so'rovlarini qabul qiladi.

**To'g'ri yechim:**
1. Frontend'ni rebuild qilish
2. Browser cache'ni tozalash
3. To'g'ridan-to'g'ri browser redirect ishlatish

