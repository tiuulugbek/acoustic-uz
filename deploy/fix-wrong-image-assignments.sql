-- Fix wrong image assignments in product descriptions
-- This SQL will help identify and fix products with wrong images

-- 1. Find products with wrong image assignments
-- Example: products that have "at-235-at235.webp" but shouldn't
SELECT 
    id,
    slug,
    name_uz,
    CASE 
        WHEN description_uz LIKE '%at-235-at235.webp%' THEN 'Has at-235 image'
        WHEN description_uz LIKE '%oticon-get-bte-getbte.webp%' THEN 'Has oticon-get-bte image'
        ELSE 'OK'
    END as issue,
    description_uz
FROM "Product"
WHERE (description_uz LIKE '%at-235-at235.webp%' 
    OR description_uz LIKE '%oticon-get-bte-getbte.webp%'
    OR description_ru LIKE '%at-235-at235.webp%'
    OR description_ru LIKE '%oticon-get-bte-getbte.webp%')
    AND slug NOT IN ('at-235', 'oticon-get-bte')
ORDER BY slug;

-- 2. To fix manually, you can update specific products:
-- Example: Remove wrong image from oticon-own-cic
-- UPDATE "Product"
-- SET description_uz = REPLACE(description_uz, 'at-235-at235.webp', 'oticon-own-cic-own_cic.webp')
-- WHERE slug = 'oticon-own-cic';

-- 3. Or restore from backup if you have one

