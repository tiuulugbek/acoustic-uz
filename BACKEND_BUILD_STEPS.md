# Backend Build - To'g'ri Qadamlar

## ⚠️ Muhim: To'g'ri katalog

**XATO:** `/home/acoustic` da ishlash
**TO'G'RI:** `/var/www/acoustic.uz` da ishlash

## ✅ To'g'ri qadamlar

### Variant 1: Skript orqali (tavsiya etiladi)

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz
./deploy/complete-backend-build.sh
```

### Variant 2: Qo'lda

```bash
# Acoustic user sifatida
su - acoustic

# 1. To'g'ri katalogga o'tish
cd /var/www/acoustic.uz

# 2. Shared package build
pnpm --filter @acoustic/shared build

# 3. Prisma generate
npx prisma@5.22.0 generate --schema=./prisma/schema.prisma

# 4. Backend build
cd apps/backend
pnpm build

# 5. Restart
pm2 restart acoustic-backend

# 6. Tekshirish
pm2 logs acoustic-backend --lines 20
```

## 🔍 Tekshirish

```bash
# Katalog to'g'rimi?
pwd
# Natija: /var/www/acoustic.uz bo'lishi kerak

# Package.json mavjudmi?
ls -la package.json
# Natija: fayl ko'rinishi kerak

# PM2 status
pm2 list

# Backend ishlayaptimi?
curl -I http://localhost:3001/api/health
```

## 📝 Xatoliklar

### "No projects found"
- **Sabab:** Noto'g'ri katalogda
- **Yechim:** `cd /var/www/acoustic.uz`

### "No such file or directory"
- **Sabab:** Noto'g'ri katalogda
- **Yechim:** `cd /var/www/acoustic.uz` keyin `cd apps/backend`

### "No package.json found"
- **Sabab:** Noto'g'ri katalogda
- **Yechim:** `cd /var/www/acoustic.uz`

## 🎯 Eng oson usul

```bash
su - acoustic
cd /var/www/acoustic.uz && ./deploy/complete-backend-build.sh
```
