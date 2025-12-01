# Backend Build Muammosini Hal Qilish

## Muammo
Backend build qilinmoqda, lekin `dist/main.js` topilmayapti.

## Aniq Yechim

### 1-qadam: Build ni verbose mode da ishga tushirish

```bash
cd /var/www/news.acoustic.uz

# Shared package build
pnpm --filter @acoustic/shared build

# Backend dist papkasini o'chirish
rm -rf apps/backend/dist

# Backend build qilish (verbose)
cd apps/backend
pnpm build 2>&1 | tee /tmp/backend-build.log

# Build natijasini tekshirish
ls -la dist/
ls -la dist/main.js
```

### 2-qadam: Agar dist/main.js topilmasa

```bash
# Barcha JS fayllarni qidirish
find apps/backend -name "*.js" -type f | grep -E "(main|index)" | head -10

# NestJS build ni to'g'ridan-to'g'ri ishga tushirish
cd apps/backend
npx nest build --verbose

# Dist papkasini tekshirish
ls -la dist/
cat dist/main.js | head -20
```

### 3-qadam: Agar hali ham topilmasa

```bash
# TypeScript kompilyatsiya qilish
cd apps/backend
npx tsc --project tsconfig.json

# Dist papkasini tekshirish
ls -la dist/
ls -la dist/main.js
```

### 4-qadam: PM2 ni ishga tushirish

```bash
cd /var/www/news.acoustic.uz

# PM2 ni to'xtatish
pm2 delete all

# PM2 ni ishga tushirish
pm2 start deploy/ecosystem.config.js

# PM2 statusini ko'rsatish
pm2 status
pm2 logs acoustic-backend --lines 50
```

## Alternativ Yechim

Agar `dist/main.js` hali ham topilmasa, quyidagi buyruqlarni bajaring:

```bash
cd /var/www/news.acoustic.uz/apps/backend

# Barcha dependencies ni o'rnatish
pnpm install

# Build qilish
pnpm build

# Agar build muvaffaqiyatli bo'lsa, dist papkasini tekshirish
if [ -f "dist/main.js" ]; then
    echo "✅ Build muvaffaqiyatli!"
    ls -lh dist/main.js
else
    echo "❌ Build xatosi!"
    echo "Build log:"
    tail -50 /tmp/backend-build.log
fi
```

## Debug

Agar muammo davom etsa:

```bash
# Build log ni ko'rish
cat /tmp/backend-build.log

# NestJS CLI versiyasini tekshirish
cd apps/backend
npx nest --version

# TypeScript versiyasini tekshirish
npx tsc --version

# Node.js versiyasini tekshirish
node --version
```

