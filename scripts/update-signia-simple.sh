#!/bin/bash

# Signia apparatlarni yangilash script

PGPASSWORD='Acoustic##4114'
DB_HOST="localhost"
DB_USER="acoustic_user"
DB_NAME="acousticwebdb"
BRAND_ID="cmiknllmo000476v71d73sn03"

echo "🔍 Signia apparatlarni tahlil qilmoqda..."

# Signia Active Pro - RIC, adults, bluetooth
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = '$BRAND_ID' 
  AND (name_uz LIKE '%Active Pro%' OR name_ru LIKE '%Active Pro%');
SQL

# Signia Active - RIC, adults, bluetooth
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = '$BRAND_ID' 
  AND (name_uz LIKE '%Active%' OR name_ru LIKE '%Active%')
  AND name_uz NOT LIKE '%Pro%'
  AND name_ru NOT LIKE '%Pro%';
SQL

# Signia INTUIS M - ITE/ITC, adults/elderly
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['ITE', 'ITC']::text[],
  audience = ARRAY['adults', 'elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = '$BRAND_ID' 
  AND (name_uz LIKE '%INTUIS M%' OR name_ru LIKE '%INTUIS M%');
SQL

# Signia INTUIS P - BTE/RIC, elderly (power)
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE', 'RIC']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = '$BRAND_ID' 
  AND (name_uz LIKE '%INTUIS P%' OR name_ru LIKE '%INTUIS P%');
SQL

# Signia INTUIS SP - BTE, elderly (super power)
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = '$BRAND_ID' 
  AND (name_uz LIKE '%INTUIS SP%' OR name_ru LIKE '%INTUIS SP%');
SQL

echo "✅ Yangilanishlar yakunlandi!"

# Natijani ko'rish
echo ""
echo "📊 Yangilangan apparatlar:"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<SQL
SELECT 
  name_uz,
  "formFactors",
  audience,
  "smartphoneCompatibility"
FROM "Product"
WHERE "brandId" = '$BRAND_ID'
ORDER BY name_uz;
SQL
