# Tezkor Deployment Qo'llanmasi

## 📍 Hozirgi Holat
- ✅ Serverga SSH orqali ulangan
- ✅ Lokal mashinada o'zgarishlar bor
- ⏭️ Gitga push qilish kerak
- ⏭️ Serverga deployment qilish kerak

---

## 1️⃣ LOKAL MASHINADA: Gitga Push

```bash
# 1. Barcha o'zgarishlarni ko'rish
git status

# 2. Barcha fayllarni qo'shish
git add .

# 3. Commit qilish
git commit -m "Add production deployment configuration and scripts"

# 4. Gitga push qilish
git push origin main
# yoki agar branch nomi boshqacha bo'lsa:
git push origin master
```

**⚠️ Agar git remote yo'q bo'lsa:**
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 2️⃣ SERVERDA: Birinchi Marta Setup

### Root User sifatida:

```bash
# 1. Git reponi klonlash
cd /root
git clone <your-repo-url> acoustic-deploy
cd acoustic-deploy

# 2. Server setup scriptini ishga tushirish
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

**Bu script quyidagilarni o'rnatadi:**
- Node.js 18.x
- pnpm 8.15.0
- PostgreSQL
- Nginx
- Certbot (SSL)
- PM2
- Deploy user

**⚠️ PostgreSQL parolini o'zgartiring:**
```bash
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'KUCHLI_PAROL_BU_YERDA';
\q
```

---

## 3️⃣ SERVERDA: Deploy User ga O'tish

```bash
su - deploy
```

---

## 4️⃣ SERVERDA: Repository Klonlash (Deploy User)

```bash
# 1. Papka yaratish va klonlash
cd /var/www
git clone <your-repo-url> news.acoustic.uz
cd news.acoustic.uz

# 2. Branch ni tekshirish
git branch

# 3. Kerakli branch ga o'tish (agar kerak bo'lsa)
git checkout main
```

---

## 5️⃣ SERVERDA: Environment Variables

```bash
cd /var/www/news.acoustic.uz

# 1. .env faylini yaratish
cp deploy/env.production.example .env

# 2. .env ni tahrirlash
nano .env
```

**Muhim o'zgartirishlar:**

```env
# Database (yangi parolni qo'ying)
DATABASE_URL=postgresql://acoustic:KUCHLI_PAROL@localhost:5432/acoustic

# JWT Secrets (random stringlar generatsiya qiling)
JWT_ACCESS_SECRET=<random-string-1>
JWT_REFRESH_SECRET=<random-string-2>
```

**JWT Secret generatsiya qilish:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Bu buyruqni 2 marta ishlating va har birini alohida JWT secret sifatida ishlating.

---

## 6️⃣ SERVERDA: Deployment

```bash
cd /var/www/news.acoustic.uz

# 1. Scriptni executable qilish
chmod +x deploy/deploy.sh

# 2. Deployment
./deploy/deploy.sh
```

**Bu script:**
- ✅ Dependencies o'rnatadi
- ✅ Database migrations ishlatadi
- ✅ Barcha app'larni build qiladi
- ✅ Admin build'ni ko'chiradi
- ✅ PM2 ni sozlaydi
- ✅ Nginx ni sozlaydi

---

## 7️⃣ SERVERDA: SSL Sertifikatlari

```bash
# Root user ga qaytish
exit

# SSL sertifikatlari o'rnatish
sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz
```

**Certbot so'ralganda:**
- Email kiriting
- Terms of Service'ga rozilik bering
- Redirect so'ralganda: 2 (Redirect) ni tanlang

---

## 8️⃣ TEKSHIRISH

```bash
# Deploy user ga qaytish
su - deploy

# Verification script
cd /var/www/news.acoustic.uz
chmod +x deploy/verify-deployment.sh
./deploy/verify-deployment.sh

# PM2 status
pm2 status

# Logs
pm2 logs
```

**Browserda tekshirish:**
- https://news.acoustic.uz
- https://api.acoustic.uz/api
- https://admins.acoustic.uz

---

## 🔄 KEYINGI YANGILANISHLAR

Lokal mashinada o'zgarishlar qilgandan keyin:

```bash
# 1. Lokal mashinada
git add .
git commit -m "Update description"
git push origin main

# 2. Serverda (deploy user)
cd /var/www/news.acoustic.uz
git pull origin main
./deploy/deploy.sh
```

---

## ❓ MUAMMOLAR VA YECHIMLAR

### Git clone xatosi
```bash
# SSH key sozlash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub
# Bu key ni GitHub/GitLab ga qo'shing
```

### Permission denied
```bash
sudo chown -R deploy:deploy /var/www/news.acoustic.uz
```

### Port band
```bash
# Qaysi process portni ishlatayotganini ko'rish
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# PM2 ni restart qilish
pm2 restart all
```

### Database ulanish muammosi
```bash
# PostgreSQL status
sudo systemctl status postgresql

# Database tekshirish
sudo -u postgres psql -l
```

---

## 📋 TO'LIQ KETMA-KETLIK (Copy-Paste uchun)

```bash
# ========== LOKAL MASHINADA ==========
git add .
git commit -m "Add deployment config"
git push origin main

# ========== SERVERDA (Root) ==========
cd /root
git clone <repo-url> acoustic-deploy
cd acoustic-deploy
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh

# PostgreSQL parol
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'PAROL';
\q

# ========== SERVERDA (Deploy) ==========
su - deploy
cd /var/www
git clone <repo-url> news.acoustic.uz
cd news.acoustic.uz
cp deploy/env.production.example .env
nano .env  # Parollarni o'zgartirish
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# ========== SERVERDA (Root - SSL) ==========
exit
sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz

# ========== TEKSHIRISH ==========
su - deploy
cd /var/www/news.acoustic.uz
./deploy/verify-deployment.sh
pm2 status
```

