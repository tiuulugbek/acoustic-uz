#!/bin/bash

# Systemd service'ni sozlash va ishga tushirish

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_FILE="/etc/systemd/system/pm2-acoustic.service"
MONITOR_SCRIPT="$PROJECT_DIR/scripts/monitor-service-restart.sh"

echo "=== Systemd service sozlash ==="

# Service faylini ko'chirish
if [ -f "$PROJECT_DIR/deploy/pm2-acoustic.service" ]; then
    echo "📋 Service faylini ko'chirish..."
    sudo cp "$PROJECT_DIR/deploy/pm2-acoustic.service" "$SERVICE_FILE"
elif [ -f "$SERVICE_FILE" ]; then
    echo "✅ Service fayl allaqachon mavjud"
else
    echo "❌ Service fayl topilmadi"
    exit 1
fi

# Monitor script'ni executable qilish
if [ -f "$MONITOR_SCRIPT" ]; then
    chmod +x "$MONITOR_SCRIPT"
    echo "✅ Monitor script executable qilindi"
else
    echo "⚠️  Monitor script topilmadi: $MONITOR_SCRIPT"
fi

# State file papkasini yaratish
sudo mkdir -p /var/lib
sudo touch /var/lib/acoustic-service-state.txt
sudo chown acoustic:acoustic /var/lib/acoustic-service-state.txt 2>/dev/null || true

# Log papkasini yaratish
sudo touch /var/log/acoustic-service-monitor.log
sudo chown acoustic:acoustic /var/log/acoustic-service-monitor.log 2>/dev/null || true

# Systemd'ni qayta yuklash
echo "🔄 Systemd'ni qayta yuklash..."
sudo systemctl daemon-reload

# Service'ni yoqish
echo "🚀 Service'ni yoqish..."
sudo systemctl enable pm2-acoustic

# Monitor service va timer'ni sozlash
echo "📊 Monitor service va timer'ni sozlash..."
sudo cp "$PROJECT_DIR/deploy/pm2-acoustic-monitor.service" /etc/systemd/system/
sudo cp "$PROJECT_DIR/deploy/pm2-acoustic-monitor.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pm2-acoustic-monitor.timer
sudo systemctl start pm2-acoustic-monitor.timer

# Service'ni ishga tushirish
echo "▶️  Service'ni ishga tushirish..."
sudo systemctl start pm2-acoustic

# Status'ni ko'rsatish
echo ""
echo "=== Service status ==="
sudo systemctl status pm2-acoustic --no-pager -l || true

echo ""
echo "=== Monitor timer status ==="
sudo systemctl status pm2-acoustic-monitor.timer --no-pager -l || true

echo ""
echo "✅ Systemd service sozlandi!"
echo ""
echo "📋 Foydali buyruqlar:"
echo "  sudo systemctl status pm2-acoustic"
echo "  sudo systemctl restart pm2-acoustic"
echo "  sudo systemctl stop pm2-acoustic"
echo "  sudo journalctl -u pm2-acoustic -f"
echo "  tail -f /var/log/acoustic-service-monitor.log"
