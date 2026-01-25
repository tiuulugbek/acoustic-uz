# Backend Fondada Ishga Tushirish

## 📝 Scriptlar

1. **start-backend-background.sh** - Backend'ni fonda ishga tushirish
2. **stop-backend.sh** - Backend'ni to'xtatish
3. **backend-status.sh** - Backend holatini ko'rish

## 🚀 Foydalanish

### Fondada ishga tushirish:
```bash
cd /root/acoustic.uz
./deploy/start-backend-background.sh
```

### To'xtatish:
```bash
./deploy/stop-backend.sh
```

### Holatni ko'rish:
```bash
./deploy/backend-status.sh
```

### Loglarni ko'rish:
```bash
tail -f /tmp/acoustic-backend.log
```

## ⚠️ MUAMMOLAR

1. **@nestjs/core moduli topilmayapti**
   - Yechim: `pnpm install` (tarmoq ishlayotgan bo'lsa)

2. **Database ulanish muammosi**
   - Yechim: PostgreSQL'ni ishga tushirish
   - `systemctl start postgresql` yoki `service postgresql start`
