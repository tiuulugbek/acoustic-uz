#!/usr/bin/env python3
"""JSON faylni Excel'ga o'zgartirish"""
import json
import sys

try:
    import xlsxwriter
except ImportError:
    print("xlsxwriter o'rnatilmagan. O'rnatish: pip install xlsxwriter")
    sys.exit(1)

json_file = '/root/signia-products-import.json'
excel_file = '/root/signia-products-import.xlsx'

with open(json_file, 'r', encoding='utf-8') as f:
    products = json.load(f)

workbook = xlsxwriter.Workbook(excel_file)
worksheet = workbook.add_worksheet('Products')

# Headers
headers = ['name_uz', 'name_ru', 'slug', 'price', 'productType', 'brandName', 'description_uz', 'description_ru']
for col, header in enumerate(headers):
    worksheet.write(0, col, header)

# Data
for row, product in enumerate(products, 1):
    worksheet.write(row, 0, product.get('name_uz', ''))
    worksheet.write(row, 1, product.get('name_ru', ''))
    worksheet.write(row, 2, product.get('slug', ''))
    worksheet.write(row, 3, product.get('price', ''))
    worksheet.write(row, 4, product.get('productType', 'hearing-aids'))
    worksheet.write(row, 5, product.get('brandName', 'Signia'))
    worksheet.write(row, 6, product.get('description_uz', ''))
    worksheet.write(row, 7, product.get('description_ru', ''))

workbook.close()
print(f"✅ Excel fayl yaratildi: {excel_file}")
print(f"📦 {len(products)} ta mahsulot")
