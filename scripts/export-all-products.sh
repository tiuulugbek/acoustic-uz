#!/bin/bash

# Export all products to JSON with all available data

PGPASSWORD="${PGPASSWORD:-acoustic_web_db_password}"
DB_USER="acoustic_user"
DB_NAME="acousticwebdb"
OUTPUT_FILE="/root/acoustic.uz/scripts/products-export.json"

echo "📦 Barcha mahsulotlarni export qilmoqda..."

# PostgreSQL'dan to'g'ridan-to'g'ri JSON export
PGPASSWORD="$PGPASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -A -c "
SELECT json_agg(
  json_build_object(
    'id', p.id,
    'numericId', p.\"numericId\"::text,
    'name_uz', p.\"name_uz\",
    'name_ru', p.\"name_ru\",
    'slug', p.slug,
    'description_uz', COALESCE(p.\"description_uz\", ''),
    'description_ru', COALESCE(p.\"description_ru\", ''),
    'price', p.price,
    'stock', p.stock,
    'productType', p.\"productType\",
    'status', p.status,
    'brand', CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) ELSE NULL END,
    'category', CASE WHEN pc.id IS NOT NULL THEN json_build_object('id', pc.id, 'name_uz', pc.\"name_uz\", 'name_ru', pc.\"name_ru\", 'slug', pc.slug) ELSE NULL END,
    'catalogs', COALESCE(
      (SELECT json_agg(json_build_object('id', c.id, 'name_uz', c.\"name_uz\", 'name_ru', c.\"name_ru\", 'slug', c.slug))
       FROM \"_ProductToCatalog\" ptc
       JOIN \"Catalog\" c ON ptc.\"A\" = c.id
       WHERE ptc.\"B\" = p.id),
      '[]'::json
    ),
    'audience', COALESCE(p.audience, '[]'::text[]),
    'formFactors', COALESCE(p.\"formFactors\", '[]'::text[]),
    'smartphoneCompatibility', COALESCE(p.\"smartphoneCompatibility\", '[]'::text[]),
    'signalProcessing', p.\"signalProcessing\",
    'powerLevel', p.\"powerLevel\",
    'hearingLossLevels', COALESCE(p.\"hearingLossLevels\", '[]'::text[]),
    'paymentOptions', COALESCE(p.\"paymentOptions\", '[]'::text[]),
    'availabilityStatus', p.\"availabilityStatus\",
    'tinnitusSupport', COALESCE(p.\"tinnitusSupport\", false),
    'specsText', COALESCE(p.\"specsText\", ''),
    'tech_uz', COALESCE(p.\"tech_uz\", ''),
    'tech_ru', COALESCE(p.\"tech_ru\", ''),
    'fittingRange_uz', COALESCE(p.\"fittingRange_uz\", ''),
    'fittingRange_ru', COALESCE(p.\"fittingRange_ru\", ''),
    'galleryIds', COALESCE(p.\"galleryIds\", '[]'::text[]),
    'createdAt', p.\"createdAt\",
    'updatedAt', p.\"updatedAt\"
  )
)
FROM \"Product\" p
LEFT JOIN \"Brand\" b ON p.\"brandId\" = b.id
LEFT JOIN \"ProductCategory\" pc ON p.\"categoryId\" = pc.id
ORDER BY p.\"createdAt\" DESC;
" 2>/dev/null | python3 -c "
import sys
import json

data = sys.stdin.read().strip()
if data:
    try:
        products = json.loads(data)
        with open('/root/acoustic.uz/scripts/products-export.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f'✅ {len(products)} ta mahsulot export qilindi!')
        print(f'📁 Fayl: /root/acoustic.uz/scripts/products-export.json')
        print(f'')
        print(f'📊 Statistika:')
        print(f'  - Jami mahsulotlar: {len(products)}')
        print(f'  - Tavsif (uz) bor: {sum(1 for p in products if p.get(\"description_uz\"))}')
        print(f'  - Tavsif (ru) bor: {sum(1 for p in products if p.get(\"description_ru\"))}')
        print(f'  - Brend belgilangan: {sum(1 for p in products if p.get(\"brand\"))}')
        print(f'  - Kataloglarga biriktirilgan: {sum(1 for p in products if p.get(\"catalogs\") and len(p.get(\"catalogs\", [])) > 0)}')
    except Exception as e:
        print(f'❌ JSON parse xatolik: {e}')
        print(f'Raw data (first 500 chars): {data[:500]}')
        sys.exit(1)
else:
    print('❌ Export bo\'sh natija qaytardi')
    sys.exit(1)
"

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Export muvaffaqiyatli yakunlandi!"
    echo "📁 Fayl: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE" 2>/dev/null || echo "Fayl topilmadi"
else
    echo ""
    echo "❌ Export xatolik bilan yakunlandi!"
    exit $EXIT_CODE
fi
