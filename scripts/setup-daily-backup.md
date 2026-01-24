# Har kunlik Database Backup va Telegram Botga Yuborish

## 1. Telegram Bot sozlamalari

`.env` faylida Telegram bot sozlamalarini to'ldiring:

```bash
# /root/acoustic.uz/apps/backend/.env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Telegram Bot yaratish:

1. Telegram'da [@BotFather](https://t.me/botfather) ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini va username'ni kiriting
4. BotFather sizga `TELEGRAM_BOT_TOKEN` beradi

### Chat ID olish:

1. Botingizga yozing
2. Quyidagi URL'ni brauzerda oching (TOKEN o'rniga bot token'ingizni qo'ying):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
3. Javobda `"chat":{"id":123456789}` ko'rinadi - bu sizning `TELEGRAM_CHAT_ID`'ingiz

## 2. Backup skriptini test qilish

```bash
# Skriptni bajarish
/root/acoustic.uz/scripts/daily-backup-telegram.sh
```

## 3. Har kunlik avtomatik backup sozlash

### Usul 1: Cron orqali (tavsiya etiladi)

```bash
# Crontab'ni ochish
crontab -e

# Quyidagi qatorni qo'shing (har kuni ertalab 2:00 da)
0 2 * * * /root/acoustic.uz/scripts/daily-backup-telegram.sh >> /var/log/daily-backup.log 2>&1
```

### Usul 2: Systemd timer orqali

```bash
# Timer fayl yaratish
sudo nano /etc/systemd/system/daily-backup.service
```

Quyidagi kontentni qo'shing:
```ini
[Unit]
Description=Daily Database Backup to Telegram
After=network.target postgresql.service

[Service]
Type=oneshot
User=root
ExecStart=/root/acoustic.uz/scripts/daily-backup-telegram.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Timer fayl yaratish:
```bash
sudo nano /etc/systemd/system/daily-backup.timer
```

```ini
[Unit]
Description=Daily Database Backup Timer
Requires=daily-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Timer'ni ishga tushirish:
```bash
sudo systemctl daemon-reload
sudo systemctl enable daily-backup.timer
sudo systemctl start daily-backup.timer
sudo systemctl status daily-backup.timer
```

## 4. Backup fayllarini boshqarish

- Backup'lar `/root/acoustic.uz/backups/` papkasida saqlanadi
- 30 kundan eski backup'lar avtomatik o'chiriladi
- Backup fayllar `.sql.gz` formatida (gzip bilan siqilgan)

## 5. Tekshirish

```bash
# Backup'lar ro'yxati
ls -lh /root/acoustic.uz/backups/

# Cron job'ni tekshirish
crontab -l

# Systemd timer'ni tekshirish
systemctl status daily-backup.timer
systemctl list-timers daily-backup.timer
```

## 6. Xatoliklarni kuzatish

```bash
# Log faylni ko'rish
tail -f /var/log/daily-backup.log

# Yoki journalctl orqali (systemd uchun)
journalctl -u daily-backup.service -f
```

## Eslatmalar

- Backup hajmi 50MB dan katta bo'lsa, faqat xabar yuboriladi (Telegram limiti)
- Backup'lar serverda ham saqlanadi (30 kun)
- Telegram bot token va chat ID to'g'ri sozlangan bo'lishi kerak
