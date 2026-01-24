#!/bin/bash
# Barcha uploads fayllarini bitta joyga yig'ish
# Rasmlar /var/www, /root, apps/backend, apps/backend/apps/backend kabi joylarda tarqalgan.
# Ular hammasi TARGET_DIR ga birlashtiriladi.
#
# Ishlatish:
#   ./scripts/consolidate-uploads.sh
#   ./scripts/consolidate-uploads.sh /var/www/acoustic.uz/apps/backend/uploads   # production

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$ROOT_DIR/apps/backend/uploads}"

# /var/www da ham project bo'lsa, u yerdan ham yig'amiz
VAR_WWW="/var/www/acoustic.uz/apps/backend/uploads"
ROOT_REPO="$ROOT_DIR/apps/backend/uploads"
ROOT_UPLOADS="$ROOT_DIR/uploads"
NESTED_UPLOADS="$ROOT_DIR/apps/backend/apps/backend/uploads"

echo "=============================================="
echo "Uploads fayllarini bitta joyga yig'ish"
echo "=============================================="
echo "Maqsad papka: $TARGET_DIR"
echo ""

mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/temp"

# Barcha manba papkalar (mavjud bo'lsa)
SOURCES=(
  "$VAR_WWW"
  "$ROOT_UPLOADS"
  "$ROOT_REPO"
  "$NESTED_UPLOADS"
)

copy_files_from() {
  local src="$1"
  [[ ! -d "$src" ]] && return 0
  echo "📂 Tekshirilmoqda: $src"
  local count=0
  while IFS= read -r f; do
    [[ -z "$f" ]] || [[ ! -f "$f" ]] && continue
    base=$(basename "$f")
    dest="$TARGET_DIR/$base"
    if [[ ! -f "$dest" ]] || [[ "$f" -nt "$dest" ]]; then
      cp -a "$f" "$dest" 2>/dev/null || cp "$f" "$dest"
      echo "   ✅ $base"
      count=$((count + 1))
    fi
  done < <(find "$src" -maxdepth 1 -type f \( -name '*.webp' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.gif' \) 2>/dev/null)
  if [[ $count -gt 0 ]]; then echo "   Jami $count ta yangi fayl ko'chirildi."; fi
}

for dir in "${SOURCES[@]}"; do
  if [[ "$dir" != "$TARGET_DIR" ]]; then
    copy_files_from "$dir"
  fi
done

echo ""
echo "----------------------------------------------"
echo "Natija: $TARGET_DIR"
ls -la "$TARGET_DIR" 2>/dev/null || true
echo ""
echo "Rasmlar soni: $(find "$TARGET_DIR" -maxdepth 1 -type f \( -name '*.webp' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.gif' \) 2>/dev/null | wc -l)"
echo "✅ Tayyor!"
exit 0
