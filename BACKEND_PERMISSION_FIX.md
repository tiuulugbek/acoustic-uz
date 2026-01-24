# Backend Build Permission Muammosi - Tuzatish

## 🔍 Muammo

Terminal output'da ko'rinib turibdiki:
- 384 ta permission xatolik (EACCES)
- `dist` folder `nobody:nogroup` ga tegishli
- Build `acoustic` user sifatida ishlayapti
- Build muvaffaqiyatsiz tugadi

## ✅ Yechim

### 1. Permission'larni tuzatish

```bash
# Root sifatida
cd /var/www/acoustic.uz/apps/backend
rm -rf dist
mkdir -p dist
chown -R acoustic:acoustic dist
chmod -R 755 dist
```

Yoki skript orqali:

```bash
# Root sifatida
/root/acoustic.uz/deploy/fix-backend-permissions.sh
```

### 2. Shared package dist folder (agar kerak bo'lsa)

```bash
cd /var/www/acoustic.uz/packages/shared
rm -rf dist
mkdir -p dist
chown -R acoustic:acoustic dist
chmod -R 755 dist
```

### 3. Build qilish (acoustic user sifatida)

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
```

## 📋 To'liq jarayon

```bash
# === ROOT SIFATIDA ===
# 1. Permission'larni tuzatish
cd /var/www/acoustic.uz/apps/backend
rm -rf dist
mkdir -p dist
chown -R acoustic:acoustic dist

cd /var/www/acoustic.uz/packages/shared
rm -rf dist
mkdir -p dist
chown -R acoustic:acoustic dist

# === ACOUSTIC USER SIFATIDA ===
su - acoustic
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
curl -I http://localhost:3001/api/health
```

## ⚠️ Eslatma

Agar hali ham permission xatolik bo'lsa:

```bash
# Barcha node_modules va dist folder'larini tekshirish
find /var/www/acoustic.uz -type d -name "dist" -o -name "node_modules" | xargs ls -ld

# Agar kerak bo'lsa, barcha dist folder'larga permission berish
find /var/www/acoustic.uz -type d -name "dist" -exec chown -R acoustic:acoustic {} \;
find /var/www/acoustic.uz -type d -name "dist" -exec chmod -R 755 {} \;
```
