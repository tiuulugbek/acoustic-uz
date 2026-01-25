#!/bin/bash
# Frontend va Admin panelni development mode'da qayta ishga tushirish

echo "🔄 Frontend va Admin panelni development mode'da qayta ishga tushiryapman..."

# Frontend (Next.js) - port 3000
echo "📦 Frontend (Next.js) ni development mode'da ishga tushiryapman..."
cd apps/frontend
pkill -f "next start" 2>/dev/null || true
sleep 2
pnpm dev &
FRONTEND_PID=$!
echo "✅ Frontend development server ishga tushdi (PID: $FRONTEND_PID)"
echo "   URL: http://localhost:3000"

# Admin panel (Vite) - port 5173
echo ""
echo "📦 Admin panel (Vite) ni development mode'da ishga tushiryapman..."
cd ../admin
pkill -f "vite" 2>/dev/null || true
sleep 2
pnpm dev &
ADMIN_PID=$!
echo "✅ Admin panel development server ishga tushdi (PID: $ADMIN_PID)"
echo "   URL: http://localhost:5173"

echo ""
echo "✅ Barcha serverlar development mode'da ishga tushdi!"
echo ""
echo "⚠️  Eslatma: Browser cache'ni tozalash uchun:"
echo "   - Chrome/Edge: Ctrl+Shift+R yoki Ctrl+F5"
echo "   - Firefox: Ctrl+Shift+R"
echo "   - Safari: Cmd+Shift+R"
echo ""
echo "Serverlarni to'xtatish uchun: pkill -f 'next dev' && pkill -f 'vite'"
