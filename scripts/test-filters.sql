-- Filterlarni test qilish

-- 1. Form Factor filter test
SELECT 
  'Form Factor: BTE' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'BTE' = ANY("formFactors");

SELECT 
  'Form Factor: RIC' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'RIC' = ANY("formFactors");

SELECT 
  'Form Factor: CIC' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'CIC' = ANY("formFactors");

-- 2. Audience filter test
SELECT 
  'Audience: adults' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'adults' = ANY(audience);

SELECT 
  'Audience: elderly' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'elderly' = ANY(audience);

-- 3. Smartphone Compatibility filter test
SELECT 
  'Smartphone: bluetooth' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'bluetooth' = ANY("smartphoneCompatibility");

SELECT 
  'Smartphone: streaming' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'streaming' = ANY("smartphoneCompatibility");

-- 4. Kombinatsiyalangan filterlar test
SELECT 
  'BTE + adults + bluetooth' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'BTE' = ANY("formFactors")
  AND 'adults' = ANY(audience)
  AND 'bluetooth' = ANY("smartphoneCompatibility");

SELECT 
  'RIC + elderly + streaming' as test_name,
  COUNT(*) as result_count
FROM "Product"
WHERE "brandId" = 'cmiknllmo000476v71d73sn03'
  AND 'RIC' = ANY("formFactors")
  AND 'elderly' = ANY(audience)
  AND 'streaming' = ANY("smartphoneCompatibility");

-- 5. Kategoriya filter test
SELECT 
  'Category: RIC (Kanal ichida)' as test_name,
  COUNT(*) as result_count
FROM "Product" p
JOIN "ProductCategory" pc ON p."categoryId" = pc.id
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND pc.slug = 'category-ric';

-- 6. Katalog filter test
SELECT 
  'Catalog: Smartfon uchun' as test_name,
  COUNT(DISTINCT p.id) as result_count
FROM "Product" p
JOIN "_ProductToCatalog" ptc ON ptc."B" = p.id
JOIN "Catalog" c ON ptc."A" = c.id
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND c.slug = 'smartfon-uchun';

SELECT 
  'Catalog: Keksalar uchun' as test_name,
  COUNT(DISTINCT p.id) as result_count
FROM "Product" p
JOIN "_ProductToCatalog" ptc ON ptc."B" = p.id
JOIN "Catalog" c ON ptc."A" = c.id
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND c.slug = 'keksalar-uchun';

-- 7. Kombinatsiyalangan filterlar (kategoriya + katalog)
SELECT 
  'Category: RIC + Catalog: Smartfon uchun' as test_name,
  COUNT(DISTINCT p.id) as result_count
FROM "Product" p
JOIN "ProductCategory" pc ON p."categoryId" = pc.id
JOIN "_ProductToCatalog" ptc ON ptc."B" = p.id
JOIN "Catalog" c ON ptc."A" = c.id
WHERE p."brandId" = 'cmiknllmo000476v71d73sn03'
  AND pc.slug = 'category-ric'
  AND c.slug = 'smartfon-uchun';
