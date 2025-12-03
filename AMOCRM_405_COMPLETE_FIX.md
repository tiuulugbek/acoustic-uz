# AmoCRM 405 Xatosini To'liq Hal Qilish

## Muammo

Browser console'da hali ham 405 xatosi chiqmoqda va Network tab'da preflight/fetch so'rovlari ko'rinmoqda.

## Asosiy Sabab

Frontend hali ham eski kod bilan ishlayapti yoki browser cache'da eski kod bor.

## To'liq Yechim

### 1-qadam: Backend'ni Restart Qilish

```bash
cd /var/www/news.acoustic.uz
git pull origin main
pm2 restart acoustic-backend
```

### 2-qadam: Frontend'ni Rebuild Qilish (MUHIM!)

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

### 3-qadam: Browser Cache'ni To'liq Tozalash

1. **Hard Refresh:**
   - **Chrome/Edge:** Ctrl+Shift+R (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Firefox:** Ctrl+F5 (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Safari:** Cmd+Option+R (Mac)

2. **Browser Cache'ni To'liq Tozalash:**
   - **Chrome:** Settings → Privacy → Clear browsing data → "Cached images and files" → Clear data
   - **Firefox:** Settings → Privacy → Clear Data → "Cached Web Content" → Clear

3. **Yoki incognito/private mode'da ochib ko'ring**

### 4-qadam: Backend Log'larni Tekshirish

```bash
# Real-time log'larni ko'rish
bash deploy/check-amocrm-backend-logs.sh

# Yoki manual
pm2 logs acoustic-backend --lines 0 | grep -i "amocrm"
```

### 5-qadam: Tekshirish

1. **Browser console'ni oching** (F12)
2. **Network tab'ni oching**
3. **"Preserve log" ni yoqing**
4. **"Disable cache" ni yoqing**
5. **"AmoCRM'ga ulanish" tugmasini bosing**
6. **Quyidagilarni tekshiring:**
   - `/api/amocrm/authorize` so'rovi yuborilishi kerak
   - Status: 302 (Redirect)
   - Keyin AmoCRM'ga redirect
   - **405 xatosi chiqmasligi kerak**

## Agar Hali Ham Muammo Bo'lsa

### 1. Frontend Build'ni Tekshirish

```bash
# Build fayllarini tekshirish
ls -la apps/admin/dist/

# Yoki rebuild qilish
cd apps/admin
pnpm run build
```

### 2. Browser DevTools'da Tekshirish

1. **Network tab'ni oching**
2. **"Preserve log" ni yoqing**
3. **"Disable cache" ni yoqing**
4. **"AmoCRM'ga ulanish" tugmasini bosing**
5. **Qaysi so'rovlar yuborilayotganini ko'ring:**
   - Agar `/api/amocrm/authorize` so'rovi yuborilsa → Backend redirect qilishi kerak
   - Agar to'g'ridan-to'g'ri AmoCRM URL'ga so'rov yuborilsa → Frontend hali ham eski kod bilan ishlayapti

### 3. Backend Log'larni Tekshirish

```bash
pm2 logs acoustic-backend --lines 100 | grep -i "amocrm\|redirect"
```

Agar log'larda `[AmoCRM] Redirecting to:` ko'rsatilsa, backend to'g'ri ishlayapti.

## Xulosa

**Asosiy muammo:** Frontend hali ham eski kod bilan ishlayapti yoki browser cache'da eski kod bor.

**Yechim:**
1. ✅ Frontend'ni rebuild qilish (pnpm ishlatish kerak)
2. ✅ Browser cache'ni to'liq tozalash
3. ✅ Backend'ni restart qilish
4. ✅ Hard refresh qilish

