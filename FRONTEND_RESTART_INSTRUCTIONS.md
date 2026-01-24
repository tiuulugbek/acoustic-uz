# Frontend qayta ishga tushirish ko'rsatmasi

## ✅ Tuzatilgan muammolar

1. **getUsefulArticles xatolik** - `getPosts` ga o'zgartirildi
2. **Import yangilandi** - `getUsefulArticles` o'rniga `getPosts` import qilinmoqda
3. **Frontend qayta build qilindi** - Muvaffaqiyatli

## ⚠️ Frontend ishga tushirish muammosi

- Port 3000'da EPERM xatolik (permission muammosi)
- PM2 `acoustic` user'da ishlayapti
- Build fayllarni `/var/www/acoustic.uz` ga ko'chirish kerak

## 🔧 Qayta ishga tushirish qadamlar

### 1. Build fayllarni ko'chirish

```bash
# Build fayllarni /var/www ga ko'chirish
rsync -av --delete /root/acoustic.uz/apps/frontend/.next/ /var/www/acoustic.uz/apps/frontend/.next/

# Permission'ni to'g'rilash
chown -R acoustic:acoustic /var/www/acoustic.uz/apps/frontend/.next
```

### 2. PM2'ni qayta ishga tushirish

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz
pm2 restart acoustic-frontend

# Yoki systemd service orqali
systemctl restart pm2-acoustic
```

### 3. Tekshirish

```bash
# Frontend ishlayaptimi?
curl -I http://localhost:3000

# PM2 status
pm2 list

# Loglar
pm2 logs acoustic-frontend
```

## 📋 Alternativ yechim

Agar PM2 ishlamasa, frontend'ni to'g'ridan-to'g'ri ishga tushirish:

```bash
cd /var/www/acoustic.uz/apps/frontend
NODE_ENV=production PORT=3000 node_modules/.bin/next start
```

## 🎯 Keyingi qadamlar

1. Build fayllarni ko'chirish
2. PM2'ni qayta ishga tushirish
3. Frontend'ni tekshirish
4. Browser'da cache'ni tozalash (Ctrl+Shift+R)
