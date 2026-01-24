# Systemd Service Sozlash

## 📋 Maqsad

1. **Avtomatik restart**: Server o'chib qolsa, service avtomatik yonadi
2. **Backup yuborish**: Service o'chib yonishida SQL dump yaratib Telegram botga yuboradi

## 🔧 Yaratilgan fayllar

1. **`scripts/monitor-service-restart.sh`** - Service o'chib yonishini kuzatish va backup yuborish
2. **`scripts/setup-systemd-service.sh`** - Systemd service'ni sozlash script'i
3. **`deploy/pm2-acoustic.service`** - Systemd service fayli (avtomatik restart)
4. **`deploy/pm2-acoustic-monitor.service`** - Monitor service (status tekshirish)
5. **`deploy/pm2-acoustic-monitor.timer`** - Monitor timer (har 1 daqiqada ishga tushadi)

## 🚀 O'rnatish

### 1. Service'ni sozlash

```bash
sudo /root/acoustic.uz/scripts/setup-systemd-service.sh
```

### 2. Tekshirish

```bash
# Service status
sudo systemctl status pm2-acoustic

# Service loglar
sudo journalctl -u pm2-acoustic -f

# Monitor loglar
tail -f /var/log/acoustic-service-monitor.log
```

## ⚙️ Xususiyatlar

### Avtomatik restart
- `Restart=always` - Service har doim qayta yonadi
- `RestartSec=10` - 10 soniyadan keyin qayta yonadi
- `StartLimitInterval=0` - Restart limit yo'q

### Xabar yuborish
- **Service o'chib qolganida**: ⚠️ "Service o'chib qoldi" xabari yuboriladi
- **Service yonib qolganida**: ✅ "Service yonib qoldi" xabari yuboriladi
- **Backup yuborish**: Service yonib qolganida avtomatik backup yaratiladi va yuboriladi
- Katta fayllar (50MB+) chunk'larga bo'linadi
- Eski backup'lar (7 kundan eski) avtomatik o'chiriladi

## 📋 Foydali buyruqlar

```bash
# Service'ni boshqarish
sudo systemctl start pm2-acoustic
sudo systemctl stop pm2-acoustic
sudo systemctl restart pm2-acoustic
sudo systemctl status pm2-acoustic

# Service'ni yoqish/o'chirish
sudo systemctl enable pm2-acoustic
sudo systemctl disable pm2-acoustic

# Loglar
sudo journalctl -u pm2-acoustic -f
tail -f /var/log/acoustic-service-monitor.log

# Monitor timer
sudo systemctl status pm2-acoustic-monitor.timer
sudo systemctl list-timers pm2-acoustic-monitor.timer

# PM2 process'lari
pm2 list
pm2 logs
```

## 🔍 Monitoring

### Service status monitoring

Monitor timer har 30 daqiqada ishga tushadi va quyidagilarni bajaradi:
1. Service status'ni tekshiradi
2. Avvalgi status bilan solishtiradi
3. Agar service o'chib yonib qolsa (inactive → active), backup yaratadi
4. Backup'ni Telegram botga yuboradi
5. Status'ni state file'ga saqlaydi

### Log fayllar

- **Service loglar**: `journalctl -u pm2-acoustic`
- **Monitor loglar**: `/var/log/acoustic-service-monitor.log`
- **State file**: `/var/lib/acoustic-service-state.txt`

## ⚠️ Eslatmalar

1. Service `acoustic` user'da ishlaydi
2. Backup'lar `backups/restart-backup-*.sql.gz` papkasida saqlanadi
3. Telegram bot token va chat ID `.env` fayldan olinadi
4. Service o'chib yonishida faqat bir marta backup yuboriladi

## 🐛 Muammolarni hal qilish

### Service ishga tushmayapti

```bash
# Systemd'ni qayta yuklash
sudo systemctl daemon-reload

# Service'ni qayta ishga tushirish
sudo systemctl restart pm2-acoustic

# Xatoliklarni ko'rish
sudo journalctl -u pm2-acoustic -n 50
```

### Backup yuborilmayapti

```bash
# Monitor loglarini tekshirish
tail -f /var/log/acoustic-service-monitor.log

# .env faylni tekshirish
cat /root/acoustic.uz/apps/backend/.env | grep TELEGRAM

# Script'ni to'g'ridan-to'g'ri ishga tushirish
sudo /root/acoustic.uz/scripts/monitor-service-restart.sh
```

### Permission muammolari

```bash
# Log fayl permission'larini to'g'rilash
sudo chown acoustic:acoustic /var/log/acoustic-service-monitor.log
sudo chmod 644 /var/log/acoustic-service-monitor.log

# State file permission'larini to'g'rilash
sudo chown acoustic:acoustic /var/lib/acoustic-service-state.txt
sudo chmod 644 /var/lib/acoustic-service-state.txt
```
