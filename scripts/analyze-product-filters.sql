-- ============================================
-- Mahsulot Filterlari Tahlili
-- ============================================
-- Bu script barcha filter maydonlarining to'ldirilganligini va 
-- har bir filter qiymatining qancha mahsulotda ishlatilganligini ko'rsatadi

\echo '============================================'
\echo 'MAHSULOT FILTERLARI TAHLILI'
\echo '============================================'
\echo ''

-- 1. UMUMIY STATISTIKA
\echo '1. UMUMIY STATISTIKA'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Jami mahsulotlar",
    COUNT(DISTINCT "brandId") as "Brendlar soni",
    COUNT(DISTINCT "productType") as "Mahsulot turlari soni",
    COUNT(DISTINCT "availabilityStatus") as "Mavjudlik holatlari soni"
FROM "Product"
WHERE "status" = 'published';
\echo ''

-- 2. BREND FILTERI
\echo '2. BREND FILTERI'
\echo '--------------------------------------------'
SELECT 
    b.name as "Brend nomi",
    COUNT(p.id) as "Mahsulotlar soni",
    ROUND(COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product" p
LEFT JOIN "Brand" b ON p."brandId" = b.id
WHERE p."status" = 'published'
GROUP BY b.id, b.name
ORDER BY COUNT(p.id) DESC;
\echo ''

-- 3. PRODUCT TYPE FILTERI
\echo '3. MAHSULOT TURI FILTERI'
\echo '--------------------------------------------'
SELECT 
    COALESCE("productType", 'Belgilanmagan') as "Mahsulot turi",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published'
GROUP BY "productType"
ORDER BY COUNT(*) DESC;
\echo ''

-- 4. CATALOG FILTERI
\echo '4. KATALOG FILTERI'
\echo '--------------------------------------------'
SELECT 
    c.name_uz as "Katalog nomi",
    COUNT(DISTINCT ptc."A") as "Mahsulotlar soni",
    ROUND(COUNT(DISTINCT ptc."A") * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Catalog" c
LEFT JOIN "_ProductToCatalog" ptc ON c.id = ptc."B"
LEFT JOIN "Product" p ON ptc."A" = p.id AND p."status" = 'published'
GROUP BY c.id, c.name_uz
ORDER BY COUNT(DISTINCT ptc."A") DESC;
\echo ''

-- 5. AUDIENCE FILTERI (Array)
\echo '5. AUDIENCE FILTERI (Kimlar uchun)'
\echo '--------------------------------------------'
SELECT 
    'adults' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'adults' = ANY("audience")
UNION ALL
SELECT 
    'elderly' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'elderly' = ANY("audience")
UNION ALL
SELECT 
    'children' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'children' = ANY("audience")
UNION ALL
SELECT 
    'Belgilanmagan' as "Audience",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND ("audience" IS NULL OR array_length("audience", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 6. FORM FACTORS FILTERI (Array) - Korpus turi
\echo '6. FORM FACTORS FILTERI (Korpus turi)'
\echo '--------------------------------------------'
SELECT 
    'BTE' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'BTE' = ANY("formFactors")
UNION ALL
SELECT 
    'RIC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'RIC' = ANY("formFactors")
UNION ALL
SELECT 
    'ITE' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'ITE' = ANY("formFactors")
UNION ALL
SELECT 
    'ITC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'ITC' = ANY("formFactors")
UNION ALL
SELECT 
    'CIC' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'CIC' = ANY("formFactors")
UNION ALL
SELECT 
    'Belgilanmagan' as "Form Factor",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND ("formFactors" IS NULL OR array_length("formFactors", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 7. SMARTPHONE COMPATIBILITY FILTERI (Array)
\echo '7. SMARTPHONE COMPATIBILITY FILTERI'
\echo '--------------------------------------------'
SELECT 
    'bluetooth' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'bluetooth' = ANY("smartphoneCompatibility")
UNION ALL
SELECT 
    'app' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'app' = ANY("smartphoneCompatibility")
UNION ALL
SELECT 
    'phone-calls' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'phone-calls' = ANY("smartphoneCompatibility")
UNION ALL
SELECT 
    'streaming' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'streaming' = ANY("smartphoneCompatibility")
UNION ALL
SELECT 
    'Belgilanmagan' as "Smartphone Compatibility",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND ("smartphoneCompatibility" IS NULL OR array_length("smartphoneCompatibility", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 8. SIGNAL PROCESSING FILTERI
\echo '8. SIGNAL PROCESSING FILTERI'
\echo '--------------------------------------------'
SELECT 
    COALESCE("signalProcessing", 'Belgilanmagan') as "Signal Processing",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published'
GROUP BY "signalProcessing"
ORDER BY COUNT(*) DESC;
\echo ''

-- 9. POWER LEVEL FILTERI
\echo '9. POWER LEVEL FILTERI'
\echo '--------------------------------------------'
SELECT 
    COALESCE("powerLevel", 'Belgilanmagan') as "Power Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published'
GROUP BY "powerLevel"
ORDER BY COUNT(*) DESC;
\echo ''

-- 10. HEARING LOSS LEVEL FILTERI (Array)
\echo '10. HEARING LOSS LEVEL FILTERI'
\echo '--------------------------------------------'
SELECT 
    'mild' as "Hearing Loss Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'mild' = ANY("hearingLossLevels")
UNION ALL
SELECT 
    'moderate' as "Hearing Loss Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'moderate' = ANY("hearingLossLevels")
UNION ALL
SELECT 
    'severe' as "Hearing Loss Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'severe' = ANY("hearingLossLevels")
UNION ALL
SELECT 
    'profound' as "Hearing Loss Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'profound' = ANY("hearingLossLevels")
UNION ALL
SELECT 
    'Belgilanmagan' as "Hearing Loss Level",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND ("hearingLossLevels" IS NULL OR array_length("hearingLossLevels", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 11. PAYMENT OPTIONS FILTERI (Array)
\echo '11. PAYMENT OPTIONS FILTERI'
\echo '--------------------------------------------'
SELECT 
    'cash-card' as "Payment Option",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'cash-card' = ANY("paymentOptions")
UNION ALL
SELECT 
    'installment-0' as "Payment Option",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'installment-0' = ANY("paymentOptions")
UNION ALL
SELECT 
    'installment-6' as "Payment Option",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND 'installment-6' = ANY("paymentOptions")
UNION ALL
SELECT 
    'Belgilanmagan' as "Payment Option",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published' AND ("paymentOptions" IS NULL OR array_length("paymentOptions", 1) IS NULL)
ORDER BY "Mahsulotlar soni" DESC;
\echo ''

-- 12. AVAILABILITY STATUS FILTERI
\echo '12. AVAILABILITY STATUS FILTERI'
\echo '--------------------------------------------'
SELECT 
    COALESCE("availabilityStatus", 'Belgilanmagan') as "Availability Status",
    COUNT(*) as "Mahsulotlar soni",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Product" WHERE "status" = 'published'), 2) as "Foiz"
FROM "Product"
WHERE "status" = 'published'
GROUP BY "availabilityStatus"
ORDER BY COUNT(*) DESC;
\echo ''

-- 13. TO'LDIRILGANLIK STATISTIKASI
\echo '13. TO''LDIRILGANLIK STATISTIKASI'
\echo '--------------------------------------------'
SELECT 
    COUNT(*) as "Jami mahsulotlar",
    COUNT("brandId") as "Brend belgilangan",
    COUNT("productType") as "Mahsulot turi belgilangan",
    COUNT(CASE WHEN "audience" IS NOT NULL AND array_length("audience", 1) > 0 THEN 1 END) as "Audience belgilangan",
    COUNT(CASE WHEN "formFactors" IS NOT NULL AND array_length("formFactors", 1) > 0 THEN 1 END) as "Form Factors belgilangan",
    COUNT(CASE WHEN "smartphoneCompatibility" IS NOT NULL AND array_length("smartphoneCompatibility", 1) > 0 THEN 1 END) as "Smartphone Compatibility belgilangan",
    COUNT("signalProcessing") as "Signal Processing belgilangan",
    COUNT("powerLevel") as "Power Level belgilangan",
    COUNT(CASE WHEN "hearingLossLevels" IS NOT NULL AND array_length("hearingLossLevels", 1) > 0 THEN 1 END) as "Hearing Loss Levels belgilangan",
    COUNT(CASE WHEN "paymentOptions" IS NOT NULL AND array_length("paymentOptions", 1) > 0 THEN 1 END) as "Payment Options belgilangan",
    COUNT("availabilityStatus") as "Availability Status belgilangan"
FROM "Product"
WHERE "status" = 'published';
\echo ''

-- 14. KATALOGLAR BILAN BOG'LIQ MAHSULOTLAR
\echo '14. KATALOGLAR BILAN BOG''LIQ MAHSULOTLAR'
\echo '--------------------------------------------'
SELECT 
    COUNT(DISTINCT p.id) as "Kataloglarga biriktirilgan mahsulotlar",
    COUNT(DISTINCT CASE WHEN ptc."A" IS NULL THEN p.id END) as "Kataloglarga biriktirilmagan mahsulotlar"
FROM "Product" p
LEFT JOIN "_ProductToCatalog" ptc ON p.id = ptc."A"
WHERE p."status" = 'published';
\echo ''

\echo '============================================'
\echo 'TAHLIL YAKUNLANDI'
\echo '============================================'
