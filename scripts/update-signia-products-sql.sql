-- Signia apparatlarni tahlil qilib yangilash
-- Form Factors, Audience, Smartphone Compatibility

-- Signia Active va Active Pro - RIC, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Active%' OR name_ru LIKE '%Active%')
  AND (name_uz LIKE '%Pro%' OR name_ru LIKE '%Pro%');

-- Signia Active (Pro bo'lmagan) - RIC, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Active%' OR name_ru LIKE '%Active%')
  AND name_uz NOT LIKE '%Pro%'
  AND name_ru NOT LIKE '%Pro%';

-- Signia INTUIS M (M = Mini/Medium) - ITE yoki ITC, adults/elderly
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['ITE', 'ITC']::text[],
  audience = ARRAY['adults', 'elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS M%' OR name_ru LIKE '%INTUIS M%');

-- Signia INTUIS P (P = Power) - BTE yoki RIC, elderly (yuqori quvvat)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE', 'RIC']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS P%' OR name_ru LIKE '%INTUIS P%');

-- Signia INTUIS SP (SP = Super Power) - BTE, elderly (juda yuqori quvvat)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE']::text[],
  audience = ARRAY['elderly']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%INTUIS SP%' OR name_ru LIKE '%INTUIS SP%');

-- Signia Pure Charge&Go - RIC, adults, bluetooth (zaryadlovchi)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls', 'streaming']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%Pure%' OR name_ru LIKE '%Pure%')
  AND (name_uz LIKE '%Charge%' OR name_ru LIKE '%Charge%');

-- Signia AX seriyasi - RIC, adults, bluetooth (zamonaviy)
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['RIC']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls', 'streaming']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%AX%' OR name_ru LIKE '%AX%')
  AND (name_uz LIKE '%Motion%' OR name_ru LIKE '%Motion%');

-- Signia AX Insio - ITE, adults
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['ITE']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND (name_uz LIKE '%AX%' OR name_ru LIKE '%AX%')
  AND (name_uz LIKE '%Insio%' OR name_ru LIKE '%Insio%');

-- Boshqa Signia apparatlar - default: BTE, adults, bluetooth
UPDATE "Product" 
SET 
  "formFactors" = ARRAY['BTE']::text[],
  audience = ARRAY['adults']::text[],
  "smartphoneCompatibility" = ARRAY['bluetooth', 'app', 'phone-calls']::text[]
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND ("formFactors" IS NULL OR array_length("formFactors", 1) IS NULL)
  AND (name_uz NOT LIKE '%Active%' AND name_uz NOT LIKE '%INTUIS%' AND name_uz NOT LIKE '%Pure%' AND name_uz NOT LIKE '%AX%');

-- Natijani ko'rish
SELECT 
  name_uz,
  name_ru,
  "formFactors",
  audience,
  "smartphoneCompatibility"
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
ORDER BY name_uz;
