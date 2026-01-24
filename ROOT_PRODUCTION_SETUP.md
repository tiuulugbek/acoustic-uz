# ✅ Root User bilan Production Setup

## 🎯 Nima o'zgarmaydi (Production bo'lib qoladi)

- ✅ **Kod production build** - `NODE_ENV=production`, optimized build
- ✅ **Portlar bir xil** - 3001 (backend), 3002 (frontend)
- ✅ **Ishlash rejimi bir xil** - production mode
- ✅ **Performance bir xil** - kod bir xil, faqat user o'zgardi

## 🔄 Nima o'zgaradi

- ✅ **User:** `acoustic` → `root`
- ✅ **Permission muammosi yo'q** - root hamma narsaga access bor
- ✅ **Ishlash osonroq** - user o'zgartirish kerak emas
- ⚠️  **Xavfsizlik:** Root bilan ishlash biroz kamroq xavfsiz (lekin server ichida)

## 🚀 O'tkazish

### 1. Root user bilan sozlash

```bash
# Root sifatida
cd /var/www/acoustic.uz
./deploy/setup-root-production.sh
```

Yoki qo'lda:

```bash
# 1. Permission'lar
chown -R root:root /var/www/acoustic.uz
chmod -R 755 /var/www/acoustic.uz

# 2. PM2 log folder
mkdir -p /root/.pm2/logs

# 3. Portlarni tozalash
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# 4. PM2'ni ishga tushirish
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem-root.config.js
pm2 save
```

### 2. Tekshirish

```bash
pm2 list
pm2 logs acoustic-backend --lines 20
pm2 logs acoustic-frontend --lines 20
curl -I http://localhost:3001/api/health
curl -I http://localhost:3002
```

## 🎯 Keyingi o'zgarishlar (Root bilan)

Endi barcha o'zgarishlar to'g'ridan-to'g'ri `/var/www/acoustic.uz` da qilinadi:

### Backend yangilash:
```bash
cd /var/www/acoustic.uz/apps/backend
# Kod o'zgartirish
pnpm build
pm2 restart acoustic-backend
```

### Frontend yangilash:
```bash
cd /var/www/acoustic.uz/apps/frontend
# Kod o'zgartirish
pnpm build
pm2 restart acoustic-frontend
```

## ✅ Afzalliklari

- ✅ **Oson** - user o'zgartirish kerak emas
- ✅ **Permission muammosi yo'q** - root hamma narsaga access bor
- ✅ **Tez** - qo'shimcha qadamlar yo'q
- ✅ **Production** - kod hali ham production build

## ⚠️  Eslatma

- Production kod build qilingan va ishlayotgan bo'lishi bilan belgilanadi
- User (root yoki acoustic) faqat process'ni ishga tushiradi
- `NODE_ENV=production` va optimized build = Production

## 📝 Xulosa

- ✅ Root bilan ishlash mumkin
- ✅ Production bo'lib qoladi
- ✅ Ishlash osonroq bo'ladi
- ✅ Permission muammosi yo'q
