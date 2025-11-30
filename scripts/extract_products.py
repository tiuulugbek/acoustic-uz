#!/usr/bin/env python3
"""
SQL fayldan mahsulotlarni ajratib olish va JSON formatiga o'tkazish scripti
"""
import re
import json
from datetime import datetime
from typing import Dict, List, Optional

def extract_products_from_sql(sql_file_path: str) -> List[Dict]:
    """
    SQL fayldan mahsulotlarni ajratib oladi
    """
    with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    products = []
    
    # Mahsulot ID larni topish
    product_ids = set(re.findall(r"\((\d+),.*?'product'", content))
    print(f"Topilgan mahsulotlar soni: {len(product_ids)}")
    
    # wp_postmeta jadvalini o'qish - meta ma'lumotlar uchun
    meta_data = {}
    meta_pattern = r"INSERT INTO `wp_postmeta`.*?VALUES\s+(.*?);"
    meta_matches = re.findall(meta_pattern, content, re.DOTALL | re.IGNORECASE)
    
    for meta_block in meta_matches:
        # Har bir meta qatorini ajratish
        meta_rows = re.findall(r"\((\d+),\s*'([^']+)',\s*'([^']*)'\)", meta_block)
        for post_id, meta_key, meta_value in meta_rows:
            if post_id not in meta_data:
                meta_data[post_id] = {}
            meta_data[post_id][meta_key] = meta_value
    
    # Har bir mahsulot uchun ma'lumotlarni olish
    for pid in product_ids:
        # INSERT INTO wp_posts qatorini topish
        # Pattern: (ID, author, date, date_gmt, content, title, excerpt, status, comment_status, ping_status, password, name, ...)
        pattern = rf'\({pid},\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\',\s*\'([^\']*)\',\s*\'([^\']+)\',\s*\'([^\']*)\',\s*\'([^\']+)\',\s*\'([^\']+)\',\s*\'([^\']+)\',\s*\'([^\']*)\',\s*\'([^\']+)\',\s*\'([^\']*)\',\s*\'([^\']*)\',\s*\'([^\']+)\',\s*\'([^\']+)\',\s*\'([^\']*)\',\s*(\d+),\s*\'([^\']*)\',\s*(\d+),\s*\'product\''
        
        # Kengroq pattern - content uzun bo'lishi mumkin
        product_match = re.search(rf'\({pid},.*?\'product\'', content, re.DOTALL)
        
        if product_match:
            product_row = product_match.group(0)
            # Qatorni ajratish
            # VALUES qatorini topish
            values_match = re.search(rf'\({pid},(.*?),\s*\'product\'', product_row, re.DOTALL)
            
            if values_match:
                values_str = values_match.group(1)
                # Qatorlarni ajratish - murakkab, chunki content ichida vergul bo'lishi mumkin
                # Oddiy usul: SQL parser ishlatish yoki manual parsing
                
                # Oddiy parsing - faqat asosiy ma'lumotlar
                # post_title ni topish
                title_match = re.search(rf'\({pid},.*?,\s*\'([^\']+)\',\s*\'([^\']*)\',\s*\'([^\']+)\'', product_row)
                
                # Yaxshiroq usul: SQL INSERT qatorini to'g'ri parse qilish
                # WordPress INSERT format: (ID, author, date, date_gmt, content, title, excerpt, status, ...)
                
                # Meta ma'lumotlarni olish
                product_meta = meta_data.get(pid, {})
                
                # Asosiy ma'lumotlarni olish
                product = {
                    'id': pid,
                    'title_ru': product_meta.get('_product_title', ''),
                    'slug': product_meta.get('_product_slug', ''),
                    'content_ru': product_meta.get('_product_content', ''),
                    'excerpt_ru': product_meta.get('_product_excerpt', ''),
                    'price': product_meta.get('_regular_price', ''),
                    'sale_price': product_meta.get('_sale_price', ''),
                    'stock': product_meta.get('_stock', '0'),
                    'sku': product_meta.get('_sku', ''),
                    'status': product_meta.get('_product_status', 'publish'),
                    'meta': product_meta
                }
                
                products.append(product)
    
    return products

if __name__ == '__main__':
    sql_file = '/Users/tiuulugbek/downloads/acoustic_old.sql'
    products = extract_products_from_sql(sql_file)
    
    # JSON faylga saqlash
    output_file = '/Users/tiuulugbek/acoustic-uz/scripts/products_extracted.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"\n{len(products)} ta mahsulot {output_file} fayliga saqlandi")








