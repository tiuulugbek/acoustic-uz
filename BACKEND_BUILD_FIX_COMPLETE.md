# Backend Build Xatolik - To'liq Tuzatish

## ✅ Bajarilgan ishlar

1. **Prisma Schema yangilandi:**
   - `/var/www/acoustic.uz/prisma/schema.prisma` ga `alternativeCover` maydoni qo'shildi
   - Service modeliga `alternativeCoverId` va `alternativeCover` relation qo'shildi
   - Media modeliga `servicesAlternative` relation qo'shildi

2. **Shared Package Schema yangilandi:**
   - `/var/www/acoustic.uz/packages/shared/src/schemas/content.ts` ga `alternativeCoverId` qo'shildi

## ⚠️ Qolgan qadamlar (Permission muammosi tufayli)

Production'da (`/var/www/acoustic.uz`) fayllar `nobody:nogroup` user'iga tegishli. Quyidagi qadamlarni **acoustic user** sifatida bajarish kerak:

### 1. Shared Package'ni build qilish

```bash
# Acoustic user sifatida kirish
su - acoustic
# Yoki SSH orqali: ssh acoustic@server

cd /var/www/acoustic.uz
pnpm --filter @acoustic/shared build
```

### 2. Prisma Client'ni yangilash

```bash
cd /var/www/acoustic.uz
npx prisma@5.22.0 generate --schema=./prisma/schema.prisma
```

### 3. Backend'ni build qilish

```bash
cd /var/www/acoustic.uz/apps/backend
pnpm build
```

### 4. PM2'ni restart qilish

```bash
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

- ✅ Schema yangilandi (Prisma va Shared)
- ⚠️ Shared package rebuild qilish kerak (acoustic user sifatida)
- ⚠️ Prisma Client yangilash kerak
- ⚠️ Backend rebuild qilish kerak
- ⚠️ PM2 restart qilish kerak

## 🎯 Barcha qadamlarni birga bajarish

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz

# 1. Shared package build
pnpm --filter @acoustic/shared build

# 2. Prisma generate
npx prisma@5.22.0 generate --schema=./prisma/schema.prisma

# 3. Backend build
cd apps/backend
pnpm build

# 4. Restart
pm2 restart acoustic-backend

# 5. Tekshirish
pm2 logs acoustic-backend --lines 20
```
