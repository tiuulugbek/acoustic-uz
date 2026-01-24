#!/bin/bash
echo "🔍 Barcha rasmlarni qidirish..."
echo ""

echo "1. Barcha webp fayllar:"
find /var/www -type f -name "*.webp" 2>/dev/null | wc -l
echo ""

echo "2. 2025-12 sanali fayllar:"
find /var/www -type f -name "*2025-12*" 2>/dev/null | wc -l
find /var/www -type f -name "*2025-12*" 2>/dev/null | head -10
echo ""

echo "3. Timestamp 1764833768750 bo'yicha:"
find /var/www -type f -name "*1764833768750*" 2>/dev/null
echo ""

echo "4. Blob-rbrw6k bo'yicha:"
find /var/www -type f -name "*rbrw6k*" 2>/dev/null
echo ""

echo "5. Barcha uploads papkalari:"
find /var/www -type d -name "uploads" 2>/dev/null
echo ""

echo "✅ Qidiruv yakunlandi"
