# ✅ Production Setup - To'liq Tushuntirish

## 📂 Hozirgi holat

**✅ Ikkalasi ham production'da:**
- Frontend: `/var/www/acoustic.uz/apps/frontend` (Port 3002)
- Backend: `/var/www/acoustic.uz/apps/backend` (Port 3001)

**✅ Local development:**
- `/root/acoustic.uz` - bu yerda kod o'zgartiriladi va build qilinadi

## 🎯 Workflow: Local → Production

### 1. Local'da ishlash va build qilish

```bash
# Local development katalogida
cd /root/acoustic.uz

# Backend o'zgartirish va build
cd apps/backend
# ... kod o'zgartirishlar ...
pnpm build

# Frontend o'zgartirish va build
cd ../frontend
# ... kod o'zgartirishlar ...
pnpm build
```

### 2. Build fayllarni server'ga yuklash

```bash
# Root sifatida
cd /root/acoustic.uz

# Backend build yuklash
./deploy/upload-build.sh backend

# Frontend build yuklash
./deploy/upload-build.sh frontend

# Yoki hammasini birga
./deploy/upload-build.sh all
```

### 3. Production'da restart qilish

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz

# Backend restart
pm2 restart acoustic-backend

# Frontend restart
pm2 restart acoustic-frontend

# Yoki hammasini
pm2 restart all
```

## 🚀 Tezkor Deploy (Barcha qadamlarni birga)

```bash
# Root sifatida
cd /root/acoustic.uz

# Backend: build + upload + restart
./deploy/deploy-local-build.sh backend

# Frontend: build + upload + restart
./deploy/deploy-local-build.sh frontend

# Hammasi: build + upload (restart qo'lda)
./deploy/deploy-local-build.sh all
```

## 📋 Yakuniy qadamlar (hozir)

### 1. Production'ni to'liq build qilish

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz

# To'liq build
./deploy/build-all.sh

# Yoki qo'lda:
pnpm --filter @acoustic/shared build
npx prisma@5.22.0 generate --schema=./prisma/schema.prisma
npx prisma@5.22.0 migrate deploy --schema=./prisma/schema.prisma
cd apps/backend && pnpm build
cd ../frontend && pnpm build
pm2 start deploy/ecosystem.config.js
```

### 2. Tekshirish

```bash
pm2 list
pm2 logs acoustic-backend --lines 20
pm2 logs acoustic-frontend --lines 20
curl -I http://localhost:3001/api/health
curl -I http://localhost:3002
```

## 🎯 Keyingi o'zgarishlar uchun

### Backend yangilash:
```bash
# 1. Local'da
cd /root/acoustic.uz/apps/backend
# Kod o'zgartirish
pnpm build

# 2. Upload
cd /root/acoustic.uz
./deploy/upload-build.sh backend

# 3. Restart
su - acoustic
cd /var/www/acoustic.uz
pm2 restart acoustic-backend
```

### Frontend yangilash:
```bash
# 1. Local'da
cd /root/acoustic.uz/apps/frontend
# Kod o'zgartirish
pnpm build

# 2. Upload
cd /root/acoustic.uz
./deploy/upload-build.sh frontend

# 3. Restart
su - acoustic
cd /var/www/acoustic.uz
pm2 restart acoustic-frontend
```

## ✅ Afzalliklari

- ✅ Local'da ishlash qulay va tez
- ✅ Server'ga faqat build fayllar yuklanadi (tez)
- ✅ Production xavfsiz (source code o'zgartirilmaydi)
- ✅ Rollback oson
- ✅ Development va production ajratilgan

## 📝 Xulosa

- ✅ Ikkalasi ham production'da
- ✅ Local development workflow sozlandi
- ✅ Build va upload skriptlari tayyor
- ⚠️  Hozir production'ni to'liq build qilish kerak
