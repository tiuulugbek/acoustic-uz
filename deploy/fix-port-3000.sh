#!/bin/bash
# Port 3000'ni faqat bu proekt uchun qulay qilish

echo "=== Port 3000'ni tekshirish va tuzatish ==="

# 1. Port 3000'ni ishlatayotgan process'larni to'xtatish
echo "1. Port 3000'ni ishlatayotgan process'larni to'xtatish..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
pkill -f "next.*3000" 2>/dev/null
sleep 2

# 2. Port 3000'ni tekshirish
echo "2. Port 3000'ni tekshirish..."
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "⚠️ Port 3000 hali ham band"
    netstat -tulpn 2>/dev/null | grep :3000 || ss -tulpn 2>/dev/null | grep :3000
else
    echo "✅ Port 3000 bo'sh"
fi

# 3. Node.js'ni tekshirish
echo "3. Node.js'ni tekshirish..."
NODE_PATH=$(which node)
if [ -n "$NODE_PATH" ]; then
    echo "✅ Node.js topildi: $NODE_PATH"
    getcap "$NODE_PATH" 2>/dev/null || echo "⚠️ Capabilities yo'q"
else
    echo "❌ Node.js topilmadi"
fi

# 4. Test qilish
echo "4. Test qilish..."
cd /root/acoustic.uz/apps/frontend
export NODE_ENV=production
export PORT=3000
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz

timeout 5 node_modules/.bin/next start 2>&1 | head -10 || echo "Test yakunlandi"

echo "=== Tugadi ==="
