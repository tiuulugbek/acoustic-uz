-- Signia apparatlarni kategoriya va kataloglarga ajratish

BEGIN;

-- 1. Form Factors asosida kategoriyalarga ajratish

-- BTE apparatlar
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-bte' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'BTE' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- ITE apparatlar
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-ite' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'ITE' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- ITC apparatlar
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'itc' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'ITC' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- CIC apparatlar
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-cic' OR slug = 'cic' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'CIC' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- RIC apparatlar
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-ric' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'RIC' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- Agar bir nechta form factor bo'lsa, birinchisini tanlash
-- BTE/RIC → RIC (zamonaviyroq)
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-ric' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'RIC' = ANY("formFactors")
  AND 'BTE' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- ITE/ITC → ITE (kattaroq)
UPDATE "Product" 
SET "categoryId" = (SELECT id FROM "ProductCategory" WHERE slug = 'category-ite' LIMIT 1)
WHERE "brandId" = 'cmiknllmo000476v71d73sn03' 
  AND 'ITE' = ANY("formFactors")
  AND 'ITC' = ANY("formFactors")
  AND "categoryId" IS NULL;

-- 2. Audience va Smartphone Compatibility asosida kataloglarga ajratish

-- Bolalar uchun
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'bolalar-va-osmirlar-uchun' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'children' = ANY(p.audience)
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'bolalar-va-osmirlar-uchun' LIMIT 1)
    AND ptc."B" = p.id
  );

-- Keksalar uchun
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'keksalar-uchun' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'elderly' = ANY(p.audience)
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'keksalar-uchun' LIMIT 1)
    AND ptc."B" = p.id
  );

-- Kuchli va superkuchli (elderly + power)
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'kuchli-va-superkuchli' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND ('elderly' = ANY(p.audience) OR p.name_uz LIKE '%P%' OR p.name_uz LIKE '%SP%' OR p.name_uz LIKE '%Power%')
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'kuchli-va-superkuchli' LIMIT 1)
    AND ptc."B" = p.id
  );

-- Smartfon uchun (bluetooth/app bilan)
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'smartfon-uchun' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND ('bluetooth' = ANY(p."smartphoneCompatibility") OR 'app' = ANY(p."smartphoneCompatibility"))
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'smartfon-uchun' LIMIT 1)
    AND ptc."B" = p.id
  );

-- Ko'rinmas (CIC/IIC)
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'ko-rinmas' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND ('CIC' = ANY(p."formFactors") OR 'IIC' = ANY(p."formFactors"))
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'ko-rinmas' LIMIT 1)
    AND ptc."B" = p.id
  );

-- Ko'rinmas quloq orqasidagi (RIC/RITE)
INSERT INTO "_ProductToCatalog" ("A", "B")
SELECT 
  (SELECT id FROM "Catalog" WHERE slug = 'ko-rinmas-quloq-orqasidagi' LIMIT 1) as "A",
  p.id as "B"
FROM "Product" p
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND ('RIC' = ANY(p."formFactors") OR 'RITE' = ANY(p."formFactors"))
  AND NOT EXISTS (
    SELECT 1 FROM "_ProductToCatalog" ptc 
    WHERE ptc."A" = (SELECT id FROM "Catalog" WHERE slug = 'ko-rinmas-quloq-orqasidagi' LIMIT 1)
    AND ptc."B" = p.id
  );

COMMIT;

-- Natijani ko'rish
SELECT 
  p.name_uz,
  pc.name_uz as category,
  array_agg(DISTINCT c.name_uz) as catalogs
FROM "Product" p
LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id
LEFT JOIN "_ProductToCatalog" ptc ON ptc."B" = p.id
LEFT JOIN "Catalog" c ON ptc."A" = c.id
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
GROUP BY p.name_uz, pc.name_uz
ORDER BY p.name_uz
LIMIT 20;
