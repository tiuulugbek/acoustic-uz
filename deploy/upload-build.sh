#!/bin/bash
# Local'dan build qilingan fayllarni server'ga yuklash

set -e

if [ -z "$1" ]; then
    echo "📤 Build fayllarni server'ga yuklash"
    echo ""
    echo "Ishlatish:"
    echo "  ./deploy/upload-build.sh backend   # Backend build yuklash"
    echo "  ./deploy/upload-build.sh frontend  # Frontend build yuklash"
    echo "  ./deploy/upload-build.sh all       # Hammasini yuklash"
    exit 1
fi

PROD_DIR="/var/www/acoustic.uz"
LOCAL_DIR="/root/acoustic.uz"

echo "📤 Build fayllarni yuklash: $1"
echo ""

case "$1" in
    backend)
        echo "🔨 Backend build yuklanmoqda..."
        rsync -av --delete \
          "$LOCAL_DIR/apps/backend/dist/" \
          "$PROD_DIR/apps/backend/dist/" \
          --exclude='*.map'
        
        chown -R acoustic:acoustic "$PROD_DIR/apps/backend/dist" 2>/dev/null || true
        echo "   ✅ Backend build yuklandi"
        echo ""
        echo "   🔄 PM2'ni restart qilish:"
        echo "   su - acoustic"
        echo "   cd /var/www/acoustic.uz"
        echo "   pm2 restart acoustic-backend"
        ;;
    
    frontend)
        echo "🔨 Frontend build yuklanmoqda..."
        rsync -av --delete \
          "$LOCAL_DIR/apps/frontend/.next/" \
          "$PROD_DIR/apps/frontend/.next/" \
          --exclude='cache'
        
        chown -R acoustic:acoustic "$PROD_DIR/apps/frontend/.next" 2>/dev/null || true
        echo "   ✅ Frontend build yuklandi"
        echo ""
        echo "   🔄 PM2'ni restart qilish:"
        echo "   su - acoustic"
        echo "   cd /var/www/acoustic.uz"
        echo "   pm2 restart acoustic-frontend"
        ;;
    
    all)
        echo "🔨 Barcha build fayllarni yuklanmoqda..."
        
        # Backend
        rsync -av --delete \
          "$LOCAL_DIR/apps/backend/dist/" \
          "$PROD_DIR/apps/backend/dist/" \
          --exclude='*.map'
        
        # Frontend
        rsync -av --delete \
          "$LOCAL_DIR/apps/frontend/.next/" \
          "$PROD_DIR/apps/frontend/.next/" \
          --exclude='cache'
        
        # Shared
        rsync -av --delete \
          "$LOCAL_DIR/packages/shared/dist/" \
          "$PROD_DIR/packages/shared/dist/"
        
        chown -R acoustic:acoustic "$PROD_DIR/apps/backend/dist" 2>/dev/null || true
        chown -R acoustic:acoustic "$PROD_DIR/apps/frontend/.next" 2>/dev/null || true
        chown -R acoustic:acoustic "$PROD_DIR/packages/shared/dist" 2>/dev/null || true
        
        echo "   ✅ Barcha build fayllar yuklandi"
        echo ""
        echo "   🔄 PM2'ni restart qilish:"
        echo "   su - acoustic"
        echo "   cd /var/www/acoustic.uz"
        echo "   pm2 restart all"
        ;;
    
    *)
        echo "❌ Noto'g'ri argument: $1"
        echo "Ishlatish: backend, frontend, yoki all"
        exit 1
        ;;
esac

echo ""
echo "✅ Yuklash yakunlandi!"
