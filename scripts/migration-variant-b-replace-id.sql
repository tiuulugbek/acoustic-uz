-- ============================================
-- MIGRATION VARIANT B: Full Replacement (HIGH RISK)
-- ============================================
-- 
-- Strategiya: Barcha FK'larni numeric ga ko'chirib, eski `id` o'rniga yangi numeric PK qilish
-- 
-- Afzalliklari:
--   - Bitta ID maydoni (storage tejash)
--   - To'liq numeric ID (API uchun qulay)
--
-- Kamchiliklari:
--   - YUQORI RISK (ma'lumot yo'qolishi mumkin)
--   - Uzoq downtime (barcha FK'larni yangilash kerak)
--   - Mapping table kerak (old_id -> new_id)
--   - Complex rollback
--
-- ⚠️  TAVSIYA: Production'da ishlatishdan oldin backup oling!
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Mapping table yaratish (old_id -> new_id)
-- ============================================

-- Har bir jadval uchun mapping table
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
        -- Mapping table yaratish
        sql_stmt := format('
            CREATE TABLE IF NOT EXISTS %I (
                old_id TEXT PRIMARY KEY,
                new_id BIGINT NOT NULL,
                table_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )',
            '_id_mapping_' || LOWER(table_record.table_name)
        );
        EXECUTE sql_stmt;
        
        -- Index qo'shish
        sql_stmt := format('
            CREATE INDEX IF NOT EXISTS %I ON %I (new_id)',
            '_id_mapping_' || LOWER(table_record.table_name) || '_new_id_idx',
            '_id_mapping_' || LOWER(table_record.table_name)
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Created mapping table for: %', table_record.table_name;
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Mapping table'larni to'ldirish
-- ============================================

DO $$
DECLARE
    table_record RECORD;
    sql_stmt TEXT;
    row_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        -- Har bir row uchun numeric_id generatsiya qilish va mapping'ga yozish
        sql_stmt := format('
            INSERT INTO %I (old_id, new_id, table_name)
            SELECT 
                id AS old_id,
                ROW_NUMBER() OVER (ORDER BY id) AS new_id,
                %L AS table_name
            FROM %I
            ON CONFLICT (old_id) DO NOTHING',
            '_id_mapping_' || LOWER(table_record.table_name),
            table_record.table_name,
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        GET DIAGNOSTICS row_count = ROW_COUNT;
        RAISE NOTICE 'Mapped % rows for table: %', row_count, table_record.table_name;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: FK'larni vaqtincha o'chirish
-- ============================================

DO $$
DECLARE
    fk_record RECORD;
    sql_stmt TEXT;
BEGIN
    FOR fk_record IN 
        SELECT
            tc.table_name AS foreign_table,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        ORDER BY tc.table_name
    LOOP
        sql_stmt := format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE',
            fk_record.foreign_table,
            fk_record.constraint_name
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Dropped FK constraint: % from table: %', 
            fk_record.constraint_name, fk_record.foreign_table;
    END LOOP;
END $$;

-- ============================================
-- STEP 4: Eski PK'larni o'chirish va yangi numeric_id qo'shish
-- ============================================

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
        -- 1. numeric_id maydonini qo'shish (mapping'dan olinadi)
        sql_stmt := format('
            ALTER TABLE %I ADD COLUMN numeric_id BIGINT',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 2. Mapping'dan numeric_id'ni to'ldirish
        sql_stmt := format('
            UPDATE %I t
            SET numeric_id = m.new_id
            FROM %I m
            WHERE t.id = m.old_id',
            table_record.table_name,
            '_id_mapping_' || LOWER(table_record.table_name)
        );
        EXECUTE sql_stmt;
        
        -- 3. numeric_id'ni NOT NULL qilish
        sql_stmt := format('
            ALTER TABLE %I ALTER COLUMN numeric_id SET NOT NULL',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 4. Eski PK constraint'ni o'chirish
        sql_stmt := format('
            ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I_pkey CASCADE',
            table_record.table_name,
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 5. Eski id maydonini o'chirish (yoki saqlash uchun old_id ga o'zgartirish)
        -- TAVSIYA: old_id ga o'zgartirish (ma'lumotni saqlash uchun)
        sql_stmt := format('
            ALTER TABLE %I RENAME COLUMN id TO old_id',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 6. numeric_id'ni yangi PK qilish
        sql_stmt := format('
            ALTER TABLE %I ADD CONSTRAINT %I_pkey PRIMARY KEY (numeric_id)',
            table_record.table_name,
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 7. numeric_id'ni id ga rename qilish (optional, lekin qulay)
        sql_stmt := format('
            ALTER TABLE %I RENAME COLUMN numeric_id TO id',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 8. Sequence yaratish (auto-increment uchun)
        sql_stmt := format('
            CREATE SEQUENCE IF NOT EXISTS %I_seq OWNED BY %I.id',
            table_record.table_name,
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 9. Sequence'ni joriy max qiymatga o'rnatish
        sql_stmt := format('
            SELECT setval(%L, COALESCE(MAX(id), 1), true) FROM %I',
            table_record.table_name || '_seq',
            table_record.table_name
        );
        EXECUTE sql_stmt;
        
        -- 10. Default value qo'shish
        sql_stmt := format('
            ALTER TABLE %I ALTER COLUMN id SET DEFAULT nextval(%L)',
            table_record.table_name,
            table_record.table_name || '_seq'
        );
        EXECUTE sql_stmt;
        
        RAISE NOTICE 'Converted table: % (old_id saved, new numeric id is primary key)', 
            table_record.table_name;
    END LOOP;
END $$;

-- ============================================
-- STEP 5: FK'larni qayta yaratish (numeric id bilan)
-- ============================================

-- Bu qism manual yoki script orqali yaratilishi kerak
-- Har bir FK uchun mapping'dan new_id'ni topib, FK'ni yangilash kerak

-- Misol: Media jadvaliga FK bog'langan jadvallar
DO $$
DECLARE
    fk_record RECORD;
    sql_stmt TEXT;
BEGIN
    -- Media.id ga FK bog'langan jadvallar
    FOR fk_record IN 
        SELECT
            tc.table_name AS foreign_table,
            kcu.column_name AS foreign_column,
            ccu.table_name AS referenced_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND ccu.table_name = 'Media'
            AND ccu.column_name = 'id'
    LOOP
        -- FK column'ni numeric ga o'zgartirish
        sql_stmt := format('
            ALTER TABLE %I ALTER COLUMN %I TYPE BIGINT USING (
                SELECT new_id FROM %I WHERE old_id = %I.%I
            )',
            fk_record.foreign_table,
            fk_record.foreign_column,
            '_id_mapping_' || LOWER(fk_record.foreign_table),
            fk_record.foreign_table,
            fk_record.foreign_column
        );
        -- ⚠️  Bu qism to'g'ri ishlamasligi mumkin, chunki USING clause'da subquery ishlatib bo'lmaydi
        -- Buning o'rniga alohida UPDATE query kerak
        
        RAISE NOTICE 'Need to update FK: %.% -> %.id (manual update required)',
            fk_record.foreign_table, fk_record.foreign_column, fk_record.referenced_table;
    END LOOP;
END $$;

-- ⚠️  E'TIBOR: FK'larni yangilash uchun alohida script kerak
-- Har bir FK column uchun:
-- 1. Mapping table'dan new_id'ni topish
-- 2. FK column'ni BIGINT ga o'zgartirish
-- 3. FK constraint'ni qayta yaratish

COMMIT;

-- ============================================
-- POST-MIGRATION NOTES:
-- ============================================
-- 
-- ⚠️  Ushbu migratsiya TO'LIQ TEST QILINMAGAN!
-- 
-- 1. FK'larni yangilash:
--    - Har bir FK column uchun mapping'dan new_id'ni topib yangilash kerak
--    - Bu juda ko'p vaqt talab qiladi
--
-- 2. Rollback:
--    - Mapping table'dan old_id'ni topib, eski strukturaga qaytarish
--    - Bu juda murakkab va xavfli
--
-- 3. Downtime:
--    - Minimal 1-2 soat (katta jadvallar uchun)
--
-- ============================================
