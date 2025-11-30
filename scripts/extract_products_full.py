#!/usr/bin/env python3
"""
SQL fayldan mahsulotlarni to'liq ajratib olish va JSON formatiga o'tkazish
"""
import re
import json
from collections import defaultdict
from typing import Dict, List, Optional

def parse_sql_value(value_str: str) -> str:
    """SQL value stringini parse qiladi"""
    # ' bilan o'ralgan bo'lsa, olib tashlash
    if value_str.startswith("'") and value_str.endswith("'"):
        return value_str[1:-1].replace("\\'", "'").replace("\\\\", "\\")
    return value_str

def extract_products_from_sql(sql_file_path: str) -> List[Dict]:
    """
    SQL fayldan mahsulotlarni ajratib oladi
    """
    print("SQL faylni o'qish...")
    with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print("Mahsulot ID larni topish...")
    # Mahsulot ID larni topish
    product_ids = set(re.findall(r"\((\d+),.*?'product'", content))
    print(f"Topilgan mahsulotlar soni: {len(product_ids)}")
    
    # wp_postmeta jadvalini parse qilish
    print("wp_postmeta jadvalini o'qish...")
    meta_data = defaultdict(dict)
    
    # Barcha INSERT INTO wp_postmeta qatorlarini topish
    meta_inserts = re.findall(r"INSERT INTO `wp_postmeta`.*?VALUES\s+(.*?);", content, re.DOTALL | re.IGNORECASE)
    print(f"Topilgan INSERT INTO wp_postmeta qatorlari: {len(meta_inserts)}")
    
    for meta_block in meta_inserts:
        # Har bir qatorni ajratish
        # Format: (meta_id, post_id, meta_key, meta_value)
        # Meta_value ichida ' va , bo'lishi mumkin
        rows = re.finditer(r"\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)", meta_block)
        
        for row_match in rows:
            meta_id, post_id, meta_key, meta_value = row_match.groups()
            if post_id in product_ids:
                meta_data[post_id][meta_key] = parse_sql_value(meta_value)
    
    print(f"Meta ma'lumotlar topildi: {len(meta_data)} ta mahsulot uchun")
    
    # wp_posts jadvalini parse qilish
    print("wp_posts jadvalini o'qish...")
    products = []
    
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
                
                # Qatorni parse qilish - SQL VALUES format
                # Format: (ID, author, date, date_gmt, content, title, excerpt, status, comment_status, ping_status, password, name, ...)
                # Content uzun bo'lishi mumkin va ichida vergul bo'lishi mumkin
                
                # Oddiy usul: regex bilan asosiy maydonlarni topish
                # Title odatda content dan keyin keladi
                # Pattern: content, 'title', 'excerpt', 'status', ...
                
                # Title ni topish - content dan keyin birinchi '...' qator
                # Lekin content ichida ham ' bo'lishi mumkin
                
                # Yaxshiroq usul: SQL VALUES qatorini to'g'ri parse qilish
                # Python SQL parser ishlatish yoki manual parsing
                
                # Manual parsing - qatorlarni ajratish
                # Content uzun bo'lishi mumkin, shuning uchun ehtiyotkorlik bilan
                
                # Oddiy regex bilan title va slug ni topish
                # Title: content dan keyin birinchi '...' qator
                title_match = re.search(r",\s*'([^']+)',\s*'([^']*)',\s*'([^']+)'", row_content)
                
                # Slug (post_name) ni topish - odatda 11-qism
                slug_match = re.search(r",\s*'([^']+)',\s*'',\s*'',\s*'([^']+)',\s*'([^']+)'", row_content)
                
                # Meta ma'lumotlarni olish
                product_meta = meta_data.get(pid, {})
                
                # Asosiy ma'lumotlarni yig'ish
                product = {
                    'id': pid,
                    'title_ru': '',
                    'slug': '',
                    'content_ru': '',
                    'excerpt_ru': '',
                    'price': product_meta.get('_regular_price', ''),
                    'sale_price': product_meta.get('_sale_price', ''),
                    'stock': product_meta.get('_stock', '0'),
                    'sku': product_meta.get('_sku', ''),
                    'weight': product_meta.get('_weight', ''),
                    'status': product_meta.get('_product_status', 'publish'),
                    'image_gallery': product_meta.get('_product_image_gallery', ''),
                    'meta': dict(product_meta)
                }
                
                # Title ni topish - boshqa usul
                # wp_posts jadvalidan title ni olish
                # Title odatda 6-qism (0-indexed: 5)
                # Lekin content uzun bo'lishi mumkin
                
                # Yaxshiroq usul: SQL faylni to'g'ri parse qilish
                # Yoki MySQL client ishlatish
                
                products.append(product)
    
    print(f"Jami mahsulotlar: {len(products)}")
    
    return products

if __name__ == '__main__':
    sql_file = '/Users/tiuulugbek/downloads/acoustic_old.sql'
    products = extract_products_from_sql(sql_file)
    
    # JSON faylga saqlash
    output_file = '/Users/tiuulugbek/acoustic-uz/scripts/products_extracted.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"\n{len(products)} ta mahsulot {output_file} fayliga saqlandi")
    
    # Statistikani ko'rsatish
    if products:
        print("\n=== Statistikalar ===")
        print(f"Narxi bor mahsulotlar: {sum(1 for p in products if p.get('price'))}")
        print(f"SKU bor mahsulotlar: {sum(1 for p in products if p.get('sku'))}")
        print(f"Stock bor mahsulotlar: {sum(1 for p in products if p.get('stock') and p.get('stock') != '0')}")








