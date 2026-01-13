-- PostgreSQL Database va User To'liq Sozlash
-- Bu faylni psql ichida ishga tushiring: \i setup-database-complete.sql
-- Yoki har bir buyruqni alohida kiriting

-- 1. Eski database va user'ni o'chirish (agar mavjud bo'lsa)
DROP DATABASE IF EXISTS acoustic;
DROP USER IF EXISTS acoustic;

-- 2. Yangi user yaratish (database yaratish ruxsati bilan)
CREATE USER acoustic WITH PASSWORD 'acoustic123' CREATEDB;

-- 3. Database yaratish
CREATE DATABASE acoustic OWNER acoustic;

-- 4. Database'ga ulanish
\c acoustic

-- 5. public schema'ga ruxsat berish
GRANT ALL ON SCHEMA public TO acoustic;
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;

-- 6. Barcha jadvallar va ketma-ketliklar uchun ruxsatlar
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO acoustic;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO acoustic;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO acoustic;

-- 7. public schema'ni acoustic user'ga berish
ALTER SCHEMA public OWNER TO acoustic;

-- 8. Tekshirish
\du acoustic
\l acoustic




