#!/usr/bin/env python3
import json
import subprocess
import sys
import re

# JSON faylni o'qish
with open('/root/signia-products-import.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"📦 Mahsulotlar soni: {len(products)}")
print("")

# Signia brand ID'ni topish
psql_cmd = ['psql', 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb', '-t', '-A', '-c', "SELECT id FROM \"Brand\" WHERE LOWER(name) LIKE '%signia%' LIMIT 1;"]

result = subprocess.run(psql_cmd, capture_output=True, text=True)
brand_id = result.stdout.strip()

if not brand_id:
    print("❌ Signia brend topilmadi!")
    sys.exit(1)

print(f"✅ Signia brend topildi (ID: {brand_id})")
print("")

success = 0
failed = 0
errors = []

for i, product in enumerate(products, 1):
    try:
        # Brand filtrlash
        if product.get('brandName', '').lower() != 'signia':
            continue
        
        # Slug yaratish
        slug = product.get('slug') or product['name_uz'].lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug).strip('-')
        
        # Ma'lumotlarni tayyorlash
        name_uz = product['name_uz'].replace("'", "''")
        name_ru = product['name_ru'].replace("'", "''")
        desc_uz = (product.get('description_uz') or '').replace("'", "''")
        desc_ru = (product.get('description_ru') or '').replace("'", "''")
        price = product.get('price') or 'NULL'
        product_type = product.get('productType', 'hearing-aids')
        
        # SQL so'rov
        desc_uz_sql = f"'{desc_uz}'" if desc_uz else 'NULL'
        desc_ru_sql = f"'{desc_ru}'" if desc_ru else 'NULL'
        
        sql = f"""INSERT INTO "Product" (id, name_uz, name_ru, slug, description_uz, description_ru, price, "productType", "brandId", status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), '{name_uz}', '{name_ru}', '{slug}', {desc_uz_sql}, {desc_ru_sql}, {price}, '{product_type}', '{brand_id}', 'archived', NOW(), NOW()) ON CONFLICT (slug) DO UPDATE SET name_uz = EXCLUDED.name_uz, name_ru = EXCLUDED.name_ru, description_uz = EXCLUDED.description_uz, description_ru = EXCLUDED.description_ru, price = EXCLUDED.price, "updatedAt" = NOW();"""
        
        psql_cmd = ['psql', 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb', '-c', sql]
        
        result = subprocess.run(psql_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ [{i}/{len(products)}] {product['name_uz']}")
            success += 1
        else:
            error_msg = result.stderr[:100] if result.stderr else result.stdout[:100]
            print(f"❌ [{i}/{len(products)}] {product['name_uz']}: {error_msg}")
            failed += 1
            errors.append(f"{i}: {product['name_uz']}")
            
    except Exception as e:
        failed += 1
        errors.append(f"{i}: {product.get('name_uz', 'Unknown')} - {str(e)}")
        print(f"❌ [{i}/{len(products)}] Xatolik: {str(e)}")

print("")
print("📊 Import Summary:")
print(f"   ✅ Success: {success}")
print(f"   ❌ Failed: {failed}")

if errors:
    print("")
    print("❌ Errors:")
    for err in errors[:10]:
        print(f"   {err}")
