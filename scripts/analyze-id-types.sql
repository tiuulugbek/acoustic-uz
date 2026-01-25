-- ============================================
-- DB Schema Analysis: ID Types and Foreign Keys
-- ============================================

-- 1. Barcha jadvallarda `id` maydonining turini aniqlash
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        ELSE ''
    END as is_primary_key
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public'
    AND c.column_name = 'id'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 2. Barcha Foreign Key bog'lanishlarini topish
SELECT
    tc.table_name AS foreign_table,
    kcu.column_name AS foreign_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    tc.constraint_name AS constraint_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 3. Qaysi jadvallar `id` ga FK bog'langan (dependency graph)
SELECT
    'FK to ' || ccu.table_name || '.' || ccu.column_name AS dependency,
    COUNT(*) AS count
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.column_name = 'id'
GROUP BY ccu.table_name, ccu.column_name
ORDER BY count DESC;

-- 4. Har bir jadvalda nechta FK bor (complexity)
SELECT
    tc.table_name,
    COUNT(*) AS foreign_key_count
FROM
    information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY foreign_key_count DESC;

-- 5. Jadval hajmlari (migration vaqtini baholash uchun)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
