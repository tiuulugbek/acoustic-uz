-- Signia apparatlarni to'liq tahlil qilib yangilash
-- Form Factors, Audience, Smartphone Compatibility

BEGIN;

-- 1. Signia Active Pro - RIC, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Active Pro%' OR name_ru LIKE '%Active Pro%');

-- 2. Signia Active (Pro bo'lmagan) - RIC, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Active%' OR name_ru LIKE '%Active%')
  AND name_uz NOT LIKE '%Pro%'
  AND name_ru NOT LIKE '%Pro%';

-- 3. Signia INTUIS M (M = Mini/Medium) - ITE/ITC, adults/elderly
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['ITE', 'ITC']::text[],
  audience = ARRAY['adults', 'elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS M%' OR name_ru LIKE '%INTUIS M%');

-- 4. Signia INTUIS P (P = Power) - BTE/RIC, elderly (yuqori quvvat)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE', 'RIC']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS P%' OR name_ru LIKE '%INTUIS P%');

-- 5. Signia INTUIS SP (SP = Super Power) - BTE, elderly (juda yuqori quvvat)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS SP%' OR name_ru LIKE '%INTUIS SP%');

-- 6. Signia MOTION CHARGE&GO - RIC, adults, bluetooth (zaryadlovchi)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls', 'streaming']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%MOTION%' OR name_ru LIKE '%MOTION%')
  AND (name_uz LIKE '%CHARGE%' OR name_ru LIKE '%CHARGE%');

-- 7. Signia MOTION CHARGE&GO P (Power) - RIC, elderly
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls', 'streaming']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%MOTION%' OR name_ru LIKE '%MOTION%')
  AND (name_uz LIKE '%CHARGE%' OR name_ru LIKE '%CHARGE%')
  AND (name_uz LIKE '% P %' OR name_ru LIKE '% P %');

-- 8. Signia MOTION CHARGE&GO SP (Super Power) - RIC, elderly
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls', 'streaming']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%MOTION%' OR name_ru LIKE '%MOTION%')
  AND (name_uz LIKE '%CHARGE%' OR name_ru LIKE '%CHARGE%')
  AND (name_uz LIKE '% SP %' OR name_ru LIKE '% SP %');

-- 9. Signia Insio CIC - CIC, adults
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['CIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Insio%' OR name_ru LIKE '%Insio%')
  AND (name_uz LIKE '%CIC%' OR name_ru LIKE '%CIC%');

-- 10. Boshqa Signia apparatlar - default: BTE, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND ("formFactors" IS NULL OR array_length("formFactors", 1) IS NULL)
  AND name_uz NOT LIKE '%Active%' 
  AND name_uz NOT LIKE '%INTUIS%' 
  AND name_uz NOT LIKE '%MOTION%'
  AND name_uz NOT LIKE '%Insio%';

COMMIT;

-- Natijani ko'rish
SELECT 
  name_uz,
  "formFactors",
  audience,
  "smartphoneCompatibility"
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
ORDER BY name_uz;
