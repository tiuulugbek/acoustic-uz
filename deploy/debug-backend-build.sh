#!/bin/bash

# Backend build muammosini debug qilish scripti

set -e

cd /var/www/news.acoustic.uz/apps/backend

echo "🔍 Backend build muammosini debug qilish..."

# 1. Node.js versiyasini tekshirish
echo "📋 Node.js versiyasi:"
node --version

# 2. NestJS CLI versiyasini tekshirish
echo "📋 NestJS CLI versiyasi:"
npx nest --version || echo "NestJS CLI topilmadi"

# 3. TypeScript versiyasini tekshirish
echo "📋 TypeScript versiyasi:"
npx tsc --version || echo "TypeScript topilmadi"

# 4. Dependencies ni tekshirish
echo "📋 Dependencies tekshirish..."
if [ ! -d "node_modules/@nestjs/cli" ]; then
    echo "❌ @nestjs/cli topilmadi, o'rnatilmoqda..."
    pnpm install
fi

# 5. NestJS build ni verbose mode da ishga tushirish
echo "🔨 NestJS build (verbose)..."
npx nest build --verbose 2>&1 | tee /tmp/nest-build-verbose.log

# 6. Agar dist papkasi yaratilmasa, TypeScript kompilyatsiya qilish
if [ ! -d "dist" ]; then
    echo "❌ Dist papkasi yaratilmadi, TypeScript kompilyatsiya qilish..."
    npx tsc --project tsconfig.json --verbose 2>&1 | tee /tmp/tsc-build.log
fi

# 7. Dist papkasini tekshirish
echo "📋 Dist papkasi tarkibi:"
ls -la dist/ 2>/dev/null || echo "❌ Dist papkasi mavjud emas!"

# 8. Build loglarni ko'rsatish
echo "📋 NestJS build log:"
cat /tmp/nest-build-verbose.log

if [ -f "/tmp/tsc-build.log" ]; then
    echo "📋 TypeScript build log:"
    cat /tmp/tsc-build.log
fi

