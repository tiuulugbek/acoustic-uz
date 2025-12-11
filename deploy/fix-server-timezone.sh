#!/bin/bash
# Fix server timezone to Asia/Tashkent (UTC+5)

set -e

echo "🕐 Fixing server timezone to Asia/Tashkent (UTC+5)..."
echo ""

# Step 1: Check current timezone
echo "📋 Step 1: Checking current timezone..."
CURRENT_TZ=$(timedatectl show --property=Timezone --value 2>/dev/null || echo "unknown")
echo "   Current timezone: $CURRENT_TZ"
echo "   Current time: $(date)"
echo ""

# Step 2: Set timezone to Asia/Tashkent
echo "📋 Step 2: Setting timezone to Asia/Tashkent..."
if timedatectl set-timezone Asia/Tashkent 2>/dev/null; then
    echo "   ✅ Timezone set successfully"
else
    echo "   ⚠️  timedatectl failed, trying alternative method..."
    
    # Alternative: Create symlink
    if [ -f /usr/share/zoneinfo/Asia/Tashkent ]; then
        ln -sf /usr/share/zoneinfo/Asia/Tashkent /etc/localtime
        echo "   ✅ Timezone set via symlink"
    else
        echo "   ❌ Asia/Tashkent timezone file not found"
        echo "   Available Asia timezones:"
        ls /usr/share/zoneinfo/Asia/ | head -10
        exit 1
    fi
fi

# Step 3: Verify timezone
echo ""
echo "📋 Step 3: Verifying timezone..."
NEW_TZ=$(timedatectl show --property=Timezone --value 2>/dev/null || cat /etc/timezone 2>/dev/null || echo "unknown")
echo "   New timezone: $NEW_TZ"
echo "   Current time: $(date)"
echo "   UTC time: $(date -u)"
echo ""

# Step 4: Check timezone offset
echo "📋 Step 4: Checking timezone offset..."
OFFSET=$(date +%z)
echo "   Timezone offset: $OFFSET"
if [[ "$OFFSET" == "+0500" ]]; then
    echo "   ✅ Timezone offset is correct (+5)"
else
    echo "   ⚠️  Timezone offset is $OFFSET (expected +0500)"
fi
echo ""

# Step 5: Update system clock
echo "📋 Step 5: Updating system clock..."
if command -v ntpdate >/dev/null 2>&1; then
    echo "   Syncing with NTP servers..."
    ntpdate -s time.nist.gov 2>/dev/null || ntpdate -s pool.ntp.org 2>/dev/null || echo "   ⚠️  NTP sync failed (not critical)"
elif command -v chronyd >/dev/null 2>&1; then
    echo "   Starting chronyd..."
    systemctl start chronyd 2>/dev/null || true
    chronyd -q 2>/dev/null || echo "   ⚠️  Chronyd sync failed (not critical)"
elif command -v systemd-timesyncd >/dev/null 2>&1; then
    echo "   Starting systemd-timesyncd..."
    systemctl start systemd-timesyncd 2>/dev/null || true
    systemctl enable systemd-timesyncd 2>/dev/null || true
fi

echo ""
echo "✅ Timezone fix complete!"
echo ""
echo "📋 Summary:"
echo "   Timezone: $NEW_TZ"
echo "   Current time: $(date)"
echo "   UTC time: $(date -u)"
echo ""
echo "💡 Note: If time is still incorrect, you may need to:"
echo "   1. Restart services: systemctl restart cron"
echo "   2. Check NTP sync: timedatectl status"
echo "   3. Manually sync: ntpdate -s pool.ntp.org"

