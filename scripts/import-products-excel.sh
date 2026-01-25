#!/bin/bash
# Excel fayl orqali mahsulotlarni import qilish

EXCEL_FILE="$1"
API_URL="http://localhost:3001/api/products/import/excel"
TOKEN="${JWT_TOKEN:-}"

if [ -z "$EXCEL_FILE" ]; then
    echo "Foydalanish: $0 <excel-file.xlsx> [JWT_TOKEN]"
    echo ""
    echo "Misol:"
    echo "  export JWT_TOKEN='your-jwt-token'"
    echo "  $0 products.xlsx"
    exit 1
fi

if [ ! -f "$EXCEL_FILE" ]; then
    echo "❌ Fayl topilmadi: $EXCEL_FILE"
    exit 1
fi

if [ -z "$TOKEN" ]; then
    echo "⚠️ JWT_TOKEN o'rnatilmagan"
    echo "   export JWT_TOKEN='your-jwt-token'"
    echo "   yoki"
    echo "   $0 $EXCEL_FILE 'your-jwt-token'"
    exit 1
fi

echo "📤 Excel fayl yuklanmoqda: $EXCEL_FILE"
echo ""

curl -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$EXCEL_FILE" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1

echo ""
echo "✅ Import yakunlandi"
