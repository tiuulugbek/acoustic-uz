# 🚀 Local Development Workflow

## 📂 Struktura

- **Local Development:** `/root/acoustic.uz` - bu yerda kod o'zgartiriladi va build qilinadi
- **Production:** `/var/www/acoustic.uz` - bu yerda ishlayotgan ilova

## 🎯 Workflow

### 1. Local'da ishlash

```bash
# Local development katalogida
cd /root/acoustic.uz

# Kod o'zgartirishlar
# ...

# Build qilish
cd apps/backend
pnpm build

cd ../frontend
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

## 📋 To'liq jarayon

### Variant 1: Backend yangilash

```bash
# 1. Local'da kod o'zgartirish va build
cd /root/acoustic.uz/apps/backend
# ... kod o'zgartirishlar ...
pnpm build

# 2. Build'ni server'ga yuklash
cd /root/acoustic.uz
./deploy/upload-build.sh backend

# 3. Restart
su - acoustic
cd /var/www/acoustic.uz
pm2 restart acoustic-backend
```

### Variant 2: Frontend yangilash

```bash
# 1. Local'da kod o'zgartirish va build
cd /root/acoustic.uz/apps/frontend
# ... kod o'zgartirishlar ...
pnpm build

# 2. Build'ni server'ga yuklash
cd /root/acoustic.uz
./deploy/upload-build.sh frontend

# 3. Restart
su - acoustic
cd /var/www/acoustic.uz
pm2 restart acoustic-frontend
```

## 🔄 Avtomatik workflow skripti

```bash
#!/bin/bash
# Local'da build qilib, server'ga yuklash va restart qilish

APP=$1  # backend, frontend, yoki all

# 1. Local'da build
cd /root/acoustic.uz
if [ "$APP" = "backend" ] || [ "$APP" = "all" ]; then
    cd apps/backend
    pnpm build
    cd ../..
fi

if [ "$APP" = "frontend" ] || [ "$APP" = "all" ]; then
    cd apps/frontend
    pnpm build
    cd ../..
fi

# 2. Server'ga yuklash
./deploy/upload-build.sh $APP

# 3. Restart (acoustic user sifatida)
echo ""
echo "🔄 Restart qilish:"
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
echo "   pm2 restart acoustic-$APP"
```

## ✅ Afzalliklari

- ✅ Local'da ishlash qulay
- ✅ Build local'da tez
- ✅ Server'ga faqat build fayllar yuklanadi
- ✅ Production xavfsiz (source code server'da o'zgartirilmaydi)
- ✅ Rollback oson (eski build'ni saqlash mumkin)

## 📝 Eslatma

- Local'da `node_modules` va `dist` folder'lar mavjud bo'lishi kerak
- Server'da faqat build fayllar (`dist`, `.next`) yuklanadi
- Source code server'da o'zgartirilmaydi
