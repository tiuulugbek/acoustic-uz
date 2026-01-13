#!/bin/bash

# Serverda fayllarni extract qilish

set -e

cd /var/www/news.acoustic.uz

echo "📁 Fayllarni extract qilish..."

# 1. Uploads papkasini extract qilish
echo "📋 Uploads papkasini extract qilish..."
UPLOADS_TAR=$(ls -t uploads-*.tar.gz 2>/dev/null | head -1)

if [ -n "$UPLOADS_TAR" ] && [ -f "$UPLOADS_TAR" ]; then
    echo "✅ Uploads archive topildi: $UPLOADS_TAR"
    echo "📦 Extract qilinmoqda..."
    
    # Mavjud uploads papkasini backup qilish
    if [ -d "uploads" ]; then
        echo "📦 Mavjud uploads papkasini backup qilish..."
        BACKUP_DIR="uploads-backup-$(date +%Y%m%d-%H%M%S)"
        mv uploads "$BACKUP_DIR" || {
            echo "⚠️ Backup xatosi, lekin davom etamiz..."
        }
    fi
    
    # Extract qilish
    tar -xzf "$UPLOADS_TAR" || {
        echo "❌ Extract xatosi!"
        exit 1
    }
    
    # Permissions o'rnatish
    sudo chown -R deploy:deploy uploads || {
        echo "⚠️ Permissions o'rnatish xatosi!"
    }
    sudo chmod -R 755 uploads || {
        echo "⚠️ Permissions o'rnatish xatosi!"
    }
    
    echo "✅ Uploads papkasi extract qilindi!"
else
    echo "⚠️ Uploads archive topilmadi!"
fi

# 2. Public papkasini extract qilish
echo ""
echo "📋 Public papkasini extract qilish..."
PUBLIC_TAR=$(ls -t public-*.tar.gz 2>/dev/null | head -1)

if [ -n "$PUBLIC_TAR" ] && [ -f "$PUBLIC_TAR" ]; then
    echo "✅ Public archive topildi: $PUBLIC_TAR"
    echo "📦 Extract qilinmoqda..."
    
    # Mavjud public papkasini backup qilish
    if [ -d "apps/frontend/public" ]; then
        echo "📦 Mavjud public papkasini backup qilish..."
        BACKUP_DIR="public-backup-$(date +%Y%m%d-%H%M%S)"
        mv apps/frontend/public "$BACKUP_DIR" || {
            echo "⚠️ Backup xatosi, lekin davom etamiz..."
        }
    fi
    
    # Extract qilish
    tar -xzf "$PUBLIC_TAR" || {
        echo "❌ Extract xatosi!"
        exit 1
    }
    
    # Permissions o'rnatish
    sudo chown -R deploy:deploy apps/frontend/public || {
        echo "⚠️ Permissions o'rnatish xatosi!"
    }
    
    echo "✅ Public papkasi extract qilindi!"
    
    # Frontend ni qayta build qilish (agar kerak bo'lsa)
    echo ""
    echo "🔄 Frontend ni qayta build qilish..."
    export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
    export NODE_ENV=production
    
    pnpm --filter @acoustic/shared build || {
        echo "⚠️ Shared build xatosi!"
    }
    
    pnpm --filter @acoustic/frontend build || {
        echo "⚠️ Frontend build xatosi!"
    }
    
    # Static fayllarni standalone ga nusxalash
    mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
    cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/ 2>/dev/null || {
        echo "⚠️ Static fayllarni nusxalash xatosi!"
    }
    
    # Frontend ni restart qilish
    pm2 restart acoustic-frontend || {
        echo "⚠️ Frontend restart xatosi!"
    }
else
    echo "⚠️ Public archive topilmadi!"
fi

# 3. Nginx ni reload qilish
echo ""
echo "🔄 Nginx ni reload qilish..."
sudo systemctl reload nginx || {
    echo "⚠️ Nginx reload xatosi!"
}

echo ""
echo "✅ Fayllar extract qilindi!"
echo ""
echo "📋 Xulosa:"
if [ -d "uploads" ]; then
    echo "- Uploads papkasi: $(du -sh uploads | cut -f1)"
fi
if [ -d "apps/frontend/public" ]; then
    echo "- Public papkasi: $(du -sh apps/frontend/public | cut -f1)"
fi


