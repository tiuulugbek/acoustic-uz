#!/bin/bash
# Frontend va Admin panelni production build qilish

echo "🔨 Frontend va Admin panelni production build qilyapman..."

# Frontend (Next.js)
echo "📦 Frontend (Next.js) ni build qilyapman..."
cd apps/frontend
pnpm build
echo "✅ Frontend build tugadi"

# Admin panel (Vite)
echo ""
echo "📦 Admin panel (Vite) ni build qilyapman..."
cd ../admin
pnpm build
echo "✅ Admin panel build tugadi"

echo ""
echo "✅ Barcha build'lar tugadi!"
echo ""
echo "⚠️  Production serverlarni qayta ishga tushirish kerak:"
echo "   - Frontend: cd apps/frontend && pnpm start"
echo "   - Admin: cd apps/admin && pnpm preview"
echo ""
echo "Yoki development mode'da ishga tushirish uchun: ./restart-frontend-dev.sh"
