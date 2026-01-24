# Admin Panel 404 Xatolikni Tuzatish

## Muammo
Browser `index-BGoCWWAa.js` faylini yuklayapti, lekin yangi build'da `index-lde8hPtc.js` mavjud. Bu browser cache muammosi.

## Yechim

### 1. Admin panel fayllarini to'liq yangilash (root sifatida)

```bash
# Root sifatida bajarish kerak
chown -R root:root /var/www/acoustic.uz/apps/admin
rm -rf /var/www/acoustic.uz/apps/admin/dist
cp -r /root/acoustic.uz/apps/admin/dist /var/www/acoustic.uz/apps/admin/dist
cp /root/acoustic.uz/apps/admin/dist/index.html /var/www/acoustic.uz/apps/admin/index.html
cp /root/acoustic.uz/apps/admin/dist/version.json /var/www/acoustic.uz/apps/admin/version.json 2>/dev/null || true
chown -R acoustic:acoustic /var/www/acoustic.uz/apps/admin
chmod -R 755 /var/www/acoustic.uz/apps/admin
```

### 2. Nginx reload

```bash
systemctl reload nginx
```

### 3. Browser cache'ni tozalash (MUHIM!)

Quyidagi usullardan birini ishlatish kerak:

1. **Hard Refresh (Eng oson):**
   - Windows/Linux: `Ctrl + F5` yoki `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **DevTools orqali:**
   - `F12` bosib DevTools ochish
   - Network tab'ga o'tish
   - "Disable cache" checkbox'ni belgilash
   - `F5` bosib sahifani yangilash

3. **Browser cache'ni tozalash:**
   - `Ctrl + Shift + Delete`
   - "Cached images and files" tanlash
   - "Clear data" bosish

4. **Incognito/Private mode:**
   - Yangi incognito/private window ochish
   - `https://admin.acoustic.uz` ga kirish

## Tekshirish

Yangilashdan keyin:
- Browser console'da xatoliklar bo'lmasligi kerak
- Admin panel to'g'ri yuklanishi kerak
- Version: `1.0.0.20260123154000` ko'rinishi kerak

## Nginx Konfiguratsiya

Nginx to'g'ri sozlangan:
- Root: `/var/www/acoustic.uz/apps/admin/dist`
- Assets: `/assets/` location bilan
- Index.html: cache disabled (no-cache headers)
- SPA routing: barcha route'lar `index.html` ga yo'naltiriladi
