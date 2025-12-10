-- Check if PostCategory has section and imageId columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PostCategory' 
AND column_name IN ('section', 'imageId')
ORDER BY column_name;

-- Check if Post has postType column
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Post' 
AND column_name = 'postType';

-- Check PostCategory table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'PostCategory'
ORDER BY ordinal_position;

