#!/bin/bash
# DB dagi Media URL larini tekshiradi: fayl UPLOADS_DIR da bormi?
# Yo'qolganlar uchun keng qidiruv (find) va ixtiyoriy repair (topilsa ko'chirish).
#
# Ishlatish:
#   ./scripts/find-missing-uploads.sh
#   ./scripts/find-missing-uploads.sh --repair
#   ./scripts/find-missing-uploads.sh --repair /var/www/acoustic.uz

set -e

REPAIR=false
PROJECT_DIR=""
for arg in "$@"; do
  [[ "$arg" == "--repair" ]] && REPAIR=true
  [[ -d "$arg" ]] && PROJECT_DIR="$arg"
done
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
[[ -z "$PROJECT_DIR" ]] && PROJECT_DIR="$ROOT_DIR"

# .env va UPLOADS_DIR
ENV_FILE=""
for e in "$PROJECT_DIR/.env" "$PROJECT_DIR/apps/backend/.env"; do
  [[ -f "$e" ]] && ENV_FILE="$e" && break
done
if [[ -z "$ENV_FILE" ]]; then
  echo "❌ .env topilmadi ($PROJECT_DIR)"
  exit 1
fi

UPLOADS_DIR=$(grep -E '^UPLOADS_DIR=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
[[ -z "$UPLOADS_DIR" ]] && UPLOADS_DIR="$PROJECT_DIR/apps/backend/uploads"
mkdir -p "$UPLOADS_DIR"

DB_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
[[ -z "$DB_URL" ]] && echo "❌ DATABASE_URL topilmadi" && exit 1

# PostgreSQL
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^/?]*\)$|\1|p')
DB_USER=$(echo "$DB_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p' | sed 's|%23|#|g')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
[[ -z "$DB_PORT" ]] && DB_PORT=5432

echo "=============================================="
echo "Yo'qolgan uploads rasmlarini tekshirish"
echo "=============================================="
echo "UPLOADS_DIR: $UPLOADS_DIR"
echo "DB: $DB_NAME @ $DB_HOST"
echo ""

MISSING=()
while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  filename=$(echo "$url" | sed 's|/uploads/||')
  if [[ ! -f "$UPLOADS_DIR/$filename" ]]; then
    MISSING+=("$filename")
  fi
done < <(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -c 'SELECT url FROM "Media" WHERE url LIKE '\''%/uploads/%'\'' ORDER BY url;' 2>/dev/null)

if [[ ${#MISSING[@]} -eq 0 ]]; then
  echo "✅ Barcha rasmlar joyida."
  exit 0
fi

echo "❌ Yo'qolgan: ${#MISSING[@]} ta"
echo ""

# Qidirish joylari (keng)
SEARCH_DIRS=(
  /var/www/acoustic.uz
  /root/acoustic.uz
  /var/www/acoustic.uz/apps/backend
  /root/acoustic.uz/apps/backend
)
for d in /var/www/acoustic.uz.backup.* /root/acoustic.uz.backup.*; do
  [[ -d "$d" ]] && SEARCH_DIRS+=("$d")
done 2>/dev/null || true

REPAIRED=0
for filename in "${MISSING[@]}"; do
  echo "🔍 $filename"
  found=""
  if [[ "$REPAIR" == true ]]; then
    for base in "${SEARCH_DIRS[@]}"; do
      [[ ! -d "$base" ]] && continue
      path=$(find "$base" -maxdepth 6 -type f -name "$filename" 2>/dev/null | head -1)
      if [[ -n "$path" ]] && [[ -f "$path" ]]; then
        cp -a "$path" "$UPLOADS_DIR/$filename"
        echo "   ✅ Topildi va ko'chirildi: $path"
        found=1
        ((REPAIRED++)) || true
        break
      fi
    done
  else
    for base in "${SEARCH_DIRS[@]}"; do
      [[ ! -d "$base" ]] && continue
      path=$(find "$base" -maxdepth 6 -type f -name "$filename" 2>/dev/null | head -1)
      if [[ -n "$path" ]]; then
        echo "   📍 Topildi: $path (--repair bilan ko'chirish mumkin)"
        found=1
        break
      fi
    done
  fi
  if [[ -z "$found" ]]; then
    echo "   ❌ Hech qayerda topilmadi"
  fi
done

echo ""
if [[ $REPAIRED -gt 0 ]]; then
  echo "✅ $REPAIRED ta fayl UPLOADS_DIR ga ko'chirildi."
fi
echo "Tayyor."
echo ""
echo "Agar rasm hech qayerda topilmasa: admin panelda qayta yuklang yoki Media yozuvini o'chiring."
