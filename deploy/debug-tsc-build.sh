#!/bin/bash

# TypeScript kompilyatsiya muammosini debug qilish

set -e

cd /var/www/news.acoustic.uz/apps/backend

echo "🔍 TypeScript kompilyatsiya muammosini debug qilish..."

# 1. TypeScript versiyasini tekshirish
echo "📋 TypeScript versiyasi:"
npx tsc --version

# 2. Source fayllarni tekshirish
echo "📋 Source fayllar:"
ls -la src/ | head -10
ls -la src/main.ts

# 3. TypeScript konfiguratsiyasini tekshirish
echo "📋 TypeScript konfiguratsiyasi:"
cat tsconfig.json

# 4. Root tsconfig.json ni tekshirish
echo "📋 Root tsconfig.json:"
cat ../../tsconfig.json

# 5. TypeScript kompilyatsiya qilish (verbose va noEmit false)
echo "🔨 TypeScript kompilyatsiya qilish (verbose)..."
npx tsc --project tsconfig.json --verbose --listFiles 2>&1 | tee /tmp/tsc-verbose.log

# 6. Build natijasini tekshirish
echo "📋 Build natijasini tekshirish..."
if [ -d "dist" ]; then
    echo "✅ Dist papkasi yaratildi!"
    ls -la dist/ | head -20
    if [ -f "dist/main.js" ]; then
        echo "✅ dist/main.js topildi!"
        ls -lh dist/main.js
    else
        echo "❌ dist/main.js topilmadi!"
        echo "Dist papkasi tarkibi:"
        find dist -name "*.js" | head -10
    fi
else
    echo "❌ Dist papkasi yaratilmadi!"
    echo "TypeScript build log:"
    cat /tmp/tsc-verbose.log
fi

# 7. Agar dist papkasi yaratilmasa, to'g'ridan-to'g'ri kompilyatsiya qilish
if [ ! -d "dist" ]; then
    echo "🔄 To'g'ridan-to'g'ri kompilyatsiya qilish..."
    npx tsc src/main.ts --outDir dist --module commonjs --target ES2022 --moduleResolution node --esModuleInterop --skipLibCheck 2>&1 | tee /tmp/tsc-direct.log
    
    if [ -f "dist/main.js" ]; then
        echo "✅ To'g'ridan-to'g'ri kompilyatsiya muvaffaqiyatli!"
        ls -lh dist/main.js
    else
        echo "❌ To'g'ridan-to'g'ri kompilyatsiya ham ishlamadi!"
        cat /tmp/tsc-direct.log
    fi
fi


