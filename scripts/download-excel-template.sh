#!/bin/bash
# Excel template yuklab olish

API_URL="http://localhost:3001/api/products/import/excel-template"
TOKEN="${JWT_TOKEN:-}"
OUTPUT_FILE="${1:-products-template.xlsx}"

if [ -z "$TOKEN" ]; then
    echo "⚠️ JWT_TOKEN o'rnatilmagan"
    echo "   export JWT_TOKEN='your-jwt-token'"
    echo "   yoki"
    echo "   $0 [output-file.xlsx] 'your-jwt-token'"
    exit 1
fi

echo "📥 Excel template yuklanmoqda..."
echo ""

curl -X GET "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -o "$OUTPUT_FILE" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1

if [ -f "$OUTPUT_FILE" ]; then
    echo "✅ Template yuklandi: $OUTPUT_FILE"
    echo "📝 Endi bu faylni to'ldiring va import qiling"
else
    echo "❌ Template yuklanmadi"
fi
