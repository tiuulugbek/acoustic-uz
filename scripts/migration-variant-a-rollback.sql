-- ============================================
-- ROLLBACK SCRIPT: Variant A (Remove numeric_id)
-- ============================================
-- 
-- ⚠️  E'TIBOR: Bu script numeric_id'ni o'chiradi
-- Ma'lumotlar yo'qolmaydi, faqat numeric_id column o'chiriladi
--
-- ============================================

BEGIN;

-- Safety check: numeric_id mavjudligini tekshirish
DO $$
DECLARE
    table_record RECORD;
    column_exists BOOLEAN;
    has_numeric_id BOOLEAN := FALSE;
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
            has_numeric_id := TRUE;
            EXIT;
        END IF;
    END LOOP;
    
    IF NOT has_numeric_id THEN
        RAISE EXCEPTION 'numeric_id column not found in any table. Migration may not have been run.';
    END IF;
END $$;

-- 1. Index'larni o'chirish
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
        -- Index o'chirish
        sql_stmt := format('DROP INDEX IF EXISTS %I',
            table_record.table_name || '_numeric_id_idx'
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Dropped index for table: %', table_record.table_name;
    END LOOP;
END $$;

-- 2. Unique constraint'larni o'chirish
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
        -- Unique constraint o'chirish
        sql_stmt := format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
            table_record.table_name,
            table_record.table_name || '_numeric_id_unique'
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Dropped unique constraint for table: %', table_record.table_name;
    END LOOP;
END $$;

-- 3. numeric_id column'ni o'chirish
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
        -- Column o'chirish
        sql_stmt := format('ALTER TABLE %I DROP COLUMN IF EXISTS numeric_id CASCADE',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Dropped numeric_id column from table: %', table_record.table_name;
    END LOOP;
END $$;

-- 4. Sequence'larni o'chirish (agar mavjud bo'lsa)
DO $$
DECLARE
    seq_record RECORD;
    sql_stmt TEXT;
BEGIN
    FOR seq_record IN 
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
            AND sequence_name LIKE '%_numeric_id_seq'
    LOOP
        sql_stmt := format('DROP SEQUENCE IF EXISTS %I CASCADE',
            seq_record.sequence_name
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Dropped sequence: %', seq_record.sequence_name;
    END LOOP;
END $$;

-- 5. Verification: numeric_id mavjud emasligini tekshirish
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
            RAISE EXCEPTION 'Rollback failed for table: %. numeric_id still exists!', 
                table_record.table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Rollback verification successful! All numeric_id columns removed.';
END $$;

COMMIT;

-- ============================================
-- POST-ROLLBACK NOTES:
-- ============================================
-- 
-- 1. API kodini eski UUID'ga qaytarish kerak
-- 2. Frontend kodini eski UUID'ga qaytarish kerak
-- 3. Prisma schema'ni eski holatga qaytarish kerak
--
-- ============================================
