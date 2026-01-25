#!/usr/bin/env python3
"""
Export all products to JSON with all available data
"""

import subprocess
import json
import os
import sys

# Database connection
DB_USER = "acoustic_user"
DB_NAME = "acousticwebdb"
DB_PASSWORD = os.environ.get("PGPASSWORD", "acoustic_web_db_password")

def run_query(query):
    """Run PostgreSQL query and return result"""
    env = os.environ.copy()
    env['PGPASSWORD'] = DB_PASSWORD
    
    cmd = [
        'psql',
        '-h', 'localhost',
        '-U', DB_USER,
        '-d', DB_NAME,
        '-t', '-A', '-F', '\t'
    ]
    
    result = subprocess.run(
        cmd + ['-c', query],
        capture_output=True,
        text=True,
        env=env
    )
    
    if result.returncode != 0:
        print(f"❌ Query xatolik: {result.stderr}")
        return None
    
    return result.stdout.strip()

def get_catalogs(product_id):
    """Get catalogs for a product"""
    query = f'''
    SELECT json_agg(json_build_object('id', c.id, 'name_uz', c."name_uz", 'name_ru', c."name_ru", 'slug', c.slug))
    FROM "_ProductToCatalog" ptc
    JOIN "Catalog" c ON ptc."A" = c.id
    WHERE ptc."B" = '{product_id}';
    '''
    
    result = run_query(query)
    if result:
        try:
            catalogs = json.loads(result) if result else []
            return catalogs if catalogs else []
        except:
            return []
    return []

def parse_array(value):
    """Parse PostgreSQL array to Python list"""
    if not value or value == '{}':
        return []
    try:
        # PostgreSQL array format: {value1,value2}
        value = value.strip('{}')
        if not value:
            return []
        return [v.strip('"') for v in value.split(',')]
    except:
        return []

def export_products():
    """Export all products to JSON"""
    print("📦 Mahsulotlarni export qilmoqda...")
    
    # Barcha mahsulotlarni olish
    query = '''
    SELECT 
      p.id,
      p."numericId"::text,
      p."name_uz",
      p."name_ru",
      p.slug,
      COALESCE(p."description_uz", '') as description_uz,
      COALESCE(p."description_ru", '') as description_ru,
      p.price,
      p.stock,
      p."productType",
      p.status,
      b.id as brand_id,
      b.name as brand_name,
      b.slug as brand_slug,
      pc.id as category_id,
      pc."name_uz" as category_name_uz,
      pc."name_ru" as category_name_ru,
      pc.slug as category_slug,
      COALESCE(p.audience::text, '{}') as audience,
      COALESCE(p."formFactors"::text, '{}') as formFactors,
      COALESCE(p."smartphoneCompatibility"::text, '{}') as smartphoneCompatibility,
      p."signalProcessing",
      p."powerLevel",
      COALESCE(p."hearingLossLevels"::text, '{}') as hearingLossLevels,
      COALESCE(p."paymentOptions"::text, '{}') as paymentOptions,
      p."availabilityStatus",
      COALESCE(p."tinnitusSupport", false) as tinnitusSupport,
      COALESCE(p."specsText", '') as specsText,
      COALESCE(p."tech_uz", '') as tech_uz,
      COALESCE(p."tech_ru", '') as tech_ru,
      COALESCE(p."fittingRange_uz", '') as fittingRange_uz,
      COALESCE(p."fittingRange_ru", '') as fittingRange_ru,
      COALESCE(p."galleryIds"::text, '{}') as galleryIds,
      p."createdAt",
      p."updatedAt"
    FROM "Product" p
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id
    ORDER BY p."createdAt" DESC;
    '''
    
    result = run_query(query)
    if not result:
        print("❌ Query natija qaytarmadi")
        return False
    
    products = []
    lines = result.split('\n')
    
    for line in lines:
        if not line.strip():
            continue
        
        parts = line.split('\t')
        if len(parts) < 25:
            continue
        
        product_id = parts[0]
        
        # Kataloglarni olish
        catalogs = get_catalogs(product_id)
        
        # Product object yaratish
        product = {
            'id': parts[0],
            'numericId': parts[1] if parts[1] and parts[1] != 'None' else None,
            'name_uz': parts[2],
            'name_ru': parts[3],
            'slug': parts[4],
            'description_uz': parts[5] if parts[5] else '',
            'description_ru': parts[6] if parts[6] else '',
            'price': float(parts[7]) if parts[7] and parts[7] != 'None' else None,
            'stock': int(parts[8]) if parts[8] and parts[8] != 'None' else None,
            'productType': parts[9] if parts[9] and parts[9] != 'None' else None,
            'status': parts[10],
            'brand': {
                'id': parts[11],
                'name': parts[12],
                'slug': parts[13]
            } if parts[11] and parts[11] != 'None' else None,
            'category': {
                'id': parts[14],
                'name_uz': parts[15],
                'name_ru': parts[16],
                'slug': parts[17]
            } if parts[14] and parts[14] != 'None' else None,
            'catalogs': catalogs,
            'audience': parse_array(parts[18]),
            'formFactors': parse_array(parts[19]),
            'smartphoneCompatibility': parse_array(parts[20]),
            'signalProcessing': parts[21] if parts[21] and parts[21] != 'None' else None,
            'powerLevel': parts[22] if parts[22] and parts[22] != 'None' else None,
            'hearingLossLevels': parse_array(parts[23]),
            'paymentOptions': parse_array(parts[24]),
            'availabilityStatus': parts[25] if len(parts) > 25 and parts[25] != 'None' else None,
            'tinnitusSupport': parts[26].lower() == 'true' if len(parts) > 26 and parts[26] else False,
            'specsText': parts[27] if len(parts) > 27 and parts[27] != 'None' else '',
            'tech_uz': parts[28] if len(parts) > 28 and parts[28] != 'None' else '',
            'tech_ru': parts[29] if len(parts) > 29 and parts[29] != 'None' else '',
            'fittingRange_uz': parts[30] if len(parts) > 30 and parts[30] != 'None' else '',
            'fittingRange_ru': parts[31] if len(parts) > 31 and parts[31] != 'None' else '',
            'galleryIds': parse_array(parts[32]) if len(parts) > 32 else [],
            'createdAt': parts[33] if len(parts) > 33 else None,
            'updatedAt': parts[34] if len(parts) > 34 else None
        }
        
        products.append(product)
    
    # JSON faylga yozish
    output_path = '/root/acoustic.uz/scripts/products-export.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {len(products)} ta mahsulot export qilindi!")
    print(f"📁 Fayl: {output_path}")
    print(f"\n📊 Statistika:")
    print(f"  - Jami mahsulotlar: {len(products)}")
    print(f"  - Tavsif (uz) bor: {sum(1 for p in products if p.get('description_uz'))}")
    print(f"  - Tavsif (ru) bor: {sum(1 for p in products if p.get('description_ru'))}")
    print(f"  - Brend belgilangan: {sum(1 for p in products if p.get('brand'))}")
    print(f"  - Kataloglarga biriktirilgan: {sum(1 for p in products if p.get('catalogs') and len(p.get('catalogs', [])) > 0)}")
    
    return True

if __name__ == '__main__':
    try:
        success = export_products()
        if success:
            print("\n✅ Export muvaffaqiyatli yakunlandi!")
            sys.exit(0)
        else:
            print("\n❌ Export xatolik bilan yakunlandi!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Xatolik: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
