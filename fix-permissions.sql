-- acoustic user'ga kerakli ruxsatlarni berish

-- Database yaratish ruxsati
ALTER USER acoustic CREATEDB;

-- public schema'ga kirish va yaratish ruxsati
GRANT ALL ON SCHEMA public TO acoustic;
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;

-- Barcha jadvallarga ruxsat
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO acoustic;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO acoustic;




