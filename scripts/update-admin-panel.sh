#!/bin/bash
set -euo pipefail

echo "=== Admin panel fayllarni yangilash ==="

# Paths
BUILD_DIR="/root/acoustic.uz/apps/admin/dist"
PROD_DIR="/var/www/acoustic.uz/apps/admin"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory topilmadi: $BUILD_DIR"
    exit 1
fi

# Fix permissions first
echo "Permission'larni to'g'rilash..."
chmod -R 777 "$PROD_DIR" 2>/dev/null || true

# Copy files
echo "Fayllarni ko'chirish..."
cp -f "$BUILD_DIR/index.html" "$PROD_DIR/index.html"
cp -f "$BUILD_DIR/version.json" "$PROD_DIR/version.json"

# Copy assets
echo "Assets ko'chirish..."
rm -rf "$PROD_DIR/dist/assets" 2>/dev/null || true
mkdir -p "$PROD_DIR/dist"
cp -rf "$BUILD_DIR/assets" "$PROD_DIR/dist/assets"

# Fix permissions
echo "Permission'larni to'g'rilash..."
chown -R acoustic:acoustic "$PROD_DIR" 2>/dev/null || true
chmod -R 755 "$PROD_DIR" 2>/dev/null || true

echo "✅ Admin panel fayllari yangilandi"
echo ""
echo "Version:"
cat "$PROD_DIR/version.json" 2>/dev/null || echo "Version fayli topilmadi"
