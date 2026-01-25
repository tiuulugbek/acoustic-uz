#!/bin/bash
# Acoustic.uz Frontend Start Script
# Bu script faqat port 3000'da ishga tushirish uchun

cd /root/acoustic.uz/apps/frontend

export NODE_ENV=production
export PORT=3000
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz

# Eski process'larni to'xtatish
pkill -f "next start" 2>/dev/null
sleep 2

# Frontend'ni ishga tushirish
exec node_modules/.bin/next start
