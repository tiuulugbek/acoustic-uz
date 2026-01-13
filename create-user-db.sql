-- PostgreSQL user va database yaratish
-- Bu faylni psql ichida ishga tushiring

CREATE USER acoustic WITH PASSWORD 'acoustic123';
CREATE DATABASE acoustic OWNER acoustic;
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;




