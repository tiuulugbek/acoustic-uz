-- ============================================
-- MIGRATION VARIANT A: Add numeric_id (RECOMMENDED)
-- ============================================
-- 
-- Strategiya: Eski `id` (text/cuid) saqlanadi, yoniga `numeric_id` (bigserial) qo'shiladi
-- 
-- Afzalliklari:
--   - Minimal risk (eski ID saqlanadi)
--   - Zero downtime (jadval struktura o'zgarmaydi)
--   - Easy rollback (numeric_id o'chirish mumkin)
--   - API'da numeric_id ishlatiladi, ichkarida uuid qoladi
--
-- Kamchiliklari:
--   - Ikkita ID maydoni bo'ladi (storage overhead)
--   - Unique constraint qo'shish kerak
--
-- ============================================

BEGIN;

-- Safety check: numeric_id allaqachon mavjud emasligini tekshirish
DO $$
DECLARE
    table_record RECORD;
    column_exists BOOLEAN;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
    LOOP
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = table_record.table_name 
                AND column_name = 'numeric_id'
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE EXCEPTION 'Table % already has numeric_id column! Migration may have been run before.', table_record.table_name;
        END IF;
    END LOOP;
END $$;

-- 1. Barcha jadvallarga `numeric_id` maydonini qo'shish
DO $$
DECLARE
    table_record RECORD;
    sql_stmt TEXT;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        -- numeric_id maydonini qo'shish (bigserial = bigint + auto-increment)
        sql_stmt := format('ALTER TABLE %I ADD COLUMN numeric_id BIGSERIAL', table_record.table_name);
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Added numeric_id to table: %', table_record.table_name;
    END LOOP;
END $$;

-- 2. Unique constraint qo'shish (har bir jadval uchun)
DO $$
DECLARE
    table_record RECORD;
    sql_stmt TEXT;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        -- Unique constraint qo'shish
        sql_stmt := format(
            'ALTER TABLE %I ADD CONSTRAINT %I UNIQUE (numeric_id)',
            table_record.table_name,
            table_record.table_name || '_numeric_id_unique'
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Added unique constraint to table: %', table_record.table_name;
    END LOOP;
END $$;

-- 3. Index qo'shish (performance uchun)
DO $$
DECLARE
    table_record RECORD;
    sql_stmt TEXT;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        -- Index qo'shish (unique constraint allaqachon index yaratadi, lekin explicit qilamiz)
        sql_stmt := format(
            'CREATE INDEX IF NOT EXISTS %I ON %I (numeric_id)',
            table_record.table_name || '_numeric_id_idx',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Added index to table: %', table_record.table_name;
    END LOOP;
END $$;

-- 4. Verification: numeric_id mavjudligini tekshirish
DO $$
DECLARE
    table_record RECORD;
    column_exists BOOLEAN;
    constraint_exists BOOLEAN;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        -- Column mavjudligini tekshirish
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = table_record.table_name 
                AND column_name = 'numeric_id'
        ) INTO column_exists;
        
        -- Constraint mavjudligini tekshirish
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
                AND table_name = table_record.table_name 
                AND constraint_name = table_record.table_name || '_numeric_id_unique'
        ) INTO constraint_exists;
        
        IF NOT column_exists OR NOT constraint_exists THEN
            RAISE EXCEPTION 'Migration failed for table: %. Column exists: %, Constraint exists: %', 
                table_record.table_name, column_exists, constraint_exists;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Migration verification successful! All tables have numeric_id with unique constraint.';
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION NOTES:
-- ============================================
-- 
-- 1. API'da numeric_id ishlatish:
--    - Frontend/Backend kodida `id` o'rniga `numeric_id` ishlatish
--    - Prisma schema'da `numeric_id` ni qo'shish va `@unique` berish
--    - API endpoints'da numeric_id'ni qabul qilish va uuid'ga convert qilish
--
-- 2. Performance:
--    - numeric_id index mavjud, tez qidiruv
--    - UUID'ga convert qilish uchun mapping table yoki JOIN kerak bo'ladi
--
-- 3. Rollback (agar kerak bo'lsa):
--    - BEGIN;
--    - ALTER TABLE <table> DROP COLUMN numeric_id CASCADE;
--    - COMMIT;
--
-- ============================================
