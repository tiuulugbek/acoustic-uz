# Backend Build Xatolik Tuzatildi

## ✅ Bajarilgan ishlar

1. **Prisma Schema yangilandi:**
   - `/var/www/acoustic.uz/prisma/schema.prisma` ga `alternativeCover` maydoni qo'shildi
   - Service modeliga `alternativeCoverId` va `alternativeCover` relation qo'shildi
   - Media modeliga `servicesAlternative` relation qo'shildi

2. **Root versiyada build muvaffaqiyatli:**
   - `/root/acoustic.uz/apps/backend` da build qilindi
   - Barcha TypeScript xatoliklari tuzatildi

## ⚠️ Qolgan qadamlar (Permission muammosi tufayli)

Production'da (`/var/www/acoustic.uz`) fayllar `nobody:nogroup` user'iga tegishli. Quyidagi qadamlarni **acoustic user** sifatida bajarish kerak:

### 1. Prisma Client'ni yangilash

```bash
# Acoustic user sifatida kirish
su - acoustic
# Yoki SSH orqali: ssh acoustic@server

cd /var/www/acoustic.uz
npx prisma@5.22.0 generate --schema=./prisma/schema.prisma
```

### 2. Backend'ni build qilish

```bash
cd /var/www/acoustic.uz/apps/backend
pnpm build
```

### 3. Yoki root'da build qilingan fayllarni ko'chirish

Agar root'da build qilingan bo'lsa:

```bash
# Root sifatida
cd /root/acoustic.uz
rsync -av --delete apps/backend/dist/ /var/www/acoustic.uz/apps/backend/dist/

# Permission'ni to'g'rilash
chown -R nobody:nogroup /var/www/acoustic.uz/apps/backend/dist
```

### 4. PM2'ni restart qilish

```bash
# Acoustic user sifatida
pm2 restart acoustic-backend

# Yoki
cd /var/www/acoustic.uz
pm2 restart acoustic-backend
```

## 🔍 Tekshirish

```bash
# Backend ishlayaptimi?
curl -I http://localhost:3001/api/health

# PM2 status
pm2 list

# Loglar
pm2 logs acoustic-backend --lines 50
```

## 📝 Xulosa

- ✅ Schema yangilandi
- ✅ Root'da build muvaffaqiyatli
- ⚠️ Production'ga ko'chirish va restart qilish kerak (acoustic user sifatida)
