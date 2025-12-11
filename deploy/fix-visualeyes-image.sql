-- Fix VisualEyes x2122 image
-- First, check what files exist for visualeyes
-- The file should be: visualeyes-x2122-product_image.webp

UPDATE "Product"
SET description_uz = REPLACE(description_uz, 'at-235-at235.webp', 'visualeyes-x2122-product_image.webp'),
    description_ru = REPLACE(description_ru, 'at-235-at235.webp', 'visualeyes-x2122-product_image.webp')
WHERE slug = 'visualeyes-x2122';

-- Verify the change
SELECT 
    id,
    slug,
    name_uz,
    CASE 
        WHEN description_uz LIKE '%visualeyes-x2122-product_image.webp%' THEN 'Fixed'
        WHEN description_uz LIKE '%at-235-at235.webp%' THEN 'Still has at-235'
        ELSE 'No image'
    END as status
FROM "Product"
WHERE slug = 'visualeyes-x2122';

