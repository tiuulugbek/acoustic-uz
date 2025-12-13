-- SQL script to fix product image URLs in database
-- This script removes URLs that don't have corresponding files
-- Run this in DBeaver or psql

-- First, let's see which products have problematic URLs
SELECT 
    id,
    slug,
    name_uz,
    galleryUrls,
    array_length(galleryUrls, 1) as url_count
FROM "Product"
WHERE galleryUrls IS NOT NULL 
    AND array_length(galleryUrls, 1) > 0
ORDER BY slug;

-- Option 1: Remove all galleryUrls that don't exist (set to empty array)
-- WARNING: This will remove ALL gallery URLs. Only use if you want to start fresh.
-- UPDATE "Product" SET "galleryUrls" = '{}' WHERE "galleryUrls" IS NOT NULL;

-- Option 2: Keep only URLs that match products/ directory pattern
-- This updates URLs to use /uploads/products/ prefix if they don't already
UPDATE "Product"
SET "galleryUrls" = ARRAY(
    SELECT '/uploads/products/' || unnest("galleryUrls")
    WHERE unnest("galleryUrls") NOT LIKE '/uploads/%'
)
WHERE "galleryUrls" IS NOT NULL 
    AND EXISTS (
        SELECT 1 
        FROM unnest("galleryUrls") AS url
        WHERE url NOT LIKE '/uploads/%'
    );

-- Option 3: Remove specific problematic URLs (example - adjust based on your needs)
-- This removes URLs that contain old date-based paths
UPDATE "Product"
SET "galleryUrls" = ARRAY(
    SELECT url 
    FROM unnest("galleryUrls") AS url
    WHERE url NOT LIKE '%/2024/%' 
        AND url NOT LIKE '%/2023/%'
        AND url LIKE '/uploads/products/%'
)
WHERE "galleryUrls" IS NOT NULL;

-- Option 4: Set galleryUrls to NULL for products with no valid images
-- UPDATE "Product" 
-- SET "galleryUrls" = NULL 
-- WHERE "galleryUrls" IS NOT NULL 
--     AND array_length("galleryUrls", 1) = 0;

-- Verify the changes
SELECT 
    id,
    slug,
    name_uz,
    galleryUrls
FROM "Product"
WHERE galleryUrls IS NOT NULL 
    AND array_length(galleryUrls, 1) > 0
ORDER BY slug
LIMIT 20;


