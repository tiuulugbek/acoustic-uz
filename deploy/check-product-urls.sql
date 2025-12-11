-- Check current state of product URLs
SELECT 
    id,
    slug,
    name_uz,
    galleryUrls,
    array_length(galleryUrls, 1) as url_count
FROM "Product"
WHERE slug IN (
    'oticon-own-iic',
    'oticon-own-cic',
    'oticon-jet-bte',
    'oticon-jet-cic'
)
ORDER BY slug;

-- Check all products with galleryUrls
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN galleryUrls IS NOT NULL AND array_length(galleryUrls, 1) > 0 THEN 1 END) as products_with_urls,
    COUNT(CASE WHEN galleryUrls IS NULL OR array_length(galleryUrls, 1) = 0 THEN 1 END) as products_without_urls
FROM "Product";

