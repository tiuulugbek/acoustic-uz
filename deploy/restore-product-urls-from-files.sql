-- Restore product URLs based on actual files in uploads/products directory
-- This will match product slugs with files in the products directory

-- First, let's see what files exist (you'll need to manually check or use a script)
-- But here's a SQL approach to restore URLs based on product slugs

-- Option 1: Restore URLs for products that have matching files
-- This assumes files are named like: {slug}.webp or {slug}-*.webp
-- You'll need to adjust based on actual file names

-- Example: If you have a file like "oticon-own-iic.webp" or "oticon-own-iic-own_iic.webp"
-- This query will help identify which products might have files

-- Check products and their potential file matches
SELECT 
    p.id,
    p.slug,
    p.name_uz,
    p.galleryUrls,
    -- Potential file patterns
    '/uploads/products/' || p.slug || '.webp' as potential_url_1,
    '/uploads/products/' || p.slug || '.jpg' as potential_url_2,
    '/uploads/products/' || p.slug || '.png' as potential_url_3
FROM "Product" p
WHERE p.slug IN (
    'oticon-own-iic',
    'oticon-own-cic',
    'oticon-jet-bte',
    'oticon-jet-cic',
    'oticon-jet-minirite',
    'oticon-own-itc'
)
ORDER BY p.slug;

-- Option 2: Restore from a backup if you have one
-- If you have a backup table or data, restore from there

-- Option 3: Manual restore - update specific products
-- Example for oticon-own-iic:
-- UPDATE "Product" 
-- SET "galleryUrls" = ARRAY['/uploads/products/oticon-own-iic-own_iic.webp']
-- WHERE slug = 'oticon-own-iic';

-- Option 4: Restore all products that have files matching their slug pattern
-- This is a more complex query that would need to check file system
-- Better to use the Node.js script for this

