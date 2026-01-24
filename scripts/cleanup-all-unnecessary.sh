#!/bin/bash

# Barcha keraksiz fayllarni o'chirish (.md hujjatlari va deploy skriptlari)

set -e

PROJECT_DIR="/root/acoustic.uz"
cd "$PROJECT_DIR"

echo "=== Barcha keraksiz fayllarni o'chirish ==="
echo ""

# 1. .md hujjatlari (faqat README.md qoldirish)
echo "🗑️  1. .md hujjatlari o'chirilmoqda (README.md saqlanmoqda)..."
MD_COUNT=0
for f in *.md; do
    if [ -f "$f" ] && [ "$f" != "README.md" ]; then
        rm -f "$f"
        MD_COUNT=$((MD_COUNT + 1))
    fi
done
echo "✅ $MD_COUNT ta .md hujjat o'chirildi (README.md qoldi)"

# 2. Deploy skriptlari (root papkadagi)
echo ""
echo "🗑️  2. Root papkadagi deploy skriptlari o'chirilmoqda..."
SCRIPT_COUNT=0
for script in deploy-*.sh restart-*.sh rebuild-*.sh; do
    if [ -f "$script" ]; then
        rm -f "$script"
        SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
        echo "  ✅ $script o'chirildi"
    fi
done
echo "✅ $SCRIPT_COUNT ta deploy skripti o'chirildi"

# 3. Natijalarni ko'rsatish
echo ""
echo "=== Tozalash natijalari ==="
echo ""
echo "📊 O'chirilgan fayllar:"
echo "  - .md hujjatlari: $MD_COUNT ta (README.md qoldi)"
echo "  - Deploy skriptlari: $SCRIPT_COUNT ta"
echo ""
echo "📋 Qolgan fayllar:"
echo "  - Markdown: $(ls -1 *.md 2>/dev/null | wc -l) ta"
echo "  - JSON: $(ls -1 *.json 2>/dev/null | wc -l) ta"
echo "  - Skriptlar: $(ls -1 *.sh 2>/dev/null | wc -l) ta"
echo ""
echo "✅ Tozalash yakunlandi!"
