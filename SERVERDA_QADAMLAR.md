# Serverda Telegram Button Bot Sozlash Qadamlari

## Ketma-ket qadamlar:

### 1. Git pull qilish
```bash
cd /var/www/news.acoustic.uz
git pull origin main
```

### 2. Migration qo'llash
```bash
npx prisma migrate deploy
```

Agar xatolik chiqsa (masalan, migration allaqachon qo'llangan), quyidagilarni bajaring:
```bash
# Migration holatini tekshirish
npx prisma migrate status

# Agar migration qo'llangan bo'lsa, skip qilish
npx prisma migrate resolve --applied 20251203120000_add_telegram_button_bot_settings
```

### 3. Backend'ni qayta ishga tushirish
```bash
pm2 restart acoustic-backend
```

### 4. Status tekshirish
```bash
pm2 status acoustic-backend
pm2 logs acoustic-backend --lines 20
```

### 5. Admin panelda sozlash
1. Admin panelga kiring: `https://admins.acoustic.uz`
2. Settings > Umumiy sozlamalar bo'limiga o'ting
3. Quyidagi maydonlarni to'ldiring:
   - **Telegram Button Bot Token**: Bot token'ni kiriting
   - **Telegram Button Bot Username**: Bot username'ni kiriting (masalan: `acoustic_support_bot` yoki `@acoustic_support_bot`)
4. "Saqlash" tugmasini bosing

### 6. Telegram Webhook sozlash

Bot token'ni oling va quyidagi buyruqni bajaring:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.acoustic.uz/api/leads/telegram-webhook"}'
```

`<BOT_TOKEN>` o'rniga bot token'ni qo'ying.

Webhook to'g'ri sozlanganini tekshirish:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 7. Tekshirish

1. Saytga kiring: `https://news.acoustic.uz`
2. O'ng pastki burchakda Telegram tugmasini ko'ring
3. Tugmani bosing va Telegram bot ochilishini tekshiring
4. Bot'ga xabar yuboring
5. Backend loglarini tekshiring:
   ```bash
   pm2 logs acoustic-backend --lines 50 | grep -i telegram
   ```

## Yoki barcha qadamlarni bir vaqtda bajarish:

```bash
cd /var/www/news.acoustic.uz
bash deploy/setup-telegram-button-bot.sh
```

## Muammolarni hal qilish

### Migration xatolik
Agar migration allaqachon qo'llangan bo'lsa:
```bash
npx prisma migrate resolve --applied 20251203120000_add_telegram_button_bot_settings
```

### Backend ishlamayapti
```bash
pm2 logs acoustic-backend --lines 100
pm2 restart acoustic-backend
```

### Telegram tugma ko'rinmayapti
- Admin panelda `telegramButtonBotUsername` to'g'ri kiritilganini tekshiring
- Browser console'da xatoliklar bor-yo'qligini tekshiring
- Frontend'ni qayta build qilish kerak bo'lishi mumkin:
  ```bash
  cd /var/www/news.acoustic.uz
  bash deploy/rebuild-frontend.sh
  ```

