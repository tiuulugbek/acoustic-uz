-- ============================================
-- Bo'sh Filterlarni To'ldirish
-- ============================================
-- Bu script bo'sh qolgan filter maydonlarini to'ldirish uchun
-- mahsulotlarni ko'rsatadi va ularni yangilash uchun SQL so'rovlarni beradi

\echo '============================================'
\echo 'BO''SH FILTERLARNI TOPISH'
\echo '============================================'
\echo ''

-- 1. FORM FACTORS BO'SH MAHSULOTLAR
\echo '1. FORM FACTORS BO''SH MAHSULOTLAR (11 ta)'
\echo '--------------------------------------------'
SELECT 
    id,
    "name_uz",
    "name_ru",
    "brandId",
    "productType"
FROM "Product"
WHERE "status" = 'published' 
  AND ("formFactors" IS NULL OR array_length("formFactors", 1) IS NULL)
ORDER BY "name_uz";
\echo ''

-- 2. SMARTPHONE COMPATIBILITY BO'SH MAHSULOTLAR
\echo '2. SMARTPHONE COMPATIBILITY BO''SH MAHSULOTLAR (8 ta)'
\echo '--------------------------------------------'
SELECT 
    id,
    "name_uz",
    "name_ru",
    "brandId",
    "productType"
FROM "Product"
WHERE "status" = 'published' 
  AND ("smartphoneCompatibility" IS NULL OR array_length("smartphoneCompatibility", 1) IS NULL)
ORDER BY "name_uz";
\echo ''

-- 3. AUDIENCE BO'SH MAHSULOTLAR
\echo '3. AUDIENCE BO''SH MAHSULOTLAR (1 ta)'
\echo '--------------------------------------------'
SELECT 
    id,
    "name_uz",
    "name_ru",
    "brandId",
    "productType"
FROM "Product"
WHERE "status" = 'published' 
  AND ("audience" IS NULL OR array_length("audience", 1) IS NULL)
ORDER BY "name_uz";
\echo ''

-- 4. HEARING LOSS LEVELS BO'SH MAHSULOTLAR
\echo '4. HEARING LOSS LEVELS BO''SH MAHSULOTLAR (51 ta)'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Bo'sh mahsulotlar soni"
FROM "Product"
WHERE "status" = 'published' 
  AND ("hearingLossLevels" IS NULL OR array_length("hearingLossLevels", 1) IS NULL);
\echo ''

-- 5. PAYMENT OPTIONS BO'SH MAHSULOTLAR
\echo '5. PAYMENT OPTIONS BO''SH MAHSULOTLAR (60 ta)'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Bo'sh mahsulotlar soni"
FROM "Product"
WHERE "status" = 'published' 
  AND ("paymentOptions" IS NULL OR array_length("paymentOptions", 1) IS NULL);
\echo ''

-- 6. KATALOGLARGA BIRIKTIRILMAGAN MAHSULOTLAR
\echo '6. KATALOGLARGA BIRIKTIRILMAGAN MAHSULOTLAR (61 ta)'
\echo '--------------------------------------------'
SELECT 
    p.id,
    p."name_uz",
    p."name_ru",
    p."brandId",
    p."productType",
    p."formFactors",
    p."audience"
FROM "Product" p
LEFT JOIN "_ProductToCatalog" ptc ON p.id = ptc."A"
WHERE p."status" = 'published' 
  AND ptc."A" IS NULL
ORDER BY p."name_uz"
LIMIT 20;
\echo ''

\echo '============================================'
\echo 'TAHLIL YAKUNLANDI'
\echo '============================================'
\echo ''
\echo 'Eslatma: Barcha bo''sh mahsulotlarni to''ldirish uchun'
\echo 'tegishli UPDATE so''rovlarini bajarish kerak.'
