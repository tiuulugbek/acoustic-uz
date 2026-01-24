# 🏗️ Deployment Strukturasi va Yangilanish Jarayoni

## 📂 Loyiha Strukturasi

### 1. **Development/Edit Joylashuvi** (Kod o'zgartirish)
```
/root/acoustic.uz/
├── apps/
│   ├── frontend/     # Frontend kodi (bu yerda o'zgartiriladi)
│   ├── backend/     # Backend kodi (bu yerda o'zgartiriladi)
│   └── admin/        # Admin panel kodi
├── packages/
│   └── shared/       # Umumiy paketlar
└── prisma/           # Database schema
```

### 2. **Production/Ishlayotgan Joylashuv** (Ishlayotgan ilova)
```
/var/www/acoustic.uz/
├── apps/
│   ├── frontend/     # ✅ ISHLAYOTGAN Frontend (bu yerda ishlayapti)
│   ├── backend/      # ✅ ISHLAYOTGAN Backend (bu yerda ishlayapti)
│   └── admin/        # ✅ ISHLAYOTGAN Admin panel
└── deploy/           # Deploy skriptlar
```

## ⚠️ MUAMMO: Nima uchun kod yangilanmaydi?

**Sabab:**
- Kod `/root/acoustic.uz` da o'zgartiriladi
- Lekin ishlayotgan ilova `/var/www/acoustic.uz` da
- O'zgarishlar avtomatik ko'chirilmaydi!

## 🔄 Yangilanish Jarayoni

### Frontend yangilash:

```bash
# 1. Kod o'zgartirish (agar /root/acoustic.uz da ishlayotgan bo'lsangiz)
cd /root/acoustic.uz/apps/frontend
# ... kod o'zgartirishlar ...

# 2. O'zgarishlarni /var/www ga ko'chirish
rsync -av --delete \
  /root/acoustic.uz/apps/frontend/ \
  /var/www/acoustic.uz/apps/frontend/ \
  --exclude='.next' \
  --exclude='node_modules'

# 3. Build qilish (production joyida)
cd /var/www/acoustic.uz
cd apps/frontend
pnpm install  # Agar yangi paketlar qo'shilgan bo'lsa
pnpm build

# 4. PM2'ni restart qilish
pm2 restart acoustic-frontend
# Yoki
cd /var/www/acoustic.uz
./deploy/build-and-start-frontend.sh
```

### Backend yangilash:

```bash
# 1. Kod o'zgartirish (agar /root/acoustic.uz da ishlayotgan bo'lsangiz)
cd /root/acoustic.uz/apps/backend
# ... kod o'zgartirishlar ...

# 2. O'zgarishlarni /var/www ga ko'chirish
rsync -av --delete \
  /root/acoustic.uz/apps/backend/ \
  /var/www/acoustic.uz/apps/backend/ \
  --exclude='dist' \
  --exclude='node_modules'

# 3. Build qilish (production joyida)
cd /var/www/acoustic.uz/apps/backend
pnpm install  # Agar yangi paketlar qo'shilgan bo'lsa
pnpm build

# 4. PM2'ni restart qilish
pm2 restart acoustic-backend
```

## 🎯 Eng Yaxshi Amaliyot

### Variant 1: To'g'ridan-to'g'ri production'da ishlash
```bash
# /var/www/acoustic.uz da to'g'ridan-to'g'ri ishlash
cd /var/www/acoustic.uz/apps/frontend
# Kod o'zgartirish
pnpm build
pm2 restart acoustic-frontend
```

### Variant 2: Development'da ishlash, keyin sync qilish
```bash
# 1. /root/acoustic.uz da ishlash va test qilish
cd /root/acoustic.uz/apps/frontend
pnpm dev  # Development mode'da test qilish

# 2. Tayyor bo'lganda production'ga ko'chirish va build qilish
cd /var/www/acoustic.uz
./deploy/sync-and-build.sh  # (agar bunday skript bo'lsa)
```

## 📋 Tezkor Yangilanish Skripti

Quyidagi skriptni yaratish mumkin:

```bash
#!/bin/bash
# /root/acoustic.uz/deploy/quick-update-frontend.sh

echo "🔄 Frontend'ni yangilash..."

# 1. Kodlarni ko'chirish
echo "📦 Kodlarni ko'chirish..."
rsync -av --delete \
  /root/acoustic.uz/apps/frontend/ \
  /var/www/acoustic.uz/apps/frontend/ \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git'

# 2. Build qilish
echo "🔨 Build qilish..."
cd /var/www/acoustic.uz/apps/frontend
pnpm install
pnpm build

# 3. Restart qilish
echo "🔄 PM2'ni restart qilish..."
pm2 restart acoustic-frontend

echo "✅ Frontend yangilandi!"
```

## 🔍 Tekshirish

```bash
# Frontend ishlayaptimi?
curl -I http://localhost:3000
# Yoki
curl -I https://acoustic.uz

# PM2 status
pm2 list

# Loglar
pm2 logs acoustic-frontend --lines 50
```

## 📝 Xulosa

**Asosiy farq:**
- `/root/acoustic.uz` = Development/Edit joylashuvi (bu yerda kod o'zgartiriladi)
- `/var/www/acoustic.uz` = Production joylashuvi (bu yerda ilova ishlayapti)

**Muammo:**
- `/root` da o'zgartirilgan kodlar avtomatik `/var/www` ga ko'chirilmaydi
- Har safar build va restart qilish kerak

**Yechim:**
1. Kodlarni `/var/www/acoustic.uz` ga ko'chirish
2. Build qilish
3. PM2'ni restart qilish
