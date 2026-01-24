#!/bin/bash

# Cron job sozlash skripti

BACKUP_SCRIPT="/root/acoustic.uz/scripts/daily-backup-final.sh"
CRON_LOG="/var/log/daily-backup.log"

echo "=== Daily Backup Cron Job sozlash ==="
echo ""

# Cron job mavjudligini tekshirish
if crontab -l 2>/dev/null | grep -q "daily-backup-final.sh"; then
    echo "⚠️  Cron job allaqachon sozlangan:"
    crontab -l | grep "daily-backup-final.sh"
    echo ""
    read -p "Yangi cron job qo'shilsinmi? (y/n): " answer
    if [ "$answer" != "y" ]; then
        echo "Bekor qilindi."
        exit 0
    fi
fi

# Cron job qo'shish (har kuni ertalab 2:00 da)
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> $CRON_LOG 2>&1") | crontab -

echo "✅ Cron job qo'shildi!"
echo ""
echo "Har kuni ertalab 2:00 da backup yaratiladi"
echo "Log fayl: $CRON_LOG"
echo ""
echo "Tekshirish:"
echo "  crontab -l"
echo "  tail -f $CRON_LOG"
