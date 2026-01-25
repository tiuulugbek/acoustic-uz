#!/bin/bash

# Frontend restart script - Port 3000'da ishlaydi
# Development mode'da ishga tushirishga harakat qiladi
# Agar development ishlamasa, production build qilib ishga tushiradi

# set -e  # Xatoliklarda ham davom etish uchun o'chirildi

FRONTEND_DIR="/root/acoustic.uz/apps/frontend"
PM2_APP_NAME="frontend"
PORT=3000  # Hardcode - faqat port 3000'da ishlaydi
HOSTNAME="127.0.0.1"

# Port 3000'ni majburiy qilish
if [ -n "$PORT" ] && [ "$PORT" != "3000" ]; then
  echo "❌ Xatolik: Frontend faqat port 3000'da ishlaydi (hardcode)!"
  echo "   Berilgan port: $PORT"
  exit 1
fi

cd "$FRONTEND_DIR"

echo "🚀 Frontend restart script ishga tushmoqda..."
echo "📁 Papka: $FRONTEND_DIR"
echo "🔌 Port: $PORT"
echo ""

# PM2'da mavjud processni to'xtatish (agar ruxsat bo'lsa)
if command -v pm2 > /dev/null 2>&1; then
    if pm2 list 2>/dev/null | grep -q "$PM2_APP_NAME"; then
        echo "⏹️  PM2'da mavjud processni to'xtatmoqda..."
        pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
        pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        sleep 2
    fi
else
    echo "⚠️  PM2 topilmadi yoki ruxsat yo'q. To'g'ridan-to'g'ri ishga tushirishga harakat qilamiz..."
fi

# Port 3000'ni tozalash
echo "🧹 Port $PORT ni tozalash..."
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Development mode'da ishga tushirishga harakat qilish
echo "🔧 Development mode'da ishga tushirishga harakat qilmoqda..."

# Port 3000'ga ruxsat bor-yo'qligini tekshirish
if timeout 2 bash -c "echo > /dev/tcp/$HOSTNAME/$PORT" 2>/dev/null; then
    echo "⚠️  Port $PORT allaqachon ishlatilmoqda, tozalash..."
    lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Development mode'ni ishga tushirish
echo "🚀 Development mode'ni ishga tushirishga harakat qilmoqda..."

# PM2 orqali ishga tushirishga harakat qilish (agar ruxsat bo'lsa)
USE_PM2=false
if command -v pm2 > /dev/null 2>&1; then
    if pm2 list 2>/dev/null > /dev/null 2>&1; then
        USE_PM2=true
        echo "📦 PM2 orqali ishga tushirilmoqda..."
        
        # PM2 ecosystem fayl yaratish
        PM2_ECOSYSTEM="/tmp/frontend-dev-ecosystem.json"
        cat > "$PM2_ECOSYSTEM" <<EOF
{
  "apps": [{
    "name": "$PM2_APP_NAME",
        "script": "$FRONTEND_DIR/node_modules/.bin/next",
        "args": "dev --port 3000 --hostname $HOSTNAME",
    "cwd": "$FRONTEND_DIR",
    "interpreter": "node",
    "env": {
      "NODE_ENV": "development"
    },
    "error_file": "/tmp/frontend-error.log",
    "out_file": "/tmp/frontend-out.log"
  }]
}
EOF
        
        pm2 start "$PM2_ECOSYSTEM" 2>&1 | head -5
        sleep 5
        
        # Development mode ishlayotganini tekshirish
        if curl -s http://$HOSTNAME:3000 > /dev/null 2>&1; then
            echo "✅ Development mode ishlayapti!"
            pm2 save 2>/dev/null || true
            echo "✅ Frontend development mode'da PM2 orqali ishga tushirildi!"
            pm2 status 2>/dev/null || true
            exit 0
        else
            echo "⚠️  PM2 orqali ishga tushirishda muammo. To'g'ridan-to'g'ri ishga tushirishga harakat qilamiz..."
            pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
            pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        fi
    fi
fi

# PM2 ishlamasa yoki ruxsat yo'q bo'lsa, to'g'ridan-to'g'ri ishga tushirish
if [ "$USE_PM2" = false ]; then
    echo "📦 To'g'ridan-to'g'ri ishga tushirilmoqda (PM2'siz)..."
    
    # Eski processlarni to'xtatish
    pkill -f "next dev" 2>/dev/null || true
    sleep 1
    
    # Background'da ishga tushirish
    cd "$FRONTEND_DIR"
    nohup node_modules/.bin/next dev --port 3000 --hostname $HOSTNAME > /tmp/frontend-dev.log 2>&1 &
    FRONTEND_PID=$!
    echo "🚀 Frontend ishga tushirildi (PID: $FRONTEND_PID)"
    
    sleep 8
    
    # Development mode ishlayotganini tekshirish
    if curl -s http://$HOSTNAME:3000 > /dev/null 2>&1; then
        echo "✅ Development mode ishlayapti!"
        echo "📝 Log fayl: /tmp/frontend-dev.log"
        echo "🔄 To'xtatish uchun: kill $FRONTEND_PID"
        exit 0
    else
        echo "⚠️  Development mode ishlamayapti. Loglarni tekshiring: tail -50 /tmp/frontend-dev.log"
        tail -30 /tmp/frontend-dev.log 2>/dev/null | tail -10
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 2
    fi
fi

# Development mode ishlamasa, production build qilish
echo "📦 Development mode ishlamayapti, production build qilmoqda..."

# Tailwindcss o'rnatilganligini tekshirish (frontend papkasida)
echo "🔍 Tailwindcss o'rnatilganligini tekshirish (frontend papkasida)..."
cd "$FRONTEND_DIR"

TAILWIND_INSTALLED=false

# Frontend papkasida tekshirish (asosiy)
# pnpm list tailwindcss tekshiruvi noto'g'ri natija berishi mumkin
# Shuning uchun node_modules'da to'g'ridan-to'g'ri tekshiramiz
if [ -f "$FRONTEND_DIR/node_modules/.bin/tailwindcss" ] || [ -d "$FRONTEND_DIR/node_modules/tailwindcss" ]; then
    echo "✅ Tailwindcss frontend papkasida topildi!"
    TAILWIND_INSTALLED=true
elif find /root/acoustic.uz/node_modules/.pnpm -name "tailwindcss@*" -type d 2>/dev/null | head -1 | grep -q .; then
    echo "✅ Tailwindcss root papkada topildi!"
    TAILWIND_INSTALLED=true
else
    echo "⚠️  Tailwindcss topilmadi!"
    echo "⚠️  Tailwindcss o'rnatishda muammo bo'lishi mumkin (pnpm store muammosi)."
    echo "🔄 Development mode'da ishga tushirishga harakat qilamiz (tailwindcss build paytida kerak emas)..."
    TAILWIND_INSTALLED=false
fi

# Agar tailwindcss o'rnatilmagan bo'lsa, development mode'da ishga tushirish
if [ "$TAILWIND_INSTALLED" = false ]; then
    echo "🔄 Tailwindcss o'rnatilmadi, development mode'da ishga tushirishga harakat qilamiz..."
    echo "🔄 Development mode'da ishga tushirishga harakat qilamiz..."
    
    if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null > /dev/null 2>&1; then
        PM2_ECOSYSTEM="/tmp/frontend-dev-ecosystem.json"
        cat > "$PM2_ECOSYSTEM" <<EOF
{
  "apps": [{
    "name": "$PM2_APP_NAME",
        "script": "$FRONTEND_DIR/node_modules/.bin/next",
        "args": "dev --port 3000 --hostname $HOSTNAME",
    "cwd": "$FRONTEND_DIR",
    "interpreter": "node",
    "env": {
      "NODE_ENV": "development"
    },
    "error_file": "/tmp/frontend-error.log",
    "out_file": "/tmp/frontend-out.log"
  }]
}
EOF
        pm2 start "$PM2_ECOSYSTEM" 2>&1 | head -5
        pm2 save 2>/dev/null || true
        sleep 8
        if curl -s http://$HOSTNAME:3000 > /dev/null 2>&1; then
            echo "✅ Frontend development mode'da PM2 orqali ishga tushirildi (tailwindcss muammosi bilan)!"
            pm2 status 2>/dev/null || true
            exit 0
        else
            echo "⚠️  PM2 orqali ishga tushirishda muammo. To'g'ridan-to'g'ri ishga tushirishga harakat qilamiz..."
            pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
            pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        fi
    fi
    
    # PM2 ishlamasa yoki xatolik bo'lsa, to'g'ridan-to'g'ri ishga tushirish
    cd "$FRONTEND_DIR"
    pkill -f "next dev" 2>/dev/null || true
    sleep 1
    nohup node_modules/.bin/next dev --port 3000 --hostname $HOSTNAME > /tmp/frontend-dev.log 2>&1 &
    FRONTEND_PID=$!
    echo "🚀 Frontend development mode'da ishga tushirildi (PID: $FRONTEND_PID, tailwindcss muammosi bilan)!"
    sleep 8
    if curl -s http://$HOSTNAME:3000 > /dev/null 2>&1; then
        echo "✅ Frontend development mode'da ishlayapti!"
        echo "📝 Log fayl: /tmp/frontend-dev.log"
        echo "🔄 To'xtatish uchun: kill $FRONTEND_PID"
        exit 0
    else
        echo "⚠️  Development mode ham ishlamayapti. Loglarni tekshiring: tail -50 /tmp/frontend-dev.log"
        tail -30 /tmp/frontend-dev.log 2>/dev/null | tail -10
        exit 1
    fi
fi

# Production build
echo "🔨 Production build qilmoqda..."
if pnpm build; then
    echo "✅ Build muvaffaqiyatli yakunlandi!"
    
    # Production mode'da ishga tushirish
    echo "🚀 Production mode'da ishga tushirilmoqda..."
    
    # PM2 orqali ishga tushirishga harakat qilish
    if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null > /dev/null 2>&1; then
        pm2 start "node server.js" --name "$PM2_APP_NAME" --cwd "$FRONTEND_DIR"
        pm2 save 2>/dev/null || true
    else
        # PM2 ishlamasa, to'g'ridan-to'g'ri ishga tushirish
        echo "📦 PM2 ishlamayapti, to'g'ridan-to'g'ri ishga tushirilmoqda..."
        cd "$FRONTEND_DIR"
        pkill -f "node server.js" 2>/dev/null || true
        sleep 1
        nohup node server.js > /tmp/frontend-prod.log 2>&1 &
        FRONTEND_PID=$!
        echo "🚀 Frontend production mode'da ishga tushirildi (PID: $FRONTEND_PID)"
        echo "📝 Log fayl: /tmp/frontend-prod.log"
    fi
    
    # Bir necha soniya kutib, ishlayotganini tekshirish
    sleep 3
    if curl -s http://$HOSTNAME:3000 > /dev/null 2>&1; then
        echo "✅ Frontend production mode'da PM2 orqali muvaffaqiyatli ishga tushirildi!"
    else
        echo "⚠️  Frontend ishga tushirildi, lekin tekshirishda muammo bo'lishi mumkin."
        echo "📊 PM2 holatini ko'rish: pm2 status"
    fi
else
    echo "❌ Build xatolik bilan yakunlandi!"
    echo "🔄 Development mode'da ishga tushirishga harakat qilamiz..."
    
    # Build xatolik bo'lsa ham development mode'da ishga tushirish
    echo "🔄 Development mode'da ishga tushirishga harakat qilamiz..."
    
    if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null > /dev/null 2>&1; then
        PM2_ECOSYSTEM="/tmp/frontend-dev-ecosystem.json"
        cat > "$PM2_ECOSYSTEM" <<EOF
{
  "apps": [{
    "name": "$PM2_APP_NAME",
        "script": "$FRONTEND_DIR/node_modules/.bin/next",
        "args": "dev --port 3000 --hostname $HOSTNAME",
    "cwd": "$FRONTEND_DIR",
    "interpreter": "node",
    "env": {
      "NODE_ENV": "development"
    },
    "error_file": "/tmp/frontend-error.log",
    "out_file": "/tmp/frontend-out.log"
  }]
}
EOF
        pm2 start "$PM2_ECOSYSTEM" 2>&1 | head -5
        pm2 save 2>/dev/null || true
        echo "✅ Frontend development mode'da PM2 orqali ishga tushirildi (build xatolik bilan)!"
    else
        # PM2 ishlamasa, to'g'ridan-to'g'ri ishga tushirish
        cd "$FRONTEND_DIR"
        pkill -f "next dev" 2>/dev/null || true
        sleep 1
        nohup node_modules/.bin/next dev --port 3000 --hostname $HOSTNAME > /tmp/frontend-dev.log 2>&1 &
        FRONTEND_PID=$!
        echo "✅ Frontend development mode'da ishga tushirildi (PID: $FRONTEND_PID, build xatolik bilan)!"
        echo "📝 Log fayl: /tmp/frontend-dev.log"
    fi
fi

echo ""
if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null > /dev/null 2>&1; then
    echo "📊 PM2 holati:"
    pm2 status 2>/dev/null || true
else
    echo "📊 Frontend process holati:"
    ps aux | grep -E "next dev|node server.js" | grep -v grep || echo "Frontend process topilmadi"
fi

echo ""
echo "✅ Script yakunlandi!"
