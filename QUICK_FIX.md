# Backend Build Muammosini Hal Qilish - Aniq Yechim

## Muammo
Backend build qilinmoqda, lekin `dist/main.js` topilmayapti.

## Serverda Quyidagi Buyruqlarni Bajaring:

### Variant 1: Script orqali (Tavsiya etiladi)

```bash
cd /var/www/news.acoustic.uz
git pull origin main
chmod +x deploy/fix-backend-build.sh
./deploy/fix-backend-build.sh
```

### Variant 2: Qo'lda (Agar script ishlamasa)

```bash
cd /var/www/news.acoustic.uz

# 1. Shared package build
pnpm --filter @acoustic/shared build

# 2. Backend dist papkasini o'chirish
rm -rf apps/backend/dist

# 3. Backend build qilish
cd apps/backend
pnpm build 2>&1 | tee /tmp/backend-build.log

# 4. Build natijasini tekshirish
ls -la dist/
ls -la dist/main.js

# 5. Agar dist/main.js topilmasa, TypeScript kompilyatsiya qilish
if [ ! -f "dist/main.js" ]; then
    echo "TypeScript kompilyatsiya qilish..."
    npx tsc --project tsconfig.json
    ls -la dist/main.js
fi

# 6. PM2 ni ishga tushirish
cd ../..
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.js
pm2 status
```

### Variant 3: Debug (Agar hali ham muammo bo'lsa)

```bash
cd /var/www/news.acoustic.uz/apps/backend

# Build log ni ko'rish
cat /tmp/backend-build.log

# NestJS CLI versiyasini tekshirish
npx nest --version

# TypeScript versiyasini tekshirish
npx tsc --version

# Node.js versiyasini tekshirish
node --version

# Barcha JS fayllarni qidirish
find . -name "*.js" -type f | grep -E "(main|index)" | head -10

# Dist papkasini to'liq ko'rish
ls -la dist/ 2>/dev/null || echo "Dist papkasi mavjud emas!"
```

## Agar Muammo Davom Etsa

1. Build log ni tekshiring: `cat /tmp/backend-build.log`
2. NestJS konfiguratsiyasini tekshiring: `cat nest-cli.json`
3. TypeScript konfiguratsiyasini tekshiring: `cat tsconfig.json`
4. Dependencies ni yangilang: `pnpm install`
