# Database Authentication Xatolik - Tuzatish

## 🔍 Muammo

Backend loglarida ko'rinib turibdiki:
```
PrismaClientInitializationError: Authentication failed against database server at `localhost`, 
the provided database credentials for `acoustic_user` are not valid.
```

## 🔎 Tekshirish

### 1. Database user mavjudmi?

```bash
sudo -u postgres psql -c "\du" | grep acoustic
```

### 2. .env faylini tekshirish

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz
cat .env | grep DATABASE_URL
```

### 3. Database'ga ulanishni test qilish

```bash
# .env'dagi DATABASE_URL'ni ishlatib
psql "postgresql://acoustic:acoustic123@localhost:5432/acoustic"
```

## ✅ Yechimlar

### Variant 1: Database user yaratish/yangilash

```bash
# PostgreSQL'ga kirish
sudo -u postgres psql

# User yaratish/yangilash
CREATE USER acoustic WITH PASSWORD 'acoustic123';
ALTER USER acoustic WITH PASSWORD 'acoustic123';

# Database yaratish (agar mavjud bo'lmasa)
CREATE DATABASE acoustic OWNER acoustic;

# Permission berish
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;
\q
```

### Variant 2: .env faylini to'g'rilash

```bash
# Acoustic user sifatida
su - acoustic
cd /var/www/acoustic.uz

# .env faylini tahrirlash
nano .env

# DATABASE_URL'ni to'g'rilash:
# postgresql://acoustic:acoustic123@localhost:5432/acoustic
```

### Variant 3: Password'ni yangilash

```bash
# PostgreSQL'da
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'yangi_password';

# Keyin .env'da ham yangilash
```

## 🔍 Tekshirish

```bash
# 1. Database'ga ulanish
psql "postgresql://acoustic:acoustic123@localhost:5432/acoustic" -c "SELECT version();"

# 2. Backend'ni restart qilish
pm2 restart acoustic-backend

# 3. Loglarni tekshirish
pm2 logs acoustic-backend --lines 20
```

## 📝 Eslatma

`.env` fayli `nobody:nogroup` ga tegishli va faqat o'qish mumkin. Agar o'zgartirish kerak bo'lsa:

```bash
# Root sifatida
chown acoustic:acoustic /var/www/acoustic.uz/.env
chmod 600 /var/www/acoustic.uz/.env

# Keyin acoustic user sifatida tahrirlash
su - acoustic
cd /var/www/acoustic.uz
nano .env
```
