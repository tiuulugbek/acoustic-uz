-- Reset all product galleryUrls to empty array
-- Use this if images got mixed up and you want to start fresh
-- WARNING: This will remove ALL image URLs from products

UPDATE "Product" 
SET "galleryUrls" = '{}'
WHERE "galleryUrls" IS NOT NULL;

-- Verify
SELECT 
    id,
    slug,
    name_uz,
    galleryUrls
FROM "Product"
WHERE galleryUrls IS NOT NULL 
    AND array_length(galleryUrls, 1) > 0
LIMIT 10;

