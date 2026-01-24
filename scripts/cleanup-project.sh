#!/bin/bash

# Acoustic.uz loyihasini tozalash skripti

set -e

PROJECT_DIR="/root/acoustic.uz"
cd "$PROJECT_DIR"

echo "=== Acoustic.uz loyihasini tozalash ==="
echo ""

# 1. Build fayllarni o'chirish
echo "🗑️  1. Build fayllarni o'chirish..."
rm -rf apps/frontend/.next
rm -rf apps/admin/dist
rm -rf apps/backend/dist
echo "✅ Build fayllar o'chirildi"

# 2. Eski backup skriptlarini o'chirish
echo ""
echo "🗑️  2. Eski backup skriptlarini o'chirish..."
cd scripts
rm -f daily-backup-final-working.sh
rm -f daily-backup-prisma.ts
rm -f daily-backup-psql.sh
rm -f daily-backup-simple.sh
rm -f daily-backup-telegram-fixed.sh
rm -f daily-backup-telegram-psql.sh
rm -f daily-backup-telegram.sh
rm -f daily-backup-working.sh
echo "✅ Eski backup skriptlari o'chirildi (faqat daily-backup-final.sh qoldi)"

# 3. Eski SQL dump fayllarini o'chirish
echo ""
echo "🗑️  3. Eski SQL dump fayllarini o'chirish..."
cd "$PROJECT_DIR"
rm -f acoustic-dump-20251201-111600.sql
rm -f acoustic-dump-20251201-111823.sql
rm -f acoustic-dump-20251201-111921.sql
echo "✅ Eski SQL dump fayllari o'chirildi"

# 4. Eski tar.gz fayllarini o'chirish
echo ""
echo "🗑️  4. Eski tar.gz fayllarini o'chirish..."
rm -f public-20251201-*.tar.gz
rm -f uploads-20251201-*.tar.gz
rm -f uploads.tar.gz
echo "✅ Eski tar.gz fayllari o'chirildi"

# 5. Xato backup fayllarini o'chirish (20-200 bytes)
echo ""
echo "🗑️  5. Xato backup fayllarini o'chirish..."
find backups -name "*.sql.gz" -size -200c -delete 2>/dev/null || true
find backups -name "*.sql" -size -200c -delete 2>/dev/null || true
echo "✅ Xato backup fayllari o'chirildi"

# 6. Eski import skriptlarini o'chirish
echo ""
echo "🗑️  6. Eski import skriptlarini o'chirish..."
cd "$PROJECT_DIR/scripts"
rm -f import-products.ts
rm -f import-products-pg.ts
rm -f import-products-direct-sql.ts
echo "✅ Eski import skriptlari o'chirildi (faqat generate-import-sql.js qoldi)"

# 7. Test va debug fayllarini o'chirish
echo ""
echo "🗑️  7. Test va debug fayllarini o'chirish..."
cd "$PROJECT_DIR"
rm -f test-api.html
rm -f scripts/debug_api.ts
rm -f scripts/test_products_api.ts
rm -f scripts/test-backend-failure.sh
rm -f scripts/test-connection.sh
echo "✅ Test va debug fayllari o'chirildi"

# 8. Eski JSON fayllarini tekshirish
echo ""
echo "🗑️  8. Eski JSON fayllarini tozalash..."
cd "$PROJECT_DIR"
# Faqat aniq eski yoki takrorlangan fayllarni o'chirish
if [ -f "products-to-import.json" ] && [ -f "product-to-import-resound.json" ]; then
    echo "   products-to-import.json va product-to-import-resound.json mavjud"
    echo "   (Saqlanmoqda - import uchun kerak bo'lishi mumkin)"
fi
if [ -f "resound-products-import.json" ] && [ -f "product-to-import-resound.json" ]; then
    rm -f resound-products-import.json
    echo "✅ Takrorlangan resound-products-import.json o'chirildi"
fi

# 9. Root papkadagi eski deploy skriptlarini tekshirish
echo ""
echo "🗑️  9. Root papkadagi eski deploy skriptlarini tekshirish..."
cd "$PROJECT_DIR"
# deploy/ papkasida barcha skriptlar bor, root papkadagilar takrorlangan bo'lishi mumkin
# Lekin ehtiyot bo'lamiz - faqat aniq takrorlanganlarni o'chirish
echo "   (Root papkadagi deploy skriptlari saqlanmoqda - deploy/ papkasida ham bor)"

# 10. Python skriptlarini tekshirish (extract_products)
echo ""
echo "🗑️  10. Python skriptlarini tekshirish..."
cd "$PROJECT_DIR/scripts"
if [ -f "extract_products.py" ]; then
    echo "   Python skriptlari mavjud (extract_products*.py)"
    echo "   (Saqlanmoqda - kelajakda kerak bo'lishi mumkin)"
fi

# 11. Build qilish
echo ""
echo "🏗️  11. Qayta build qilish..."
cd "$PROJECT_DIR"

# Frontend build
echo "   Frontend build qilinmoqda..."
cd apps/frontend
pnpm build || {
    echo "⚠️  Frontend build xatolik, lekin davom etilmoqda..."
}
cd "$PROJECT_DIR"

# Admin build
echo "   Admin build qilinmoqda..."
cd apps/admin
pnpm build || {
    echo "⚠️  Admin build xatolik, lekin davom etilmoqda..."
}
cd "$PROJECT_DIR"

# Backend build
echo "   Backend build qilinmoqda..."
cd apps/backend
pnpm build || {
    echo "⚠️  Backend build xatolik, lekin davom etilmoqda..."
}
cd "$PROJECT_DIR"

echo ""
echo "✅ Build jarayoni tugadi"

# 12. Natijalarni ko'rsatish
echo ""
echo "=== Tozalash natijalari ==="
echo ""
echo "📊 Papkalar hajmi:"
du -sh apps/frontend/.next 2>/dev/null || echo "   .next: o'chirilgan (qayta build qilish kerak)"
du -sh apps/admin/dist 2>/dev/null || echo "   admin/dist: o'chirilgan (qayta build qilish kerak)"
du -sh apps/backend/dist 2>/dev/null || echo "   backend/dist: o'chirilgan (qayta build qilish kerak)"
echo ""
echo "📦 Scripts papkasi:"
ls -1 scripts/daily-backup-*.sh scripts/daily-backup-*.ts 2>/dev/null | wc -l | xargs -I {} echo "   Backup skriptlari: {} ta"
echo ""
echo "✅ Tozalash yakunlandi!"
