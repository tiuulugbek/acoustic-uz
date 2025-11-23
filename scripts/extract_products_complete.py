#!/usr/bin/env python3
"""
SQL fayldan mahsulotlarni to'liq ajratib olish - Complete versiya
post_content ni to'g'ri ajratib oladi
"""
import re
import json
from collections import defaultdict

def parse_sql_insert_row(row_content: str) -> dict:
    """
    WordPress SQL INSERT qatorini parse qiladi
    Format: (id, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, ...)
    """
    # Qatorni vergul bilan ajratish, lekin qo'shtirnoq ichidagi vergullarni e'tiborsiz qoldirish
    parts = []
    current = ''
    in_quotes = False
    escape = False
    
    for i, char in enumerate(row_content):
        if escape:
            current += char
            escape = False
            continue
        
        if char == '\\':
            escape = True
            current += char
            continue
        
        if char == "'":
            in_quotes = not in_quotes
            current += char
            continue
        
        if char == ',' and not in_quotes:
            parts.append(current.strip())
            current = ''
            continue
        
        current += char
    
    if current:
        parts.append(current.strip())
    
    result = {}
    if len(parts) > 0:
        # ID (0)
        result['id'] = parts[0].strip("'\"")
    if len(parts) > 4:
        # post_content (4)
        content = parts[4]
        if content.startswith("'") and content.endswith("'"):
            content = content[1:-1]
        # Escape qilish
        content = content.replace("\\'", "'").replace("\\\\", "\\").replace("\\n", "\n").replace("\\r", "\r")
        result['post_content'] = content
    if len(parts) > 5:
        # post_title (5)
        title = parts[5]
        if title.startswith("'") and title.endswith("'"):
            title = title[1:-1]
        title = title.replace("\\'", "'").replace("\\\\", "\\")
        result['post_title'] = title
    if len(parts) > 6:
        # post_excerpt (6)
        excerpt = parts[6]
        if excerpt.startswith("'") and excerpt.endswith("'"):
            excerpt = excerpt[1:-1]
        excerpt = excerpt.replace("\\'", "'").replace("\\\\", "\\").replace("\\r\\n", "\n")
        result['post_excerpt'] = excerpt
    
    return result

def extract_products_from_sql(sql_file_path: str) -> dict:
    """
    SQL fayldan mahsulotlarni ajratib oladi
    """
    print("SQL faylni o'qish...")
    with open(sql_file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print("Mahsulot ID larni topish...")
    product_ids = set(re.findall(r"\((\d+),.*?'product'", content))
    print(f"Topilgan mahsulotlar soni: {len(product_ids)}")
    
    # wp_postmeta ma'lumotlarini olish
    print("wp_postmeta ma'lumotlarini olish...")
    meta_data = defaultdict(dict)
    
    for pid in product_ids:
        pattern = rf"\((\d+),\s*{pid},\s*'([^']+)',\s*'([^']*)'\)"
        matches = re.findall(pattern, content)
        for meta_id, meta_key, meta_value in matches:
            meta_value = meta_value.replace("\\'", "'").replace("\\\\", "\\")
            meta_data[pid][meta_key] = meta_value
    
    print(f"Meta ma'lumotlar topildi: {len(meta_data)} ta mahsulot uchun")
    
    # wp_posts dan title, content, slug ni olish
    print("wp_posts jadvalini o'qish...")
    products = []
    
    for idx, pid in enumerate(product_ids):
        # Bu mahsulot qatorini topish
        product_row_match = re.search(rf'\({pid},(.*?),\s*\'product\'', content, re.DOTALL)
        
        if product_row_match:
            row_content = product_row_match.group(1)
            
            # SQL INSERT qatorini parse qilish
            parsed = parse_sql_insert_row(row_content)
            
            # Slug ni topish - password dan keyin
            # Pattern: ... 'password', 'name', ...
            slug_match = re.search(r",\s*'([^']*)',\s*'([^']+)',\s*'',\s*'',\s*'([^']+)'", row_content[-500:])
            
            # Meta ma'lumotlarni olish
            product_meta = meta_data.get(pid, {})
            
            product = {
                'id': pid,
                'title_ru': parsed.get('post_title', ''),
                'slug': slug_match.group(2) if slug_match and slug_match.group(2) and not slug_match.group(2).startswith('2024-') and not slug_match.group(2).startswith('2023-') else '',
                'content_ru': parsed.get('post_content', ''),
                'excerpt_ru': parsed.get('post_excerpt', ''),
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
            
            products.append(product)
        
        if (idx + 1) % 10 == 0:
            print(f"  {idx + 1}/{len(product_ids)} mahsulotlar qayta ishlandi...")
    
    print(f"\nJami mahsulotlar: {len(products)}")
    
    # Statistikalar
    with_content = sum(1 for p in products if p.get('content_ru') and len(p.get('content_ru', '')) > 50)
    print(f"Tavsif bilan mahsulotlar: {with_content} ta")
    
    return {
        'products': products,
        'stats': {
            'total': len(products),
            'with_title': sum(1 for p in products if p.get('title_ru')),
            'with_slug': sum(1 for p in products if p.get('slug')),
            'with_content': with_content,
            'with_price': sum(1 for p in products if p.get('price')),
            'with_sku': sum(1 for p in products if p.get('sku')),
            'with_stock': sum(1 for p in products if p.get('stock') and p.get('stock') != '0'),
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
    for key, value in result['stats'].items():
        print(f"{key}: {value}")
    
    # Birinchi bir nechta mahsulotni ko'rsatish
    if result['products']:
        print("\n=== Birinchi 3 ta mahsulot (namuna) ===")
        for p in result['products'][:3]:
            print(f"\nID: {p['id']}")
            print(f"  Title: {p['title_ru'][:50]}")
            print(f"  Slug: {p['slug']}")
            print(f"  Content length: {len(p.get('content_ru', ''))} belgi")
            if p.get('content_ru'):
                print(f"  Content preview: {p['content_ru'][:100]}...")
            print(f"  Price: {p['price']}")
            print(f"  SKU: {p['sku']}")
            print(f"  Stock: {p['stock']}")
