#!/usr/bin/env python3
"""
SQL fayldan mahsulotlarni to'liq ajratib olish - Final versiya
"""
import re
import json
from collections import defaultdict
from typing import Dict, List, Optional

def extract_products_from_sql(sql_file_path: str) -> Dict:
    """
    SQL fayldan mahsulotlarni ajratib oladi
    """
    print("SQL faylni o'qish...")
    with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print("Mahsulot ID larni topish...")
    # Mahsulot ID larni topish - wp_posts jadvalidan
    product_ids = set(re.findall(r"\((\d+),.*?'product'", content))
    print(f"Topilgan mahsulotlar soni: {len(product_ids)}")
    
    # wp_postmeta jadvalini parse qilish
    print("wp_postmeta jadvalini o'qish...")
    meta_data = defaultdict(dict)
    
    # Har bir mahsulot ID uchun meta ma'lumotlarni qidirish
    for idx, pid in enumerate(product_ids):
        # Bu ID uchun barcha meta qatorlarni topish
        # Pattern: (meta_id, pid, 'key', 'value')
        pattern = rf"\((\d+),\s*{pid},\s*'([^']+)',\s*'([^']*)'\)"
        matches = re.findall(pattern, content)
        
        for meta_id, meta_key, meta_value in matches:
            # Escape belgilarni tozalash
            meta_value = meta_value.replace("\\'", "'").replace("\\\\", "\\")
            meta_data[pid][meta_key] = meta_value
        
        if (idx + 1) % 10 == 0:
            print(f"  {idx + 1}/{len(product_ids)} mahsulotlar qayta ishlandi...")
    
    print(f"Meta ma'lumotlar topildi: {len(meta_data)} ta mahsulot uchun")
    
    # wp_posts jadvalini parse qilish - title, content, slug ni olish
    print("wp_posts jadvalini o'qish...")
    products_data = {}
    
    # INSERT INTO wp_posts qatorini topish
    posts_insert = re.search(r"INSERT INTO `wp_posts`.*?VALUES\s+(.*?);", content, re.DOTALL | re.IGNORECASE)
    
    if posts_insert:
        posts_values = posts_insert.group(1)
        
        # Har bir mahsulot uchun
        for pid in product_ids:
            # Bu mahsulot qatorini topish
            product_row_match = re.search(rf'\({pid},(.*?),\s*\'product\'', posts_values, re.DOTALL)
            
            if product_row_match:
                row_content = product_row_match.group(1)
                
                # Qatorni parse qilish - murakkab, chunki content uzun bo'lishi mumkin
                # WordPress formatida: (ID, author, date, date_gmt, content, title, excerpt, status, ...)
                
                # Title ni topish - content dan keyin birinchi '...' qator
                # Lekin content ichida ham ' bo'lishi mumkin
                # Oddiy usul: title ni regex bilan topish
                
                # Pattern: content, 'title', 'excerpt', 'status', ...
                # Content uzun bo'lishi mumkin, shuning uchun ehtiyotkorlik bilan
                
                # Yaxshiroq usul: title va slug ni alohida qidirish
                # Title odatda content dan keyin keladi
                # Slug (post_name) odatda 11-qism
                
                # Meta ma'lumotlarni olish
                product_meta = meta_data.get(pid, {})
                
                # wp_posts dan title va slug ni olish
                # Title ni topish - boshqa usul
                # Slug ni topish
                slug_match = re.search(rf'\({pid},.*?,\s*\'([^\']+)\',\s*\'[^\']*\',\s*\'[^\']*\',\s*\'[^\']+\',\s*\'[^\']+\',\s*\'[^\']+\',\s*\'[^\']+\',\s*\'[^\']+\',\s*\'[^\']+\',\s*\'([^\']+)\'', row_content)
                
                # Asosiy ma'lumotlarni yig'ish
                product = {
                    'id': pid,
                    'title_ru': '',  # Keyinroq to'ldiriladi
                    'slug': slug_match.group(2) if slug_match else '',
                    'content_ru': '',  # Keyinroq to'ldiriladi
                    'excerpt_ru': '',  # Keyinroq to'ldiriladi
                    'price': product_meta.get('_regular_price', ''),
                    'sale_price': product_meta.get('_sale_price', ''),
                    'stock': product_meta.get('_stock', '0'),
                    'sku': product_meta.get('_sku', ''),
                    'weight': product_meta.get('_weight', ''),
                    'status': 'publish',
                    'image_gallery': product_meta.get('_product_image_gallery', ''),
                    'thumbnail_id': product_meta.get('_thumbnail_id', ''),
                    'meta': dict(product_meta)
                }
                
                products_data[pid] = product
    
    print(f"Jami mahsulotlar: {len(products_data)}")
    
    return {
        'products': list(products_data.values()),
        'meta_stats': {
            'total_products': len(product_ids),
            'products_with_meta': len(meta_data),
            'products_with_price': sum(1 for p in products_data.values() if p.get('price')),
            'products_with_sku': sum(1 for p in products_data.values() if p.get('sku')),
            'products_with_stock': sum(1 for p in products_data.values() if p.get('stock') and p.get('stock') != '0'),
        }
    }

if __name__ == '__main__':
    sql_file = '/Users/tiuulugbek/downloads/acoustic_old.sql'
    result = extract_products_from_sql(sql_file)
    
    # JSON faylga saqlash
    output_file = '/Users/tiuulugbek/acoustic-uz/scripts/products_extracted.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n{len(result['products'])} ta mahsulot {output_file} fayliga saqlandi")
    print("\n=== Statistikalar ===")
    for key, value in result['meta_stats'].items():
        print(f"{key}: {value}")
    
    # Birinchi mahsulotni ko'rsatish
    if result['products']:
        print("\n=== Birinchi mahsulot (namuna) ===")
        first = result['products'][0]
        print(f"ID: {first['id']}")
        print(f"Slug: {first['slug']}")
        print(f"Price: {first['price']}")
        print(f"SKU: {first['sku']}")
        print(f"Stock: {first['stock']}")
        print(f"Meta kalitlar: {len(first['meta'])} ta")








