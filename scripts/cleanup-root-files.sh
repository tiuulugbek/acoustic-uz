#!/bin/bash

# Root papkadagi keraksiz fayllarni o'chirish

set -e

PROJECT_DIR="/root/acoustic.uz"
cd "$PROJECT_DIR"

echo "=== Root papkadagi keraksiz fayllarni o'chirish ==="
echo ""

# 1. Tahlil hujjatlari
echo "🗑️  1. Tahlil hujjatlari o'chirilmoqda..."
rm -f CLEANUP_ANALYSIS.md
rm -f CLEANUP_RESULTS.md
rm -f FOLDER_ANALYSIS.md
rm -f NODE_MODULES_ANALYSIS.md
rm -f ROOT_FILES_ANALYSIS.md
echo "✅ Tahlil hujjatlari o'chirildi (5 ta)"

# 2. Misol fayllar
echo ""
echo "🗑️  2. Misol fayllar o'chirilmoqda..."
rm -f products_example.json
echo "✅ Misol fayllar o'chirildi"

# 3. Takrorlangan deploy skriptlari (ehtiyot bilan)
echo ""
echo "🗑️  3. Takrorlangan deploy skriptlari tekshirilmoqda..."

# rebuild-frontend.sh deploy/ papkasida ham bor
if [ -f "rebuild-frontend.sh" ] && [ -f "deploy/rebuild-frontend.sh" ]; then
    rm -f rebuild-frontend.sh
    echo "✅ rebuild-frontend.sh o'chirildi (deploy/ papkasida ham bor)"
fi

# Boshqa deploy skriptlarini tekshirish
for script in deploy-backend.sh deploy-manual.sh deploy-optimized.sh deploy-simple.sh deploy-to-server.sh restart-frontend-dev.sh; do
    if [ -f "$script" ]; then
        # deploy/ papkasida mavjudligini tekshirish
        if [ -f "deploy/$script" ]; then
            rm -f "$script"
            echo "✅ $script o'chirildi (deploy/ papkasida ham bor)"
        else
            echo "⚠️  $script saqlanmoqda (deploy/ papkasida yo'q)"
        fi
    fi
done

# 4. Ixtiyoriy hujjatlar (agar kerak bo'lmasa)
echo ""
echo "🗑️  4. Ixtiyoriy hujjatlar tekshirilmoqda..."
# Bu hujjatlar ixtiyoriy - o'chirish yoki saqlash mumkin
# ANALYTICS_SETUP.md va SEO_STATUS.md - agar kerak bo'lmasa, o'chirish mumkin
# Lekin ehtiyot bo'lamiz - o'chirmaymiz (foydalanuvchi xohlasa, qo'lda o'chirishi mumkin)

# 5. Natijalarni ko'rsatish
echo ""
echo "=== Tozalash natijalari ==="
echo ""
echo "📊 O'chirilgan fayllar:"
echo "  - Tahlil hujjatlari: 5 ta"
echo "  - Misol fayllar: 1 ta"
echo "  - Takrorlangan skriptlar: (tekshirildi)"
echo ""
echo "✅ Tozalash yakunlandi!"
echo ""
echo "📋 Qolgan fayllar:"
echo "  - Markdown hujjatlar: $(ls -1 *.md 2>/dev/null | wc -l) ta"
echo "  - JSON fayllar: $(ls -1 *.json 2>/dev/null | wc -l) ta"
echo "  - Deploy skriptlari: $(ls -1 *.sh 2>/dev/null | wc -l) ta"
