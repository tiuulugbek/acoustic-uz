#!/usr/bin/env python3
"""
Simple product export to JSON
Exports all products with all available data
"""

import subprocess
import json
import os

DB_USER = "acoustic_user"
DB_NAME = "acousticwebdb"
DB_PASSWORD = os.environ.get("PGPASSWORD", "acoustic_web_db_password")

def run_psql(query):
    """Run psql query and return result"""
    env = os.environ.copy()
    env['PGPASSWORD'] = DB_PASSWORD
    
    cmd = ['psql', '-h', 'localhost', '-U', DB_USER, '-d', DB_NAME, '-t', '-A', '-F', '|']
    
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    stdout, stderr = process.communicate(input=query)
    
    if process.returncode != 0:
        print(f"❌ Query xatolik: {stderr}")
        return None
    
    return stdout.strip()

def parse_array(value):
    """Parse PostgreSQL array"""
    if not value or value == '{}':
        return []
    try:
        value = value.strip('{}')
        if not value:
            return []
        return [v.strip('"') for v in value.split(',')]
    except:
        return []

def get_catalogs(product_id):
    """Get catalogs for a product"""
    query = f'''
    SELECT json_agg(json_build_object('id', c.id, 'name_uz', c."name_uz", 'name_ru', c."name_ru", 'slug', c.slug))
    FROM "_ProductToCatalog" ptc
    JOIN "Catalog" c ON ptc."A" = c.id
    WHERE ptc."B" = '{product_id}';
    '''
    
    result = run_psql(query)
    if result:
        try:
            return json.loads(result) or []
        except:
            return []
    return []

def export_products():
    """Export all products"""
    print("📦 Mahsulotlarni export qilmoqda...")
    
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
    ORDER BY p."createdAt" DESC;
    '''
    
    result = run_psql(query)
    if not result:
        print("❌ Query natija qaytarmadi")
        return False
    
    products = []
    for line in result.split('\n'):
        if not line.strip():
            continue
        
        parts = line.split('|')
        if len(parts) < 25:
            continue
        
        product_id = parts[0]
        catalogs = get_catalogs(product_id)
        
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
            'catalogs': catalogs,
            'audience': parse_array(parts[14]),
            'formFactors': parse_array(parts[15]),
            'smartphoneCompatibility': parse_array(parts[16]),
            'signalProcessing': parts[17] if parts[17] and parts[17] != 'None' else None,
            'powerLevel': parts[18] if parts[18] and parts[18] != 'None' else None,
            'hearingLossLevels': parse_array(parts[19]),
            'paymentOptions': parse_array(parts[20]),
            'availabilityStatus': parts[21] if parts[21] and parts[21] != 'None' else None,
            'tinnitusSupport': parts[22].lower() == 'true' if parts[22] else False,
            'specsText': parts[23] if parts[23] else '',
            'tech_uz': parts[24] if parts[24] else '',
            'tech_ru': parts[25] if len(parts) > 25 and parts[25] else '',
            'fittingRange_uz': parts[26] if len(parts) > 26 and parts[26] else '',
            'fittingRange_ru': parts[27] if len(parts) > 27 and parts[27] else '',
            'galleryIds': parse_array(parts[28]) if len(parts) > 28 else [],
            'createdAt': parts[29] if len(parts) > 29 else None,
            'updatedAt': parts[30] if len(parts) > 30 else None
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
            exit(0)
        else:
            print("\n❌ Export xatolik bilan yakunlandi!")
            exit(1)
    except Exception as e:
        print(f"\n❌ Xatolik: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
