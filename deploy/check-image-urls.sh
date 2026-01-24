#!/bin/bash
echo "🔍 Rasmlar URL'larini tekshirish..."
echo ""
echo "Mavjud fayl:"
curl -I https://a.acoustic.uz/uploads/2026-01-15-1768452603047-blob-s2k16h.webp 2>&1 | grep -E "(HTTP|content-type|Access-Control)" | head -3
echo ""
echo "Yo'q fayl:"
curl -I https://a.acoustic.uz/uploads/2025-12-04-1764833768750-blob-rbrw6k.webp 2>&1 | grep -E "(HTTP|content-type|Access-Control)" | head -3
echo ""
echo "✅ Tekshiruv yakunlandi"
