# Admin Panel Yangilash Yo'riqnomasi

## Muammo
Admin panel fayllari `/var/www/acoustic.uz/apps/admin/` papkasida `nobody:nogroup` owner'iga ega va permission muammosi tufayli avtomatik ko'chirib bo'lmayapti.

## Yechim

### 1. Admin panel build qilindi
✅ Build qilingan fayllar: `/root/acoustic.uz/apps/admin/dist/`
✅ Yangi version: `1.0.0.20260123154000`

### 2. Fayllarni qo'lda ko'chirish

Quyidagi buyruqlarni **root** sifatida bajarish kerak:

```bash
cd /root/acoustic.uz

# 1. Owner'ni o'zgartirish
chown root:root /var/www/acoustic.uz/apps/admin/index.html /var/www/acoustic.uz/apps/admin/version.json 2>/dev/null || true

# 2. Eski fayllarni o'chirish
rm -f /var/www/acoustic.uz/apps/admin/index.html /var/www/acoustic.uz/apps/admin/version.json

# 3. Yangi fayllarni ko'chirish
cp apps/admin/dist/index.html /var/www/acoustic.uz/apps/admin/index.html
cp apps/admin/dist/version.json /var/www/acoustic.uz/apps/admin/version.json

# 4. Assets ko'chirish
chown -R root:root /var/www/acoustic.uz/apps/admin/dist 2>/dev/null || true
rm -rf /var/www/acoustic.uz/apps/admin/dist/assets
mkdir -p /var/www/acoustic.uz/apps/admin/dist
cp -r apps/admin/dist/assets /var/www/acoustic.uz/apps/admin/dist/assets

# 5. Permission'lar
chown -R acoustic:acoustic /var/www/acoustic.uz/apps/admin
chmod -R 755 /var/www/acoustic.uz/apps/admin
```

### 3. Browser cache'ni tozalash

Admin panel yangi versiyasini ko'rish uchun browser cache'ni tozalash kerak:

1. **Ctrl+Shift+Delete** → "Cached images and files" → Tozalash
2. Yoki **Ctrl+F5** (hard refresh)
3. Yoki **Incognito/Private mode**'da ochish
4. Yoki **DevTools (F12)** → Network → "Disable cache" belgilash → F5

## Yangilanishlar

✅ `alternativeCoverId` maydoni qo'shildi (Services.tsx)
✅ Logout PATCH endpoint qo'llab-quvvatlanadi (auth.controller.ts)
✅ Yangi version build qilindi: `1.0.0.20260123154000`

## Tekshirish

Version tekshirish:
```bash
cat /var/www/acoustic.uz/apps/admin/version.json
```

Index.html version tekshirish:
```bash
grep -o "__APP_VERSION__='[^']*'" /var/www/acoustic.uz/apps/admin/index.html
```

## Eslatma

Agar permission muammosi davom etsa, fayllarni qo'lda ko'chirish kerak bo'ladi.
