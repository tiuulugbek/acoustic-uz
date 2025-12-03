# Telegram Button Bot Sozlash Qo'llanmasi

## Umumiy ma'lumot

Ikki alohida Telegram bot sozlandi:

1. **Formalar Bot** (`telegramBotToken`, `telegramChatId`)
   - Saytdagi formalardan kelgan so'rovlar shu botga yuboriladi
   - Telegram chat'ga yuboriladi

2. **Telegram Button Bot** (`telegramButtonBotToken`, `telegramButtonBotUsername`)
   - Saytdagi Telegram tugmasidan kelgan xabarlar AmoCRM'ga yuboriladi
   - Telegram chat'ga yuborilmaydi

## Qadamlar

### 1. Migration yaratish va qo'llash

```bash
cd /var/www/news.acoustic.uz
npx prisma migrate dev --name add_telegram_button_bot_settings
# yoki production'da:
npx prisma migrate deploy
```

### 2. Telegram Button Bot yaratish

1. Telegram'da [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini va username'ni kiriting (masalan: `@acoustic_support_bot`)
4. Bot token'ni oling (masalan: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 3. Telegram Button Bot webhook sozlash

Webhook'ni sozlash uchun quyidagi URL'ga POST so'rov yuborish kerak:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.acoustic.uz/api/leads/telegram-webhook"}'
```

`<BOT_TOKEN>` o'rniga bot token'ni qo'ying.

### 4. Admin panelda sozlash

1. Admin panelga kiring: `https://admins.acoustic.uz`
2. Settings > Umumiy sozlamalar bo'limiga o'ting
3. Quyidagi maydonlarni to'ldiring:

   **Telegram sozlamalari (Formalar uchun):**
   - Telegram Bot Token: Formalar bot token'i
   - Telegram Chat ID: Formalar yuboriladigan chat ID

   **Telegram Button Bot (AmoCRM uchun):**
   - Telegram Button Bot Token: Button bot token'i
   - Telegram Button Bot Username: Bot username (masalan: `acoustic_support_bot` yoki `@acoustic_support_bot`)

4. "Saqlash" tugmasini bosing

### 5. Backend'ni qayta ishga tushirish

```bash
pm2 restart acoustic-backend
```

## Ishlash prinsipi

### Formalar
- Foydalanuvchi saytdagi formani to'ldiradi
- Lead yaratiladi va **ikkalasi ham** yuboriladi:
  - Telegram forms bot'ga (chat'ga)
  - AmoCRM'ga

### Telegram Button
- Foydalanuvchi saytdagi Telegram tugmasini bosadi
- Telegram bot ochiladi
- Foydalanuvchi bot'ga xabar yozadi
- Webhook orqali lead yaratiladi va **faqat AmoCRM'ga** yuboriladi
- Telegram chat'ga yuborilmaydi

## Tekshirish

1. Saytga kiring va Telegram tugmasini ko'ring (o'ng pastki burchakda)
2. Tugmani bosing va Telegram bot ochilishini tekshiring
3. Bot'ga xabar yuboring
4. AmoCRM'da yangi lead yaratilganini tekshiring

## Muammolarni hal qilish

### Telegram tugma ko'rinmayapti
- Admin panelda `telegramButtonBotUsername` to'g'ri kiritilganini tekshiring
- Browser console'da xatoliklar bor-yo'qligini tekshiring

### Webhook ishlamayapti
- Bot token to'g'ri ekanligini tekshiring
- Webhook URL to'g'ri sozlanganini tekshiring:
  ```bash
  curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
  ```
- Backend loglarini tekshiring:
  ```bash
  pm2 logs acoustic-backend --lines 50
  ```

### Xabarlar AmoCRM'ga yuborilmayapti
- AmoCRM integratsiyasi to'g'ri sozlanganini tekshiring
- Backend loglarini tekshiring
- AmoCRM'da yangi lead yaratilganini tekshiring

