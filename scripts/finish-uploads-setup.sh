#!/bin/bash
# Rasmlar birlashtirilgach: UPLOADS_DIR ni o'rnatish va backendni qayta ishga tushirish
#
# Ishlatish (production /var/www da):
#   ./scripts/finish-uploads-setup.sh
#   ./scripts/finish-uploads-setup.sh /var/www/acoustic.uz
#
# Oldin: kod yangilanishlari (main, storage, products) git da bo'lishi kerak.
#        /var/www da `git pull` yoki deploy qilingan bo'lsin.

set -e

PROJECT_DIR="${1:-/var/www/acoustic.uz}"
UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
ENV_FILE="$PROJECT_DIR/apps/backend/.env"

echo "=============================================="
echo "Uploads sozlamalarini yakunlash"
echo "=============================================="
echo "Loyiha: $PROJECT_DIR"
echo "UPLOADS_DIR: $UPLOADS_DIR"
echo ""

if [[ ! -d "$UPLOADS_DIR" ]]; then
  echo "❌ Uploads papkasi topilmadi: $UPLOADS_DIR"
  exit 1
fi

# 1. .env da UPLOADS_DIR ni o'rnatish yoki yangilash
if [[ -f "$ENV_FILE" ]]; then
  if grep -q '^UPLOADS_DIR=' "$ENV_FILE"; then
    sed -i "s|^UPLOADS_DIR=.*|UPLOADS_DIR=$UPLOADS_DIR|" "$ENV_FILE"
    echo "✅ UPLOADS_DIR yangilandi .env da"
  else
    echo "" >> "$ENV_FILE"
    echo "# Uploads (barcha rasmlar shu papkada)" >> "$ENV_FILE"
    echo "UPLOADS_DIR=$UPLOADS_DIR" >> "$ENV_FILE"
    echo "✅ UPLOADS_DIR qo'shildi .env ga"
  fi
else
  echo "⚠️  .env topilmadi: $ENV_FILE"
  echo "   Loyihada .env.example dan nusxa oling va UPLOADS_DIR=$UPLOADS_DIR qo'shing."
  exit 1
fi

# 2. Backend rebuild va restart
echo ""
echo "🔄 Backend qayta yig'ilmoqda va ishga tushirilmoqda..."
cd "$PROJECT_DIR" || exit 1

if [[ -f deploy/restart-backend-only.sh ]]; then
  bash deploy/restart-backend-only.sh
else
  echo "   PM2 orqali qayta ishga tushirish..."
  cd apps/backend && pnpm run build:nest 2>/dev/null || pnpm run build 2>/dev/null || true
  cd "$PROJECT_DIR" || exit 1
  pm2 restart acoustic-backend 2>/dev/null || echo "   ⚠️  pm2 restart acoustic-backend bajarildi (xato bo'lishi mumkin)"
fi

echo ""
echo "=============================================="
echo "✅ Tayyor!"
echo "=============================================="
echo "Rasmlar: $UPLOADS_DIR"
echo "Soni:    $(find "$UPLOADS_DIR" -maxdepth 1 -type f \( -name '*.webp' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.gif' \) 2>/dev/null | wc -l) ta"
echo ""
echo "Tekshirish: pm2 logs acoustic-backend --lines 5"
echo "            curl -s -o /dev/null -w '%{http_code}' https://a.acoustic.uz/uploads/2026-01-15-1768452603047-blob-s2k16h.webp"
echo ""
