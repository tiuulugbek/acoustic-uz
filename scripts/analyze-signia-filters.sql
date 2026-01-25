-- ============================================
-- Signia Mahsulotlari Filterlari Tahlili
-- ============================================
-- Faqat Signia brendidagi eshitish moslamalarini tahlil qiladi

\echo '============================================'
\echo 'SIGNIA MAHSULOTLARI FILTERLARI TAHLILI'
\echo '============================================'
\echo ''

-- Signia brend ID ni topish
\echo 'Signia brend ID:'
SELECT id, name FROM "Brand" WHERE LOWER(name) LIKE '%signia%';
\echo ''

-- 1. UMUMIY STATISTIKA (Faqat Signia)
\echo '1. UMUMIY STATISTIKA (Faqat Signia)'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Jami Signia mahsulotlari",
    COUNT(DISTINCT "productType") as "Mahsulot turlari soni",
    COUNT(DISTINCT "availabilityStatus") as "Mavjudlik holatlari soni"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published';
\echo ''

-- 2. AUDIENCE FILTERI (Signia)
\echo '2. AUDIENCE FILTERI (Signia)'
\echo '--------------------------------------------'
SELECT 
    'adults' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'adults' = ANY(p."audience")
UNION ALL
SELECT 
    'elderly' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'elderly' = ANY(p."audience")
UNION ALL
SELECT 
    'children' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'children' = ANY(p."audience")
UNION ALL
SELECT 
    'Belgilanmagan' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND (p."audience" IS NULL OR array_length(p."audience", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 3. FORM FACTORS FILTERI (Signia)
\echo '3. FORM FACTORS FILTERI (Signia)'
\echo '--------------------------------------------'
SELECT 
    'BTE' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'BTE' = ANY(p."formFactors")
UNION ALL
SELECT 
    'RIC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'RIC' = ANY(p."formFactors")
UNION ALL
SELECT 
    'ITE' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'ITE' = ANY(p."formFactors")
UNION ALL
SELECT 
    'ITC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'ITC' = ANY(p."formFactors")
UNION ALL
SELECT 
    'CIC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'CIC' = ANY(p."formFactors")
UNION ALL
SELECT 
    'Belgilanmagan' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND (p."formFactors" IS NULL OR array_length(p."formFactors", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 4. SMARTPHONE COMPATIBILITY FILTERI (Signia)
\echo '4. SMARTPHONE COMPATIBILITY FILTERI (Signia)'
\echo '--------------------------------------------'
SELECT 
    'bluetooth' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'bluetooth' = ANY(p."smartphoneCompatibility")
UNION ALL
SELECT 
    'app' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'app' = ANY(p."smartphoneCompatibility")
UNION ALL
SELECT 
    'phone-calls' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'phone-calls' = ANY(p."smartphoneCompatibility")
UNION ALL
SELECT 
    'streaming' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND 'streaming' = ANY(p."smartphoneCompatibility")
UNION ALL
SELECT 
    'Belgilanmagan' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" p JOIN "Brand" b ON p."brandId" = b.id WHERE b.name = 'Signia' AND p."status" = 'published'), 2) as "Foiz"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published' AND (p."smartphoneCompatibility" IS NULL OR array_length(p."smartphoneCompatibility", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 5. TO'LDIRILGANLIK STATISTIKASI (Signia)
\echo '5. TO''LDIRILGANLIK STATISTIKASI (Signia)'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Jami Signia mahsulotlari",
    COUNT(CASE WHEN p."audience" IS NOT NULL AND array_length(p."audience", 1) > 0 THEN 1 END) as "Audience belgilangan",
    COUNT(CASE WHEN p."formFactors" IS NOT NULL AND array_length(p."formFactors", 1) > 0 THEN 1 END) as "Form Factors belgilangan",
    COUNT(CASE WHEN p."smartphoneCompatibility" IS NOT NULL AND array_length(p."smartphoneCompatibility", 1) > 0 THEN 1 END) as "Smartphone Compatibility belgilangan",
    COUNT(CASE WHEN p."hearingLossLevels" IS NOT NULL AND array_length(p."hearingLossLevels", 1) > 0 THEN 1 END) as "Hearing Loss Levels belgilangan",
    COUNT(CASE WHEN p."paymentOptions" IS NOT NULL AND array_length(p."paymentOptions", 1) > 0 THEN 1 END) as "Payment Options belgilangan"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
WHERE b.name = 'Signia' AND p."status" = 'published';
\echo ''

-- 6. KATALOGLARGA BIRIKTIRILGAN MAHSULOTLAR (Signia)
\echo '6. KATALOGLARGA BIRIKTIRILGAN MAHSULOTLAR (Signia)'
\echo '--------------------------------------------'
SELECT 
    COUNT(DISTINCT p.id) as "Kataloglarga biriktirilgan Signia mahsulotlari",
    COUNT(DISTINCT CASE WHEN ptc."A" IS NULL THEN p.id END) as "Kataloglarga biriktirilmagan Signia mahsulotlari"
FROM "Product" p
JOIN "Brand" b ON p."brandId" = b.id
LEFT JOIN "_ProductToCatalog" ptc ON p.id = ptc."A"
WHERE b.name = 'Signia' AND p."status" = 'published';
\echo ''

\echo '============================================'
\echo 'SIGNIA TAHLILI YAKUNLANDI'
\echo '============================================'
