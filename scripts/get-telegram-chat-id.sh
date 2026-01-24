#!/bin/bash

# Telegram Chat ID ni olish skripti

BOT_TOKEN="8460957603:AAFTv7EIdgwSunJCOlAmklb07HLYO81NdUs"

echo "=== Telegram Chat ID ni olish ==="
echo ""
echo "1. Telegram'da @acousticuzbackupbot ga yozing"
echo "2. Keyin quyidagi buyruqni bajaring:"
echo ""
echo "curl -s 'https://api.telegram.org/bot${BOT_TOKEN}/getUpdates' | grep -o '\"chat\":{\"id\":[0-9]*' | head -1"
echo ""
echo "Yoki quyidagi buyruqni bajaring:"
echo ""

curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates" | python3 -m json.tool 2>/dev/null | grep -A 5 '"chat"' | head -20 || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates" | grep -o '"chat":{"id":[0-9]*' | head -1

echo ""
echo ""
echo "Chat ID ni topganingizdan keyin, .env faylida TELEGRAM_CHAT_ID ni to'ldiring"
