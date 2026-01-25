#!/bin/bash

# Export all products to JSON
# Uses psql to export products with all related data

PGPASSWORD="${PGPASSWORD:-acoustic_web_db_password}"
DB_USER="acoustic_user"
DB_NAME="acousticwebdb"
OUTPUT_FILE="/root/acoustic.uz/scripts/products-export.json"

echo "📦 Mahsulotlarni export qilmoqda..."

# Export to JSON using psql
psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -A -F "" << 'SQL' > /tmp/products-raw.json
SELECT json_agg(
  json_build_object(
    'id', p.id,
    'numericId', p."numericId"::text,
    'name_uz', p."name_uz",
    'name_ru', p."name_ru",
    'slug', p.slug,
    'description_uz', p."description_uz",
    'description_ru', p."description_ru",
    'price', p.price,
    'stock', p.stock,
    'productType', p."productType",
    'status', p.status,
    'brand', json_build_object('id', b.id, 'name', b.name, 'slug', b.slug),
    'category', CASE WHEN pc.id IS NOT NULL THEN json_build_object('id', pc.id, 'name_uz', pc."name_uz", 'name_ru', pc."name_ru", 'slug', pc.slug) ELSE NULL END,
    'catalogs', COALESCE((SELECT json_agg(json_build_object('id', c.id, 'name_uz', c."name_uz", 'name_ru', c."name_ru", 'slug', c.slug)) FROM "_ProductToCatalog" ptc JOIN "Catalog" c ON ptc."A" = c.id WHERE ptc."B" = p.id), '[]'::json),
    'audience', p.audience,
    'formFactors', p."formFactors",
    'smartphoneCompatibility', p."smartphoneCompatibility",
    'signalProcessing', p."signalProcessing",
    'powerLevel', p."powerLevel",
    'hearingLossLevels', p."hearingLossLevels",
    'paymentOptions', p."paymentOptions",
    'availabilityStatus', p."availabilityStatus",
    'tinnitusSupport', p."tinnitusSupport",
    'specsText', p."specsText",
    'tech_uz', p."tech_uz",
    'tech_ru', p."tech_ru",
    'fittingRange_uz', p."fittingRange_uz",
    'fittingRange_ru', p."fittingRange_ru",
    'galleryIds', p."galleryIds",
    'createdAt', p."createdAt",
    'updatedAt', p."updatedAt"
  )
)
FROM "Product" p
LEFT JOIN "Brand" b ON p."brandId" = b.id
LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id;
SQL

# Format JSON using Python
python3 << 'PYEOF'
import json
import sys

try:
    with open('/tmp/products-raw.json', 'r', encoding='utf-8') as f:
        content = f.read().strip()
        if not content:
            print("❌ Export bo'sh natija qaytardi")
            sys.exit(1)
        
        # JSON'ni parse qilish
        products = json.loads(content)
        
        # Formatlangan JSON'ga yozish
        output_path = '/root/acoustic.uz/scripts/products-export.json'
        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(products, out, ensure_ascii=False, indent=2)
        
        print(f"✅ {len(products)} ta mahsulot export qilindi!")
        print(f"📁 Fayl: {output_path}")
        
        # Statistika
        print("\n📊 Statistika:")
        print(f"  - Jami mahsulotlar: {len(products)}")
        print(f"  - Tavsif (uz) bor: {sum(1 for p in products if p.get('description_uz'))}")
        print(f"  - Tavsif (ru) bor: {sum(1 for p in products if p.get('description_ru'))}")
        print(f"  - Brend belgilangan: {sum(1 for p in products if p.get('brand'))}")
        print(f"  - Kataloglarga biriktirilgan: {sum(1 for p in products if p.get('catalogs') and len(p.get('catalogs', [])) > 0)}")
        
except json.JSONDecodeError as e:
    print(f"❌ JSON parse xatolik: {e}")
    print("Raw content:")
    with open('/tmp/products-raw.json', 'r', encoding='utf-8') as f:
        print(f.read()[:500])
    sys.exit(1)
except Exception as e:
    print(f"❌ Xatolik: {e}")
    sys.exit(1)
PYEOF

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Export muvaffaqiyatli yakunlandi!"
    echo "📁 Fayl: $OUTPUT_FILE"
else
    echo ""
    echo "❌ Export xatolik bilan yakunlandi!"
    exit $EXIT_CODE
fi
