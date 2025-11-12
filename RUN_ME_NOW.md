# 🚀 Run These Commands Now

## ✅ Status

- ✅ PostgreSQL is running locally
- ✅ Database `acoustic` exists and is accessible
- ✅ `.env` file is configured correctly
- ✅ Connection works: `postgresql://acoustic:acoustic123@localhost:5432/acoustic`

**You DON'T need Docker!** Your local PostgreSQL is ready.

## 📝 Run These Commands

### 1. Generate Prisma Client

```bash
pnpm --filter @acoustic/backend db:generate
```

### 2. Run Migrations

```bash
pnpm --filter @acoustic/backend db:migrate
```

### 3. Seed Database (creates admin user)

```bash
pnpm --filter @acoustic/backend db:seed
```

### 4. Start Development Servers

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🎉 After Starting

Visit:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002

**Login credentials:**
- Email: `admin@acoustic.uz`
- Password: `Admin#12345`
- **Note**: You'll be required to change the password on first login

## 🐛 If You Get Errors

### "Prisma client not found"
```bash
pnpm --filter @acoustic/backend db:generate
```

### "Migration failed"
```bash
# Check database connection
psql "postgresql://acoustic:acoustic123@localhost:5432/acoustic" -c "SELECT 1;"

# If that works, try resetting migrations
pnpm --filter @acoustic/backend db:migrate reset
```

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep acoustic
```

## 💡 Quick Command Summary

```bash
# All-in-one setup (after dependencies are installed)
pnpm --filter @acoustic/backend db:generate
pnpm --filter @acoustic/backend db:migrate
pnpm --filter @acoustic/backend db:seed
pnpm dev
```

## 📚 More Help

- See [START_HERE.md](./START_HERE.md) for detailed setup guide
- See [QUICK_START.md](./QUICK_START.md) for troubleshooting
- See [DOCKER_SETUP.md](./DOCKER_SETUP.md) if you want to use Docker later

