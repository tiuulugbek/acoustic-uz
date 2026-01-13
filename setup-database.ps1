# PostgreSQL Database Yaratish Script

Write-Host "PostgreSQL Database Yaratish..." -ForegroundColor Green

# PostgreSQL bin papkasini topish
$pgBinPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (-not (Test-Path $pgBinPath)) {
    Write-Host "PostgreSQL topilmadi. Iltimos, PostgreSQL o'rnatilgan joyni tekshiring." -ForegroundColor Red
    exit 1
}

Write-Host "`nPostgreSQL parolini kiriting (postgres user uchun):" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Environment variable sifatida parolni o'tkazish
$env:PGPASSWORD = $plainPassword

# Database yaratish
Write-Host "`nDatabase yaratilmoqda..." -ForegroundColor Cyan
& $pgBinPath -U postgres -h localhost -c "CREATE DATABASE acoustic;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database muvaffaqiyatli yaratildi!" -ForegroundColor Green
    Write-Host "`nKeyingi qadamlar:" -ForegroundColor Yellow
    Write-Host "1. .env faylida DATABASE_URL ni yangilang:" -ForegroundColor White
    Write-Host "   DATABASE_URL=postgresql://postgres:$plainPassword@localhost:5432/acoustic" -ForegroundColor Gray
    Write-Host "`n2. Migrations ni ishga tushiring:" -ForegroundColor White
    Write-Host "   pnpm --filter @acoustic/backend db:migrate" -ForegroundColor Gray
    Write-Host "`n3. Database ni seed qiling:" -ForegroundColor White
    Write-Host "   pnpm --filter @acoustic/backend db:seed" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Xatolik yuz berdi. Database allaqachon mavjud bo'lishi mumkin." -ForegroundColor Red
    Write-Host "Yoki parol noto'g'ri. Iltimos, qayta urinib ko'ring." -ForegroundColor Yellow
}

# Parolni xotiraga o'chirish
$env:PGPASSWORD = $null
$plainPassword = $null




