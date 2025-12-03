# AmoCRM 405 Xatosining Asosiy Sababi

## Muammo

Browser to'g'ridan-to'g'ri AmoCRM URL'ga GET so'rovi yuborayapti:
```
https://acousticcrm.amocrm.ru/oauth2/authorize?client_id=...&response_type=code&redirect_uri=...
Status: 405 Method Not Allowed
```

## Asosiy Sabab

Browser to'g'ridan-to'g'ri AmoCRM URL'ga so'rov yuborayapti, bu esa shuni anglatadiki:
1. **Frontend hali ham eski kod bilan ishlayapti** (rebuild qilinmagan)
2. **Yoki browser cache'da eski kod bor**
3. **Yoki backend'da redirect to'g'ri ishlamayapti**

## Tekshirish

### 1. Backend Log'larni Tekshirish

Serverda:

```bash
cd /var/www/news.acoustic.uz
pm2 logs acoustic-backend --lines 100 | grep -i "amocrm\|redirect"
```

Agar log'larda `[AmoCRM] Redirecting to:` ko'rsatilsa, backend to'g'ri ishlayapti.

### 2. Frontend Build'ni Tekshirish

```bash
# Build fayllarini tekshirish
ls -la apps/admin/dist/

# Yoki rebuild qilish
cd apps/admin
pnpm run build
```

### 3. Browser DevTools'da Tekshirish

1. **Network tab'ni oching**
2. **"Preserve log" ni yoqing**
3. **"Disable cache" ni yoqing**
4. **"AmoCRM'ga ulanish" tugmasini bosing**
5. **Qaysi so'rovlar yuborilayotganini ko'ring:**
   - Agar `/api/amocrm/authorize` so'rovi yuborilsa → Backend redirect qilishi kerak
   - Agar to'g'ridan-to'g'ri AmoCRM URL'ga so'rov yuborilsa → Frontend hali ham eski kod bilan ishlayapti

## Yechim

### 1. Frontend'ni Rebuild Qilish (MUHIM!)

```bash
cd /var/www/news.acoustic.uz
git pull origin main

# pnpm o'rnatilganligini tekshirish
which pnpm || npm install -g pnpm@8.15.0

# Dependencies o'rnatish
pnpm install

# Admin'ni build qilish
pnpm --filter @acoustic/admin build

# Yoki script bilan
bash deploy/rebuild-admin.sh
```

### 2. Browser Cache'ni To'liq Tozalash

1. **Hard Refresh:** Ctrl+Shift+R (yoki Cmd+Shift+R)
2. **Browser Cache'ni To'liq Tozalash:**
   - Chrome: Settings → Privacy → Clear browsing data → "Cached images and files"
   - Firefox: Settings → Privacy → Clear Data → "Cached Web Content"
3. **Yoki incognito/private mode'da ochib ko'ring**

### 3. Backend'ni Restart Qilish

```bash
pm2 restart acoustic-backend
```

## Agar Hali Ham Muammo Bo'lsa

### AmoCRM Integration'ni Qayta Yaratish

405 xatosi AmoCRM Integration sozlamalarida muammo borligini ham ko'rsatishi mumkin:

1. **AmoCRM'ga kiring:** `https://acousticcrm.amocrm.ru`
2. **Settings → Integrations** ga o'ting
3. **Eski Integration'ni o'chiring**
4. **Yangi "API Integration" yarating:**
   - Nom: "Acoustic.uz Website"
   - Redirect URI: `https://api.acoustic.uz/api/amocrm/callback`
5. **Yangi Client ID va Client Secret ni oling**
6. **Admin panelda yangi ma'lumotlarni kiriting**

## Xulosa

**Asosiy muammo:** Frontend hali ham eski kod bilan ishlayapti yoki browser cache'da eski kod bor.

**Yechim:**
1. ✅ Frontend'ni rebuild qilish (pnpm ishlatish kerak)
2. ✅ Browser cache'ni to'liq tozalash
3. ✅ Backend'ni restart qilish
4. ✅ Hard refresh qilish

