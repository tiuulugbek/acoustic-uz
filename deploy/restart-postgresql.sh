#!/bin/bash
# PostgreSQL'ni qayta ishga tushirish (agar ruxsat bo'lsa)

echo "=== PostgreSQL Qayta Ishga Tushirish ==="
echo ""

# Systemctl orqali
if command -v systemctl > /dev/null 2>&1; then
    echo "Systemctl orqali qayta ishga tushirishga harakat qilamiz..."
    sudo systemctl restart postgresql 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL qayta ishga tushdi"
        sleep 3
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            echo "✅ PostgreSQL port 5432'da ishlamoqda"
        else
            echo "⚠️ PostgreSQL ishlamoqda, lekin port 5432'da listener yo'q"
        fi
    else
        echo "❌ Systemctl ishlamadi (permission muammosi)"
    fi
fi

# Service orqali
if command -v service > /dev/null 2>&1 && [ $? -ne 0 ]; then
    echo "Service orqali qayta ishga tushirishga harakat qilamiz..."
    sudo service postgresql restart 2>&1
fi

echo ""
echo "PostgreSQL holatini tekshiring:"
pg_isready -h localhost -p 5432 2>&1 || echo "⚠️ PostgreSQL port 5432'da ishlamayapti"
