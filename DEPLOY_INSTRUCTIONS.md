# Admin Panel Rebuild Qo'llanmasi

## Serverda quyidagi buyruqlarni ketma-ket bajaring:

```bash
# 1. Project directory'ga o'ting
cd /var/www/news.acoustic.uz

# 2. Yangi kodlarni oling
git pull origin main

# 3. Admin panelni rebuild qiling
bash deploy/deploy-admin-build.sh --rebuild
```

## Build vaqtida quyidagilar ko'rinishi kerak:

- `[Vite Config] Generated version: 1.0.0.20251203130420.4e15e0d` - versiya generatsiya qilingan
- `[Vite Config] Version written to: .../version.json` - versiya faylga yozilgan
- `✅ Build verified - no localhost:3001 found` - build to'g'ri
- `📋 Version in build: 1.0.0.20251203130420.4e15e0d` - build faylida versiya

## Keyin browser'da:

1. **Console'ni oching** (F12 yoki Ctrl+Shift+I)
2. **Console'da quyidagilarni tekshiring:**
   - `[AdminLayout] APP_VERSION:` - versiya ko'rsatilishi kerak
   - `[AdminLayout] BUILD_TIME:` - build time ko'rsatilishi kerak

3. **Admin panelga kiring:** `https://admins.acoustic.uz`

4. **Tekshiring:**
   - Header'da versiya badge'i yangi versiyani ko'rsatishi kerak
   - Footer'da ham yangi versiya va build time ko'rinishi kerak
   - Settings sahifasida "Telegram sozlamalari" tab'i ko'rinishi kerak

## Agar versiya hali ham eski bo'lsa:

1. **Browser cache'ni to'liq tozalang:**
   - Chrome: Ctrl+Shift+Delete → "Cached images and files" → "All time" → Clear
   - Yoki: DevTools → Application tab → Clear storage → Clear site data

2. **Yoki incognito mode'da ochib ko'ring**

3. **Build log'ni tekshiring** - versiya generatsiya qilingan-yu qilinganini ko'ring

