#!/bin/bash
# Database authentication muammosini tuzatish

set -e

echo "🔧 Database authentication muammosini tuzatish..."
echo ""

# 1. Database user'ni tekshirish va yaratish
echo "👤 1. Database user'ni tekshirish..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_user WHERE usename='acoustic'" | grep -q 1; then
    echo "   ✅ User 'acoustic' mavjud"
    echo "   🔄 Password'ni yangilash..."
    sudo -u postgres psql -c "ALTER USER acoustic WITH PASSWORD 'acoustic123';" 2>/dev/null || true
    echo "   ✅ Password yangilandi"
else
    echo "   ⚠️  User 'acoustic' mavjud emas, yaratilmoqda..."
    sudo -u postgres psql -c "CREATE USER acoustic WITH PASSWORD 'acoustic123';" 2>/dev/null || true
    echo "   ✅ User yaratildi"
fi
echo ""

# 2. Database'ni tekshirish va yaratish
echo "💾 2. Database'ni tekshirish..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='acoustic'" | grep -q 1; then
    echo "   ✅ Database 'acoustic' mavjud"
else
    echo "   ⚠️  Database 'acoustic' mavjud emas, yaratilmoqda..."
    sudo -u postgres psql -c "CREATE DATABASE acoustic OWNER acoustic;" 2>/dev/null || true
    echo "   ✅ Database yaratildi"
fi
echo ""

# 3. Permission'lar
echo "🔐 3. Permission'larni berish..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;" 2>/dev/null || true
sudo -u postgres psql -d acoustic -c "GRANT ALL ON SCHEMA public TO acoustic;" 2>/dev/null || true
echo "   ✅ Permission'lar berildi"
echo ""

# 4. .env faylini tekshirish va yangilash
echo "📝 4. .env faylini tekshirish..."
ENV_FILE="/var/www/acoustic.uz/.env"

if [ -f "$ENV_FILE" ]; then
    echo "   ✅ .env fayl mavjud"
    
    # Permission'ni to'g'rilash
    chown acoustic:acoustic "$ENV_FILE" 2>/dev/null || chown nobody:nogroup "$ENV_FILE"
    chmod 600 "$ENV_FILE" 2>/dev/null || true
    
    # DATABASE_URL'ni tekshirish va yangilash
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        echo "   ✅ DATABASE_URL mavjud"
        # Yangilash (agar kerak bo'lsa)
        sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic|g' "$ENV_FILE" 2>/dev/null || true
        echo "   ✅ DATABASE_URL yangilandi"
    else
        echo "   ⚠️  DATABASE_URL mavjud emas, qo'shilmoqda..."
        echo "DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic" >> "$ENV_FILE" 2>/dev/null || true
        echo "   ✅ DATABASE_URL qo'shildi"
    fi
else
    echo "   ⚠️  .env fayl mavjud emas, yaratilmoqda..."
    cp /var/www/acoustic.uz/.env.example "$ENV_FILE" 2>/dev/null || true
    chown acoustic:acoustic "$ENV_FILE" 2>/dev/null || chown nobody:nogroup "$ENV_FILE"
    chmod 600 "$ENV_FILE" 2>/dev/null || true
    echo "   ✅ .env fayl yaratildi"
fi
echo ""

# 5. Test ulanish
echo "🔍 5. Database ulanishini test qilish..."
if PGPASSWORD=acoustic123 psql -h localhost -U acoustic -d acoustic -c "SELECT version();" > /dev/null 2>&1; then
    echo "   ✅ Database'ga ulanish muvaffaqiyatli"
else
    echo "   ⚠️  Database'ga ulanish xatolik (password yoki user muammosi)"
fi
echo ""

echo "✅ Database authentication tuzatildi!"
echo ""
echo "📋 Keyingi qadamlar:"
echo "   1. pm2 restart acoustic-backend"
echo "   2. pm2 logs acoustic-backend --lines 20"
echo ""
echo "⚠️  Agar hali ham xatolik bo'lsa, .env faylini qo'lda tekshiring:"
echo "   su - acoustic"
echo "   cd /var/www/acoustic.uz"
echo "   cat .env | grep DATABASE_URL"
