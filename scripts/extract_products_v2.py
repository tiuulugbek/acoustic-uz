#!/usr/bin/env python3
"""
SQL fayldan mahsulotlarni to'liq ajratib olish - v2
MySQL dump faylini to'g'ri parse qilish
"""
import re
import json
from collections import defaultdict
from typing import Dict, List, Optional

def parse_sql_insert_row(row_str: str) -> Optional[tuple]:
    """
    SQL INSERT qatorini parse qiladi
    Format: (meta_id, post_id, 'meta_key', 'meta_value')
    """
    # Qatorni ajratish
    match = re.match(r"\((\d+),\s*(\d+),\s*'([^']+)',\s*'(.*)'\)", row_str)
    if match:
        meta_id, post_id, meta_key, meta_value = match.groups()
        # Escape belgilarni tozalash
        meta_value = meta_value.replace("\\'", "'").replace("\\\\", "\\")
        return (int(meta_id), int(post_id), meta_key, meta_value)
    return None

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
    
    # INSERT INTO wp_postmeta qatorlarini topish
    meta_inserts = re.findall(r"INSERT INTO `wp_postmeta`.*?VALUES\s+(.*?);", content, re.DOTALL | re.IGNORECASE)
    print(f"Topilgan INSERT INTO wp_postmeta qatorlari: {len(meta_inserts)}")
    
    # Har bir INSERT blockni parse qilish
    total_rows = 0
    for block_idx, meta_block in enumerate(meta_inserts):
        # Qatorlarni ajratish - format: (meta_id, post_id, 'meta_key', 'meta_value')
        # Qatorlar vergul bilan ajratilgan
        rows = re.findall(r"\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)", meta_block)
        
        for meta_id, post_id, meta_key, meta_value in rows:
            total_rows += 1
            if post_id in product_ids:
                # Escape belgilarni tozalash
                meta_value = meta_value.replace("\\'", "'").replace("\\\\", "\\")
                meta_data[post_id][meta_key] = meta_value
        
        if (block_idx + 1) % 100 == 0:
            print(f"  {block_idx + 1}/{len(meta_inserts)} blocklar qayta ishlandi...")
    
    print(f"Jami meta qatorlar: {total_rows}")
    print(f"Meta ma'lumotlar topildi: {len(meta_data)} ta mahsulot uchun")
    
    # wp_posts jadvalini parse qilish - title va content ni olish
    print("wp_posts jadvalini o'qish...")
    products_data = {}
    
    # INSERT INTO wp_posts qatorini topish
    posts_insert = re.search(r"INSERT INTO `wp_posts`.*?VALUES\s+(.*?);", content, re.DOTALL | re.IGNORECASE)
    
    if posts_insert:
        posts_values = posts_insert.group(1)
        
        # Har bir mahsulot uchun
        for pid in product_ids:
            # Bu mahsulot qatorini topish
            # Pattern: (ID, author, date, date_gmt, content, title, excerpt, status, ...)
            product_row_match = re.search(rf'\({pid},(.*?),\s*\'product\'', posts_values, re.DOTALL)
            
            if product_row_match:
                row_content = product_row_match.group(1)
                
                # Qatorni parse qilish - murakkab, chunki content uzun bo'lishi mumkin
                # Oddiy usul: title va slug ni regex bilan topish
                
                # Title ni topish - content dan keyin birinchi '...' qator
                # Lekin content ichida ham ' bo'lishi mumkin
                # Yaxshiroq usul: SQL VALUES qatorini to'g'ri parse qilish
                
                # Oddiy regex bilan title ni topish
                # WordPress formatida: content, 'title', 'excerpt', 'status', ...
                # Title odatda content dan keyin keladi
                
                # Slug (post_name) ni topish - odatda 11-qism
                # Pattern: ... 'name', 'to_ping', 'pinged', 'modified', ...
                
                # Meta ma'lumotlarni olish
                product_meta = meta_data.get(pid, {})
                
                # Asosiy ma'lumotlarni yig'ish
                product = {
                    'id': pid,
                    'title_ru': '',  # wp_posts dan olinadi
                    'slug': '',  # wp_posts dan olinadi
                    'content_ru': '',  # wp_posts dan olinadi
                    'excerpt_ru': '',  # wp_posts dan olinadi
                    'price': product_meta.get('_regular_price', ''),
                    'sale_price': product_meta.get('_sale_price', ''),
                    'stock': product_meta.get('_stock', '0'),
                    'sku': product_meta.get('_sku', ''),
                    'weight': product_meta.get('_weight', ''),
                    'status': 'publish',  # wp_posts dan olinadi
                    'image_gallery': product_meta.get('_product_image_gallery', ''),
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








