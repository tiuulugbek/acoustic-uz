# Environment Variables To'ldirish Qo'llanmasi

## 🔑 JWT Secrets Generatsiya Qilish

### 1️⃣ Lokal Mashinada (yoki Serverda)

```bash
# JWT_ACCESS_SECRET generatsiya qilish
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET generatsiya qilish (yana bir marta ishlating)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Yoki Python bilan:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Yoki OpenSSL bilan:**
```bash
openssl rand -hex 32
```

**Natija:** Har safar boshqa random string chiqadi, masalan:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 📝 To'liq .env Fayli Misoli

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL connection string
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL=postgresql://acoustic:MyStrongPassword123!@localhost:5432/acoustic

# ============================================
# JWT SECRETS (XAVFSIZLIK UCHUN MUHIM!)
# ============================================
# Yuqoridagi buyruq bilan generatsiya qilingan random stringlar
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4

# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=production

# ============================================
# BACKEND CONFIGURATION
# ============================================
PORT=3001
CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ============================================
# FRONTEND CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
NEXT_TELEMETRY_DISABLED=1

# ============================================
# ADMIN PANEL CONFIGURATION
# ============================================
VITE_API_URL=https://api.acoustic.uz/api

# ============================================
# FILE STORAGE
# ============================================
# Variantlar: "local" yoki "s3"
STORAGE_DRIVER=local

# ============================================
# TELEGRAM (IXTIYORIY)
# ============================================
# Agar Telegram bot ishlatmoqchi bo'lsangiz:
# 1. @BotFather ga yozing Telegram'da
# 2. /newbot buyrug'ini yuboring
# 3. Bot nomini va username ni kiriting
# 4. Sizga token beriladi
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Telegram Chat ID ni olish:
# 1. @userinfobot ga yozing
# 2. Sizga chat ID beriladi

# ============================================
# AMOCRM (IXTIYORIY)
# ============================================
# Agar AmoCRM integratsiyasi kerak bo'lsa:
AMOCRM_DOMAIN=yourcompany.amocrm.ru
AMOCRM_CLIENT_ID=your-client-id
AMOCRM_CLIENT_SECRET=your-client-secret
AMOCRM_ACCESS_TOKEN=
AMOCRM_REFRESH_TOKEN=
AMOCRM_PIPELINE_ID=
AMOCRM_STATUS_ID=

# ============================================
# APP URL (OAuth callbacks uchun)
# ============================================
APP_URL=https://api.acoustic.uz
```

---

## 🔧 Qadama-qadam To'ldirish

### Qadam 1: Database URL

**Serverda PostgreSQL parolini o'zgartiring:**
```bash
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'YangiKuchliParol123!';
\q
```

**Keyin .env faylida:**
```env
DATABASE_URL=postgresql://acoustic:YangiKuchliParol123!@localhost:5432/acoustic
```

### Qadam 2: JWT Secrets

**Serverda yoki lokal mashinada:**
```bash
# Birinchi secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Natija: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Ikkinchi secret (yana bir marta ishlating)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Natija: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

**Keyin .env faylida:**
```env
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

### Qadam 3: Domenlar (O'zgartirish shart emas)

```env
CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz
NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
VITE_API_URL=https://api.acoustic.uz/api
APP_URL=https://api.acoustic.uz
```

### Qadam 4: Storage (Hozircha local)

```env
STORAGE_DRIVER=local
```

### Qadam 5: Telegram (Ixtiyoriy - bo'sh qoldirish mumkin)

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Qadam 6: AmoCRM (Ixtiyoriy - bo'sh qoldirish mumkin)

```env
AMOCRM_DOMAIN=
AMOCRM_CLIENT_ID=
AMOCRM_CLIENT_SECRET=
AMOCRM_ACCESS_TOKEN=
AMOCRM_REFRESH_TOKEN=
AMOCRM_PIPELINE_ID=
AMOCRM_STATUS_ID=
```

---

## 📋 Minimal .env Fayli (Kerakli Minimal)

Agar faqat ishlashi kerak bo'lsa, quyidagilar yetarli:

```env
# Database
DATABASE_URL=postgresql://acoustic:PAROL@localhost:5432/acoustic

# JWT Secrets (generatsiya qiling!)
JWT_ACCESS_SECRET=<random-string-1>
JWT_REFRESH_SECRET=<random-string-2>

# Environment
NODE_ENV=production

# Backend
PORT=3001
CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz

# Frontend
NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
NEXT_TELEMETRY_DISABLED=1

# Admin
VITE_API_URL=https://api.acoustic.uz/api

# Storage
STORAGE_DRIVER=local

# App URL
APP_URL=https://api.acoustic.uz
```

---

## 🚀 Serverda Tezkor Sozlash

```bash
# 1. .env faylini yaratish
cd /var/www/news.acoustic.uz
cp deploy/env.production.example .env

# 2. JWT Secrets generatsiya qilish
echo "JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env.temp
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env.temp

# 3. .env ni tahrirlash
nano .env

# 4. Database parolini o'zgartirish
# DATABASE_URL=postgresql://acoustic:YANGI_PAROL@localhost:5432/acoustic

# 5. JWT secrets ni .env.temp dan ko'chirish va .env ga qo'shish
```

---

## ⚠️ XAVFSIZLIK TAVSIYALARI

1. **JWT Secrets:**
   - Har safar yangi generatsiya qiling
   - Hech kimga ko'rsatmang
   - Gitga commit qilmang (`.env` `.gitignore` da bo'lishi kerak)

2. **Database Parol:**
   - Kamida 12 belgi
   - Katta-kichik harflar, raqamlar, belgilar
   - Masalan: `MyStrongPass123!@#`

3. **.env Fayli:**
   - Faqat serverda bo'lishi kerak
   - Permission: `chmod 600 .env`
   - Hech qachon gitga push qilmang

---

## 🔍 Tekshirish

```bash
# .env faylini tekshirish (parollar ko'rinmasligi kerak)
cat .env | grep -v PASSWORD | grep -v SECRET

# JWT secrets uzunligini tekshirish
grep JWT .env | awk -F= '{print length($2)}'
# Har ikkalasi ham 64 belgi bo'lishi kerak (hex format)
```


